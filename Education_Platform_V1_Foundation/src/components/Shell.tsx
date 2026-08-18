import React from "react";
import { tr, type Lang } from "../lib/i18n";
import { Badge } from "./ui";

export type NavItem={id:string,labelKey:string,group:"provider"|"tenant"|"system",icon:string};
export const navItems:NavItem[]=[
  {id:"provider-dashboard",labelKey:"dashboard",group:"provider",icon:"⌂"},
  {id:"customers",labelKey:"customers",group:"provider",icon:"◫"},
  {id:"tenant-dashboard",labelKey:"dashboard",group:"tenant",icon:"⌂"},
  {id:"branches",labelKey:"branches",group:"tenant",icon:"⌘"},
  {id:"students",labelKey:"students",group:"tenant",icon:"◎"},
  {id:"staff",labelKey:"staff",group:"tenant",icon:"♙"},
  {id:"attendance",labelKey:"attendance",group:"tenant",icon:"✓"},
  {id:"finance",labelKey:"finance",group:"tenant",icon:"¤"},
  {id:"payroll",labelKey:"payroll",group:"tenant",icon:"≋"},
  {id:"import",labelKey:"import",group:"tenant",icon:"⇩"},
  {id:"access",labelKey:"access",group:"tenant",icon:"⚿"},
  {id:"architecture",labelKey:"architecture",group:"system",icon:"⌘"},
  {id:"audit",labelKey:"audit",group:"system",icon:"≣"}
];

export function Shell({
  children,page,onNavigate,user,lang,setLang,isPlatformOwner,tenants,selectedTenant,setSelectedTenant,branches,selectedBranch,setSelectedBranch,onLogout
}:any){
  const tenantAvailable=!!selectedTenant || !isPlatformOwner;
  const visible=navItems.filter(n=>n.group==="system" || (n.group==="provider"&&isPlatformOwner) || (n.group==="tenant"&&tenantAvailable));
  return <div className="app-shell" dir={lang==="ar"||lang==="ku"?"rtl":"ltr"}>
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">E</div><div><strong>Edu Platform</strong><span>V1 Foundation</span></div></div>
      <div className="side-context">
        <span>{isPlatformOwner?tr(lang,"provider"):tr(lang,"tenant")}</span>
        <Badge tone={isPlatformOwner?"info":"good"}>{user.highest_role.replaceAll("_"," ")}</Badge>
      </div>
      <nav>{visible.map(n=><button key={n.id} className={page===n.id?"nav-active":""} onClick={()=>onNavigate(n.id)}>
        <i>{n.icon}</i><span>{tr(lang,n.labelKey)}</span>
      </button>)}</nav>
      <div className="side-bottom"><button onClick={onLogout}><i>↪</i><span>{tr(lang,"logout")}</span></button></div>
    </aside>
    <div className="main">
      <header className="topbar">
        <div className="scope-pickers">
          {isPlatformOwner&&<select value={selectedTenant||""} onChange={e=>setSelectedTenant(e.target.value||null)}>
            <option value="">Provider scope</option>{tenants.map((t:any)=><option key={t.id} value={t.id}>{t.name}</option>)}
          </select>}
          {selectedTenant&&<select value={selectedBranch||""} onChange={e=>setSelectedBranch(e.target.value||null)}>
            <option value="">All branches</option>{branches.map((b:any)=><option key={b.id} value={b.id}>{b.name}</option>)}
          </select>}
        </div>
        <div className="top-actions">
          <select value={lang} onChange={e=>setLang(e.target.value as Lang)}><option value="en">EN</option><option value="ku">KU</option><option value="ar">AR</option></select>
          <div className="user-chip"><div className="avatar">{user.name?.slice(0,1)?.toUpperCase()}</div><div><strong>{user.name}</strong><span>{user.email}</span></div></div>
        </div>
      </header>
      <main className="content">{children}</main>
    </div>
  </div>
}
