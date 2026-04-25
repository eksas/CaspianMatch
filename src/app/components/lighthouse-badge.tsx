import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, X } from "lucide-react";
import { C, EASE } from "../lib/design";
import type { LighthouseData } from "../lib/trio";

export function LighthouseBadge({ data, compact }: { data: LighthouseData | null; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  if (!data) {
    return (
      <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px]" style={{ background: C.tide50, color: C.tide500, fontWeight: 600 }}>
        <Flame className="w-3 h-3" />
        Маяк —
      </span>
    );
  }
  const tone =
    data.score >= 80 ? { bg: C.kelp, fg: "#fff", label: "Отличный" } :
    data.score >= 60 ? { bg: C.tide700, fg: "#fff", label: "Хороший" } :
    data.score >= 40 ? { bg: C.tide100, fg: C.depth, label: "Средний" } :
                       { bg: C.coral, fg: "#fff", label: "Медленный" };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] transition-all hover:brightness-105"
        style={{ background: tone.bg, color: tone.fg, fontWeight: 700, letterSpacing: "-0.005em" }}
        title="Маяк · репутация работодателя"
      >
        <Flame className="w-3 h-3" strokeWidth={2.4} />
        {compact ? `${data.score}` : `Маяк ${data.score}`}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: "rgba(10,31,61,0.35)", backdropFilter: "blur(6px)" }}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE.splash }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 w-full max-w-md border"
              style={{ borderColor: C.tide100 }}
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="text-[10px] font-mono mb-1" style={{ color: C.tide500, letterSpacing: "0.18em", fontWeight: 600 }}>МАЯК · РЕПУТАЦИЯ</div>
                  <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: C.abyss }}>
                    {data.companyName ?? "Работодатель"}
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center" style={{ color: C.tide500 }}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-end gap-3 mb-6">
                <div style={{ fontSize: 64, fontWeight: 900, color: tone.bg, letterSpacing: "-0.04em", lineHeight: 1 }}>{data.score}</div>
                <div className="pb-3">
                  <div className="h-6 px-2.5 rounded-md inline-flex items-center text-[11px]" style={{ background: tone.bg, color: tone.fg, fontWeight: 700 }}>{tone.label}</div>
                  <div className="text-[11px] mt-1" style={{ color: C.depth, fontWeight: 500 }}>{data.applications} откликов · {data.jobs} вакансий</div>
                </div>
              </div>

              <div className="space-y-3">
                <Bar label="Отвечает" value={data.breakdown.responseRate} />
                <Bar label="Скорость ответа" value={data.breakdown.responseSpeed} />
                <Bar label="Доводит до контакта" value={data.breakdown.followThrough} />
                <Bar label="Качество объявлений" value={data.breakdown.quality} />
              </div>

              {data.score < 40 && (
                <div className="mt-5 rounded-xl p-3 text-[12px] flex items-start gap-2" style={{ background: `${C.coral}15`, color: C.coral, fontWeight: 600 }}>
                  Этот работодатель отвечает медленно. Заложи время ожидания.
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[12px] mb-1.5" style={{ color: C.depth, fontWeight: 600 }}>
        <span>{label}</span><span style={{ color: C.abyss, fontWeight: 800 }}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.tide50 }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, ease: EASE.splash }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${C.tide500}, ${C.tide700})` }}
        />
      </div>
    </div>
  );
}
