import { useMemo } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Navigation, ArrowUpRight, MapPin } from "lucide-react";
import { useMatchedJobs } from "../lib/store";
import { useAuth } from "../lib/auth";
import { C, EASE } from "../lib/design";

export function Nearby() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { matched } = useMatchedJobs();
  const my = user?.microdistrict ?? 11;

  const ranked = useMemo(() => {
    return [...matched]
      .map((j) => ({ ...j, _d: Math.abs((j.microdistrict ?? 0) - my) }))
      .sort((a, b) => a._d - b._d || b.match - a.match)
      .slice(0, 12);
  }, [matched, my]);

  return (
    <div>
      <header className="pb-6 border-b" style={{ borderColor: C.abyss }}>
        <div className="flex items-baseline justify-between pb-2">
          <span className="font-mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.abyss, fontWeight: 800 }}>
            ФУНКЦИЯ 01 · ГИПЕРЛОКАЛ
          </span>
          <span className="font-mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: C.tide500, fontWeight: 700 }}>
            ТВОЙ · {my} МКР
          </span>
        </div>
        <h1 className="mt-6" style={{ fontSize: "clamp(44px,7vw,96px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.9, color: C.abyss }}>
          Работа в<br />
          <span style={{ fontStyle: "italic", color: C.coral }}>10 минутах</span> ходьбы.
        </h1>
      </header>

      <ul className="mt-10">
        {ranked.map((j, i) => (
          <motion.li
            key={j.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.03, ease: EASE.tide }}
            onClick={() => nav(`/app/jobs/${j.id}`)}
            className="group grid grid-cols-[72px_1fr_auto] items-baseline gap-5 py-5 border-b cursor-pointer hover:pl-2 transition-all"
            style={{ borderColor: C.tide100 }}
          >
            <div className="font-mono tabular-nums" style={{ fontSize: 26, fontWeight: 900, color: j._d === 0 ? C.coral : C.abyss, letterSpacing: "-0.03em", lineHeight: 1, fontStyle: j._d === 0 ? "italic" : "normal" }}>
              {j._d === 0 ? "0" : `±${j._d}`}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-3 h-3" style={{ color: C.tide500 }} />
                <span className="font-mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: C.tide500, fontWeight: 700 }}>
                  {j.microdistrict} МКР · {j.company}
                </span>
              </div>
              <div className="truncate" style={{ fontSize: 20, fontWeight: 800, color: C.abyss, letterSpacing: "-0.02em" }}>
                {j.title}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span style={{ fontSize: 13, fontWeight: 800, color: C.abyss }}>{j.salary}</span>
              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: C.abyss }} />
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
