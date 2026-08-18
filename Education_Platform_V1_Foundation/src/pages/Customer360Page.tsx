import React,{useEffect,useMemo,useState} from "react";
import {api,qs} from "../lib/api";
import {Badge,Button,PageHeader,StatCard} from "../components/ui";

const tabs=["Overview","Contacts & Owners","Subscription","Entitlements","Usage / Quotas","Provisioning","Domains / Branding","Implementation","Adoption / Health","Support / Incidents","Security / Compliance","Backups","Communications","Timeline","Provider Audit"];

export default function Customer360Page({tenantId,tenant,branches,onOpenTenantApp,onNavigate}:{tenantId:string,tenant:any,branches:any[],onOpenTenantApp:()=>void,onNavigate:(page:string)=>void}){
  const [active,setActive]=useState(0);
  const [users,setUsers]=useState<any[]>([]),[students,setStudents]=useState<any[]>([]),[staff,setStaff]=useState<any[]>([]);
  useEffect(()=>{
    if(!tenantId)return;
    Promise.all([
      api<any>("/api/users"+qs({tenant_id:tenantId})).catch(()=>({rows:[]})),
      api<any>("/api/students"+qs({tenant_id:tenantId})).catch(()=>({rows:[]})),
      api<any>("/api/staff"+qs({tenant_id:tenantId})).catch(()=>({rows:[]}))
    ]).then(([u,s,st])=>{setUsers(u.rows||[]);setStudents(s.rows||[]);setStaff(st.rows||[])})
  },[tenantId]);
  const owners=useMemo(()=>users.filter(u=>(u.assignments||[]).some((a:any)=>a.role_code==="tenant_owner")),[users]);
  const loginUrl=location.origin;
  const renewal=tenant?.expires_at?new Date(tenant.expires_at).toLocaleDateString():"—";
  const copyLogin=()=>navigator.clipboard?.writeText(loginUrl);

  const overview=<>
    <div className="stats-grid customer-stats">
      <StatCard label="Branches / Campuses" value={branches.length} meta="Active organization scope"/>
      <StatCard label="Students" value={students.length} meta="Current records"/>
      <StatCard label="Staff / Teachers" value={staff.length} meta="Current records"/>
      <StatCard label="Tenant Owners" value={owners.length} meta="Account ownership"/>
      <StatCard label="Renewal / Expiry" value={renewal} meta={tenant?.plan_code||"Plan not set"}/>
    </div>
    <div className="grid-2 mt">
      <section className="panel">
        <div className="panel-head"><h3>Customer access</h3><Badge tone={owners.length?"good":"warn"}>{owners.length?"Owner configured":"Owner required"}</Badge></div>
        <div className="customer-access-card"><div><span>Login URL</span><strong>{loginUrl}</strong></div><div className="customer-access-actions"><Button variant="secondary" onClick={copyLogin}>Copy login URL</Button><Button onClick={onOpenTenantApp}>Open tenant application</Button></div></div>
        <div className="owner-list">{owners.length?owners.map(o=><div key={o.id}><div className="avatar small">{o.name?.slice(0,1)?.toUpperCase()}</div><div><strong>{o.name}</strong><span>{o.email}</span></div><Badge tone="good">Tenant Owner</Badge></div>):<p className="muted-text">No Tenant Owner is assigned. Create one from Users & Delegated Access before handing the customer access to the system.</p>}</div>
      </section>
      <section className="panel">
        <div className="panel-head"><h3>Account 360 status</h3><Badge tone="info">P02</Badge></div>
        <div className="status-stack">
          <div><span>Customer status</span><strong>{tenant?.status||"—"}</strong></div>
          <div><span>Plan</span><strong>{tenant?.plan_code||"—"}</strong></div>
          <div><span>Country</span><strong>{tenant?.country||"—"}</strong></div>
          <div><span>Default currency</span><strong>{tenant?.default_currency||"—"}</strong></div>
          <div><span>Default language</span><strong>{tenant?.default_language||"—"}</strong></div>
        </div>
      </section>
    </div>
    <section className="panel mt">
      <div className="panel-head"><h3>Account team & action center</h3><Badge tone="neutral">V6 workspace</Badge></div>
      <div className="action-grid">
        {["Commercial owner","Customer success owner","Implementation lead","Support owner","Security / privacy contact","Technical contact"].map(x=><div className="action-tile" key={x}><span>{x}</span><strong>Not assigned</strong><button>Assign</button></div>)}
      </div>
    </section>
  </>;

  const tabContent=active===0?overview:<section className="panel customer-tab-placeholder">
    <div className="workspace-section-head"><div><span className="eyebrow">P02 CUSTOMER / TENANT 360</span><h2>{tabs[active]}</h2></div><Badge tone="info">Architecture-backed</Badge></div>
    <p>This workspace is part of the Master Architecture V6 Customer / Tenant 360. The navigation and information architecture are now present; operational records and workflows will be wired in staged implementation.</p>
    <div className="workspace-card-grid compact-cards">
      {["Workspace overview","Records & relationships","Actions & workflow","Permissions & approvals","Timeline & audit","Reports & KPIs"].map((x,i)=><article className="workspace-feature-card" key={x}><span className="feature-index">{String(i+1).padStart(2,"0")}</span><h3>{x}</h3><p>Reserved for the {tabs[active]} domain with tenant-scoped data and audit controls.</p></article>)}
    </div>
  </section>;

  return <div>
    <div className="customer-360-hero">
      <PageHeader title={tenant?.name||"Customer / Tenant 360"} description={`P02 · Customer / Tenant Workspace · Tenant ID ${tenantId}`} actions={<><Button variant="secondary" onClick={()=>onNavigate("customers")}>← Directory</Button><Button onClick={onOpenTenantApp}>Enter tenant application</Button></>}/>
      <div className="customer-meta-row"><Badge tone={tenant?.status==="active"||tenant?.status==="trial"?"good":"warn"}>{tenant?.status||"unknown"}</Badge><span>Plan: <strong>{tenant?.plan_code||"—"}</strong></span><span>Renewal: <strong>{renewal}</strong></span><span>Slug: <strong>{tenant?.slug||"—"}</strong></span></div>
    </div>
    <div className="workspace-tabs customer-tabs">{tabs.map((t,i)=><button key={t} className={active===i?"active":""} onClick={()=>setActive(i)}>{t}</button>)}</div>
    {tabContent}
  </div>
}
