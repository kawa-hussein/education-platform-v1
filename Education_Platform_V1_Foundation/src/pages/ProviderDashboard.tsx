import React,{useEffect,useState} from "react";
import {api} from "../lib/api";
import {PageHeader,StatCard,Badge,Button} from "../components/ui";

export default function ProviderDashboard({onNavigate}:{onNavigate?:(page:string)=>void}){
  const [s,setS]=useState<any>(null);
  useEffect(()=>{api<any>("/api/provider/summary").then(r=>setS(r.summary)).catch(()=>{})},[]);
  const actions=[
    ["Renewals requiring action",s?.renewals_due??0,"P06"],
    ["Tenants awaiting provisioning",0,"P09"],
    ["Implementations at risk",0,"P10"],
    ["Support escalations",0,"P13"],
    ["Security approvals",0,"P18"],
    ["Release approvals",0,"P17"]
  ];
  return <div className="control-tower">
    <PageHeader title="Provider Executive Control Tower" description="P01 · Global commercial, customer, operational and governance view for the SaaS provider." actions={<><Badge tone="good">Platform online</Badge><Button onClick={()=>onNavigate?.("customers")}>Provision customer</Button></>}/>
    <div className="control-tower-strip"><div><span>MASTER ARCHITECTURE</span><strong>V6.0 · SaaS Control Plane</strong></div><div><span>CONTROL PLANE</span><strong>Provider-only boundary</strong></div><div><span>APPLICATION PLANE</span><strong>Tenant-isolated workspaces</strong></div><div><span>DEPLOYMENT</span><strong>Cloudflare Worker + D1</strong></div></div>

    <section className="dashboard-section"><div className="section-title-row"><div><span className="eyebrow">GLOBAL OVERVIEW</span><h2>Platform estate</h2></div><Badge tone="neutral">Live data</Badge></div>
      <div className="stats-grid executive-stats">
        <StatCard label="Customers / Tenants" value={s?.tenants??"—"} meta={`${s?.active_tenants??0} active / trial`}/>
        <StatCard label="Institutions / Branches" value={s?.branches??"—"} meta="Across all tenants"/>
        <StatCard label="Active Students" value={s?.students??"—"} meta="Platform-wide"/>
        <StatCard label="Active Staff" value={s?.staff??"—"} meta="Platform-wide"/>
        <StatCard label="Renewals ≤ 30 days" value={s?.renewals_due??"—"} meta="Action window"/>
      </div>
    </section>

    <div className="dashboard-composite mt">
      <section className="panel executive-panel">
        <div className="panel-head"><div><span className="eyebrow">COMMERCIAL SNAPSHOT</span><h3>Revenue & renewal intelligence</h3></div><Badge tone="warn">Commercial engine staged</Badge></div>
        <div className="metric-matrix">
          {["ARR","MRR","New ARR","Expansion ARR","Net Revenue Retention","Gross Revenue Retention","Outstanding Platform Invoices","Failed Payments / Dunning"].map(x=><div key={x}><span>{x}</span><strong>—</strong><small>Not configured yet</small></div>)}
        </div>
      </section>
      <section className="panel action-center-panel">
        <div className="panel-head"><div><span className="eyebrow">ACTION CENTER</span><h3>Requires provider attention</h3></div><Badge tone="info">P01</Badge></div>
        <div className="action-list">{actions.map(([label,count,code])=><button key={String(label)} onClick={()=>onNavigate?.(`module-${code}`)}><div><strong>{label}</strong><span>{code}</span></div><b>{count}</b><i>→</i></button>)}</div>
      </section>
    </div>

    <div className="grid-3 mt">
      <section className="panel health-panel"><div className="panel-head"><h3>Customer health</h3><Badge tone="info">P12</Badge></div><div className="health-bars">{[["Healthy",0,"good"],["Watch",0,"warn"],["At risk",0,"bad"],["Onboarding delayed",0,"warn"],["Renewal risk",0,"bad"]].map(([x,n,t]:any)=><div key={x}><span>{x}</span><div><i className={`health-${t}`} style={{width:`${Math.max(4,n*10)}%`}}></i></div><strong>{n}</strong></div>)}</div></section>
      <section className="panel"><div className="panel-head"><h3>Operations snapshot</h3><Badge tone="good">Core online</Badge></div><div className="status-stack"><div><span>Worker availability</span><strong>Online</strong></div><div><span>D1 database binding</span><strong>Connected</strong></div><div><span>Queue backlog</span><strong>Not enabled</strong></div><div><span>Backup restore test</span><strong>Not configured</strong></div><div><span>Capacity risk</span><strong>Baseline only</strong></div></div></section>
      <section className="panel"><div className="panel-head"><h3>Control-plane coverage</h3><Badge tone="neutral">35 modules</Badge></div><div className="coverage-ring"><div><strong>35</strong><span>Provider modules registered</span></div></div><p className="muted-text">The complete P01–P35 provider architecture is now exposed in the enterprise navigation. Operational implementation continues module-by-module.</p></section>
    </div>
  </div>
}
