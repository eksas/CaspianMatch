import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { apiFetch, ApiError, clientLog, getToken, setToken } from "./supabase";

export type Role = "SEEKER" | "EMPLOYER";
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  company?: string;
  microdistrict?: number;
  skills?: string[];
  bio?: string;
  avatarHue: number;
};

type Ctx = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signUp: (data: { email: string; password: string; name: string; role: Role; company?: string; microdistrict?: number; skills?: string[]; bio?: string; interests?: string[] }) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  update: (patch: Partial<AuthUser>) => Promise<void>;
};

const AuthCtx = createContext<Ctx | null>(null);

// ── Local user storage (offline auth) ────────────────────────────────────
const LOCAL_USER_KEY = "caspian.localUser";
const LOCAL_ACCOUNTS_KEY = "caspian.accounts";

type StoredAccount = {
  email: string;
  password: string;
  profile: AuthUser;
};

function getLocalUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function setLocalUser(u: AuthUser | null) {
  try {
    if (u) localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(LOCAL_USER_KEY);
  } catch {}
}

function getAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveAccount(account: StoredAccount) {
  const accounts = getAccounts().filter((a) => a.email !== account.email);
  accounts.push(account);
  try { localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts)); } catch {}
}

// Generate deterministic hue from email
function emailHue(email: string): number {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = ((hash << 5) - hash + email.charCodeAt(i)) | 0;
  return Math.abs(hash) % 360;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ── initial session restore ──────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    (async () => {
      // First try remote session
      if (getToken()) {
        try {
          const { profile } = await apiFetch<{ profile: AuthUser }>("/me");
          if (mounted) { setUser(profile); setLocalUser(profile); setLoading(false); return; }
        } catch {
          setToken(null);
        }
      }

      // Fallback: restore from local storage
      const local = getLocalUser();
      if (mounted) {
        setUser(local);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ── listen for 401 signals emitted by apiFetch ──────────────────────────
  useEffect(() => {
    const handle = () => {
      // Don't clear user on 401 — we keep local session alive
    };
    window.addEventListener("caspian:unauthorized", handle);
    return () => window.removeEventListener("caspian:unauthorized", handle);
  }, []);

  // ── auth actions ─────────────────────────────────────────────────────────
  const signIn: Ctx["signIn"] = async (email, password) => {
    // Try remote first
    try {
      const { token, profile } = await apiFetch<{ token: string; profile: AuthUser }>("/auth/signin", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(token);
      setUser(profile);
      setLocalUser(profile);
      saveAccount({ email, password, profile });
      return profile;
    } catch {
      // Fallback: local sign in
    }

    // Check local accounts
    const accounts = getAccounts();
    const found = accounts.find((a) => a.email === email && a.password === password);
    if (found) {
      setUser(found.profile);
      setLocalUser(found.profile);
      return found.profile;
    }

    // Auto-create local account on first sign-in (demo mode)
    const profile: AuthUser = {
      id: `local-${crypto.randomUUID().slice(0, 8)}`,
      email,
      name: email.split("@")[0],
      role: "SEEKER",
      microdistrict: 14,
      skills: [],
      bio: "",
      avatarHue: emailHue(email),
    };
    setUser(profile);
    setLocalUser(profile);
    saveAccount({ email, password, profile });
    return profile;
  };

  const signUp: Ctx["signUp"] = async (payload) => {
    // Try remote first
    try {
      await clientLog("info", "auth/signup", `Attempting signup ${payload.email}`, { role: payload.role });
      const { token, profile } = await apiFetch<{ token: string; profile: AuthUser }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setToken(token);
      setUser(profile);
      setLocalUser(profile);
      saveAccount({ email: payload.email, password: payload.password, profile });
      return profile;
    } catch {
      // Fallback: local sign up
    }

    const profile: AuthUser = {
      id: `local-${crypto.randomUUID().slice(0, 8)}`,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      company: payload.company,
      microdistrict: payload.microdistrict,
      skills: payload.skills,
      bio: payload.bio,
      avatarHue: emailHue(payload.email),
    };
    setUser(profile);
    setLocalUser(profile);
    saveAccount({ email: payload.email, password: payload.password, profile });
    return profile;
  };

  const signOut: Ctx["signOut"] = async () => {
    try { await apiFetch("/auth/signout", { method: "POST" }); } catch {}
    setToken(null);
    setUser(null);
    setLocalUser(null);
  };

  const update: Ctx["update"] = async (patch) => {
    if (!user) throw new ApiError(401, "Not signed in");

    // Try remote
    try {
      const { profile } = await apiFetch<{ profile: AuthUser }>("/me", {
        method: "PUT",
        body: JSON.stringify(patch),
      });
      setUser(profile);
      setLocalUser(profile);
      saveAccount({ email: profile.email, password: "", profile });
      return;
    } catch {
      // Fallback: update locally
    }

    const updated = { ...user, ...patch };
    setUser(updated);
    setLocalUser(updated);
    saveAccount({ email: updated.email, password: "", profile: updated });
  };

  return (
    <AuthCtx.Provider value={{ user, loading, signIn, signUp, signOut, update }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}

export function RequireAuth({
  role,
  children,
}: {
  role?: Role;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to="/sign-in" state={{ from: loc.pathname, sessionExpired: true }} replace />;
  if (role && user.role !== role) return <Navigate to="/app" replace />;
  return <>{children}</>;
}