import React,{useCallback,useEffect,useMemo,useState} from "react";
import {api,qs} from "./lib/api";
import type {Lang} from "./lib/i18n";
import {Shell} from "./components/Shell";
import AuthPage from "./pages/AuthPage";
import ProviderDashboard from "./pages/ProviderDashboard";
import CustomersPage from "./pages/CustomersPage";
import Customer360Page from "./pages/Customer360Page";
import ProviderTeamPage from "./pages/ProviderTeamPage";
import ProviderInvitePage from "./pages/ProviderInvitePage";
import TenantDashboard from "./pages/TenantDashboard";
import BranchesPage from "./pages/BranchesPage";
import StudentsPage from "./pages/StudentsPage";
import StaffPage from "./pages/StaffPage";
import AttendancePage from "./pages/AttendancePage";
import FinancePage from "./pages/FinancePage";
import PayrollPage from "./pages/PayrollPage";
import ImportPage from "./pages/ImportPage";
import AccessPage from "./pages/AccessPage";
import ArchitecturePage from "./pages/ArchitecturePage";
import AuditPage from "./pages/AuditPage";
import ModuleWorkspacePage from "./pages/ModuleWorkspacePage";

function currentPage(){return new URLSearchParams(location.search).get("page")||"provider-dashboard"}

export default function App(){
 const [me,setMe]=useState<any|null|undefined>(undefined),[page,setPage]=useState(currentPage()),[lang,setLang]=useState<Lang>((localStorage.getItem("edu_lang") as Lang)||"en");
 const [tenants,setTenants]=useState<any[]>([]),[selectedTenant,setSelectedTenantState]=useState<string|null>(localStorage.getItem("edu_tenant")),[branches,setBranches]=useState<any[]>([]),[selectedBranch,setSelectedBranchState]=useState<string|null>(localStorage.getItem("edu_branch"));
 const [students,setStudents]=useState<any[]>([]),[staff,setStaff]=useState<any[]>([]);
 const inviteToken=new URLSearchParams(location.search).get("provider_invite");

 const refreshMe=useCallback(()=>api<any>("/api/auth/me").then(r=>setMe(r.user)).catch(()=>setMe(null)),[]);
 useEffect(()=>{if(!inviteToken)refreshMe()},[refreshMe,inviteToken]);
 useEffect(()=>{localStorage.setItem("edu_lang",lang)},[lang]);

 const isProviderUser=!!me?.is_provider_user;
 const isPlatformOwner=!!me?.is_platform_owner;
 const assignedTenantIds=useMemo(()=>[...new Set((me?.assignments||[]).map((a:any)=>a.tenant_id).filter(Boolean))] as string[],[me]);
 const effectiveTenant=useMemo(()=>{
   if(isProviderUser)return selectedTenant;
   if(selectedTenant&&assignedTenantIds.includes(selectedTenant))return selectedTenant;
   return assignedTenantIds[0]||null;
 },[isProviderUser,selectedTenant,assignedTenantIds]);

 function setSelectedTenant(id:string|null){
   setSelectedTenantState(id); if(id)localStorage.setItem("edu_tenant",id);else localStorage.removeItem("edu_tenant");
   setSelectedBranch(null);
 }
 function setSelectedBranch(id:string|null){
   setSelectedBranchState(id); if(id)localStorage.setItem("edu_branch",id);else localStorage.removeItem("edu_branch");
 }
 function navigate(id:string){setPage(id);history.pushState({}, "", `${location.pathname}?page=${encodeURIComponent(id)}`)}
 useEffect(()=>{const f=()=>setPage(currentPage());addEventListener("popstate",f);return()=>removeEventListener("popstate",f)},[]);

 const loadTenants=useCallback(()=>{if(!me)return;api<any>("/api/tenants").then(r=>{
   setTenants(r.rows);
   if(!isProviderUser){
     const allowed=(r.rows||[]).map((x:any)=>x.id);
     const id=allowed.includes(selectedTenant)?selectedTenant:(allowed[0]||null);
     if(id&&id!==selectedTenant)setSelectedTenant(id);
   }
 }).catch(()=>{})},[me,isProviderUser,selectedTenant]);
 useEffect(()=>{loadTenants()},[loadTenants]);

 useEffect(()=>{
   if(!effectiveTenant){setBranches([]);setStudents([]);setStaff([]);return}
   api<any>("/api/branches"+qs({tenant_id:effectiveTenant})).then(r=>{
     setBranches(r.rows);
     if(selectedBranch&&!r.rows.some((x:any)=>x.id===selectedBranch))setSelectedBranch(null);
   }).catch(()=>{});
   api<any>("/api/students"+qs({tenant_id:effectiveTenant,branch_id:selectedBranch})).then(r=>setStudents(r.rows)).catch(()=>{});
   api<any>("/api/staff"+qs({tenant_id:effectiveTenant,branch_id:selectedBranch})).then(r=>setStaff(r.rows)).catch(()=>{});
 },[effectiveTenant,selectedBranch]);

 useEffect(()=>{
   if(!me||isProviderUser)return;
   if(page==="provider-dashboard"||page==="customers"||page==="customer-360"||page==="provider-team"||page.startsWith("module-P")){
     setPage("tenant-dashboard");history.replaceState({},"",`${location.pathname}?page=tenant-dashboard`);
   }
 },[me,isProviderUser,page]);

 async function logout(){await api("/api/auth/logout",{method:"POST"}).catch(()=>{});setMe(null);setTenants([]);setBranches([]);setSelectedTenantState(null);setSelectedBranchState(null);localStorage.removeItem("edu_tenant");localStorage.removeItem("edu_branch")}
 if(inviteToken)return <ProviderInvitePage token={inviteToken} onDone={()=>{history.replaceState({},"",location.pathname);location.reload()}}/>;
 if(me===undefined)return <div className="boot-screen"><div className="spinner"></div><span>Loading Education Platform…</span></div>;
 if(!me)return <AuthPage onReady={refreshMe}/>;

 const tenant=tenants.find(t=>t.id===effectiveTenant);
 const needTenant=()=> <div className="choose-tenant enterprise-empty"><div className="empty-icon">⌘</div><h2>Select a customer tenant</h2><p>Choose a school group from the scope selector or provision a customer first.</p>{isProviderUser&&<button className="btn btn-primary" onClick={()=>navigate("customers")}>Open customer directory</button>}</div>;

 let content:React.ReactNode=null;
 if(page.startsWith("module-")){
   const code=page.slice(7).toUpperCase();
   if(code.startsWith("P")) content=isProviderUser?<ModuleWorkspacePage code={code} onNavigate={navigate}/>:needTenant();
   else content=effectiveTenant?<ModuleWorkspacePage code={code} onNavigate={navigate}/>:needTenant();
 } else switch(page){
  case "provider-dashboard": content=isProviderUser?<ProviderDashboard onNavigate={navigate}/>:effectiveTenant?<TenantDashboard tenantId={effectiveTenant} branchId={selectedBranch} tenant={tenant} onNavigate={navigate}/>:needTenant(); break;
  case "customers": content=isProviderUser?<CustomersPage onChanged={loadTenants} onOpenTenant={id=>{setSelectedTenant(id);navigate("customer-360")}}/>:needTenant(); break;
  case "customer-360": content=isProviderUser&&effectiveTenant?<Customer360Page tenantId={effectiveTenant} tenant={tenant} branches={branches} onOpenTenantApp={()=>navigate("tenant-dashboard")} onNavigate={navigate}/>:needTenant(); break;
  case "provider-team": content=isProviderUser?<ProviderTeamPage/>:needTenant(); break;
  case "tenant-dashboard": content=effectiveTenant?<TenantDashboard tenantId={effectiveTenant} branchId={selectedBranch} tenant={tenant} onNavigate={navigate}/>:needTenant(); break;
  case "branches": content=effectiveTenant?<BranchesPage tenantId={effectiveTenant} onChanged={()=>{api<any>("/api/branches"+qs({tenant_id:effectiveTenant})).then(r=>setBranches(r.rows))}}/>:needTenant(); break;
  case "students": content=effectiveTenant?<StudentsPage tenantId={effectiveTenant} branchId={selectedBranch} branches={branches}/>:needTenant(); break;
  case "staff": content=effectiveTenant?<StaffPage tenantId={effectiveTenant} branchId={selectedBranch} branches={branches}/>:needTenant(); break;
  case "attendance": content=effectiveTenant?<AttendancePage tenantId={effectiveTenant} branchId={selectedBranch}/>:needTenant(); break;
  case "finance": content=effectiveTenant?<FinancePage tenantId={effectiveTenant} branchId={selectedBranch} branches={branches} students={students} currency={tenant?.default_currency||"IQD"}/>:needTenant(); break;
  case "payroll": content=effectiveTenant?<PayrollPage tenantId={effectiveTenant} branchId={selectedBranch} branches={branches} staff={staff} currency={tenant?.default_currency||"IQD"}/>:needTenant(); break;
  case "import": content=effectiveTenant?<ImportPage tenantId={effectiveTenant} branchId={selectedBranch} branches={branches}/>:needTenant(); break;
  case "access": content=effectiveTenant?<AccessPage tenantId={effectiveTenant} branchId={selectedBranch} branches={branches}/>:needTenant(); break;
  case "architecture": content=isProviderUser?<ArchitecturePage/>:effectiveTenant?<TenantDashboard tenantId={effectiveTenant} branchId={selectedBranch} tenant={tenant} onNavigate={navigate}/>:needTenant(); break;
  case "audit": content=effectiveTenant?<AuditPage tenantId={effectiveTenant} branchId={selectedBranch} isPlatformOwner={isPlatformOwner}/>:needTenant(); break;
  default: content=isProviderUser?<ProviderDashboard onNavigate={navigate}/>:effectiveTenant?<TenantDashboard tenantId={effectiveTenant} branchId={selectedBranch} tenant={tenant} onNavigate={navigate}/>:needTenant();
 }
 return <Shell page={page} onNavigate={navigate} user={me} lang={lang} setLang={setLang} isPlatformOwner={isProviderUser}
   tenants={tenants} selectedTenant={effectiveTenant} setSelectedTenant={setSelectedTenant} branches={branches}
   selectedBranch={selectedBranch} setSelectedBranch={setSelectedBranch} onLogout={logout}>{content}</Shell>
}
