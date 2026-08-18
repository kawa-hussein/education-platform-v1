export class ApiError extends Error {
  status: number;
  details: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message); this.status = status; this.details = details;
  }
}
export async function api<T=any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) headers.set("content-type","application/json");
  const res = await fetch(path, { ...options, headers, credentials:"same-origin" });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw new ApiError(data.error || `Request failed (${res.status})`, res.status, data.details);
  return data as T;
}
export const qs = (params: Record<string,string|number|null|undefined>) => {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k,v])=>{ if(v!==null && v!==undefined && v!=="") u.set(k,String(v)); });
  return u.toString() ? `?${u.toString()}` : "";
};
