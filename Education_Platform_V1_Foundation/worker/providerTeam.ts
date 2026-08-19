import type {AuthUser,Env} from "./types";
import {audit} from "./audit";
import {makePassword} from "./auth";
import {bytesToBase64,error,json,readJson,sha256,uuid} from "./utils";
import {hasProviderPermission,isProviderOwner,isProviderUser,PROVIDER_PERMISSIONS,providerPermissions,publicProviderRoles,roleDefinition} from "./providerAccess";

type JsonMap=Record<string,any>;

function randomToken(){
  const bytes=crypto.getRandomValues(new Uint8Array(32));
  return bytesToBase64(bytes).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
}
function cleanEmail(v:any){return String(v||"").trim().toLowerCase();}
function cleanName(v:any){return String(v||"").trim();}
function validRole(code:string){return !!roleDefinition(code)&&code!=="platform_owner";}
function normalizeOverrides(value:any):Record<string,"allow"|"deny">{
  const allowed=new Set(PROVIDER_PERMISSIONS.map(x=>x.code));
  const out:Record<string,"allow"|"deny">={};
  if(value&&typeof value==="object") for(const [k,v] of Object.entries(value)) if(allowed.has(k as any)&&(v==="allow"||v==="deny")) out[k]=v;
  return out;
}
async function replaceOverrides(env:Env,userId:string,overrides:Record<string,"allow"|"deny">,actorId:string){
  await env.DB.prepare("DELETE FROM provider_user_permission_overrides WHERE user_id=?").bind(userId).run();
  const rows=Object.entries(overrides);
  if(rows.length) await env.DB.batch(rows.map(([code,effect])=>env.DB.prepare(`INSERT INTO provider_user_permission_overrides(user_id,permission_code,effect,created_by) VALUES(?,?,?,?)`).bind(userId,code,effect,actorId)));
}
async function activeOwnerCount(env:Env){
  const row=await env.DB.prepare(`SELECT COUNT(DISTINCT u.id) c FROM users u JOIN role_assignments r ON r.user_id=u.id WHERE u.status='active' AND r.tenant_id IS NULL AND r.role_code IN ('platform_owner','provider_owner')`).first<any>();
  return Number(row?.c||0);
}
async function currentProviderRole(env:Env,userId:string){
  return await env.DB.prepare(`SELECT role_code FROM role_assignments WHERE user_id=? AND tenant_id IS NULL ORDER BY created_at DESC LIMIT 1`).bind(userId).first<any>();
}

export async function handlePublicProviderInvite(request:Request,env:Env):Promise<Response|null>{
  const url=new URL(request.url), path=url.pathname;
  if(path==="/api/provider/invitations/validate"&&request.method==="GET"){
    const token=url.searchParams.get("token")||"";
    if(!token)return error("Invitation token required.",400);
    const tokenHash=await sha256(token);
    const row=await env.DB.prepare(`SELECT id,email,name,role_code,status,expires_at FROM provider_invitations WHERE token_hash=? LIMIT 1`).bind(tokenHash).first<any>();
    if(!row)return error("Invitation not found.",404);
    if(row.status!=="pending")return error(`Invitation is ${row.status}.`,409);
    if(new Date(row.expires_at).getTime()<=Date.now()){
      await env.DB.prepare("UPDATE provider_invitations SET status='expired' WHERE id=?").bind(row.id).run();
      return error("Invitation has expired.",410);
    }
    const role=roleDefinition(row.role_code);
    return json({ok:true,invitation:{id:row.id,email:row.email,name:row.name,role_code:row.role_code,role_name:role?.name||row.role_code,expires_at:row.expires_at}});
  }
  if(path==="/api/provider/invitations/accept"&&request.method==="POST"){
    const body=await readJson<JsonMap>(request), token=String(body.token||"");
    if(!token||String(body.password||"").length<10)return error("A valid invitation and password of at least 10 characters are required.",400);
    const tokenHash=await sha256(token);
    const invite=await env.DB.prepare(`SELECT * FROM provider_invitations WHERE token_hash=? LIMIT 1`).bind(tokenHash).first<any>();
    if(!invite)return error("Invitation not found.",404);
    if(invite.status!=="pending")return error(`Invitation is ${invite.status}.`,409);
    if(new Date(invite.expires_at).getTime()<=Date.now()){
      await env.DB.prepare("UPDATE provider_invitations SET status='expired' WHERE id=?").bind(invite.id).run();
      return error("Invitation has expired.",410);
    }
    const exists=await env.DB.prepare("SELECT id FROM users WHERE email=? COLLATE NOCASE LIMIT 1").bind(invite.email).first<any>();
    if(exists)return error("An account with this email already exists. Ask a Provider Owner to add access to that account.",409);
    const id=uuid(), pw=await makePassword(String(body.password)), name=cleanName(body.name)||invite.name;
    try{
      await env.DB.batch([
        env.DB.prepare("INSERT INTO users(id,email,name,password_hash,password_salt,status,preferred_language) VALUES(?,?,?,?,?,'active',?)").bind(id,invite.email,name,pw.hash,pw.salt,body.preferred_language||"en"),
        env.DB.prepare("INSERT INTO role_assignments(id,user_id,role_code,can_delegate) VALUES(?,?,?,?,?)".replace("VALUES(?,?,?,?,?)","VALUES(?,?,?,?)")).bind(uuid(),id,invite.role_code,invite.role_code==="provider_owner"?1:0),
        env.DB.prepare("UPDATE provider_invitations SET status='accepted',accepted_user_id=?,accepted_at=CURRENT_TIMESTAMP WHERE id=?").bind(id,invite.id)
      ]);
      const overrides=normalizeOverrides(JSON.parse(invite.permission_overrides_json||"{}"));
      await replaceOverrides(env,id,overrides,invite.created_by);
    }catch(e:any){return error("Could not create provider account.",409,e?.message);}
    await audit(env,request,id,"ACCEPT","provider_invitation",invite.id,null,null,request.headers.get("cf-ray")||uuid(),{email:invite.email,role:invite.role_code},null,"PROVIDER_INVITATION_ACCEPTED");
    return json({ok:true,message:"Provider account activated. You can now sign in."},{status:201});
  }
  return null;
}

export async function handleProviderTeamRoute(request:Request,env:Env,user:AuthUser,requestId:string):Promise<Response|null>{
  const url=new URL(request.url), path=url.pathname;
  if(!path.startsWith("/api/provider/"))return null;
  if(!isProviderUser(user))return error("Provider access required.",403);

  if(path==="/api/provider/roles"&&request.method==="GET"){
    if(!(await hasProviderPermission(env,user,"provider.team.view")))return error("Provider team access required.",403);
    return json({ok:true,roles:publicProviderRoles(),permissions:PROVIDER_PERMISSIONS});
  }

  if(path==="/api/provider/team"&&request.method==="GET"){
    if(!(await hasProviderPermission(env,user,"provider.team.view")))return error("Provider team access required.",403);
    const assignments=(await env.DB.prepare(`SELECT u.id,u.name,u.email,u.status,u.preferred_language,u.created_at,r.role_code,r.can_delegate,r.created_at role_assigned_at FROM users u JOIN role_assignments r ON r.user_id=u.id WHERE r.tenant_id IS NULL ORDER BY u.name`).all<any>()).results||[];
    const rows=[] as any[];
    for(const row of assignments){
      const role=roleDefinition(row.role_code); if(!role)continue;
      const overrides=(await env.DB.prepare("SELECT permission_code,effect FROM provider_user_permission_overrides WHERE user_id=? ORDER BY permission_code").bind(row.id).all<any>()).results||[];
      rows.push({...row,role_name:role.name,permission_overrides:overrides});
    }
    const invitations=(await env.DB.prepare(`SELECT i.id,i.email,i.name,i.role_code,i.status,i.expires_at,i.created_at,i.accepted_at,i.accepted_user_id,u.name created_by_name FROM provider_invitations i LEFT JOIN users u ON u.id=i.created_by ORDER BY i.created_at DESC LIMIT 100`).all<any>()).results||[];
    return json({ok:true,rows,invitations,current_user_id:user.id,current_permissions:await providerPermissions(env,user)});
  }

  if(path==="/api/provider/team/users"&&request.method==="POST"){
    if(!(await hasProviderPermission(env,user,"provider.team.manage")))return error("Provider team management permission required.",403);
    const body=await readJson<JsonMap>(request), roleCode=String(body.role_code||"");
    if(!cleanName(body.name)||!cleanEmail(body.email)||String(body.password||"").length<10||!validRole(roleCode))return error("Name, email, valid role and a password of at least 10 characters are required.",400);
    if(roleCode==="provider_owner"&&!isProviderOwner(user))return error("Only a Provider Owner can create another Provider Owner.",403);
    const existing=await env.DB.prepare("SELECT id FROM users WHERE email=? COLLATE NOCASE LIMIT 1").bind(cleanEmail(body.email)).first<any>();
    if(existing)return error("A user with this email already exists.",409);
    const id=uuid(), pw=await makePassword(String(body.password)), overrides=normalizeOverrides(body.permission_overrides);
    try{
      await env.DB.batch([
        env.DB.prepare("INSERT INTO users(id,email,name,password_hash,password_salt,status,preferred_language) VALUES(?,?,?,?,?,'active',?)").bind(id,cleanEmail(body.email),cleanName(body.name),pw.hash,pw.salt,body.preferred_language||"en"),
        env.DB.prepare("INSERT INTO role_assignments(id,user_id,role_code,can_delegate) VALUES(?,?,?,?)").bind(uuid(),id,roleCode,roleCode==="provider_owner"?1:0)
      ]);
      await replaceOverrides(env,id,overrides,user.id);
    }catch(e:any){return error("Could not create provider user.",409,e?.message);}
    await audit(env,request,user.id,"CREATE","provider_user",id,null,null,requestId,{email:body.email,role:roleCode,overrides},null,"PROVIDER_USER_CREATED");
    return json({ok:true,id,login_url:url.origin},{status:201});
  }

  if(path==="/api/provider/team/invitations"&&request.method==="POST"){
    if(!(await hasProviderPermission(env,user,"provider.team.manage")))return error("Provider team management permission required.",403);
    const body=await readJson<JsonMap>(request), roleCode=String(body.role_code||"");
    if(!cleanName(body.name)||!cleanEmail(body.email)||!validRole(roleCode))return error("Name, email and a valid role are required.",400);
    if(roleCode==="provider_owner"&&!isProviderOwner(user))return error("Only a Provider Owner can invite another Provider Owner.",403);
    const existing=await env.DB.prepare("SELECT id FROM users WHERE email=? COLLATE NOCASE LIMIT 1").bind(cleanEmail(body.email)).first<any>();
    if(existing)return error("A user with this email already exists.",409);
    await env.DB.prepare("UPDATE provider_invitations SET status='revoked' WHERE email=? COLLATE NOCASE AND status='pending'").bind(cleanEmail(body.email)).run();
    const token=randomToken(), tokenHash=await sha256(token), id=uuid(), expiresAt=new Date(Date.now()+7*86400000).toISOString(), overrides=normalizeOverrides(body.permission_overrides);
    await env.DB.prepare(`INSERT INTO provider_invitations(id,email,name,role_code,token_hash,permission_overrides_json,expires_at,created_by) VALUES(?,?,?,?,?,?,?,?)`).bind(id,cleanEmail(body.email),cleanName(body.name),roleCode,tokenHash,JSON.stringify(overrides),expiresAt,user.id).run();
    const inviteUrl=`${url.origin}/?provider_invite=${encodeURIComponent(token)}`;
    await audit(env,request,user.id,"CREATE","provider_invitation",id,null,null,requestId,{email:body.email,role:roleCode,expires_at:expiresAt},null,"PROVIDER_INVITATION_CREATED");
    return json({ok:true,id,invite_url:inviteUrl,expires_at:expiresAt},{status:201});
  }

  const revoke=path.match(/^\/api\/provider\/team\/invitations\/([^/]+)\/revoke$/);
  if(revoke&&request.method==="POST"){
    if(!(await hasProviderPermission(env,user,"provider.team.manage")))return error("Provider team management permission required.",403);
    const invite=await env.DB.prepare("SELECT * FROM provider_invitations WHERE id=?").bind(revoke[1]).first<any>();
    if(!invite)return error("Invitation not found.",404);
    if(invite.role_code==="provider_owner"&&!isProviderOwner(user))return error("Only a Provider Owner can revoke an owner invitation.",403);
    await env.DB.prepare("UPDATE provider_invitations SET status='revoked' WHERE id=? AND status='pending'").bind(invite.id).run();
    await audit(env,request,user.id,"REVOKE","provider_invitation",invite.id,null,null,requestId,{email:invite.email},null,"PROVIDER_INVITATION_REVOKED");
    return json({ok:true});
  }

  const userMatch=path.match(/^\/api\/provider\/team\/users\/([^/]+)$/);
  if(userMatch&&request.method==="PATCH"){
    if(!(await hasProviderPermission(env,user,"provider.team.manage")))return error("Provider team management permission required.",403);
    const targetId=userMatch[1], body=await readJson<JsonMap>(request), current=await currentProviderRole(env,targetId);
    if(!current)return error("Provider user not found.",404);
    const targetIsOwner=current.role_code==="provider_owner"||current.role_code==="platform_owner";
    if(targetIsOwner&&!isProviderOwner(user))return error("Only a Provider Owner can change another owner.",403);
    if(targetId===user.id&&(body.status&&body.status!=="active"||body.role_code&&body.role_code!==current.role_code))return error("You cannot suspend or demote your own provider account.",409);
    const newRole=body.role_code?String(body.role_code):current.role_code;
    if(body.role_code&&!validRole(newRole))return error("Invalid provider role.",400);
    if(newRole==="provider_owner"&&!isProviderOwner(user))return error("Only a Provider Owner can grant Provider Owner.",403);
    if(targetIsOwner&&newRole!=="provider_owner"&&newRole!=="platform_owner"&&await activeOwnerCount(env)<=1)return error("The last active Provider Owner cannot be removed or demoted.",409);
    if(targetIsOwner&&body.status&&body.status!=="active"&&await activeOwnerCount(env)<=1)return error("The last active Provider Owner cannot be suspended.",409);
    if(body.role_code&&newRole!==current.role_code){
      await env.DB.prepare("UPDATE role_assignments SET role_code=?,can_delegate=? WHERE user_id=? AND tenant_id IS NULL").bind(newRole,newRole==="provider_owner"?1:0,targetId).run();
    }
    if(body.status){
      if(!["active","suspended","disabled"].includes(String(body.status)))return error("Invalid status.",400);
      await env.DB.prepare("UPDATE users SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(body.status,targetId).run();
      if(body.status!=="active")await env.DB.prepare("DELETE FROM sessions WHERE user_id=?").bind(targetId).run();
    }
    if(body.permission_overrides!==undefined)await replaceOverrides(env,targetId,normalizeOverrides(body.permission_overrides),user.id);
    await audit(env,request,user.id,"UPDATE","provider_user",targetId,null,null,requestId,{role:newRole,status:body.status,permission_overrides:body.permission_overrides},null,"PROVIDER_USER_UPDATED");
    return json({ok:true});
  }

  return null;
}
