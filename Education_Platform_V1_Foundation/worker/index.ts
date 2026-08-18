import type { AuthUser, Env } from "./types";
import { audit } from "./audit";
import { clearSessionCookie, createSession, destroySession, getAuthUser, isPlatformOwner, makePassword, verifyPassword } from "./auth";
import { canAccessBranch, canAccessTenant, canAdminBranch, canAdminTenant, canAssignRole, highestRole } from "./permissions";
import { error, json, mutationOriginAllowed, readJson, securityHeaders, slugify, uuid } from "./utils";

type JsonMap = Record<string, any>;

function required(obj: JsonMap, fields: string[]): string | null {
  for (const f of fields) if (obj[f] === undefined || obj[f] === null || String(obj[f]).trim() === "") return f;
  return null;
}

async function auth(env: Env, request: Request): Promise<AuthUser | Response> {
  const user = await getAuthUser(env, request);
  return user || error("Authentication required.", 401);
}

function tenantScope(user: AuthUser, url: URL, body?: JsonMap): { tenantId: string | null; branchId: string | null } {
  const tenantId = (body?.tenant_id || url.searchParams.get("tenant_id") || null) as string | null;
  const branchId = (body?.branch_id || url.searchParams.get("branch_id") || null) as string | null;
  return { tenantId, branchId };
}

async function listRows(env: Env, sql: string, binds: any[] = []) {
  const res = await env.DB.prepare(sql).bind(...binds).all<any>();
  return res.results || [];
}

async function quotaCheck(env: Env, tenantId: string, metric: "students"|"staff", addCount = 1): Promise<string | null> {
  const sub = await env.DB.prepare(`SELECT student_limit,staff_limit FROM subscriptions WHERE tenant_id=? ORDER BY created_at DESC LIMIT 1`).bind(tenantId).first<any>();
  const limit = metric === "students" ? sub?.student_limit : sub?.staff_limit;
  if (limit == null) return null;
  const row = metric === "students"
    ? await env.DB.prepare("SELECT COUNT(*) c FROM students WHERE tenant_id=? AND status IN ('future','active','on_leave')").bind(tenantId).first<any>()
    : await env.DB.prepare("SELECT COUNT(*) c FROM staff WHERE tenant_id=? AND employment_status='active'").bind(tenantId).first<any>();
  const current = Number(row?.c || 0);
  return current + addCount > Number(limit) ? `${metric === "students" ? "Student" : "Staff"} limit reached for this subscription (${limit}).` : null;
}

async function route(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const requestId = request.headers.get("cf-ray") || uuid();

  if (!mutationOriginAllowed(request)) return error("Cross-origin mutation blocked.", 403);

  // Health
  if (path === "/api/health" && request.method === "GET") {
    const db = await env.DB.prepare("SELECT value FROM system_metadata WHERE key='schema_version'").first<any>().catch(() => null);
    return json({ ok: true, service: "education-platform", database: !!db, schemaVersion: db?.value || null });
  }

  // Bootstrap
  if (path === "/api/bootstrap/status" && request.method === "GET") {
    const row = await env.DB.prepare("SELECT COUNT(*) AS c FROM users").first<any>();
    return json({ ok: true, needs_bootstrap: Number(row?.c || 0) === 0 });
  }

  if (path === "/api/bootstrap" && request.method === "POST") {
    const count = await env.DB.prepare("SELECT COUNT(*) AS c FROM users").first<any>();
    if (Number(count?.c || 0) > 0) return error("Platform is already initialized.", 409);
    const body = await readJson<JsonMap>(request);
    const missing = required(body, ["name","email","password"]);
    if (missing) return error(`Missing field: ${missing}`);
    const id = uuid();
    const pw = await makePassword(String(body.password));
    await env.DB.batch([
      env.DB.prepare("INSERT INTO users(id,email,name,password_hash,password_salt,status) VALUES(?,?,?,?,?,'active')")
        .bind(id, String(body.email).trim().toLowerCase(), String(body.name).trim(), pw.hash, pw.salt),
      env.DB.prepare("INSERT INTO role_assignments(id,user_id,role_code,can_delegate) VALUES(?,?, 'platform_owner',1)")
        .bind(uuid(), id)
    ]);
    const session = await createSession(env, request, id);
    await audit(env, request, id, "CREATE", "platform_owner", id, null, null, requestId, { email: body.email }, null, "PLATFORM_BOOTSTRAP");
    const response = json({ ok: true, message: "Platform owner created." }, { status: 201 });
    const headers = new Headers(response.headers); headers.append("set-cookie", session.cookie);
    return new Response(response.body, { status: response.status, headers });
  }

  // Auth
  if (path === "/api/auth/login" && request.method === "POST") {
    const body = await readJson<JsonMap>(request);
    const row = await env.DB.prepare("SELECT * FROM users WHERE email=? COLLATE NOCASE AND status='active' LIMIT 1")
      .bind(String(body.email || "").trim().toLowerCase()).first<any>();
    if (!row || !(await verifyPassword(String(body.password || ""), row.password_hash, row.password_salt))) {
      return error("Invalid email or password.", 401);
    }
    const session = await createSession(env, request, row.id);
    await audit(env, request, row.id, "LOGIN", "user", row.id, null, null, requestId, undefined, undefined, "AUTH_LOGIN");
    const response = json({ ok: true });
    const headers = new Headers(response.headers); headers.append("set-cookie", session.cookie);
    return new Response(response.body, { status: response.status, headers });
  }

  if (path === "/api/auth/logout" && request.method === "POST") {
    const user = await getAuthUser(env, request);
    await destroySession(env, request);
    if (user) await audit(env, request, user.id, "LOGOUT", "user", user.id, null, null, requestId, undefined, undefined, "AUTH_LOGOUT");
    const response = json({ ok: true });
    const headers = new Headers(response.headers); headers.append("set-cookie", clearSessionCookie(request));
    return new Response(response.body, { status: response.status, headers });
  }

  if (path === "/api/auth/me" && request.method === "GET") {
    const user = await getAuthUser(env, request);
    if (!user) return error("Not authenticated.", 401);
    return json({ ok: true, user: { ...user, highest_role: highestRole(user), is_platform_owner: isPlatformOwner(user) } });
  }

  const a = await auth(env, request);
  if (a instanceof Response) return a;
  const user = a;

  // Provider summary
  if (path === "/api/provider/summary" && request.method === "GET") {
    if (!isPlatformOwner(user)) return error("Platform owner access required.", 403);
    const [tenants, active, branches, students, staff, renewals] = await Promise.all([
      env.DB.prepare("SELECT COUNT(*) c FROM tenants").first<any>(),
      env.DB.prepare("SELECT COUNT(*) c FROM tenants WHERE status IN ('trial','active','renewal_due')").first<any>(),
      env.DB.prepare("SELECT COUNT(*) c FROM branches WHERE status='active'").first<any>(),
      env.DB.prepare("SELECT COUNT(*) c FROM students WHERE status='active'").first<any>(),
      env.DB.prepare("SELECT COUNT(*) c FROM staff WHERE employment_status='active'").first<any>(),
      env.DB.prepare("SELECT COUNT(*) c FROM tenants WHERE expires_at IS NOT NULL AND expires_at <= datetime('now','+30 day') AND status NOT IN ('cancelled','archived')").first<any>()
    ]);
    return json({ ok:true, summary:{
      tenants:Number(tenants?.c||0), active_tenants:Number(active?.c||0), branches:Number(branches?.c||0),
      students:Number(students?.c||0), staff:Number(staff?.c||0), renewals_due:Number(renewals?.c||0)
    }});
  }

  // Tenants
  if (path === "/api/tenants" && request.method === "GET") {
    if (isPlatformOwner(user)) {
      const rows = await listRows(env, `
        SELECT t.*, p.name plan_name,
          (SELECT COUNT(*) FROM branches b WHERE b.tenant_id=t.id AND b.status='active') branch_count,
          (SELECT COUNT(*) FROM students s WHERE s.tenant_id=t.id AND s.status='active') student_count,
          (SELECT COUNT(*) FROM staff st WHERE st.tenant_id=t.id AND st.employment_status='active') staff_count
        FROM tenants t LEFT JOIN plans p ON p.code=t.plan_code ORDER BY t.created_at DESC
      `);
      return json({ ok:true, rows });
    }
    const tenantIds = [...new Set(user.assignments.map(x=>x.tenant_id).filter(Boolean))] as string[];
    if (!tenantIds.length) return json({ ok:true, rows:[] });
    const placeholders = tenantIds.map(()=>"?").join(",");
    const rows = await listRows(env, `SELECT * FROM tenants WHERE id IN (${placeholders}) ORDER BY name`, tenantIds);
    return json({ ok:true, rows });
  }

  if (path === "/api/tenants" && request.method === "POST") {
    if (!isPlatformOwner(user)) return error("Platform owner access required.", 403);
    const body = await readJson<JsonMap>(request);
    const missing = required(body, ["name"]);
    if (missing) return error(`Missing field: ${missing}`);
    const id = uuid();
    const slug = slugify(String(body.slug || body.name)) || `tenant-${id.slice(0,8)}`;
    const expires = new Date(Date.now()+30*86400000).toISOString();
    const branchLimit = body.branch_limit ?? 3, studentLimit = body.student_limit ?? 500, staffLimit = body.staff_limit ?? 100;
    try {
      await env.DB.batch([
        env.DB.prepare(`INSERT INTO tenants(id,name,slug,legal_name,status,plan_code,country,timezone,default_currency,default_language,expires_at)
          VALUES(?,?,?,?,?,?,?,?,?,?,?)`)
          .bind(id, body.name, slug, body.legal_name||null, body.status||"trial", body.plan_code||"trial",
            body.country||null, body.timezone||"Asia/Baghdad", body.default_currency||"IQD", body.default_language||"en", body.expires_at||expires),
        env.DB.prepare(`INSERT INTO subscriptions(id,tenant_id,plan_code,status,starts_at,ends_at,renewal_at,branch_limit,student_limit,staff_limit)
          VALUES(?,?,?,'trial',CURRENT_TIMESTAMP,?,?,?,?,?)`)
          .bind(uuid(), id, body.plan_code||"trial", body.expires_at||expires, body.expires_at||expires, branchLimit, studentLimit, staffLimit)
      ]);
    } catch (e:any) {
      return error("Could not create customer. The slug may already exist.", 409, e?.message);
    }
    await audit(env, request, user.id, "CREATE", "tenant", id, id, null, requestId, body, null, "TENANT_CREATED");
    return json({ ok:true, id }, { status:201 });
  }

  // Branches
  if (path === "/api/branches" && request.method === "GET") {
    const { tenantId } = tenantScope(user,url);
    if (!tenantId || !canAccessTenant(user, tenantId)) return error("Tenant scope required.", 403);
    const rows = await listRows(env, `
      SELECT b.*,
        (SELECT COUNT(*) FROM students s WHERE s.branch_id=b.id AND s.status='active') student_count,
        (SELECT COUNT(*) FROM staff_assignments sa JOIN staff st ON st.id=sa.staff_id WHERE sa.branch_id=b.id AND st.employment_status='active') staff_count
      FROM branches b WHERE b.tenant_id=? ORDER BY b.name`, [tenantId]);
    return json({ ok:true, rows });
  }

  if (path === "/api/branches" && request.method === "POST") {
    const body = await readJson<JsonMap>(request);
    const { tenantId } = tenantScope(user,url,body);
    if (!tenantId || !canAdminTenant(user,tenantId)) return error("Tenant administrator access required.",403);
    const missing=required(body,["name","code"]); if(missing) return error(`Missing field: ${missing}`);
    const sub = await env.DB.prepare(`SELECT branch_limit FROM subscriptions WHERE tenant_id=? ORDER BY created_at DESC LIMIT 1`).bind(tenantId).first<any>();
    if (sub?.branch_limit != null) {
      const count=await env.DB.prepare("SELECT COUNT(*) c FROM branches WHERE tenant_id=? AND status='active'").bind(tenantId).first<any>();
      if (Number(count?.c||0) >= Number(sub.branch_limit)) return error("Branch limit reached for this subscription.",409);
    }
    const id=uuid();
    await env.DB.prepare(`INSERT INTO branches(id,tenant_id,code,name,type,address,city,phone,email,timezone) VALUES(?,?,?,?,?,?,?,?,?,?)`)
      .bind(id,tenantId,String(body.code).trim(),String(body.name).trim(),body.type||"school",body.address||null,body.city||null,body.phone||null,body.email||null,body.timezone||null).run();
    await audit(env,request,user.id,"CREATE","branch",id,tenantId,id,requestId,body,null,"BRANCH_CREATED");
    return json({ok:true,id},{status:201});
  }

  // Users & delegated roles
  if (path === "/api/users" && request.method === "GET") {
    const { tenantId, branchId }=tenantScope(user,url);
    if (!tenantId || !canAccessBranch(user,tenantId,branchId)) return error("Scope not allowed.",403);
    const binds:any[]=[tenantId];
    let sql=`
      SELECT DISTINCT u.id,u.email,u.name,u.status,u.preferred_language,u.created_at
      FROM users u JOIN role_assignments r ON r.user_id=u.id
      WHERE r.tenant_id=?`;
    if(branchId){ sql += " AND (r.branch_id IS NULL OR r.branch_id=?)"; binds.push(branchId); }
    sql += " ORDER BY u.name";
    const rows=await listRows(env,sql,binds);
    for(const row of rows){
      row.assignments=await listRows(env,"SELECT id,role_code,tenant_id,branch_id,department_id,can_delegate,starts_at,ends_at FROM role_assignments WHERE user_id=? AND tenant_id=?",[row.id,tenantId]);
    }
    return json({ok:true,rows});
  }

  if (path === "/api/users" && request.method === "POST") {
    const body=await readJson<JsonMap>(request);
    const { tenantId,branchId }=tenantScope(user,url,body);
    if(!tenantId || !canAccessBranch(user,tenantId,branchId)) return error("Scope not allowed.",403);
    const missing=required(body,["name","email","password","role_code"]); if(missing) return error(`Missing field: ${missing}`);
    if(!canAssignRole(user,String(body.role_code),tenantId,branchId)) return error("You cannot assign this role in this scope.",403);
    const id=uuid(), pw=await makePassword(String(body.password));
    try {
      await env.DB.batch([
        env.DB.prepare("INSERT INTO users(id,email,name,password_hash,password_salt,status,preferred_language) VALUES(?,?,?,?,?,'active',?)")
          .bind(id,String(body.email).trim().toLowerCase(),String(body.name).trim(),pw.hash,pw.salt,body.preferred_language||"en"),
        env.DB.prepare(`INSERT INTO role_assignments(id,user_id,role_code,tenant_id,branch_id,department_id,can_delegate)
          VALUES(?,?,?,?,?,?,?)`).bind(uuid(),id,body.role_code,tenantId,branchId||null,body.department_id||null,body.can_delegate?1:0)
      ]);
    } catch(e:any){ return error("Could not create user. Email may already exist.",409,e?.message); }
    await audit(env,request,user.id,"CREATE","user",id,tenantId,branchId,requestId,{email:body.email,role:body.role_code},null,"USER_CREATED");
    return json({ok:true,id},{status:201});
  }

  // Students
  if (path === "/api/students" && request.method === "GET") {
    const {tenantId,branchId}=tenantScope(user,url);
    if(!tenantId || !canAccessBranch(user,tenantId,branchId)) return error("Scope not allowed.",403);
    const q=(url.searchParams.get("q")||"").trim();
    const binds:any[]=[tenantId]; let sql=`
      SELECT s.*, b.name branch_name, g.name grade_name, c.name class_name
      FROM students s
      JOIN branches b ON b.id=s.branch_id
      LEFT JOIN grade_levels g ON g.id=s.grade_level_id
      LEFT JOIN classes c ON c.id=s.class_id
      WHERE s.tenant_id=?`;
    if(branchId){ sql+=" AND s.branch_id=?"; binds.push(branchId); }
    if(q){ sql+=" AND (s.student_no LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ?)"; binds.push(`%${q}%`,`%${q}%`,`%${q}%`); }
    sql+=" ORDER BY s.created_at DESC LIMIT 500";
    return json({ok:true,rows:await listRows(env,sql,binds)});
  }

  if (path === "/api/students" && request.method === "POST") {
    const body=await readJson<JsonMap>(request);
    const {tenantId,branchId}=tenantScope(user,url,body);
    if(!tenantId || !branchId || !canAdminBranch(user,tenantId,branchId)) return error("Branch administrator access required.",403);
    const missing=required(body,["student_no","first_name"]); if(missing) return error(`Missing field: ${missing}`);
    const quotaError = await quotaCheck(env, tenantId, "students", 1); if (quotaError) return error(quotaError, 409);
    const id=uuid();
    try{
      await env.DB.prepare(`INSERT INTO students(
        id,tenant_id,branch_id,student_no,first_name,last_name,preferred_name,date_of_birth,gender,email,phone,status,grade_level_id,class_id,admission_date,notes
      ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
        id,tenantId,branchId,String(body.student_no),String(body.first_name),String(body.last_name||""),body.preferred_name||null,
        body.date_of_birth||null,body.gender||null,body.email||null,body.phone||null,body.status||"active",
        body.grade_level_id||null,body.class_id||null,body.admission_date||null,body.notes||null
      ).run();
      await env.DB.prepare("INSERT OR IGNORE INTO student_accounts(id,tenant_id,student_id,currency) VALUES(?,?,?,?)")
        .bind(uuid(),tenantId,id,body.currency||"IQD").run();
    }catch(e:any){ return error("Could not create student. Student number may already exist.",409,e?.message); }
    await audit(env,request,user.id,"CREATE","student",id,tenantId,branchId,requestId,body,null,"STUDENT_CREATED");
    return json({ok:true,id},{status:201});
  }

  // Staff
  if (path === "/api/staff" && request.method === "GET") {
    const {tenantId,branchId}=tenantScope(user,url);
    if(!tenantId || !canAccessBranch(user,tenantId,branchId)) return error("Scope not allowed.",403);
    const binds:any[]=[tenantId]; let filter="";
    if(branchId){filter=" AND EXISTS(SELECT 1 FROM staff_assignments sa WHERE sa.staff_id=st.id AND sa.branch_id=?)";binds.push(branchId);}
    const rows=await listRows(env,`SELECT st.* FROM staff st WHERE st.tenant_id=? ${filter} ORDER BY st.created_at DESC LIMIT 500`,binds);
    for(const row of rows){
      row.assignments=await listRows(env,`SELECT sa.*,b.name branch_name,d.name department_name FROM staff_assignments sa LEFT JOIN branches b ON b.id=sa.branch_id LEFT JOIN departments d ON d.id=sa.department_id WHERE sa.staff_id=? ORDER BY sa.starts_at DESC`,[row.id]);
    }
    return json({ok:true,rows});
  }

  if (path === "/api/staff" && request.method === "POST") {
    const body=await readJson<JsonMap>(request);
    const {tenantId,branchId}=tenantScope(user,url,body);
    if(!tenantId || !branchId || !canAdminBranch(user,tenantId,branchId)) return error("Branch administrator access required.",403);
    const missing=required(body,["employee_no","first_name"]); if(missing) return error(`Missing field: ${missing}`);
    const quotaError = await quotaCheck(env, tenantId, "staff", 1); if (quotaError) return error(quotaError, 409);
    const id=uuid();
    try{
      await env.DB.batch([
        env.DB.prepare(`INSERT INTO staff(id,tenant_id,employee_no,first_name,last_name,email,phone,employment_status,hire_date,job_title)
          VALUES(?,?,?,?,?,?,?,?,?,?)`).bind(id,tenantId,body.employee_no,body.first_name,body.last_name||"",body.email||null,body.phone||null,body.employment_status||"active",body.hire_date||null,body.job_title||null),
        env.DB.prepare(`INSERT INTO staff_assignments(id,staff_id,tenant_id,branch_id,department_id,assignment_type,title,workload_percent,cost_allocation_percent)
          VALUES(?,?,?,?,?,?,?,?,?)`).bind(uuid(),id,tenantId,branchId,body.department_id||null,body.assignment_type||"employee",body.job_title||null,Number(body.workload_percent||100),Number(body.cost_allocation_percent||100))
      ]);
    }catch(e:any){return error("Could not create staff member. Employee number may already exist.",409,e?.message);}
    await audit(env,request,user.id,"CREATE","staff",id,tenantId,branchId,requestId,body,null,"STAFF_CREATED");
    return json({ok:true,id},{status:201});
  }

  // Attendance
  if (path === "/api/attendance" && request.method === "GET") {
    const {tenantId,branchId}=tenantScope(user,url);
    if(!tenantId || !canAccessBranch(user,tenantId,branchId)) return error("Scope not allowed.",403);
    const date=url.searchParams.get("date") || new Date().toISOString().slice(0,10);
    const binds:any[]=[tenantId,date]; let branchFilter="";
    if(branchId){branchFilter=" AND s.branch_id=?";binds.push(branchId);}
    const rows=await listRows(env,`
      SELECT s.id student_id,s.student_no,s.first_name,s.last_name,s.branch_id,b.name branch_name,
        a.id attendance_id,a.status attendance_status,a.minutes_late,a.reason,a.note
      FROM students s JOIN branches b ON b.id=s.branch_id
      LEFT JOIN attendance_records a ON a.student_id=s.id AND a.attendance_date=? AND a.period_code='daily' AND a.course_section_id IS NULL
      WHERE s.tenant_id=? ${branchFilter} AND s.status='active'
      ORDER BY s.first_name,s.last_name
    `.replace("a.attendance_date=?","a.attendance_date=?"), branchId ? [date,tenantId,branchId] : [date,tenantId]);
    return json({ok:true,date,rows});
  }

  if (path === "/api/attendance" && request.method === "POST") {
    const body=await readJson<JsonMap>(request);
    const {tenantId,branchId}=tenantScope(user,url,body);
    if(!tenantId || !branchId || !canAccessBranch(user,tenantId,branchId)) return error("Scope not allowed.",403);
    const missing=required(body,["student_id","attendance_date","status"]); if(missing)return error(`Missing field: ${missing}`);
    const existing=await env.DB.prepare(`SELECT id FROM attendance_records WHERE student_id=? AND attendance_date=? AND period_code='daily' AND course_section_id IS NULL`)
      .bind(body.student_id,body.attendance_date).first<any>();
    const id=existing?.id||uuid();
    if(existing){
      await env.DB.prepare(`UPDATE attendance_records SET status=?,minutes_late=?,reason=?,note=?,recorded_by=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
        .bind(body.status,Number(body.minutes_late||0),body.reason||null,body.note||null,user.id,id).run();
    }else{
      await env.DB.prepare(`INSERT INTO attendance_records(id,tenant_id,branch_id,student_id,attendance_date,period_code,status,minutes_late,reason,note,recorded_by)
        VALUES(?,?,?,?,?,'daily',?,?,?,?,?)`).bind(id,tenantId,branchId,body.student_id,body.attendance_date,body.status,Number(body.minutes_late||0),body.reason||null,body.note||null,user.id).run();
    }
    await audit(env,request,user.id,existing?"UPDATE":"CREATE","attendance",id,tenantId,branchId,requestId,body,null,"ATTENDANCE_RECORDED");
    return json({ok:true,id});
  }

  // Finance invoices
  if (path === "/api/invoices" && request.method === "GET") {
    const {tenantId,branchId}=tenantScope(user,url);
    if(!tenantId || !canAccessBranch(user,tenantId,branchId)) return error("Scope not allowed.",403);
    const binds:any[]=[tenantId];let bf="";
    if(branchId){bf=" AND i.branch_id=?";binds.push(branchId);}
    const rows=await listRows(env,`SELECT i.*,b.name branch_name,s.student_no,s.first_name,s.last_name FROM invoices i JOIN branches b ON b.id=i.branch_id LEFT JOIN students s ON s.id=i.student_id WHERE i.tenant_id=? ${bf} ORDER BY i.issue_date DESC LIMIT 500`,binds);
    return json({ok:true,rows});
  }

  if (path === "/api/invoices" && request.method === "POST") {
    const body=await readJson<JsonMap>(request);
    const {tenantId,branchId}=tenantScope(user,url,body);
    if(!tenantId || !branchId || !canAdminBranch(user,tenantId,branchId)) return error("Finance scope not allowed.",403);
    const missing=required(body,["invoice_no","issue_date","total"]);if(missing)return error(`Missing field: ${missing}`);
    const id=uuid(),total=Number(body.total||0);
    await env.DB.prepare(`INSERT INTO invoices(id,tenant_id,branch_id,student_id,invoice_no,issue_date,due_date,currency,subtotal,discount_total,total,paid_total,status,notes,created_by)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,tenantId,branchId,body.student_id||null,body.invoice_no,body.issue_date,body.due_date||null,body.currency||"IQD",Number(body.subtotal??total),Number(body.discount_total||0),total,0,body.status||"issued",body.notes||null,user.id).run();
    await audit(env,request,user.id,"CREATE","invoice",id,tenantId,branchId,requestId,body,null,"INVOICE_CREATED");
    return json({ok:true,id},{status:201});
  }

  // Payroll
  if (path === "/api/payroll" && request.method === "GET") {
    const {tenantId,branchId}=tenantScope(user,url);
    if(!tenantId || !canAccessBranch(user,tenantId,branchId))return error("Scope not allowed.",403);
    const binds:any[]=[tenantId];let bf="";
    if(branchId){bf=" AND pe.branch_id=?";binds.push(branchId);}
    const rows=await listRows(env,`
      SELECT pe.*,pp.name period_name,pp.starts_on,pp.ends_on,st.employee_no,st.first_name,st.last_name
      FROM payroll_entries pe JOIN payroll_periods pp ON pp.id=pe.payroll_period_id JOIN staff st ON st.id=pe.staff_id
      WHERE pe.tenant_id=? ${bf} ORDER BY pp.starts_on DESC,st.first_name LIMIT 500`,binds);
    return json({ok:true,rows});
  }

  if (path === "/api/payroll" && request.method === "POST") {
    const body=await readJson<JsonMap>(request);
    const {tenantId,branchId}=tenantScope(user,url,body);
    if(!tenantId || !canAdminBranch(user,tenantId,branchId||""))return error("Payroll administrator access required.",403);
    const missing=required(body,["staff_id","period_name","starts_on","ends_on"]);if(missing)return error(`Missing field: ${missing}`);
    let period=await env.DB.prepare("SELECT id FROM payroll_periods WHERE tenant_id=? AND name=? AND starts_on=? AND ends_on=?")
      .bind(tenantId,body.period_name,body.starts_on,body.ends_on).first<any>();
    let periodId=period?.id;
    if(!periodId){
      periodId=uuid();
      await env.DB.prepare("INSERT INTO payroll_periods(id,tenant_id,name,starts_on,ends_on,pay_date,status) VALUES(?,?,?,?,?,?,'draft')")
        .bind(periodId,tenantId,body.period_name,body.starts_on,body.ends_on,body.pay_date||null).run();
    }
    const id=uuid();
    const base=Number(body.base_pay||0),variable=Number(body.variable_pay||0),bonus=Number(body.bonus||0),allowances=Number(body.allowances||0),deductions=Number(body.deductions||0);
    const net=base+variable+bonus+allowances-deductions;
    await env.DB.prepare(`INSERT INTO payroll_entries(id,tenant_id,branch_id,payroll_period_id,staff_id,base_pay,variable_pay,bonus,allowances,deductions,net_pay,status,calculation_json)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,'draft',?)`).bind(id,tenantId,branchId||null,periodId,body.staff_id,base,variable,bonus,allowances,deductions,net,JSON.stringify(body.calculation||{})).run();
    await audit(env,request,user.id,"CREATE","payroll_entry",id,tenantId,branchId,requestId,{...body,net_pay:net},null,"PAYROLL_ENTRY_CREATED");
    return json({ok:true,id,net_pay:net},{status:201});
  }

  // Student import from parsed Excel rows
  if (path === "/api/import/students" && request.method === "POST") {
    const body=await readJson<JsonMap>(request);
    const {tenantId,branchId}=tenantScope(user,url,body);
    if(!tenantId || !branchId || !canAdminBranch(user,tenantId,branchId)) return error("Branch administrator access required.",403);
    const rows=Array.isArray(body.rows)?body.rows:[];
    if(!rows.length)return error("No rows supplied.");
    if(rows.length>2000)return error("For the free starter, import up to 2,000 rows per batch.");
    const quotaError = await quotaCheck(env, tenantId, "students", rows.length); if (quotaError) return error(quotaError, 409);
    const jobId=uuid();
    let valid=0,errors:any[]=[],statements:D1PreparedStatement[]=[];
    const seen=new Set<string>();
    for(let idx=0;idx<rows.length;idx++){
      const r=rows[idx]||{};
      const studentNo=String(r.student_no||r["Student ID"]||r["Student No"]||"").trim();
      const firstName=String(r.first_name||r["First Name"]||r["Student Name"]||"").trim();
      const lastName=String(r.last_name||r["Last Name"]||"").trim();
      if(!studentNo||!firstName){errors.push({row:idx+2,error:"Student number and first name are required"});continue;}
      if(seen.has(studentNo)){errors.push({row:idx+2,error:"Duplicate student number inside file"});continue;}
      seen.add(studentNo);valid++;
      statements.push(env.DB.prepare(`INSERT OR IGNORE INTO students(id,tenant_id,branch_id,student_no,first_name,last_name,date_of_birth,gender,email,phone,status,admission_date,notes)
        VALUES(?,?,?,?,?,?,?,?,?,?, 'active',?,?)`).bind(uuid(),tenantId,branchId,studentNo,firstName,lastName,r.date_of_birth||r["Date of Birth"]||null,r.gender||r["Gender"]||null,r.email||r["Email"]||null,r.phone||r["Phone"]||null,r.admission_date||null,r.notes||null));
    }
    await env.DB.prepare(`INSERT INTO import_jobs(id,tenant_id,branch_id,import_type,source_filename,total_rows,valid_rows,error_rows,status,summary_json,created_by)
      VALUES(?,?,?,?,?,?,?,?,?,?,?)`).bind(jobId,tenantId,branchId,"students",body.filename||null,rows.length,valid,errors.length,"processing",JSON.stringify({errors:errors.slice(0,100)}),user.id).run();
    let imported=0;
    for(let i=0;i<statements.length;i+=100){
      const results=await env.DB.batch(statements.slice(i,i+100));
      imported += results.filter((r:any)=>r.success).length;
    }
    await env.DB.prepare(`UPDATE import_jobs SET imported_rows=?,status='completed',completed_at=CURRENT_TIMESTAMP WHERE id=?`).bind(imported,jobId).run();
    await audit(env,request,user.id,"IMPORT","student",jobId,tenantId,branchId,requestId,{total:rows.length,valid,errors:errors.length,imported},null,"STUDENT_IMPORT_COMPLETED");
    return json({ok:true,job_id:jobId,total:rows.length,valid,errors,imported});
  }

  // Audit viewer
  if (path === "/api/audit" && request.method === "GET") {
    const {tenantId,branchId}=tenantScope(user,url);
    if(tenantId && !canAccessBranch(user,tenantId,branchId))return error("Scope not allowed.",403);
    if(!tenantId && !isPlatformOwner(user))return error("Tenant scope required.",403);
    const binds:any[]=[];let where="1=1";
    if(tenantId){where+=" AND a.tenant_id=?";binds.push(tenantId);}
    if(branchId){where+=" AND a.branch_id=?";binds.push(branchId);}
    const rows=await listRows(env,`SELECT a.*,u.name actor_name,u.email actor_email FROM audit_logs a LEFT JOIN users u ON u.id=a.actor_user_id WHERE ${where} ORDER BY a.created_at DESC LIMIT 500`,binds);
    return json({ok:true,rows});
  }

  return error("API route not found.",404);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const response = await route(request, env);
      return securityHeaders(response);
    } catch (e:any) {
      console.error("Unhandled API error", e);
      return securityHeaders(error("Unexpected server error.", 500, e?.message));
    }
  }
};
