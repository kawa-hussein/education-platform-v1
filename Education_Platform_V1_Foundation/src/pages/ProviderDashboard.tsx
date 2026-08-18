import React,{useEffect,useState} from "react";
import {api} from "../lib/api";
import {PageHeader,StatCard,Badge} from "../components/ui";
export default function ProviderDashboard(){
  const [s,setS]=useState<any>(null);
  useEffect(()=>{api<any>("/api/provider/summary").then(r=>setS(r.summary)).catch(()=>{})},[]);
  return <div>
    <PageHeader title="Provider Control Center" description="Commercial, tenant and operational overview for your SaaS platform."/>
    <div className="stats-grid">
      <StatCard label="Customers / Tenants" value={s?.tenants??"—"} meta={`${s?.active_tenants??0} active / trial`}/>
      <StatCard label="School Branches" value={s?.branches??"—"} meta="Across all tenants"/>
      <StatCard label="Active Students" value={s?.students??"—"} meta="Platform-wide"/>
      <StatCard label="Active Staff" value={s?.staff??"—"} meta="Platform-wide"/>
      <StatCard label="Renewals ≤ 30 days" value={s?.renewals_due??"—"} meta="Requires attention"/>
    </div>
    <div className="grid-2 mt">
      <section className="panel"><div className="panel-head"><h3>Control-plane foundation</h3><Badge tone="good">Live</Badge></div>
        <div className="check-list"><span>✓ Tenant provisioning</span><span>✓ Subscription status & expiry</span><span>✓ Branch / student limits</span><span>✓ Provider-only access boundary</span><span>✓ Audited mutations</span></div>
      </section>
      <section className="panel"><div className="panel-head"><h3>Next production layers</h3><Badge tone="info">Planned</Badge></div>
        <div className="check-list muted"><span>Billing gateway automation</span><span>Customer success health scoring</span><span>Support access approvals</span><span>Queue-based background jobs</span><span>R2 document storage</span></div>
      </section>
    </div>
  </div>
}
