import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, TrendingUp, GraduationCap } from "lucide-react";
import { apiFetch } from "../lib/supabase";
import { C, EASE } from "../lib/design";
import { getLocalBoostTips } from "../lib/mock-data";

type Tip = { title: string; detail: string; boost: number };

export function BoostTipsModal({ jobId, open, onClose }: { jobId: string; open: boolean; onClose: () => void }) {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true); setErr(null); setTips([]);
    apiFetch<{ tips: Tip[] }>("/boost-tips", { method: "POST", body: JSON.stringify({ jobId }) })
      .then(({ tips }) => setTips(tips ?? []))
      .catch(() => {
        // Fallback: use local boost tips
        setTips(getLocalBoostTips(jobId));
      })
      .finally(() => setLoading(false));
  }, [open, jobId]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(10,31,61,0.45)", backdropFilter: "blur(6px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 14, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE.splash }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-white p-6 relative"
            style={{ boxShadow: "0 40px 80px -20px rgba(10,31,61,0.4)" }}
          >
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: C.tide50, color: C.tide700 }}>
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-3.5 h-3.5" style={{ color: C.tide700 }} />
              <span className="text-[10.5px] font-mono" style={{ color: C.tide700, letterSpacing: "0.18em", fontWeight: 700 }}>
                ЖЕМЧУГ · AI-НАСТАВНИК
              </span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.025em", color: C.abyss }}>
              Как поднять шансы.
            </div>
            <div className="text-[12.5px] mt-1 mb-5" style={{ color: C.depth, fontWeight: 500 }}>
              AI смотрит на твой профиль и эту вакансию — даёт 3 конкретных шага.
            </div>

            {loading && (
              <div className="py-10 text-center">
                <Sparkles className="w-5 h-5 mx-auto animate-pulse mb-2" style={{ color: C.tide700 }} />
                <div className="text-[13px]" style={{ color: C.depth, fontWeight: 600 }}>AI готовит советы…</div>
              </div>
            )}

            {err && <div className="text-[13px]" style={{ color: C.coral, fontWeight: 600 }}>{err}</div>}

            {!loading && !err && tips.length > 0 && (
              <div className="space-y-2.5">
                {tips.map((t, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-2xl border p-4 flex items-start gap-3"
                    style={{ borderColor: C.tide100, background: C.tide50 }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white" style={{ background: C.tide700, fontWeight: 800 }}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[14px]" style={{ color: C.abyss, fontWeight: 700, letterSpacing: "-0.01em" }}>{t.title}</span>
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-mono" style={{ color: C.kelp, fontWeight: 700 }}>
                          <TrendingUp className="w-3 h-3" /> +{t.boost}%
                        </span>
                      </div>
                      <div className="text-[12.5px]" style={{ color: C.depth, fontWeight: 500, lineHeight: 1.5 }}>{t.detail}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
