import type { Env } from "./types";
import { clientFingerprint, sha256, uuid } from "./utils";

export async function audit(
  env: Env,
  request: Request,
  actorUserId: string | null,
  action: string,
  entityType: string,
  entityId: string | null,
  tenantId: string | null,
  branchId: string | null,
  requestId: string,
  newValue?: unknown,
  oldValue?: unknown,
  eventCode?: string
): Promise<void> {
  const { ipHashInput } = clientFingerprint(request);
  const ipHash = await sha256(ipHashInput);
  await env.DB.prepare(`
    INSERT INTO audit_logs(
      id,tenant_id,branch_id,actor_user_id,action,entity_type,entity_id,event_code,
      old_value_json,new_value_json,request_id,ip_hash
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
  `).bind(
    uuid(), tenantId, branchId, actorUserId, action, entityType, entityId, eventCode || null,
    oldValue == null ? null : JSON.stringify(oldValue),
    newValue == null ? null : JSON.stringify(newValue),
    requestId, ipHash
  ).run();
}
