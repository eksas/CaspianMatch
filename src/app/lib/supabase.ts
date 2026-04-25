import { projectId, publicAnonKey } from "../../../utils/supabase/info";

export const API_BASE = `http://localhost:3000`;

const TOKEN_KEY = "caspian.token";

export function getToken(): string | null {
  try {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) return null;
    // Reject any stored Supabase / OIDC JWTs (they always start with "eyJ").
    // Our custom session tokens are 64-char hex strings — never "eyJ…".
    // Keeping a JWT would make every protected API call 401 in a loop.
    if (t.startsWith("eyJ")) {
      localStorage.removeItem(TOKEN_KEY);
      console.warn("[auth] Cleared stale Supabase JWT from localStorage — please sign in again.");
      return null;
    }
    return t;
  } catch { return null; }
}
export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

/** Thrown by apiFetch when the server returns a non-2xx response. */
export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function clientLog(
  level: "info" | "warn" | "error",
  scope: string,
  message: string,
  meta?: unknown,
) {
  console.log(`[${level}] ${scope}: ${message}`, meta ?? "");
  try {
    await fetch(`${API_BASE}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${publicAnonKey}` },
      body: JSON.stringify({ level, scope, message, meta }),
    });
  } catch {}
}

export async function apiFetch<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const session = getToken();
  const token = session ?? publicAnonKey;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(opts.headers ?? {}),
      },
    });
  } catch (networkErr) {
    // Network-level failure (no connection, CORS preflight issue, etc.)
    const msg = `Нет соединения с сервером. Проверь интернет.`;
    console.warn(`[network] ${opts.method ?? "GET"} ${path}: ${networkErr}`);
    throw new ApiError(0, msg);
  }

  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {}

    console.warn(`API ${opts.method ?? "GET"} ${path} → ${res.status}: ${msg}`);

    // NOTE: We intentionally do NOT auto-clear the session on 401 here.
    // A single stale/misbehaving endpoint shouldn't yank the user back to
    // /sign-in. The initial session restore in AuthProvider handles 401
    // explicitly — every other caller just surfaces the error.

    if (path !== "/logs") {
      clientLog("error", "client/api", `${opts.method ?? "GET"} ${path} → ${msg}`);
    }
    throw new ApiError(res.status, msg);
  }

  return res.json();
}

/** Quick connectivity probe — resolves true if edge function responds, false otherwise. */
export async function pingServer(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      method: "GET",
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      signal: AbortSignal.timeout(6000),
    });
    return res.ok;
  } catch {
    return false;
  }
}