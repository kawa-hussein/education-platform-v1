import React,{useEffect,useState} from "react";
import {api,qs} from "../lib/api";
import {Badge,DataTable,PageHeader} from "../components/ui";
export default function AuditPage({tenantId,branchId,isPlatformOwner}:{tenantId:string|null,branchId:string|null,isPlatformOwner:boolean}){
 const [rows,setRows]=useState<any[]>([]),[error,setError]=useState("");
 useEffect(()=>{if(!tenantId&&!isPlatformOwner)return;api<any>("/api/audit"+qs({tenant_id:tenantId,branch_id:branchId})).then(r=>setRows(r.rows)).catch(e=>setError(e.message))},[tenantId,branchId,isPlatformOwner]);
 return <div><PageHeader title="Audit Trail" description="Security-sensitive actions are attributed to actor, tenant, branch, entity and request."/>
 {error&&<div className="alert alert-error">{error}</div>}
 <div className="panel"><DataTable rows={rows} columns={[
  {key:"created_at",label:"Time",render:r=>new Date(r.created_at+"Z").toLocaleString()},{key:"action",label:"Action",render:r=><Badge tone="info">{r.action}</Badge>},
  {key:"entity_type",label:"Entity"},{key:"entity_id",label:"Record"},{key:"actor_name",label:"Actor",render:r=>r.actor_name||"System"},
  {key:"event_code",label:"Event"}
 ]}/></div></div>
}
