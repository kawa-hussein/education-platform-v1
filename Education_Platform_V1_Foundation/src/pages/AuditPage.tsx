import React,{useEffect,useState} from "react";
import {api,qs} from "../lib/api";
import {Badge,DataTable,PageHeader} from "../components/ui";
import {useI18n} from "../lib/i18nContext";
export default function AuditPage({tenantId,branchId,isPlatformOwner}:{tenantId:string|null,branchId:string|null,isPlatformOwner:boolean}){
 const {lang,label}=useI18n(),c=(en:string,ku:string,ar:string,tr:string)=>lang==="ku"?ku:lang==="ar"?ar:lang==="tr"?tr:en;
 const [rows,setRows]=useState<any[]>([]),[error,setError]=useState("");
 useEffect(()=>{if(!tenantId&&!isPlatformOwner)return;api<any>("/api/audit"+qs({tenant_id:tenantId,branch_id:branchId})).then(r=>setRows(r.rows)).catch(e=>setError(e.message))},[tenantId,branchId,isPlatformOwner]);
 return <div><PageHeader title={c("Audit Trail","مێژووی پشکنین","مسار التدقيق","Denetim İzi")} description={c("Security-sensitive actions are attributed to actor, customer, branch, entity and request.","کردارە هەستیارەکانی ئاسایش بە ئەنجامدەر، کڕیار، لق، یەکە و داواکارییەکەوە دەبەسترێن.","تُنسب الإجراءات الحساسة أمنياً إلى المنفذ والعميل والفرع والكيان والطلب.","Güvenlik açısından hassas işlemler kullanıcı, müşteri, şube, varlık ve isteğe bağlanır.")}/>
 {error&&<div className="alert alert-error">{error}</div>}
 <div className="panel"><DataTable rows={rows} columns={[
  {key:"created_at",label:c("Time","کات","الوقت","Zaman"),render:r=>new Date(r.created_at+"Z").toLocaleString(lang==="ku"?"ku-Arab":lang)},{key:"action",label:c("Action","کردار","الإجراء","İşlem"),render:r=><Badge tone="info">{label(r.action)}</Badge>},
  {key:"entity_type",label:c("Entity","یەکە","الكيان","Varlık"),render:r=>label(r.entity_type)},{key:"entity_id",label:c("Record","تۆمار","السجل","Kayıt")},{key:"actor_name",label:c("Actor","ئەنجامدەر","المنفذ","Kullanıcı"),render:r=>r.actor_name||c("System","سیستەم","النظام","Sistem")},{key:"event_code",label:c("Event","ڕووداو","الحدث","Olay")}
 ]}/></div></div>
}
