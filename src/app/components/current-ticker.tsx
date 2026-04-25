import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Waves } from "lucide-react";
import { apiFetch } from "../lib/supabase";
import type { Job } from "../lib/store";

function relative(ts: number) {
  const mins = Math.max(1, Math.round((Date.now() - ts) / 60000));
  if (mins < 60) return `${mins} мин назад`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} ч назад`;
  return `${Math.round(hrs / 24)} д назад`;
}

export function CurrentTicker() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    apiFetch<{ jobs: Job[] }>("/jobs").then(({ jobs }) => setJobs(jobs.slice(0, 5))).catch(() => {});
  }, []);

  useEffect(() => {
    if (jobs.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % jobs.length), 8000);
    return () => clearInterval(t);
  }, [jobs.length]);

  const j = jobs[idx];
  if (!j) return null;

  return (
    <div className="hidden md:flex fixed bottom-6 left-6 z-30 max-w-[320px] items-center gap-2.5 rounded-full bg-white/60 backdrop-blur px-3 h-10 border border-[#D6E4F0] opacity-55 hover:opacity-95 transition-opacity text-[11px]" style={{ color: "#0F3057" }}>
      <Waves className="w-3.5 h-3.5 text-[#3A8FCC] shrink-0" />
      <AnimatePresence mode="wait">
        <motion.span
          key={j.id}
          initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
          className="truncate"
          style={{ fontWeight: 500 }}
        >
          <span className="text-[#1B5A8F]" style={{ fontWeight: 600 }}>{j.title}</span>
          <span className="text-[#6B6B6B]"> · {j.microdistrict} МКР · {relative(j.createdAt)}</span>
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
