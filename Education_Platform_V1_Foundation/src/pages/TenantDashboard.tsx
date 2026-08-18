import React,{useEffect,useState} from "react";
import {api,qs} from "../lib/api";
import {Badge,PageHeader,StatCard} from "../components/ui";
export default function TenantDashboard({tenantId,branchId,tenant}:{tenantId:string,branchId:string|null,tenant:any}){
  const [s,setS]=useState<any>({});
  useEffect(()=>{if(!tenantId)return; Promise.all([
    api<any>("/api/branches"+qs({tenant_id:tenantId})),
    api<any>("/api/students"+qs({tenant_id:tenantId,branch_id:branchId})),
    api<any>("/api/staff"+qs({tenant_id:tenantId,branch_id:branchId})),
    api<any>("/api/invoices"+qs({tenant_id:tenantId,branch_id:branchId}))
  ]).then(([b,st,sf,inv])=>setS({branches:b.rows.length,students:st.rows.length,staff:sf.rows.length,invoices:inv.rows.length,outstanding:inv.rows.reduce((a:number,x:any)=>a+Math.max(0,Number(x.total)-Number(x.paid_total)),0)})).catch(()=>{})},[tenantId,branchId]);
  return <div><PageHeader title={tenant?.name||"School workspace"} description={branchId?"Branch-scoped operational dashboard":"Group-level consolidated workspace"}/>
    <div className="context-banner"><div><strong>{tenant?.status||"active"}</strong><span>Plan: {tenant?.plan_code||"—"}</span></div><Badge tone="info">{branchId?"Branch view":"Consolidated view"}</Badge></div>
    <div className="stats-grid">
      {!branchId&&<StatCard label="Branches" value={s.branches??"—"}/>}
      <StatCard label="Students" value={s.students??"—"}/>
      <StatCard label="Staff" value={s.staff??"—"}/>
      <StatCard label="Invoices" value={s.invoices??"—"}/>
      <StatCard label="Outstanding" value={Number(s.outstanding||0).toLocaleString()} meta={tenant?.default_currency||"IQD"}/>
    </div>
    <div className="grid-3 mt">
      {["Admissions & Enrollment","Academic & Attendance","Finance & Payroll"].map((x,i)=><section className="panel shortcut" key={x}><span className="shortcut-no">0{i+1}</span><h3>{x}</h3><p>{i===0?"Applicant lifecycle, students and families.":i===1?"Daily school operations and learning data.":"Billing, payments and staff compensation."}</p></section>)}
    </div>
  </div>
}
