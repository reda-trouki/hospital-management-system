// Thin fetch wrapper around the Spring Boot REST API (see hms-backend/README.md).
const BASE = ((import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8080").replace(/\/$/, "")
const TOKEN_KEY = "medicore-token"

export class ApiError extends Error {
  constructor(public status: number, message: string, public fields?: Record<string, string>) { super(message) }
}

export const tokenStore = {
  get: () => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } },
  set: (t: string) => { try { localStorage.setItem(TOKEN_KEY, t) } catch { /* ignore */ } },
  clear: () => { try { localStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ } },
}

let onUnauthorized: () => void = () => {}
export const setUnauthorizedHandler = (fn: () => void) => { onUnauthorized = fn }

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {}
  const token = tokenStore.get()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers["Content-Type"] = "application/json"
  let res: Response
  try {
    res = await fetch(BASE + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  } catch {
    throw new ApiError(0, `Cannot reach the server at ${BASE}. Is the backend running?`)
  }
  if (res.status === 204) return undefined as T
  const text = await res.text()
  let data: unknown
  try { data = text ? JSON.parse(text) : undefined } catch { data = undefined }
  if (!res.ok) {
    const p = (data ?? {}) as { detail?: string; title?: string; errors?: Record<string, string> }
    const fields = p.errors
    const fieldMsg = fields ? Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join("; ") : ""
    const msg = [p.detail && p.detail !== "Validation failed" ? p.detail : "", fieldMsg].filter(Boolean).join(" — ") || p.title || `Request failed (${res.status})`
    if (res.status === 401 && path !== "/api/auth/login") onUnauthorized()
    throw new ApiError(res.status, msg, fields)
  }
  return data as T
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body ?? {}),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body ?? {}),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body ?? {}),
  del: <T>(path: string) => request<T>("DELETE", path),
}

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong")
