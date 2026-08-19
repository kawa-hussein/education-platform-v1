import baseWorker from "./index";
import type {Env} from "./types";
import {getAuthUser,isPlatformOwner} from "./auth";
import {highestRole} from "./permissions";
import {handlePublicProviderInvite,handleProviderTeamRoute} from "./providerTeam";
import {handleModuleWorkbenchRoute} from "./moduleWorkbench";
import {hasProviderPermission,highestProviderRole,isProviderOwner,isProviderUser,providerPermissions} from "./providerAccess";
import {error,json,mutationOriginAllowed,securityHeaders,uuid} from "./utils";

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
      const url=new URL(request.url),path=url.pathname,requestId=request.headers.get("cf-ray")||uuid();
      if(!mutationOriginAllowed(request))return securityHeaders(error("Cross-origin mutation blocked.",403));

      if(path.startsWith("/api/provider/invitations/")){
        const publicResponse=await handlePublicProviderInvite(request,env);
        if(publicResponse)return securityHeaders(publicResponse);
      }

      if(path==="/api/auth/me"&&request.method==="GET"){
        const user=await getAuthUser(env,request);
        if(!user)return securityHeaders(error("Not authenticated.",401));
        const providerRole=highestProviderRole(user),permissions=isProviderUser(user)?await providerPermissions(env,user):[];
        return securityHeaders(json({ok:true,user:{...user,highest_role:providerRole?.code||highestRole(user),is_platform_owner:isProviderOwner(user)||isPlatformOwner(user),is_provider_user:isProviderUser(user),provider_role_name:providerRole?.name||null,provider_permissions:permissions}}));
      }

      const isExtension=path.startsWith("/api/provider/team")||path==="/api/provider/roles"||path.startsWith("/api/modules/")||path==="/api/provider/summary";
      if(isExtension){
        const user=await getAuthUser(env,request);
        if(!user)return securityHeaders(error("Authentication required.",401));
        if(path==="/api/provider/summary"&&request.method==="GET"){
          if(!isProviderUser(user)||!(await hasProviderPermission(env,user,"provider.dashboard.view")))return securityHeaders(error("Provider dashboard access required.",403));
          return securityHeaders(json({ok:true,summary:await providerSummary(env)}));
        }
        const team=await handleProviderTeamRoute(request,env,user,requestId);if(team)return securityHeaders(team);
        const module=await handleModuleWorkbenchRoute(request,env,user,requestId);if(module)return securityHeaders(module);
      }

      return baseWorker.fetch(request,env);
    }catch(e:any){
      console.error("Unhandled entry error",e);
      return securityHeaders(error("Unexpected server error.",500,e?.message));
    }
  }
};
