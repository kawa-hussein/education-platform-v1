import type { AuthUser } from "./types";
import { isPlatformOwner } from "./auth";

const TENANT_ADMIN_ROLES = new Set([
  "tenant_owner","group_admin","central_director","school_admin","branch_manager",
  "academic_manager","finance_manager","hr_manager","admissions_manager","it_manager"
]);

export function canAccessTenant(user: AuthUser, tenantId: string): boolean {
  if (isPlatformOwner(user)) return true;
  return user.assignments.some(a => a.tenant_id === tenantId);
}

export function canAccessBranch(user: AuthUser, tenantId: string, branchId?: string | null): boolean {
  if (isPlatformOwner(user)) return true;
  const tenantAssignments = user.assignments.filter(a => a.tenant_id === tenantId);
  if (!tenantAssignments.length) return false;
  if (!branchId) return true;
  return tenantAssignments.some(a => !a.branch_id || a.branch_id === branchId);
}

export function canAdminTenant(user: AuthUser, tenantId: string): boolean {
  if (isPlatformOwner(user)) return true;
  return user.assignments.some(a =>
    a.tenant_id === tenantId &&
    !a.branch_id &&
    TENANT_ADMIN_ROLES.has(a.role_code)
  );
}

export function canAdminBranch(user: AuthUser, tenantId: string, branchId: string): boolean {
  if (isPlatformOwner(user)) return true;
  return user.assignments.some(a =>
    a.tenant_id === tenantId &&
    TENANT_ADMIN_ROLES.has(a.role_code) &&
    (!a.branch_id || a.branch_id === branchId)
  );
}

export function highestRole(user: AuthUser): string {
  if (isPlatformOwner(user)) return "platform_owner";
  const order = ["tenant_owner","group_admin","central_director","school_admin","branch_manager","academic_manager","finance_manager","hr_manager","admissions_manager","teacher","staff","viewer"];
  return order.find(r => user.assignments.some(a => a.role_code === r)) || "viewer";
}

export function canAssignRole(user: AuthUser, roleCode: string, tenantId: string, branchId?: string | null): boolean {
  if (isPlatformOwner(user)) return roleCode !== "platform_owner" || !tenantId;
  const assignment = user.assignments.find(a =>
    a.tenant_id === tenantId &&
    a.can_delegate === 1 &&
    (!a.branch_id || !branchId || a.branch_id === branchId)
  );
  if (!assignment) return false;
  const rank: Record<string, number> = {
    tenant_owner: 100, group_admin: 90, central_director: 80, school_admin: 75,
    branch_manager: 70, academic_manager: 60, finance_manager: 60, hr_manager: 60,
    admissions_manager: 60, department_manager: 50, teacher: 30, staff: 20, viewer: 10
  };
  return (rank[roleCode] || 0) < (rank[assignment.role_code] || 0);
}
