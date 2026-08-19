import React,{useMemo,useState} from "react";
import { type Lang } from "../lib/i18n";
import {Badge} from "./ui";
import {providerNavGroups,tenantCoreNavGroups,k12NavGroups,titleForCode,type NavGroup} from "../data/enterpriseNav";

const providerPermissionForCode:Record<string,string>={
 P01:"provider.dashboard.view",P02:"provider.customers.view",P03:"provider.commercial.manage",P04:"provider.commercial.manage",P05:"provider.commercial.manage",P06:"provider.commercial.manage",P07:"provider.billing.view",P08:"provider.operations.manage",P09:"provider.delivery.manage",P10:"provider.delivery.manage",P11:"provider.customers.view",P12:"provider.success.manage",P13:"provider.support.manage",P14:"provider.support.elevated",P15:"provider.operations.manage",P16:"provider.operations.manage",P17:"provider.operations.manage",P18:"provider.security.manage",P19:"provider.operations.manage",P20:"provider.operations.manage",P21:"provider.settings.manage",P22:"provider.settings.manage",P23:"provider.operations.manage",P24:"provider.success.manage",P25:"provider.security.manage",P26:"provider.billing.view",P27:"provider.dashboard.view",P28:"provider.billing.view",P29:"provider.team.view",P30:"provider.audit.view",P31:"provider.security.manage",P32:"provider.operations.manage",P33:"provider.commercial.manage",P34:"provider.security.manage",P35:"provider.operations.manage"
};

function shortTitle(code:string,title:string){
  const map:Record<string,string>={
    P01:"Executive Control Tower",P02:"Customer / Tenant 360",P03:"Sales CRM",P04:"Contracts",P05:"Plans & Entitlements",P06:"Subscriptions & Renewals",P07:"Provider Billing",P08:"Usage & Quotas",P09:"Tenant Provisioning",P10:"Implementation & Migration",P11:"Commercial Portal",P12:"Customer Success",P13:"Support & Service Desk",P14:"Privileged Support Access",P15:"SaaS Operations / SRE",P16:"Incidents & Change",P17:"Releases & Rollout",P18:"Security & Compliance",P19:"Backup & DR",P20:"Deployment & Isolation",P21:"Regions & Residency",P22:"Domains & White-label",P23:"Developer & Partner Platform",P24:"Customer Communications",P25:"Offboarding & Retention",P26:"Revenue Operations",P27:"SaaS Analytics",P28:"FinOps",P29:"Provider Team & Access",P30:"Provider Audit",P31:"Platform Protection",P32:"Product Feedback",P33:"Partners & Resellers",P34:"Legal & Assurance",P35:"Control-plane API",
    A01:"Tenant Management",A02:"Organization & Branches",A03:"People & Identity",A04:"Households & Family",A05:"Authentication",A06:"Roles & Permissions",A07:"Configuration Center",A08:"Workflow Engine",A09:"Business Rules",A10:"Events & Automation",A11:"Communication Center",A12:"Notification Center",A13:"Document Management",A14:"Forms & Consents",A15:"Tasks & Cases",A16:"Audit & History",A17:"Privacy & Governance",A18:"Data Quality",A19:"Import / Export / Migration",A20:"Integrations & API",A21:"Search",A22:"Analytics & Reporting",A23:"System Operations",A24:"Backup & DR",A25:"Master Data Governance",A26:"Contracts",A27:"Service Desk",A28:"Localization & Country Packs",A29:"Records & Archive",A30:"Multi-branch Administration",
    B01:"Academic Year & Structure",B02:"Admissions CRM",B03:"Enrollment",B04:"Student Directory",B05:"Student 360",B06:"Curriculum",B07:"Timetable & Scheduling",B08:"Calendar & Events",B09:"Teaching & Learning",B10:"Attendance",B11:"Assessment",B12:"Gradebook",B13:"Exam Management",B14:"Report Cards & Transcripts",B15:"Behaviour & Conduct",B16:"Safeguarding",B17:"Wellbeing & Counselling",B18:"Learning Support / SEN",B19:"Medical & Health",B20:"Parent Portal",B21:"Student Portal",B22:"Teacher Portal",B23:"Parent Meetings",B24:"Clubs & Activities",B25:"Trips & Visits",B26:"Transport",B27:"Dismissal & Pickup",B28:"Meals / Cafeteria",B29:"Library & Media",B30:"Student Billing",B31:"School Accounting",B32:"Procurement",B33:"Inventory & Assets",B34:"Facilities",B35:"HR / Workforce",B36:"Staff Cover",B37:"Front Desk",B38:"Visitor Management",B39:"Incidents & Emergency",B40:"Alumni & Development",B41:"Boarding / Residential",B42:"Payroll & Compensation",B43:"Financial Aid",B44:"Expenses & Petty Cash",B45:"Fund & Grant Accounting",B46:"Multi-entity Finance",B47:"Cashier / POS",B48:"Marketing CRM",B49:"Website / CMS",B50:"Quality & Accreditation",B51:"Complaints & Appeals",B52:"IT & Device Lifecycle",B53:"Physical Security & ID",B54:"Year-end & Rollover",B55:"Regulatory Reporting",B56:"Business Continuity"
  };
  return map[code]||title.replace(/\s*\/\s*/g," / ").replace(/\bMANAGEMENT\b/g,"").trim();
}

export function Shell({children,page,onNavigate,user,lang,setLang,isPlatformOwner,tenants,selectedTenant,setSelectedTenant,branches,selectedBranch,setSelectedBranch,onLogout}:any){
  const providerPage=isPlatformOwner&&(page==="provider-dashboard"||page==="customers"||page==="customer-360"||page==="provider-team"||page==="architecture"||page.startsWith("module-P"));
  const plane=providerPage?"provider":"tenant";
  const [query,setQuery]=useState("");
  const [openGroups,setOpenGroups]=useState<Record<string,boolean>>({"provider-command":true,"provider-commercial":true,"core-org":true,"school-academic":true});
  const tenantAvailable=!!selectedTenant || !isPlatformOwner;
  const groups:NavGroup[]=plane==="provider"?providerNavGroups:[...tenantCoreNavGroups,...k12NavGroups];
  const providerPermissions=new Set<string>(user.provider_permissions||[]);
  const visibleGroups=useMemo(()=>groups.map(g=>({...g,entries:g.entries.filter(e=>{
    if(plane==="provider"){
      const required=providerPermissionForCode[e.code];
      if(required&&!providerPermissions.has(required))return false;
    }
    return !query.trim()||`${e.code} ${titleForCode(e.code)}`.toLowerCase().includes(query.trim().toLowerCase());
  })})).filter(g=>g.entries.length),[groups,query,plane,user.provider_permissions]);
  const tenant=tenants.find((t:any)=>t.id===selectedTenant);
  const activeFor=(code:string,route:string)=>page===route||page===`module-${code}`||(code==="P02"&&page==="customer-360");
  const toggle=(id:string)=>setOpenGroups(x=>({...x,[id]:!x[id]}));
  const switchPlane=(target:"provider"|"tenant")=>{
    if(target==="provider")onNavigate("provider-dashboard");
    else if(tenantAvailable)onNavigate("tenant-dashboard");
    else onNavigate("customers");
  };
  return <div className="app-shell enterprise-shell" dir={lang==="ar"||lang==="ku"?"rtl":"ltr"}>
    <aside className="sidebar enterprise-sidebar">
      <div className="brand enterprise-brand"><div className="brand-mark">E</div><div><strong>Education Platform</strong><span>Enterprise V6 · SaaS</span></div></div>
      {isPlatformOwner&&<div className="plane-switch"><button className={plane==="provider"?"active":""} onClick={()=>switchPlane("provider")}><span>P</span>Provider</button><button className={plane==="tenant"?"active":""} onClick={()=>switchPlane("tenant")} disabled={!tenantAvailable}><span>T</span>Tenant App</button></div>}
      <div className="sidebar-context-card">
        <span className="context-kicker">{plane==="provider"?"CONTROL PLANE":"APPLICATION PLANE"}</span>
        <strong>{plane==="provider"?"Provider operations":tenant?.name||"School workspace"}</strong>
        <small>{plane==="provider"?(user.provider_role_name||"Internal SaaS administration"):selectedBranch?branches.find((b:any)=>b.id===selectedBranch)?.name||"Branch scope":"Group / all branches"}</small>
      </div>
      <div className="module-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search modules…"/></div>
      <nav className="enterprise-nav">
        {visibleGroups.map((g,gi)=>{
          const open=query.trim()?true:(openGroups[g.id]??gi===0);
          return <section className="nav-group" key={g.id}><button className="nav-group-head" onClick={()=>toggle(g.id)}><span>{g.label}</span><i>{open?"−":"+"}</i></button>{open&&<div className="nav-group-items">{g.entries.map(e=>{const title=titleForCode(e.code);return <button key={e.code} className={activeFor(e.code,e.route)?"nav-active":""} onClick={()=>onNavigate(e.route)} title={`${e.code} · ${title}`}><span className="nav-code">{e.code}</span><span className="nav-copy"><strong>{shortTitle(e.code,title)}</strong><small>{e.code.startsWith("P")?"Provider":e.code.startsWith("A")?"Core":"K-12"}</small></span><i className="nav-arrow">›</i></button>})}</div>}</section>
        })}
      </nav>
      <div className="side-bottom enterprise-side-bottom">{isPlatformOwner&&<button onClick={()=>onNavigate("architecture")}><i>⌘</i><span>V6 Architecture Map</span></button>}<button onClick={onLogout}><i>↪</i><span>Log out</span></button></div>
    </aside>
    <div className="main enterprise-main">
      <header className="topbar enterprise-topbar">
        <div className="topbar-left">
          <div className="scope-title"><span>{plane==="provider"?"Provider Control Plane":"Tenant Application"}</span><strong>{plane==="provider"?"Enterprise SaaS Operations":tenant?.name||"Select customer tenant"}</strong></div>
          <div className="scope-pickers">
            {isPlatformOwner&&<select value={selectedTenant||""} onChange={e=>setSelectedTenant(e.target.value||null)}><option value="">Provider scope / no tenant</option>{tenants.map((t:any)=><option key={t.id} value={t.id}>{t.name}</option>)}</select>}
            {selectedTenant&&plane==="tenant"&&<select value={selectedBranch||""} onChange={e=>setSelectedBranch(e.target.value||null)}><option value="">Group / all branches</option>{branches.map((b:any)=><option key={b.id} value={b.id}>{b.name}</option>)}</select>}
          </div>
          <select className="mobile-module-select" value={page==="customer-360"?"customers":page} onChange={e=>onNavigate(e.target.value)}>
            {visibleGroups.map(g=><optgroup label={g.label} key={g.id}>{g.entries.map(e=><option key={e.code} value={e.route}>{e.code} · {shortTitle(e.code,titleForCode(e.code))}</option>)}</optgroup>)}
          </select>
        </div>
        <div className="top-actions"><button className="command-btn" title="Global command center">⌘ K</button><select className="lang-select" value={lang} onChange={e=>setLang(e.target.value as Lang)}><option value="en">EN</option><option value="ku">KU</option><option value="ar">AR</option></select><div className="top-icon-btn">◌</div><div className="user-chip enterprise-user-chip"><div className="avatar">{user.name?.slice(0,1)?.toUpperCase()}</div><div><strong>{user.name}</strong><span>{(user.provider_role_name||user.highest_role).replaceAll("_"," ")}</span></div></div></div>
      </header>
      <main className="content enterprise-content">{children}</main>
    </div>
  </div>
}
