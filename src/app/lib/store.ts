import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "./supabase";
import { useAuth } from "./auth";
import { generateMatchScores } from "./mock-data";
import { recordEvent } from "./gamification";

export type Job = {
  id: string;
  title: string;
  company: string;
  salary: string;
  microdistrict: number;
  category: string;
  isAIParsed: boolean;
  description: string;
  requirements: string[];
  createdAt: number;
  match: number;
  urgent?: boolean;
};

export type Application = {
  id: string;
  jobId: string;
  applicantId?: string;
  name: string;
  phone: string;
  note: string;
  status: "PENDING" | "APPROVED";
  createdAt: number;
};

// ── Local storage helpers ─────────────────────────────────────────────────
const LS = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  set(key: string, val: unknown) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  },
};

// ── useJobs ──────────────────────────────────────────────────────────────
export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>(() => {
    const local = LS.get<Job[]>("caspian.jobs", []);
    // Wipe old mock jobs from beta
    if (local.length > 0 && local.some(j => j.title === "Бариста" && j.salary === "180 000 ₸")) {
      LS.set("caspian.jobs", []);
      LS.set("caspian.apps", []); // Also wipe old mock applications
      return [];
    }
    return local;
  });

  // Persist locally
  useEffect(() => { LS.set("caspian.jobs", jobs); }, [jobs]);

  // Try to fetch from API (non-blocking); if it fails, we already have local data
  const refresh = useCallback(async () => {
    try {
      const { jobs: remote } = await apiFetch<{ jobs: Job[] }>("/jobs");
      if (remote) setJobs(remote);
    } catch {
      // Silently use local data
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addJob = async (j: Job) => {
    // Try remote first
    try {
      const { job } = await apiFetch<{ job: Job }>("/jobs", { method: "POST", body: JSON.stringify(j) });
      setJobs((p) => [job, ...p.filter((x) => x.id !== job.id)]);
      return;
    } catch {
      // Fallback: add locally
    }
    setJobs((p) => [j, ...p.filter((x) => x.id !== j.id)]);
    recordEvent("POST_VACANCY");
  };

  return { jobs, setJobs, addJob, refresh };
}

// ── useApplications ─────────────────────────────────────────────────────
export function useApplications() {
  const { user } = useAuth();
  const [apps, setApps] = useState<Application[]>(() => {
    return LS.get<Application[]>("caspian.apps", []);
  });

  useEffect(() => { LS.set("caspian.apps", apps); }, [apps]);

  const refresh = useCallback(async () => {
    if (!user) { return; }
    try {
      const { applications } = await apiFetch<{ applications: Application[] }>("/applications");
      if (applications) setApps(applications);
    } catch {
      // Use local data
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const add = async (a: Application) => {
    try {
      const { application } = await apiFetch<{ application: Application }>("/applications", {
        method: "POST",
        body: JSON.stringify(a),
      });
      setApps((p) => [application, ...p]);
      return;
    } catch {
      // Fallback: add locally
    }
    setApps((p) => [a, ...p]);
    recordEvent("APPLY");
  };

  const approve = async (id: string) => {
    try {
      const { application } = await apiFetch<{ application: Application }>(`/applications/${id}/approve`, {
        method: "POST",
      });
      setApps((p) => p.map((a) => (a.id === id ? application : a)));
      return;
    } catch {
      // Fallback: approve locally
    }
    setApps((p) => p.map((a) => (a.id === id ? { ...a, status: "APPROVED" as const } : a)));
  };

  return { apps, add, approve, refresh };
}

// ── useSaved ────────────────────────────────────────────────────────────
export function useSaved() {
  const { user } = useAuth();
  const [saved, setSaved] = useState<string[]>(() => {
    return LS.get<string[]>("caspian.saved", []);
  });

  useEffect(() => { LS.set("caspian.saved", saved); }, [saved]);

  useEffect(() => {
    if (!user) { return; }
    (async () => {
      try {
        const { saved: remote } = await apiFetch<{ saved: string[] }>("/saved");
        if (remote) setSaved(remote);
      } catch {
        // Use local data
      }
    })();
  }, [user]);

  const toggle = async (id: string) => {
    if (!user) return;
    try {
      const { saved: remote } = await apiFetch<{ saved: string[] }>("/saved/toggle", {
        method: "POST",
        body: JSON.stringify({ jobId: id }),
      });
      setSaved(remote);
      return;
    } catch {
      // Fallback: toggle locally
    }
    setSaved((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    if (!saved.includes(id)) recordEvent("SAVE_JOB");
  };

  return { saved, toggle, has: (id: string) => saved.includes(id) };
}

export type MatchScore = { id: string; score: number; reason: string };

// ── useMatchedJobs ──────────────────────────────────────────────────────
export function useMatchedJobs() {
  const { user } = useAuth();
  const { jobs } = useJobs();
  const [scores, setScores] = useState<Record<string, MatchScore>>({});
  const [loading, setLoading] = useState(false);

  const run = useCallback(async () => {
    if (!user || user.role !== "SEEKER" || jobs.length === 0) return;
    setLoading(true);
    try {
      const { scores: list } = await apiFetch<{ scores: MatchScore[] }>("/match-jobs", { method: "POST", body: "{}" });
      const map: Record<string, MatchScore> = {};
      list.forEach((s) => { map[s.id] = s; });
      setScores(map);
    } catch {
      // Fallback: generate local match scores
      const localScores = generateMatchScores(jobs);
      const map: Record<string, MatchScore> = {};
      localScores.forEach((s) => { map[s.id] = s; });
      setScores(map);
    } finally {
      setLoading(false);
    }
  }, [user, jobs.length]);

  useEffect(() => { run(); }, [run]);

  const matched = jobs.map((j) => {
    const s = scores[j.id];
    return s ? { ...j, match: s.score, matchReason: s.reason as string | undefined } : j;
  }).sort((a, b) => b.match - a.match);

  return { matched, loading, scores, refresh: run };
}

export function resetAll() {
  try {
    localStorage.removeItem("caspian.jobs");
    localStorage.removeItem("caspian.apps");
    localStorage.removeItem("caspian.saved");
  } catch {}
}
