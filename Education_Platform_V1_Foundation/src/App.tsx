import React,{useCallback,useEffect,useMemo,useState} from "react";
import {api,qs} from "./lib/api";
import type {Lang} from "./lib/i18n";
import {Shell} from "./components/Shell";
import AuthPage from "./pages/AuthPage";
import ProviderDashboard from "./pages/ProviderDashboard";
import CustomersPage from "./pages/CustomersPage";
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

function currentPage(){return new URLSearchParams(location.search).get("page")||"provider-dashboard"}

export default function App(){
 const [me,setMe]=useState<any|null|undefined>(undefined),[page,setPage]=useState(currentPage()),[lang,setLang]=useState<Lang>((localStorage.getItem("edu_lang") as Lang)||"en");
 const [tenants,setTenants]=useState<any[]>([]),[selectedTenant,setSelectedTenantState]=useState<string|null>(localStorage.getItem("edu_tenant")),[branches,setBranches]=useState<any[]>([]),[selectedBranch,setSelectedBranchState]=useState<string|null>(localStorage.getItem("edu_branch"));
 const [students,setStudents]=useState<any[]>([]),[staff,setStaff]=useState<any[]>([]);

 const refreshMe=useCallback(()=>api<any>("/api/auth/me").then(r=>setMe(r.user)).catch(()=>setMe(null)),[]);
 useEffect(()=>{refreshMe()},[]);
 useEffect(()=>{localStorage.setItem("edu_lang",lang)},[lang]);

 const isPlatformOwner=!!me?.is_platform_owner;
 const effectiveTenant=useMemo(()=>{
   if(isPlatformOwner)return selectedTenant;
   return selectedTenant || me?.assignments?.find((a:any)=>a.tenant_id)?.tenant_id || null;
 },[isPlatformOwner,selectedTenant,me]);

 function setSelectedTenant(id:string|null){
   setSelectedTenantState(id); if(id)localStorage.setItem("edu_tenant",id);else localStorage.removeItem("edu_tenant");
   setSelectedBranch(null);
   if(id && page.startsWith("provider"))navigate("tenant-dashboard");
 }
 function setSelectedBranch(id:string|null){
   setSelectedBranchState(id); if(id)localStorage.setItem("edu_branch",id);else localStorage.removeItem("edu_branch");
 }
 function navigate(id:string){setPage(id);history.pushState({}, "", `${location.pathname}?page=${encodeURIComponent(id)}`)}
 useEffect(()=>{const f=()=>setPage(currentPage());addEventListener("popstate",f);return()=>removeEventListener("popstate",f)},[]);

 const loadTenants=useCallback(()=>{if(!me)return;api<any>("/api/tenants").then(r=>{
   setTenants(r.rows);
   if(!isPlatformOwner && !selectedTenant){
     const id=r.rows[0]?.id||null;if(id)setSelectedTenant(id);
   }
 }).catch(()=>{})},[me,isPlatformOwner,selectedTenant]);

 useEffect(()=>{loadTenants()},[loadTenants]);
 useEffect(()=>{
   if(!effectiveTenant){setBranches([]);setStudents([]);setStaff([]);return}
   api<any>("/api/branches"+qs({tenant_id:effectiveTenant})).then(r=>{
     setBranches(r.rows);
     if(selectedBranch&&!r.rows.some((x:any)=>x.id===selectedBranch))setSelectedBranch(null);
   }).catch(()=>{});
   api<any>("/api/students"+qs({tenant_id:effectiveTenant})).then(r=>setStudents(r.rows)).catch(()=>{});
   api<any>("/api/staff"+qs({tenant_id:effectiveTenant})).then(r=>setStaff(r.rows)).catch(()=>{});
 },[effectiveTenant,selectedBranch]);

 async function logout(){await api("/api/auth/logout",{method:"POST"}).catch(()=>{});setMe(null);setTenants([]);setBranches([])}
 if(me===undefined)return <div className="boot-screen"><div className="spinner"></div><span>Loading Education Platform…</span></div>;
 if(!me)return <AuthPage onReady={refreshMe}/>;

 const tenant=tenants.find(t=>t.id===effectiveTenant);
 const needTenant=()=> <div className="choose-tenant"><div className="empty-icon">⌘</div><h2>Select a customer tenant</h2><p>Choose a school group from the top bar or create a customer first.</p></div>;

 let content:React.ReactNode=null;
 switch(page){
  case "provider-dashboard": content=isPlatformOwner?<ProviderDashboard/>:<TenantDashboard tenantId={effectiveTenant!} branchId={selectedBranch} tenant={tenant}/>; break;
  case "customers": content=isPlatformOwner?<CustomersPage onChanged={loadTenants} onOpenTenant={id=>{setSelectedTenant(id);navigate("tenant-dashboard")}}/>:needTenant(); break;
  case "tenant-dashboard": content=effectiveTenant?<TenantDashboard tenantId={effectiveTenant} branchId={selectedBranch} tenant={tenant}/>:needTenant(); break;
  case "branches": content=effectiveTenant?<BranchesPage tenantId={effectiveTenant} onChanged={()=>{api<any>("/api/branches"+qs({tenant_id:effectiveTenant})).then(r=>setBranches(r.rows))}}/>:needTenant(); break;
  case "students": content=effectiveTenant?<StudentsPage tenantId={effectiveTenant} branchId={selectedBranch} branches={branches}/>:needTenant(); break;
  case "staff": content=effectiveTenant?<StaffPage tenantId={effectiveTenant} branchId={selectedBranch} branches={branches}/>:needTenant(); break;
  case "attendance": content=effectiveTenant?<AttendancePage tenantId={effectiveTenant} branchId={selectedBranch}/>:needTenant(); break;
  case "finance": content=effectiveTenant?<FinancePage tenantId={effectiveTenant} branchId={selectedBranch} branches={branches} students={students} currency={tenant?.default_currency||"IQD"}/>:needTenant(); break;
  case "payroll": content=effectiveTenant?<PayrollPage tenantId={effectiveTenant} branchId={selectedBranch} branches={branches} staff={staff} currency={tenant?.default_currency||"IQD"}/>:needTenant(); break;
  case "import": content=effectiveTenant?<ImportPage tenantId={effectiveTenant} branchId={selectedBranch} branches={branches}/>:needTenant(); break;
  case "access": content=effectiveTenant?<AccessPage tenantId={effectiveTenant} branchId={selectedBranch} branches={branches}/>:needTenant(); break;
  case "architecture": content=<ArchitecturePage/>; break;
  case "audit": content=<AuditPage tenantId={effectiveTenant} branchId={selectedBranch} isPlatformOwner={isPlatformOwner}/>; break;
  default: content=effectiveTenant?<TenantDashboard tenantId={effectiveTenant} branchId={selectedBranch} tenant={tenant}/>:<ProviderDashboard/>;
 }
 return <Shell page={page} onNavigate={navigate} user={me} lang={lang} setLang={setLang} isPlatformOwner={isPlatformOwner}
   tenants={tenants} selectedTenant={effectiveTenant} setSelectedTenant={setSelectedTenant} branches={branches}
   selectedBranch={selectedBranch} setSelectedBranch={setSelectedBranch} onLogout={logout}>{content}</Shell>
}
