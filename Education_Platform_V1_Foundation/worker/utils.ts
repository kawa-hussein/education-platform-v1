export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function error(message: string, status = 400, details?: unknown): Response {
  return json({ ok: false, error: message, details }, { status });
}

export async function readJson<T = any>(request: Request): Promise<T> {
  const ct = request.headers.get("content-type") || "";
  if (!ct.includes("application/json")) throw new Error("Expected application/json");
  return await request.json() as T;
}

export function uuid(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function addDays(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function getCookie(request: Request, name: string): string | null {
  const raw = request.headers.get("cookie") || "";
  for (const pair of raw.split(";")) {
    const [k, ...rest] = pair.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function clientFingerprint(request: Request): { ipHashInput: string; userAgent: string } {
  const ip = request.headers.get("cf-connecting-ip") || "local";
  const ua = request.headers.get("user-agent") || "unknown";
  return { ipHashInput: ip, userAgent: ua.slice(0, 500) };
}

export async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return bytesToBase64(new Uint8Array(digest));
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

export function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function securityHeaders(response: Response): Response {
  const h = new Headers(response.headers);
  h.set("x-content-type-options", "nosniff");
  h.set("x-frame-options", "DENY");
  h.set("referrer-policy", "strict-origin-when-cross-origin");
  h.set("permissions-policy", "camera=(), microphone=(), geolocation=(self)");
  h.set("content-security-policy",
    "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: h });
}

export function mutationOriginAllowed(request: Request): boolean {
  if (!["POST","PUT","PATCH","DELETE"].includes(request.method)) return true;
  const origin = request.headers.get("origin");
  if (!origin) return true; // CLI/API clients; authorization still required
  return origin === new URL(request.url).origin;
}
