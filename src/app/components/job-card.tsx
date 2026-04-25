import { motion } from "motion/react";
import { MapPin, Bookmark, BookmarkCheck, ArrowUpRight, Sparkles, Zap } from "lucide-react";
import type { Job } from "../lib/store";
import { C, EASE, categoryIcon } from "../lib/design";
import { MatchPill } from "./match-pill";

function timeAgo(ts: number) {
  const m = Math.max(1, Math.floor((Date.now() - ts) / 60000));
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч`;
  return `${Math.floor(h / 24)} д`;
}

export function JobCard({
  job, onOpen, saved, onToggleSave, index = 0,
}: {
  job: Job & { matchReason?: string }; onOpen: (j: Job) => void; saved: boolean; onToggleSave: () => void; index?: number;
}) {
  const Icon = categoryIcon(job.category);
  const reason = job.matchReason;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.42, delay: index * 0.05, ease: EASE.tide }}
      onClick={() => onOpen(job)}
      className="group relative cursor-pointer rounded-2xl bg-white border hover:border-[#8FB8D9] transition-colors px-4 py-3.5 flex items-start gap-4"
      style={{ borderColor: job.urgent ? C.coral : C.tide100, fontFamily: "var(--font-sans)" }}
    >
      {job.urgent && (
        <span className="absolute -top-2 left-4 inline-flex items-center gap-1 h-5 px-2 rounded-full text-white text-[10px] font-mono" style={{ background: C.coral, letterSpacing: "0.08em", fontWeight: 700 }}>
          <Zap className="w-2.5 h-2.5" /> ГОРИТ
        </span>
      )}
      <div className="relative shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: C.tide50, color: C.tide700 }}>
        <Icon className="w-5 h-5" strokeWidth={1.8} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-display text-[16px] truncate" style={{ color: C.abyss, fontWeight: 500, letterSpacing: "-0.01em" }}>
            {job.title}
          </span>
          <span style={{ color: C.tide300 }}>·</span>
          <span className="text-[12.5px] truncate" style={{ color: C.tide700, fontWeight: 500 }}>
            {job.company}
          </span>
          {job.isAIParsed && (
            <span className="inline-flex items-center gap-1 px-1.5 h-5 rounded-md text-[10px]" style={{ background: C.tide50, color: C.tide700, fontWeight: 600 }}>
              <Sparkles className="w-2.5 h-2.5" /> AI
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2 text-[11.5px] font-mono" style={{ color: C.depth, letterSpacing: "0.04em" }}>
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {job.microdistrict} МКР
          </span>
          <span style={{ color: C.tide300 }}>·</span>
          <span style={{ color: C.abyss, fontWeight: 600 }}>{job.salary}</span>
          <span style={{ color: C.tide300 }}>·</span>
          <span>{timeAgo(job.createdAt)} назад</span>
        </div>
        {reason && (
          <div className="mt-1.5 text-[11.5px] inline-flex items-start gap-1" style={{ color: C.tide700, fontWeight: 500, lineHeight: 1.4 }}>
            <Sparkles className="w-3 h-3 shrink-0 mt-0.5" /> <span>{reason}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={{
            background: saved ? C.tide700 : C.tide50,
            color: saved ? "#fff" : C.tide700,
          }}
          aria-label={saved ? "Saved" : "Save"}
        >
          {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
        <MatchPill score={job.match} />
        <ArrowUpRight className="w-4 h-4 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: C.tide300 }} />
      </div>
    </motion.div>
  );
}
