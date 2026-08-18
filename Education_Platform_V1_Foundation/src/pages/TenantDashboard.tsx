import React,{useEffect,useState} from "react";
import {api,qs} from "../lib/api";
import {Badge,Button,PageHeader,StatCard} from "../components/ui";

export default function TenantDashboard({tenantId,branchId,tenant,onNavigate}:{tenantId:string,branchId:string|null,tenant:any,onNavigate?:(page:string)=>void}){
  const [s,setS]=useState<any>({});
  useEffect(()=>{if(!tenantId)return; Promise.all([
    api<any>("/api/branches"+qs({tenant_id:tenantId})),
    api<any>("/api/students"+qs({tenant_id:tenantId,branch_id:branchId})),
    api<any>("/api/staff"+qs({tenant_id:tenantId,branch_id:branchId})),
    api<any>("/api/invoices"+qs({tenant_id:tenantId,branch_id:branchId}))
  ]).then(([b,st,sf,inv])=>setS({branches:b.rows.length,students:st.rows.length,staff:sf.rows.length,invoices:inv.rows.length,outstanding:inv.rows.reduce((a:number,x:any)=>a+Math.max(0,Number(x.total)-Number(x.paid_total)),0)})).catch(()=>{})},[tenantId,branchId]);
  const launch=[
    ["Admissions","B02","Applicant pipeline, offers and decisions"],["Student 360","B05","Whole-student workspace and timeline"],["Academic setup","B01","Years, terms, grades and cohorts"],
    ["Timetable","B07","Scheduling, rooms and constraints"],["Attendance","B10","Registers, absences and interventions"],["Gradebook","B12","Teacher gradebooks and publishing"],
    ["Finance","B30","Student billing and family accounts"],["HR & Workforce","B35","Staff lifecycle and workforce"],["Safeguarding","B16","Restricted case management"]
  ];
  return <div className="tenant-home">
    <PageHeader title={tenant?.name||"School group workspace"} description={branchId?"Branch-scoped operational command center":"A01 · Tenant / Customer Workspace · Group-level consolidated view"} actions={<><Badge tone="good">{branchId?"Branch scope":"Group scope"}</Badge><Button variant="secondary" onClick={()=>onNavigate?.("module-A01")}>Tenant settings</Button></>}/>
    <div className="tenant-context-hero"><div><span className="eyebrow">TENANT APPLICATION PLANE</span><h2>{branchId?"Local branch operations":"Education group command center"}</h2><p>Role-scoped access across organization, academics, people, finance, student care, workflows, reporting and administration.</p></div><div className="tenant-hero-meta"><span>Plan <strong>{tenant?.plan_code||"—"}</strong></span><span>Status <strong>{tenant?.status||"active"}</strong></span><span>Currency <strong>{tenant?.default_currency||"IQD"}</strong></span></div></div>
    <div className="stats-grid executive-stats mt">
      {!branchId&&<StatCard label="Branches / Campuses" value={s.branches??"—"} meta="Organization structure"/>}
      <StatCard label="Students" value={s.students??"—"} meta="Current scope"/>
      <StatCard label="Staff / Teachers" value={s.staff??"—"} meta="Current scope"/>
      <StatCard label="Invoices" value={s.invoices??"—"} meta="Student billing records"/>
      <StatCard label="Outstanding" value={Number(s.outstanding||0).toLocaleString()} meta={tenant?.default_currency||"IQD"}/>
    </div>

    <div className="dashboard-composite mt">
      <section className="panel">
        <div className="panel-head"><div><span className="eyebrow">SCHOOL OPERATING SYSTEM</span><h3>Operational launchpad</h3></div><Badge tone="info">K-12 Pack</Badge></div>
        <div className="launchpad-grid">{launch.map(([label,code,desc])=><button key={code} onClick={()=>onNavigate?.(`module-${code}`)}><span>{code}</span><strong>{label}</strong><p>{desc}</p><i>→</i></button>)}</div>
      </section>
      <section className="panel today-panel"><div className="panel-head"><div><span className="eyebrow">TODAY</span><h3>School operations</h3></div><Badge tone="neutral">Live foundation</Badge></div>
        <div className="today-list"><button onClick={()=>onNavigate?.("attendance")}><span>Attendance registers</span><strong>Open daily register</strong><i>→</i></button><button onClick={()=>onNavigate?.("students")}><span>Student directory</span><strong>{s.students??0} in scope</strong><i>→</i></button><button onClick={()=>onNavigate?.("staff")}><span>Staff directory</span><strong>{s.staff??0} in scope</strong><i>→</i></button><button onClick={()=>onNavigate?.("finance")}><span>Finance</span><strong>{Number(s.outstanding||0).toLocaleString()} {tenant?.default_currency||"IQD"} outstanding</strong><i>→</i></button></div>
      </section>
    </div>

    <div className="grid-3 mt"><section className="panel"><div className="panel-head"><h3>Academic operations</h3><Badge tone="info">B01–B14</Badge></div><p className="muted-text">Academic year, admissions, enrollment, curriculum, timetable, teaching, attendance, assessment, gradebook, exams and reporting.</p><Button variant="ghost" onClick={()=>onNavigate?.("module-B01")}>Explore academic core →</Button></section><section className="panel"><div className="panel-head"><h3>Student care & community</h3><Badge tone="info">B15–B29</Badge></div><p className="muted-text">Behaviour, safeguarding, wellbeing, learning support, medical, portals, meetings, activities, trips, transport, pickup, meals and library.</p><Button variant="ghost" onClick={()=>onNavigate?.("module-B16")}>Explore student care →</Button></section><section className="panel"><div className="panel-head"><h3>Business & administration</h3><Badge tone="info">B30–B56</Badge></div><p className="muted-text">Billing, accounting, procurement, assets, facilities, HR, payroll, grants, multi-entity finance, quality, IT, security, rollover and regulatory reporting.</p><Button variant="ghost" onClick={()=>onNavigate?.("module-B30")}>Explore operations →</Button></section></div>
  </div>
}
