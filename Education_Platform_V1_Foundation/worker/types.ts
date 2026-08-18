export interface Env {
  DB: D1Database;
}

export interface RoleAssignment {
  id: string;
  role_code: string;
  tenant_id: string | null;
  branch_id: string | null;
  department_id: string | null;
  can_delegate: number;
  starts_at: string;
  ends_at: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  preferred_language: string;
  assignments: RoleAssignment[];
}

export interface RequestContext {
  user: AuthUser;
  requestId: string;
}
