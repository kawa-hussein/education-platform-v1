import type {AuthUser,Env} from "./types";
import {audit} from "./audit";
import {canAccessBranch} from "./permissions";
import {hasProviderPermission,isProviderUser} from "./providerAccess";
import {error,json,readJson,uuid} from "./utils";

type JsonMap=Record<string,any>;
const validStatuses=new Set(["draft","active","pending","approved","completed","archived"]);
const providerPermissionForCode:Record<string,string>={
 P01:"provider.dashboard.view",P02:"provider.customers.view",P03:"provider.commercial.manage",P04:"provider.commercial.manage",P05:"provider.commercial.manage",P06:"provider.commercial.manage",P07:"provider.billing.view",P08:"provider.operations.manage",P09:"provider.delivery.manage",P10:"provider.delivery.manage",P11:"provider.customers.view",P12:"provider.success.manage",P13:"provider.support.manage",P14:"provider.support.elevated",P15:"provider.operations.manage",P16:"provider.operations.manage",P17:"provider.operations.manage",P18:"provider.security.manage",P19:"provider.operations.manage",P20:"provider.operations.manage",P21:"provider.settings.manage",P22:"provider.settings.manage",P23:"provider.operations.manage",P24:"provider.success.manage",P25:"provider.security.manage",P26:"provider.billing.view",P27:"provider.dashboard.view",P28:"provider.billing.view",P29:"provider.team.view",P30:"provider.audit.view",P31:"provider.security.manage",P32:"provider.operations.manage",P33:"provider.commercial.manage",P34:"provider.security.manage",P35:"provider.operations.manage"
};

function scope(url:URL,body?:JsonMap){return {tenantId:(body?.tenant_id||url.searchParams.get("tenant_id")||null) as string|null,branchId:(body?.branch_id||url.searchParams.get("branch_id")||null) as string|null};}
async function authorize(env:Env,user:AuthUser,code:string,tenantId:string|null,branchId:string|null){
  if(code.startsWith("P")){
    if(!isProviderUser(user))return false;
    const permission=providerPermissionForCode[code];
    return permission?await hasProviderPermission(env,user,permission):true;
  }
  if(!tenantId)return false;
  return canAccessBranch(user,tenantId,branchId);
}
function cleanStatus(value:any){const v=String(value||"draft").toLowerCase();return validStatuses.has(v)?v:"draft";}

export async function handleModuleWorkbenchRoute(request:Request,env:Env,user:AuthUser,requestId:string):Promise<Response|null>{
  const url=new URL(request.url),path=url.pathname;
  const listMatch=path.match(/^\/api\/modules\/([A-Z]\d{2})\/records$/i);
  const recordMatch=path.match(/^\/api\/modules\/([A-Z]\d{2})\/records\/([^/]+)$/i);
  const activityMatch=path.match(/^\/api\/modules\/([A-Z]\d{2})\/activity$/i);
  if(!listMatch&&!recordMatch&&!activityMatch)return null;
  const code=String((listMatch||recordMatch||activityMatch)![1]).toUpperCase();

  if(listMatch&&request.method==="GET"){
    const {tenantId,branchId}=scope(url);
    if(!(await authorize(env,user,code,tenantId,branchId)))return error("Module access not allowed in this scope.",403);
    const binds:any[]=[code]; let where="module_code=?";
    if(code.startsWith("P")){where+=" AND tenant_id IS NULL";}
    else {where+=" AND tenant_id=?";binds.push(tenantId);if(branchId){where+=" AND (branch_id IS NULL OR branch_id=?)";binds.push(branchId);}}
    const section=url.searchParams.get("section"); if(section){where+=" AND section_key=?";binds.push(section);}
    const status=url.searchParams.get("status"); if(status&&validStatuses.has(status)){where+=" AND status=?";binds.push(status);}
    const q=(url.searchParams.get("q")||"").trim();if(q){where+=" AND (title LIKE ? OR description LIKE ? OR record_type LIKE ?)";binds.push(`%${q}%`,`%${q}%`,`%${q}%`);}
    const rows=(await env.DB.prepare(`SELECT mr.*,u.name owner_name,c.name created_by_name FROM module_records mr LEFT JOIN users u ON u.id=mr.owner_user_id LEFT JOIN users c ON c.id=mr.created_by WHERE ${where} ORDER BY mr.updated_at DESC LIMIT 500`).bind(...binds).all<any>()).results||[];
    return json({ok:true,rows});
  }

  if(listMatch&&request.method==="POST"){
    const body=await readJson<JsonMap>(request),{tenantId,branchId}=scope(url,body);
    if(!(await authorize(env,user,code,tenantId,branchId)))return error("Module write access not allowed in this scope.",403);
    const title=String(body.title||"").trim();if(!title)return error("Record title is required.",400);
    const id=uuid(),status=cleanStatus(body.status),data=body.data&&typeof body.data==="object"?body.data:{};
    await env.DB.prepare(`INSERT INTO module_records(id,module_code,section_key,tenant_id,branch_id,record_type,title,status,description,data_json,owner_user_id,created_by,updated_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(id,code,body.section_key||null,code.startsWith("P")?null:tenantId,code.startsWith("P")?null:(branchId||null),String(body.record_type||"general"),title,status,body.description||null,JSON.stringify(data),body.owner_user_id||user.id,user.id,user.id).run();
    await audit(env,request,user.id,"CREATE","module_record",id,code.startsWith("P")?null:tenantId,code.startsWith("P")?null:branchId,requestId,{module_code:code,title,status,section_key:body.section_key},null,"MODULE_RECORD_CREATED");
    return json({ok:true,id},{status:201});
  }

  if(recordMatch&&request.method==="PATCH"){
    const id=recordMatch[2],body=await readJson<JsonMap>(request),existing=await env.DB.prepare("SELECT * FROM module_records WHERE id=? AND module_code=?").bind(id,code).first<any>();
    if(!existing)return error("Record not found.",404);
    if(!(await authorize(env,user,code,existing.tenant_id,existing.branch_id)))return error("Module write access not allowed.",403);
    const title=body.title!==undefined?String(body.title).trim():existing.title;if(!title)return error("Record title is required.",400);
    const status=body.status!==undefined?cleanStatus(body.status):existing.status;
    const description=body.description!==undefined?body.description:existing.description;
    const recordType=body.record_type!==undefined?String(body.record_type||"general"):existing.record_type;
    const sectionKey=body.section_key!==undefined?body.section_key:existing.section_key;
    const data=body.data!==undefined?JSON.stringify(body.data||{}):existing.data_json;
    const owner=body.owner_user_id!==undefined?body.owner_user_id:existing.owner_user_id;
    await env.DB.prepare(`UPDATE module_records SET title=?,status=?,description=?,record_type=?,section_key=?,data_json=?,owner_user_id=?,updated_by=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .bind(title,status,description,recordType,sectionKey,data,owner,user.id,id).run();
    await audit(env,request,user.id,"UPDATE","module_record",id,existing.tenant_id,existing.branch_id,requestId,{module_code:code,title,status,section_key:sectionKey},{title:existing.title,status:existing.status,section_key:existing.section_key},"MODULE_RECORD_UPDATED");
    return json({ok:true});
  }

  if(recordMatch&&request.method==="DELETE"){
    const id=recordMatch[2],existing=await env.DB.prepare("SELECT * FROM module_records WHERE id=? AND module_code=?").bind(id,code).first<any>();
    if(!existing)return error("Record not found.",404);
    if(!(await authorize(env,user,code,existing.tenant_id,existing.branch_id)))return error("Module write access not allowed.",403);
    await env.DB.prepare("UPDATE module_records SET status='archived',updated_by=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(user.id,id).run();
    await audit(env,request,user.id,"ARCHIVE","module_record",id,existing.tenant_id,existing.branch_id,requestId,{module_code:code},null,"MODULE_RECORD_ARCHIVED");
    return json({ok:true});
  }

  if(activityMatch&&request.method==="GET"){
    const {tenantId,branchId}=scope(url);
    if(!(await authorize(env,user,code,tenantId,branchId)))return error("Module access not allowed in this scope.",403);
    const binds:any[]=[`%\"module_code\":\"${code}\"%`];
    let where="a.entity_type='module_record' AND a.new_json LIKE ?";
    if(!code.startsWith("P")&&tenantId){where+=" AND a.tenant_id=?";binds.push(tenantId);if(branchId){where+=" AND (a.branch_id IS NULL OR a.branch_id=?)";binds.push(branchId);}}
    const rows=(await env.DB.prepare(`SELECT a.id,a.action,a.event_type,a.record_id,a.created_at,u.name actor_name,u.email actor_email FROM audit_logs a LEFT JOIN users u ON u.id=a.actor_user_id WHERE ${where} ORDER BY a.created_at DESC LIMIT 100`).bind(...binds).all<any>()).results||[];
    return json({ok:true,rows});
  }
  return null;
}
