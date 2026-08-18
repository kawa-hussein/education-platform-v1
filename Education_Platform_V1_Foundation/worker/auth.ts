import type { AuthUser, Env, RoleAssignment } from "./types";
import { addDays, base64ToBytes, bytesToBase64, clientFingerprint, getCookie, sha256, uuid } from "./utils";

const SESSION_COOKIE = "edu_session";
// Workers Free has a very small per-request CPU budget. Keep bootstrap/login
// within that budget for the V1 pilot; raise this when moving authentication
// to a paid Worker / dedicated auth service.
const PBKDF2_ITERATIONS = 25_000;

async function derivePassword(password: string, saltBytes: Uint8Array): Promise<string> {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: saltBytes, iterations: PBKDF2_ITERATIONS },
    material,
    256
  );
  return bytesToBase64(new Uint8Array(bits));
}

export async function makePassword(password: string): Promise<{ hash: string; salt: string }> {
  if (password.length < 10) throw new Error("Password must be at least 10 characters.");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { hash: await derivePassword(password, salt), salt: bytesToBase64(salt) };
}

export async function verifyPassword(password: string, expectedHash: string, salt: string): Promise<boolean> {
  const actual = await derivePassword(password, base64ToBytes(salt));
  const a = new TextEncoder().encode(actual);
  const b = new TextEncoder().encode(expectedHash);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function createSession(env: Env, request: Request, userId: string): Promise<{ cookie: string; expiresAt: string }> {
  const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
  const token = bytesToBase64(tokenBytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  const tokenHash = await sha256(token);
  const { ipHashInput, userAgent } = clientFingerprint(request);
  const ipHash = await sha256(ipHashInput);
  const expiresAt = addDays(7);
  await env.DB.prepare(
    "INSERT INTO sessions(id,user_id,token_hash,expires_at,ip_hash,user_agent) VALUES(?,?,?,?,?,?)"
  ).bind(uuid(), userId, tokenHash, expiresAt, ipHash, userAgent).run();

  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  const cookie = `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7*24*60*60}${secure}`;
  return { cookie, expiresAt };
}

export function clearSessionCookie(request: Request): string {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export async function destroySession(env: Env, request: Request): Promise<void> {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return;
  await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await sha256(token)).run();
}

export async function getAuthUser(env: Env, request: Request): Promise<AuthUser | null> {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await sha256(token);
  const session = await env.DB.prepare(`
    SELECT u.id,u.email,u.name,u.preferred_language,s.id AS session_id
    FROM sessions s
    JOIN users u ON u.id=s.user_id
    WHERE s.token_hash=? AND s.expires_at > CURRENT_TIMESTAMP AND u.status='active'
    LIMIT 1
  `).bind(tokenHash).first<any>();
  if (!session) return null;

  await env.DB.prepare("UPDATE sessions SET last_seen_at=CURRENT_TIMESTAMP WHERE id=?").bind(session.session_id).run();

  const assignmentsResult = await env.DB.prepare(`
    SELECT id,role_code,tenant_id,branch_id,department_id,can_delegate,starts_at,ends_at
    FROM role_assignments
    WHERE user_id=?
      AND starts_at <= CURRENT_TIMESTAMP
      AND (ends_at IS NULL OR ends_at > CURRENT_TIMESTAMP)
  `).bind(session.id).all<RoleAssignment>();

  return {
    id: session.id,
    email: session.email,
    name: session.name,
    preferred_language: session.preferred_language || "en",
    assignments: assignmentsResult.results || []
  };
}

export function isPlatformOwner(user: AuthUser): boolean {
  return user.assignments.some(a => a.role_code === "platform_owner" && !a.tenant_id);
}
