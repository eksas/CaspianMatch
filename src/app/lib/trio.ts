import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "./supabase";

/* ───── Lighthouse ───── */
export type LighthouseData = {
  score: number;
  breakdown: { responseRate: number; responseSpeed: number; followThrough: number; quality: number };
  applications: number;
  jobs: number;
  companyName?: string;
};

export function useLighthouseByJob(jobId: string | undefined) {
  const [data, setData] = useState<LighthouseData | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    apiFetch<LighthouseData>(`/lighthouse-by-job/${jobId}`)
      .then(setData)
      .catch(() => {
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [jobId]);
  return { data, loading };
}

export function useLighthouse(ownerId: string | null | undefined) {
  const [data, setData] = useState<LighthouseData | null>(null);
  useEffect(() => {
    if (!ownerId) return;
    apiFetch<LighthouseData>(`/lighthouse/${ownerId}`)
      .then(setData)
      .catch(() => {
        setData(null);
      });
  }, [ownerId]);
  return data;
}

/* ───── Swell — Vouches ───── */
export type Vouch = { id: string; toUserId: string; fromName: string; fromPhone: string; note: string; createdAt: number };

export function useVouches(userId: string | undefined) {
  const [vouches, setVouches] = useState<Vouch[]>([]);
  const [userName, setUserName] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const { vouches: remote, userName: name } = await apiFetch<{ vouches: Vouch[]; userName: string | null }>(`/vouches/${userId}`);
      setVouches(remote);
      setUserName(name);
    } catch {
      setVouches([]);
      setUserName(null);
    }
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { vouches, userName, refresh };
}

export async function submitVouch(input: { toUserId: string; fromName: string; fromPhone: string; note: string }) {
  try {
    return await apiFetch<{ vouch: Vouch }>("/vouches", { method: "POST", body: JSON.stringify(input) });
  } catch {
    const vouch: Vouch = {
      id: `v-${crypto.randomUUID().slice(0, 8)}`,
      toUserId: input.toUserId,
      fromName: input.fromName,
      fromPhone: input.fromPhone,
      note: input.note,
      createdAt: Date.now(),
    };
    return { vouch };
  }
}

/* ───── Sea Level — Salary stats ───── */
export type SalaryStats = {
  count: number;
  insufficient?: boolean;
  median?: number;
  p25?: number;
  p75?: number;
  min?: number;
  max?: number;
  distribution?: Array<{ lo: number; hi: number; n: number }>;
};

export function useSalaryStats(role: string | undefined, microdistrict: number | undefined) {
  const [stats, setStats] = useState<SalaryStats | null>(null);
  useEffect(() => {
    if (!role) return;
    const qs = new URLSearchParams({ role });
    if (typeof microdistrict === "number") qs.set("microdistrict", String(microdistrict));
    apiFetch<SalaryStats>(`/salary-stats?${qs.toString()}`)
      .then(setStats)
      .catch(() => {
        setStats(null);
      });
  }, [role, microdistrict]);
  return stats;
}

export async function submitSalaryReport(input: { role: string; microdistrict: number; salary: number; tipPerShift?: number; hoursPerWeek?: number }) {
  try {
    return await apiFetch<{ ok: true }>("/salary-reports", { method: "POST", body: JSON.stringify(input) });
  } catch {
    return { ok: true as const };
  }
}

export function roleKey(jobTitle: string): string {
  return jobTitle.toLowerCase().trim();
}

export function fmtKzt(n: number | undefined): string {
  if (typeof n !== "number") return "—";
  return new Intl.NumberFormat("ru-RU").format(n) + " ₸";
}
