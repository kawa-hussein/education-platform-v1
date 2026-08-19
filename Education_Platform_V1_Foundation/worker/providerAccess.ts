import type { AuthUser, Env } from "./types";

export type ProviderRoleDefinition={
  code:string;
  name:string;
  description:string;
  rank:number;
  permissions:string[];
};

export const PROVIDER_PERMISSIONS=[
  {code:"provider.dashboard.view",group:"Command Center",name:"View provider dashboard"},
  {code:"provider.customers.view",group:"Customers",name:"View customers / tenants"},
  {code:"provider.customers.manage",group:"Customers",name:"Create and edit customers"},
  {code:"provider.commercial.manage",group:"Commercial",name:"Manage CRM, contracts, plans and subscriptions"},
  {code:"provider.billing.view",group:"Billing",name:"View provider billing and revenue operations"},
  {code:"provider.billing.manage",group:"Billing",name:"Manage invoices, payments and collections"},
  {code:"provider.delivery.manage",group:"Delivery",name:"Manage provisioning, onboarding and migration"},
  {code:"provider.success.manage",group:"Customer",name:"Manage customer success and account health"},
  {code:"provider.support.manage",group:"Support",name:"Manage support tickets and service desk"},
  {code:"provider.support.elevated",group:"Support",name:"Request privileged tenant support access"},
  {code:"provider.operations.manage",group:"Operations",name:"Manage SRE, incidents, releases and platform operations"},
  {code:"provider.security.manage",group:"Security",name:"Manage security, compliance and privileged access"},
  {code:"provider.audit.view",group:"Governance",name:"View provider audit history"},
  {code:"provider.team.view",group:"Administration",name:"View provider internal team"},
  {code:"provider.team.manage",group:"Administration",name:"Create, invite, suspend and edit provider users"},
  {code:"provider.owner.manage",group:"Administration",name:"Create or change Provider Owners"},
  {code:"provider.settings.manage",group:"Administration",name:"Manage provider-wide configuration"},
  {code:"provider.data.read",group:"Data Access",name:"Read tenant operational data when explicitly permitted"},
] as const;

const ALL=PROVIDER_PERMISSIONS.map(x=>x.code);
const without=(...codes:string[])=>ALL.filter(x=>!codes.includes(x));
const only=(...codes:string[])=>codes;

export const PROVIDER_ROLES:ProviderRoleDefinition[]=[
  {code:"provider_owner",name:"Provider Owner",description:"Company owner / partner with full provider control.",rank:1000,permissions:ALL},
  {code:"platform_owner",name:"Provider Owner (Legacy)",description:"Initial bootstrap owner; treated as Provider Owner.",rank:1000,permissions:ALL},
  {code:"platform_super_admin",name:"Platform Super Admin",description:"Broad platform administration without authority to create Provider Owners.",rank:900,permissions:without("provider.owner.manage")},
  {code:"saas_operations_admin",name:"SaaS Operations Admin",description:"Provisioning, reliability, incidents, releases and operational administration.",rank:800,permissions:only("provider.dashboard.view","provider.customers.view","provider.delivery.manage","provider.operations.manage","provider.audit.view","provider.team.view")},
  {code:"security_admin",name:"Security Admin",description:"Security, compliance, privileged access and audit oversight.",rank:800,permissions:only("provider.dashboard.view","provider.customers.view","provider.security.manage","provider.audit.view","provider.team.view","provider.support.elevated")},
  {code:"support_manager",name:"Support Manager",description:"Support operations and controlled privileged-support requests.",rank:700,permissions:only("provider.dashboard.view","provider.customers.view","provider.support.manage","provider.support.elevated","provider.audit.view","provider.team.view")},
  {code:"support_engineer",name:"Support Engineer",description:"Customer support with no standing access to sensitive tenant data.",rank:600,permissions:only("provider.dashboard.view","provider.customers.view","provider.support.manage")},
  {code:"implementation_consultant",name:"Implementation Consultant",description:"Onboarding, configuration delivery and data migration.",rank:600,permissions:only("provider.dashboard.view","provider.customers.view","provider.delivery.manage","provider.support.manage")},
  {code:"customer_success_manager",name:"Customer Success Manager",description:"Customer health, adoption, renewals support and success planning.",rank:600,permissions:only("provider.dashboard.view","provider.customers.view","provider.success.manage","provider.commercial.manage")},
  {code:"account_manager",name:"Account Manager",description:"Commercial account ownership and customer relationship management.",rank:600,permissions:only("provider.dashboard.view","provider.customers.view","provider.commercial.manage","provider.billing.view","provider.success.manage")},
  {code:"sales_user",name:"Sales User",description:"Lead, opportunity, demo and proposal management.",rank:500,permissions:only("provider.dashboard.view","provider.customers.view","provider.commercial.manage")},
  {code:"billing_revenue_ops",name:"Billing / Revenue Ops",description:"Provider billing, invoices, payments and collections without education-data access.",rank:600,permissions:only("provider.dashboard.view","provider.customers.view","provider.billing.view","provider.billing.manage","provider.audit.view")},
  {code:"product_manager",name:"Product Manager",description:"Product feedback, rollout visibility and roadmap operations.",rank:500,permissions:only("provider.dashboard.view","provider.customers.view","provider.operations.manage")},
  {code:"release_manager",name:"Release Manager",description:"Release, rollout, feature-flag and change coordination.",rank:600,permissions:only("provider.dashboard.view","provider.operations.manage","provider.audit.view")},
  {code:"auditor",name:"Auditor",description:"Read-only governance and audit access.",rank:400,permissions:only("provider.dashboard.view","provider.customers.view","provider.billing.view","provider.audit.view","provider.team.view")},
  {code:"read_only_executive",name:"Read-Only Executive",description:"Executive dashboards and high-level customer visibility only.",rank:300,permissions:only("provider.dashboard.view","provider.customers.view","provider.billing.view")},
];

const roleMap=Object.fromEntries(PROVIDER_ROLES.map(x=>[x.code,x])) as Record<string,ProviderRoleDefinition>;

export function providerAssignments(user:AuthUser){
  return user.assignments.filter(a=>!a.tenant_id && !!roleMap[a.role_code]);
}
export function isProviderUser(user:AuthUser){return providerAssignments(user).length>0;}
export function isProviderOwner(user:AuthUser){return providerAssignments(user).some(a=>a.role_code==="provider_owner"||a.role_code==="platform_owner");}
export function highestProviderRole(user:AuthUser){
  return providerAssignments(user).map(a=>roleMap[a.role_code]).filter(Boolean).sort((a,b)=>b.rank-a.rank)[0]||null;
}

export async function providerPermissions(env:Env,user:AuthUser):Promise<string[]>{
  const base=new Set<string>();
  for(const assignment of providerAssignments(user)) for(const p of roleMap[assignment.role_code]?.permissions||[]) base.add(p);
  if(!base.size)return [];
  const res=await env.DB.prepare("SELECT permission_code,effect FROM provider_user_permission_overrides WHERE user_id=?").bind(user.id).all<any>().catch(()=>({results:[]} as any));
  for(const row of res.results||[]){ if(row.effect==="deny")base.delete(row.permission_code); else if(row.effect==="allow")base.add(row.permission_code); }
  return [...base];
}
export async function hasProviderPermission(env:Env,user:AuthUser,permission:string){
  if(isProviderOwner(user))return true;
  return (await providerPermissions(env,user)).includes(permission);
}
export function roleDefinition(code:string){return roleMap[code]||null;}
export function publicProviderRoles(){return PROVIDER_ROLES.filter(r=>r.code!=="platform_owner");}
