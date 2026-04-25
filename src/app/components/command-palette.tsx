import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Sparkles, CornerDownLeft, ArrowUp, ArrowDown, Coffee, Bike, ShoppingBag, ChefHat, Store, Briefcase } from "lucide-react";

const CAT_ICON: Record<string, typeof Coffee> = { waiter: Coffee, courier: Bike, cashier: ShoppingBag, cook: ChefHat, retail: Store };
import type { Job } from "../lib/store";
import { parseQuery, type ParsedQuery } from "../lib/parse";
import { CATEGORY_COLOR } from "../lib/colors";

type Props = {
  open: boolean;
  onClose: () => void;
  jobs: Job[];
  onPick: (j: Job) => void;
};

export function CommandPalette({ open, onClose, jobs, onPick }: Props) {
  const [q, setQ] = useState("");
  const [parsed, setParsed] = useState<ParsedQuery>({});
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 10); setQ(""); setIdx(0); }
  }, [open]);

  useEffect(() => { setParsed(parseQuery(q)); setIdx(0); }, [q]);

  const results = jobs
    .filter((j) => {
      if (parsed.role && j.category !== parsed.role) return false;
      if (parsed.district && j.microdistrict !== parsed.district) return false;
      if (q && !parsed.role && !parsed.district) {
        const t = q.toLowerCase();
        return j.title.toLowerCase().includes(t) || j.company.toLowerCase().includes(t) || String(j.microdistrict).includes(t);
      }
      return true;
    })
    .sort((a, b) => b.match - a.match)
    .slice(0, 8);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && results[idx]) { onPick(results[idx]); onClose(); }
    else if (e.key === "Escape") onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="relative w-full max-w-2xl rounded-2xl border border-white/60 bg-white/95 backdrop-blur-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.35)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <div
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{ background: "linear-gradient(90deg,#4285F4,#EA4335,#FBBC04,#34A853)" }}
            />
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E5E7EB]">
              {q ? (
                <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
                  <Sparkles className="w-4 h-4" style={{ color: "#4285F4" }} />
                </motion.div>
              ) : (
                <Search className="w-4 h-4 text-slate-400" />
              )}
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKey}
                placeholder="Search jobs — try 'barista 14' or 'courier'…"
                className="flex-1 bg-transparent outline-none text-[15px] text-slate-900 placeholder:text-slate-400"
                style={{ fontWeight: 500 }}
              />
              {(parsed.role || parsed.district) && (
                <div className="flex items-center gap-1">
                  {parsed.role && (
                    <span className="px-2 py-0.5 rounded-md text-white text-[11px]" style={{ background: "linear-gradient(90deg,#4285F4,#34A853)", fontWeight: 700 }}>
                      {parsed.role}
                    </span>
                  )}
                  {parsed.district && (
                    <span className="px-2 py-0.5 rounded-md bg-[#F3F4F6] border border-[#E5E7EB] text-slate-700 text-[11px]" style={{ fontWeight: 700 }}>
                      {parsed.district} МКР
                    </span>
                  )}
                </div>
              )}
              <kbd className="px-1.5 py-0.5 rounded-md bg-[#F3F4F6] border border-[#E5E7EB] text-[11px] text-slate-500" style={{ fontWeight: 600 }}>esc</kbd>
            </div>

            <div className="max-h-[52vh] overflow-y-auto py-1.5">
              {results.length === 0 ? (
                <div className="px-4 py-10 text-center text-[13px] text-slate-400" style={{ fontWeight: 500 }}>No results</div>
              ) : (
                results.map((j, i) => {
                  const accent = CATEGORY_COLOR[j.category] ?? "#4285F4";
                  return (
                    <button
                      key={j.id}
                      onMouseEnter={() => setIdx(i)}
                      onClick={() => { onPick(j); onClose(); }}
                      className={"w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-xl mx-1.5 transition-colors " + (i === idx ? "bg-[#F3F4F6]" : "")}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                        style={{ background: accent }}
                      >
                        {(() => { const Icon = CAT_ICON[j.category] ?? Briefcase; return <Icon className="w-4 h-4" />; })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] text-slate-900 truncate" style={{ fontWeight: 600 }}>
                          {j.title} <span className="text-slate-400" style={{ fontWeight: 500 }}>· {j.company}</span>
                        </div>
                        <div className="text-[11px] text-slate-500" style={{ fontWeight: 500 }}>{j.microdistrict} МКР · {j.salary}</div>
                      </div>
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-md text-white"
                        style={{ background: "linear-gradient(90deg,#4285F4,#34A853)", fontWeight: 700 }}
                      >
                        {j.match}%
                      </span>
                      {i === idx && <CornerDownLeft className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-[#E5E7EB] bg-[#F9FAFB]">
              <div className="flex items-center gap-3 text-[11px] text-slate-500" style={{ fontWeight: 500 }}>
                <span className="flex items-center gap-1"><ArrowUp className="w-3 h-3" /><ArrowDown className="w-3 h-3" /> navigate</span>
                <span className="flex items-center gap-1"><CornerDownLeft className="w-3 h-3" /> open</span>
              </div>
              <span className="text-[11px] text-slate-400" style={{ fontWeight: 600 }}>{results.length} result{results.length === 1 ? "" : "s"}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
