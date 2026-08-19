import React,{useMemo,useState} from "react";
import {type Lang} from "../lib/i18n";
import {useI18n} from "../lib/i18nContext";
import {providerNavGroups,tenantCoreNavGroups,k12NavGroups,academyNavGroups,higherEdNavGroups,type NavGroup} from "../data/enterpriseNav";
import {moduleTitle} from "../data/moduleLocale";

const providerPermissionForCode:Record<string,string>={
 P01:"provider.dashboard.view",P02:"provider.customers.view",P03:"provider.commercial.manage",P04:"provider.commercial.manage",P05:"provider.commercial.manage",P06:"provider.commercial.manage",P07:"provider.billing.view",P08:"provider.operations.manage",P09:"provider.delivery.manage",P10:"provider.delivery.manage",P11:"provider.customers.view",P12:"provider.success.manage",P13:"provider.support.manage",P14:"provider.support.elevated",P15:"provider.operations.manage",P16:"provider.operations.manage",P17:"provider.operations.manage",P18:"provider.security.manage",P19:"provider.operations.manage",P20:"provider.operations.manage",P21:"provider.settings.manage",P22:"provider.settings.manage",P23:"provider.operations.manage",P24:"provider.success.manage",P25:"provider.security.manage",P26:"provider.billing.view",P27:"provider.dashboard.view",P28:"provider.billing.view",P29:"provider.team.view",P30:"provider.audit.view",P31:"provider.security.manage",P32:"provider.operations.manage",P33:"provider.commercial.manage",P34:"provider.security.manage",P35:"provider.operations.manage"
};

const groupKey:Record<string,string>={
  "provider-command":"commandCenter","provider-commercial":"commercial","provider-delivery":"deliveryCustomer","provider-operations":"operationsReliability","provider-platform":"platformGovernance","provider-intelligence":"financeIntelligence","provider-admin":"administrationProtection",
  "core-org":"organizationIdentity","core-config":"configurationAutomation","core-work":"documentsWorkHistory","core-data":"governanceDataIntegration","core-enterprise":"enterpriseAdministration",
  "school-academic":"academicCore","school-care":"studentCareSupport","school-community":"portalsCommunity","school-ops":"financeOperations","school-business":"payrollFundingDevelopment","school-enterprise":"growthQualityResilience",
  "academy-core":"academyCore","academy-commercial":"billingOperations","higher-academic":"academicLifecycle","higher-finance":"studentFinance","higher-faculty":"facultyResearch","higher-campus":"campusStudentAffairs","higher-institution":"institutionalEffectiveness"
};

function packLabel(code:string,lang:Lang){
  const v=code[0];
  if(lang==="ku")return v==="P"?"پلاتفۆرم":v==="A"?"بنەمای سیستەم":v==="B"?"قوتابخانە K-12":v==="C"?"ئەکادیمی":"خوێندنی باڵا";
  if(lang==="ar")return v==="P"?"المزوّد":v==="A"?"نواة المنصة":v==="B"?"المدارس K-12":v==="C"?"الأكاديمية":"التعليم العالي";
  if(lang==="tr")return v==="P"?"Sağlayıcı":v==="A"?"Platform Çekirdeği":v==="B"?"K-12 Okul":v==="C"?"Akademi":"Yükseköğretim";
  return v==="P"?"Provider":v==="A"?"Core":v==="B"?"K-12":v==="C"?"Academy":"Higher Ed";
}

export function Shell({children,page,onNavigate,user,isPlatformOwner,tenants,selectedTenant,setSelectedTenant,branches,selectedBranch,setSelectedBranch,onLogout}:any){
  const {lang,setLang,t}=useI18n();
  const providerPage=isPlatformOwner&&(page==="provider-dashboard"||page==="customers"||page==="customer-360"||page==="provider-team"||page==="architecture"||page.startsWith("module-P"));
  const plane=providerPage?"provider":"tenant";
  const [query,setQuery]=useState("");
  const [openGroups,setOpenGroups]=useState<Record<string,boolean>>({"provider-command":true,"provider-admin":true,"core-org":true,"school-academic":true});
  const tenantAvailable=!!selectedTenant || !isPlatformOwner;
  const groups:NavGroup[]=plane==="provider"?providerNavGroups:[...tenantCoreNavGroups,...k12NavGroups,...academyNavGroups,...higherEdNavGroups];
  const providerPermissions=new Set<string>(user.provider_permissions||[]);
  const visibleGroups=useMemo(()=>groups.map(g=>({...g,entries:g.entries.filter(e=>{
    if(plane==="provider"){
      const required=providerPermissionForCode[e.code];
      if(required&&!providerPermissions.has(required))return false;
    }
    return !query.trim()||`${e.code} ${moduleTitle(e.code,lang)}`.toLowerCase().includes(query.trim().toLowerCase());
  })})).filter(g=>g.entries.length),[groups,query,plane,lang,user.provider_permissions]);
  const tenant=tenants.find((x:any)=>x.id===selectedTenant);
  const activeFor=(code:string,route:string)=>page===route||page===`module-${code}`||(code==="P02"&&page==="customer-360")||(code==="P29"&&page==="provider-team");
  const toggle=(id:string)=>setOpenGroups(x=>({...x,[id]:!x[id]}));
  const switchPlane=(target:"provider"|"tenant")=>{
    if(target==="provider")onNavigate("provider-dashboard");
    else if(tenantAvailable)onNavigate("tenant-dashboard");
    else onNavigate("customers");
  };
  return <div className="app-shell enterprise-shell" dir={lang==="ar"||lang==="ku"?"rtl":"ltr"}>
    <aside className="sidebar enterprise-sidebar">
      <div className="brand enterprise-brand"><div className="brand-mark">E</div><div><strong>Education Platform</strong><span>Enterprise V6 · SaaS</span></div></div>
      {isPlatformOwner&&<div className="plane-switch"><button className={plane==="provider"?"active":""} onClick={()=>switchPlane("provider")}><span>P</span>{lang==="ku"?"پلاتفۆرم":lang==="ar"?"المزوّد":lang==="tr"?"Sağlayıcı":"Provider"}</button><button className={plane==="tenant"?"active":""} onClick={()=>switchPlane("tenant")} disabled={!tenantAvailable}><span>T</span>{lang==="ku"?"کڕیار":lang==="ar"?"العميل":lang==="tr"?"Müşteri":"Tenant App"}</button></div>}
      <div className="sidebar-context-card">
        <span className="context-kicker">{plane==="provider"?t("providerPlane"):t("tenantPlane")}</span>
        <strong>{plane==="provider"?t("providerOps"):tenant?.name||t("tenant")}</strong>
        <small>{plane==="provider"?(user.provider_role_name||t("internalAdmin")):selectedBranch?branches.find((b:any)=>b.id===selectedBranch)?.name||t("branches"):t("groupAllBranches")}</small>
      </div>
      <div className="module-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t("searchModules")}/></div>
      <nav className="enterprise-nav">
        {visibleGroups.map((g,gi)=>{
          const open=query.trim()?true:(openGroups[g.id]??gi===0);
          return <section className="nav-group" key={g.id}><button className="nav-group-head" onClick={()=>toggle(g.id)}><span>{t(groupKey[g.id]||g.label)}</span><i>{open?"−":"+"}</i></button>{open&&<div className="nav-group-items">{g.entries.map(e=>{const title=moduleTitle(e.code,lang);return <button key={e.code} className={activeFor(e.code,e.route)?"nav-active":""} onClick={()=>onNavigate(e.route)} title={`${e.code} · ${title}`}><span className="nav-code">{e.code}</span><span className="nav-copy"><strong>{title}</strong><small>{packLabel(e.code,lang)}</small></span><i className="nav-arrow">›</i></button>})}</div>}</section>
        })}
      </nav>
      <div className="side-bottom enterprise-side-bottom">{isPlatformOwner&&<button onClick={()=>onNavigate("architecture")}><i>⌘</i><span>{t("architectureMap")}</span></button>}<button onClick={onLogout}><i>↪</i><span>{t("logout")}</span></button></div>
    </aside>
    <div className="main enterprise-main">
      <header className="topbar enterprise-topbar">
        <div className="topbar-left">
          <div className="scope-title"><span>{plane==="provider"?t("providerPlane"):t("tenantPlane")}</span><strong>{plane==="provider"?t("providerOps"):tenant?.name||t("selectTenant")}</strong></div>
          <div className="scope-pickers">
            {isPlatformOwner&&<select value={selectedTenant||""} onChange={e=>setSelectedTenant(e.target.value||null)}><option value="">{t("providerScope")}</option>{tenants.map((x:any)=><option key={x.id} value={x.id}>{x.name}</option>)}</select>}
            {selectedTenant&&plane==="tenant"&&<select value={selectedBranch||""} onChange={e=>setSelectedBranch(e.target.value||null)}><option value="">{t("groupAllBranches")}</option>{branches.map((b:any)=><option key={b.id} value={b.id}>{b.name}</option>)}</select>}
          </div>
          <select className="mobile-module-select" value={page==="customer-360"?"customers":page} onChange={e=>onNavigate(e.target.value)}>
            {visibleGroups.map(g=><optgroup label={t(groupKey[g.id]||g.label)} key={g.id}>{g.entries.map(e=><option key={e.code} value={e.route}>{e.code} · {moduleTitle(e.code,lang)}</option>)}</optgroup>)}
          </select>
        </div>
        <div className="top-actions"><button className="command-btn" title="Global command center">⌘ K</button><select className="lang-select" aria-label={t("language")} value={lang} onChange={e=>setLang(e.target.value as Lang)}><option value="en">English</option><option value="ku">کوردی</option><option value="ar">العربية</option><option value="tr">Türkçe</option></select><div className="top-icon-btn">◌</div><div className="user-chip enterprise-user-chip"><div className="avatar">{user.name?.slice(0,1)?.toUpperCase()}</div><div><strong>{user.name}</strong><span>{String(user.provider_role_name||user.highest_role||"").replaceAll("_"," ")}</span></div></div></div>
      </header>
      <main className="content enterprise-content">{children}</main>
    </div>
  </div>
}
