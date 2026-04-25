import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Plus, MapPin, Sparkles } from "lucide-react";
import { useJobs } from "../lib/store";
import { CATEGORY, categoryIcon } from "../lib/design";

export function EmployerVacancies() {
  const { jobs } = useJobs();
  const nav = useNavigate();

  return (
    <div>
      <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
        <div>
          <div className="text-[12px] uppercase tracking-[0.12em] text-slate-500" style={{ fontWeight: 700 }}>Vacancies</div>
          <h1 className="mt-2" style={{ fontSize: "clamp(36px,5vw,52px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.02 }}>
            All <span style={{ color: "#1B5A8F" }}>listings</span> · {jobs.length}
          </h1>
          <p className="mt-3 text-[15px] text-slate-600" style={{ fontWeight: 500 }}>
            Everything you've posted. Tap a card to view, edit, or close.
          </p>
        </div>
        <Link
          to="/app/employer/post"
          className="h-11 px-5 rounded-full bg-[#1B5A8F] text-white text-[13px] inline-flex items-center gap-1.5 hover:bg-[#163bc9] transition-colors"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-3.5 h-3.5" /> New vacancy
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 px-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1B5A8F]/10 text-[#1B5A8F] flex items-center justify-center">
            <Plus className="w-6 h-6" />
          </div>
          <div className="mt-4 text-[16px] text-slate-900" style={{ fontWeight: 600 }}>No vacancies yet.</div>
          <div className="mt-1 text-[13px] text-slate-500" style={{ fontWeight: 500 }}>Paste a WhatsApp ad and let the parser do the rest.</div>
          <Link to="/app/employer/post" className="mt-6 inline-flex h-11 px-5 rounded-full bg-slate-900 text-white items-center gap-1.5 hover:bg-[#1B5A8F] transition-colors" style={{ fontWeight: 600, fontSize: 13 }}>
            Post your first vacancy <Plus className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {jobs.map((j, i) => {
            const color = CATEGORY[j.category] ?? "#1B5A8F";
            const Icon = categoryIcon(j.category);
            return (
              <motion.button
                key={j.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                whileHover={{ y: -2 }}
                onClick={() => nav(`/app/jobs/${j.id}`)}
                className="text-left rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: color }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {j.isAIParsed && (
                    <span className="inline-flex items-center gap-1 px-2.5 h-6 rounded-full bg-[#1B5A8F]/10 text-[#1B5A8F] text-[10px]" style={{ fontWeight: 600 }}>
                      <Sparkles className="w-2.5 h-2.5" /> AI
                    </span>
                  )}
                </div>
                <div className="text-[15px] text-slate-900" style={{ fontWeight: 700, letterSpacing: "-0.01em" }}>{j.title}</div>
                <div className="text-[12px] text-slate-500" style={{ fontWeight: 500 }}>{j.company}</div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500" style={{ fontWeight: 600 }}>
                  <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{j.microdistrict} МКР</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-900" style={{ fontWeight: 700 }}>{j.salary}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
