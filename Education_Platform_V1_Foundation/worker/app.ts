import legacyWorker from "./index";
import type {Env} from "./types";
import {getAuthUser,isPlatformOwner} from "./auth";
import {highestRole} from "./permissions";
import {error,json,mutationOriginAllowed,securityHeaders,uuid} from "./utils";
import {handleProviderTeamRoute,handlePublicProviderInvite} from "./providerTeam";
import {hasProviderPermission,highestProviderRole,isProviderUser,providerPermissions} from "./providerAccess";

async function providerSummary(env:Env){
  const [tenants,active,branches,students,staff,renewals]=await Promise.all([
    env.DB.prepare("SELECT COUNT(*) c FROM tenants").first<any>(),
    env.DB.prepare("SELECT COUNT(*) c FROM tenants WHERE status IN ('trial','active','renewal_due')").first<any>(),
    env.DB.prepare("SELECT COUNT(*) c FROM branches WHERE status='active'").first<any>(),
    env.DB.prepare("SELECT COUNT(*) c FROM students WHERE status='active'").first<any>(),
    env.DB.prepare("SELECT COUNT(*) c FROM staff WHERE employment_status='active'").first<any>(),
    env.DB.prepare("SELECT COUNT(*) c FROM tenants WHERE expires_at IS NOT NULL AND expires_at <= datetime('now','+30 day') AND status NOT IN ('cancelled','archived')").first<any>()
  ]);
  return {tenants:Number(tenants?.c||0),active_tenants:Number(active?.c||0),branches:Number(branches?.c||0),students:Number(students?.c||0),staff:Number(staff?.c||0),renewals_due:Number(renewals?.c||0)};
}

export default {
  async fetch(request:Request,env:Env):Promise<Response>{
    try{
      if(!mutationOriginAllowed(request))return securityHeaders(error("Cross-origin mutation blocked.",403));
      const url=new URL(request.url), path=url.pathname;

      const publicInvite=await handlePublicProviderInvite(request,env);
      if(publicInvite)return securityHeaders(publicInvite);

      if(path==="/api/auth/me"&&request.method==="GET"){
        const user=await getAuthUser(env,request);
        if(!user)return securityHeaders(error("Not authenticated.",401));
        const provider=isProviderUser(user), providerRole=highestProviderRole(user), permissions=provider?await providerPermissions(env,user):[];
        return securityHeaders(json({ok:true,user:{...user,highest_role:providerRole?.code||highestRole(user),is_platform_owner:isPlatformOwner(user),is_provider_user:provider,provider_permissions:permissions,provider_role_name:providerRole?.name||null}}));
      }

      const user=await getAuthUser(env,request);
      if(user&&path.startsWith("/api/provider/team")||user&&path==="/api/provider/roles"){
        const handled=await handleProviderTeamRoute(request,env,user!,request.headers.get("cf-ray")||uuid());
        if(handled)return securityHeaders(handled);
      }

      if(user&&path==="/api/provider/summary"&&request.method==="GET"&&isProviderUser(user)){
        if(!(await hasProviderPermission(env,user,"provider.dashboard.view")))return securityHeaders(error("Provider dashboard permission required.",403));
        return securityHeaders(json({ok:true,summary:await providerSummary(env)}));
      }

      if(user&&path==="/api/tenants"&&request.method==="GET"&&isProviderUser(user)&&!isPlatformOwner(user)){
        if(!(await hasProviderPermission(env,user,"provider.customers.view")))return securityHeaders(error("Customer directory permission required.",403));
        const rows=(await env.DB.prepare(`SELECT t.*,p.name plan_name,(SELECT COUNT(*) FROM branches b WHERE b.tenant_id=t.id AND b.status='active') branch_count,(SELECT COUNT(*) FROM students s WHERE s.tenant_id=t.id AND s.status='active') student_count,(SELECT COUNT(*) FROM staff st WHERE st.tenant_id=t.id AND st.employment_status='active') staff_count FROM tenants t LEFT JOIN plans p ON p.code=t.plan_code ORDER BY t.created_at DESC`).all<any>()).results||[];
        return securityHeaders(json({ok:true,rows}));
      }

      return await legacyWorker.fetch(request,env);
    }catch(e:any){
      console.error("Unhandled app router error",e);
      return securityHeaders(error("Unexpected server error.",500,e?.message));
    }
  }
};
