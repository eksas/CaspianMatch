import { useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Sparkles, ArrowUpRight, Zap, Bookmark, BookmarkCheck, Shield, Trophy, Waves } from "lucide-react";
import { useMatchedJobs, useSaved } from "../lib/store";
import { C, EASE, categoryIcon } from "../lib/design";
import { useAuth } from "../lib/auth";
import { getRank, getLeague, loadStats } from "../lib/gamification";
import { calculateTrustScore, getTrustTier, loadReviews, loadReferrals } from "../lib/trust";

const DISTRICTS = [3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 17, 19, 22, 23, 26, 27, 28, 32];
const CATEGORIES = [
  { id: "all",     label: "Всё" },
  { id: "waiter",  label: "Кафе" },
  { id: "courier", label: "Доставка" },
  { id: "cashier", label: "Касса" },
  { id: "cook",    label: "Кухня" },
  { id: "retail",  label: "Торговля" },
];

export function Browse() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { matched, loading, refresh } = useMatchedJobs();
  const { has, toggle } = useSaved();
  const [params] = useSearchParams();
  const fresh = params.get("fresh") === "1";
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [dist, setDist] = useState<number | null>(null);
  const [sort, setSort] = useState<"match" | "newest">("match");

  // Dashboard Hub State
  const stats = useMemo(() => loadStats(), []);
  const rank = useMemo(() => getRank(stats.xp), [stats.xp]);
  const league = useMemo(() => getLeague(rank), [rank]);
  const reviews = useMemo(() => loadReviews(user?.id), [user?.id]);
  const referrals = useMemo(() => loadReferrals(user?.id), [user?.id]);
  const trust = useMemo(() => calculateTrustScore(reviews, referrals), [reviews, referrals]);
  const tier = useMemo(() => getTrustTier(trust.score), [trust.score]);

  const list = useMemo(() => {
    let l = [...matched];
    if (cat !== "all") l = l.filter((j) => j.category === cat);
    if (dist) l = l.filter((j) => j.microdistrict === dist);
    if (q.trim()) {
      const t = q.toLowerCase();
      l = l.filter((j) => j.title.toLowerCase().includes(t) || j.company.toLowerCase().includes(t));
    }
    l.sort((a, b) => (sort === "match" ? b.match - a.match : b.createdAt - a.createdAt));
    return l;
  }, [matched, cat, dist, q, sort]);

  const hasFilter = cat !== "all" || dist !== null || q.trim() !== "";
  const firstName = user?.name?.split(" ")[0] ?? "";

  const countsByDist = useMemo(() => {
    const m: Record<number, number> = {};
    matched.forEach((j) => { m[j.microdistrict] = (m[j.microdistrict] ?? 0) + 1; });
    return m;
  }, [matched]);
  const maxCount = Math.max(1, ...Object.values(countsByDist));

  const topMatch = matched[0];

  return (
    <div>
      <AnimatePresence>
        {fresh && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-10 flex items-start gap-4 pb-6 border-b"
            style={{ borderColor: C.abyss }}
          >
            <Sparkles className="w-4 h-4 mt-1 shrink-0" style={{ color: C.coral }} />
            <div>
              <div className="text-[11px] font-mono" style={{ color: C.tide500, letterSpacing: "0.18em", fontWeight: 800 }}>
                ПЕРВЫЙ МАТЧ
              </div>
              <div className="mt-1" style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.025em", color: C.abyss, lineHeight: 1.15 }}>
                {firstName}, AI уже подобрал тебе вакансии.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header>
        <div className="flex items-baseline justify-between pb-2 border-b" style={{ borderColor: C.abyss }}>
          <span className="text-[11px] font-mono" style={{ color: C.abyss, letterSpacing: "0.18em", fontWeight: 800 }}>
            CASPIAN / ВЫПУСК № {new Date().toISOString().slice(5, 10).replace("-", "·")}
          </span>
          <span className="text-[11px] font-mono" style={{ color: C.tide500, letterSpacing: "0.14em", fontWeight: 600 }}>
            {matched.length.toString().padStart(3, "0")} ВАКАНСИЙ · {user?.microdistrict ?? "—"} МКР
          </span>
        </div>

        <div className="relative mt-8 grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8">
            <h1 style={{ fontSize: "clamp(52px,9vw,132px)", fontWeight: 900, letterSpacing: "-0.055em", lineHeight: 0.88, color: C.abyss }}>
              Город ищет<br />
              <span style={{ fontStyle: "italic", color: C.coral, fontWeight: 900 }}>тебя.</span>
            </h1>
            
            {/* Quick Stats Hub */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/app/rank" className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border transition-all hover:bg-white" style={{ borderColor: C.tide100, background: "rgba(255,255,255,0.5)"}}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: `${rank.color}15` }}>{rank.icon}</div>
                <div>
                  <div className="text-[10px] font-mono tracking-widest" style={{ color: C.tide500, fontWeight: 700 }}>ЛИГА · {league.labelRu}</div>
                  <div className="text-[12px]" style={{ color: C.abyss, fontWeight: 800 }}>{stats.xp} XP</div>
                </div>
              </Link>
              <Link to="/app/profile" className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border transition-all hover:bg-white" style={{ borderColor: C.tide100, background: "rgba(255,255,255,0.5)"}}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: `${tier.color}15` }}>{tier.emoji}</div>
                <div>
                  <div className="text-[10px] font-mono tracking-widest" style={{ color: C.tide500, fontWeight: 700 }}>ВОЛНА ДОВЕРИЯ</div>
                  <div className="text-[12px]" style={{ color: C.abyss, fontWeight: 800 }}>{trust.score} / 100 баллов</div>
                </div>
              </Link>
            </div>
          </div>

          {topMatch && !hasFilter && (
            <button onClick={() => nav(`/app/jobs/${topMatch.id}`)} className="md:col-span-4 text-left group">
              <div className="text-[11px] font-mono pb-2 border-b mb-3" style={{ color: C.coral, letterSpacing: "0.18em", fontWeight: 800, borderColor: C.abyss }}>
                ● ЖЕМЧУГ / ТОП MATCH
              </div>
              <div className="relative overflow-hidden p-5" style={{ background: C.abyss, color: "white" }}>
                <div className="flex items-baseline justify-between mb-6">
                  <span className="font-mono text-[10px]" style={{ letterSpacing: "0.18em", opacity: 0.65, fontWeight: 700 }}>
                    {topMatch.microdistrict.toString().padStart(2, "0")} МКР
                  </span>
                  <span className="font-mono tabular-nums" style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-0.04em", color: C.coral, lineHeight: 1 }}>
                    {topMatch.match}
                  </span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
                  {topMatch.title}
                </div>
                <div className="text-[12px] mt-1 opacity-75" style={{ fontWeight: 500 }}>
                  {topMatch.company} · {topMatch.salary}
                </div>
                <div className="mt-4 pt-4 border-t text-[11.5px]" style={{ borderColor: "rgba(255,255,255,0.15)", opacity: 0.85, fontStyle: "italic", lineHeight: 1.45, fontWeight: 500 }}>
                  — {(topMatch as any).matchReason ?? "Твои навыки и район совпали идеально."}
                </div>
                <ArrowUpRight className="absolute top-5 right-5 w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          )}
        </div>
      </header>

      <div className="mt-16 grid md:grid-cols-[260px_1fr] gap-12">
        <aside className="space-y-12 md:sticky md:top-24 self-start">
          <div>
            <div className="flex items-baseline justify-between pb-2 border-b mb-2" style={{ borderColor: C.abyss }}>
              <span className="text-[11px] font-mono" style={{ color: C.abyss, letterSpacing: "0.18em", fontWeight: 800 }}>
                РАЙОН · КАРТА
              </span>
              {dist !== null && (
                <button onClick={() => setDist(null)} className="text-[11px] font-mono hover:underline" style={{ color: C.coral, letterSpacing: "0.14em", fontWeight: 700 }}>
                  СБРОСИТЬ
                </button>
              )}
            </div>
            <ul className="max-h-[320px] overflow-y-auto pr-1">
              <DistrictRow label="Любой" count={matched.length} max={maxCount} active={dist === null} onClick={() => setDist(null)} />
              {DISTRICTS.map((d) => (
                <DistrictRow
                  key={d}
                  label={`${d} МКР${d === user?.microdistrict ? " · ты" : ""}`}
                  count={countsByDist[d] ?? 0}
                  max={maxCount}
                  active={dist === d}
                  mine={d === user?.microdistrict}
                  onClick={() => setDist(d)}
                />
              ))}
            </ul>
          </div>

          <div>
            <div className="pb-2 border-b mb-2" style={{ borderColor: C.abyss }}>
              <span className="text-[11px] font-mono" style={{ color: C.abyss, letterSpacing: "0.18em", fontWeight: 800 }}>
                КАТЕГОРИЯ
              </span>
            </div>
            <ul>
              {CATEGORIES.map((c) => {
                const active = cat === c.id;
                return (
                  <li key={c.id}>
                    <button onClick={() => setCat(c.id)} className="w-full flex items-baseline justify-between py-2 text-left">
                      <span className="text-[14px]"
                        style={{
                          color: active ? C.coral : C.abyss,
                          fontWeight: active ? 800 : 600,
                          fontStyle: active ? "italic" : "normal",
                          letterSpacing: "-0.01em",
                        }}>
                        {c.label}
                      </span>
                      {active && <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.coral }} />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        <main>
          <div className="flex items-center gap-6 flex-wrap pb-3 border-b" style={{ borderColor: C.tide100 }}>
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.tide500 }} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Название или компания…"
                className="w-full h-10 pl-6 pr-8 bg-transparent text-[14px] outline-none"
                style={{ fontWeight: 500, color: C.abyss }}
              />
              {q && (
                <button onClick={() => setQ("")} className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center" style={{ color: C.tide500 }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <SortBtn active={sort === "match"} onClick={() => setSort("match")}>AI-рейтинг</SortBtn>
            <span style={{ color: C.tide100 }}>·</span>
            <SortBtn active={sort === "newest"} onClick={() => setSort("newest")}>Свежие</SortBtn>
            <button
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-[12px] disabled:opacity-60 hover:opacity-70 transition-opacity"
              style={{ color: C.tide700, fontWeight: 700, letterSpacing: "-0.005em" }}
            >
              <Sparkles className={"w-3.5 h-3.5 " + (loading ? "animate-pulse" : "")} />
              {loading ? "Матчим…" : "Пересчитать"}
            </button>
          </div>

          <div className="mt-8 mb-6 flex items-baseline justify-between pb-2 border-b" style={{ borderColor: C.abyss }}>
            <span className="text-[11px] font-mono" style={{ color: C.abyss, letterSpacing: "0.18em", fontWeight: 800 }}>
              {hasFilter ? "ОТФИЛЬТРОВАНО" : "ВСЕ ВАКАНСИИ"}
            </span>
            <div className="flex items-center gap-6">
              {(() => {
                const salaries = list
                  .map(j => {
                    const m = j.salary.replace(/\s/g, "").match(/(\d{4,})/);
                    return m ? parseInt(m[1]) : null;
                  })
                  .filter((s): s is number => s !== null);
                
                if (salaries.length > 0) {
                  const median = salaries.sort((a,b) => a - b)[Math.floor(salaries.length / 2)];
                  return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono" style={{ background: `${C.abyss}15`, color: C.abyss, fontWeight: 700 }}>
                      <Waves className="w-3.5 h-3.5" /> СРЕДНЯЯ З/П: {new Intl.NumberFormat("ru-RU").format(median)} ₸
                    </span>
                  );
                }
                return null;
              })()}

              <span className="text-[11px] font-mono flex items-center gap-3" style={{ color: C.tide500, letterSpacing: "0.14em", fontWeight: 600 }}>
                <span>{list.length} РЕЗ.</span>
                {hasFilter && (
                <button onClick={() => { setCat("all"); setDist(null); setQ(""); }} className="hover:underline" style={{ color: C.coral, fontWeight: 800 }}>
                  СБРОСИТЬ
                </button>
              )}
            </span>
          </div>

          {list.length === 0 ? (
            <div className="py-24 text-center">
              <div style={{ fontSize: 28, fontStyle: "italic", fontWeight: 800, letterSpacing: "-0.025em", color: C.abyss }}>Тут пусто.</div>
              <div className="mt-2 text-[13px]" style={{ color: C.depth, fontWeight: 500 }}>Попробуй другой район или категорию.</div>
            </div>
          ) : (
            <ul>
              {list.map((j, i) => (
                <EditorialJobRow
                  key={j.id}
                  job={j}
                  index={i}
                  saved={has(j.id)}
                  onToggleSave={() => toggle(j.id)}
                  onOpen={() => nav(`/app/jobs/${j.id}`)}
                />
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}

function DistrictRow({
  label, count, max, active, mine, onClick,
}: { label: string; count: number; max: number; active: boolean; mine?: boolean; onClick: () => void }) {
  const pct = Math.round((count / max) * 100);
  return (
    <li>
      <button onClick={onClick} className="w-full group py-1.5">
        <div className="flex items-baseline justify-between">
          <span className="text-[13.5px] inline-flex items-center gap-1.5"
            style={{
              color: active ? C.coral : C.abyss,
              fontWeight: active || mine ? 800 : 600,
              fontStyle: active ? "italic" : "normal",
              letterSpacing: "-0.01em",
            }}>
            {mine && <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.coral }} />}
            {label}
          </span>
          <span className="text-[11px] font-mono tabular-nums"
            style={{ color: active ? C.coral : C.tide500, fontWeight: 700, letterSpacing: "0.04em" }}>
            {count.toString().padStart(2, "0")}
          </span>
        </div>
        <div className="mt-1 h-[2px] w-full" style={{ background: "rgba(15,48,87,0.08)" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: active ? C.coral : C.tide500, opacity: active ? 1 : 0.35 }} />
        </div>
      </button>
    </li>
  );
}

function SortBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="text-[12px] transition-colors"
      style={{
        color: active ? C.coral : C.tide500,
        fontWeight: active ? 800 : 600,
        fontStyle: active ? "italic" : "normal",
      }}
    >
      {children}
    </button>
  );
}

function EditorialJobRow({
  job, index, saved, onToggleSave, onOpen,
}: { job: any; index: number; saved: boolean; onToggleSave: () => void; onOpen: () => void }) {
  const Icon = categoryIcon(job.category);
  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03, ease: EASE.tide }}
      className="group relative grid grid-cols-[56px_1fr_auto] gap-5 items-baseline py-5 border-b cursor-pointer hover:pl-3 transition-all"
      style={{ borderColor: C.tide100 }}
      onClick={onOpen}
    >
      <div>
        <div className="font-mono tabular-nums" style={{ fontSize: 11, letterSpacing: "0.12em", color: C.tide500, fontWeight: 700 }}>
          {(index + 1).toString().padStart(2, "0")}
        </div>
        <div className="font-mono tabular-nums mt-1"
          style={{
            fontSize: 22,
            letterSpacing: "-0.03em",
            color: job.match >= 80 ? C.coral : C.abyss,
            fontWeight: 900,
            fontStyle: job.match >= 80 ? "italic" : "normal",
            lineHeight: 1,
          }}>
          {job.match}
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Icon className="w-3.5 h-3.5" style={{ color: C.tide700 }} strokeWidth={2.2} />
          {job.urgent && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-1.5 h-4" style={{ background: C.coral, color: "white", fontWeight: 800, letterSpacing: "0.14em" }}>
              <Zap className="w-2.5 h-2.5" /> ГОРИТ
            </span>
          )}
          <span className="text-[11px] font-mono" style={{ color: C.tide500, letterSpacing: "0.14em", fontWeight: 600 }}>
            {job.microdistrict} МКР · {job.company}
          </span>
        </div>
        <div className="truncate" style={{ fontSize: 20, fontWeight: 800, color: C.abyss, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
          {job.title}
        </div>
        <div className="mt-1.5 flex items-start gap-1.5 text-[12.5px] max-w-xl"
          style={{ color: C.depth, fontStyle: "italic", fontWeight: 500, lineHeight: 1.45 }}>
          <Sparkles className="w-3 h-3 mt-0.5 shrink-0" style={{ color: C.coral, fontStyle: "normal" }} />
          {job.matchReason ?? "Район совпадает, и нужный навык у тебя уже есть."}
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right">
          <div className="text-[11px] font-mono" style={{ color: C.tide500, letterSpacing: "0.18em", fontWeight: 700 }}>ЗП</div>
          <div style={{ fontSize: 14.5, fontWeight: 800, color: C.abyss, letterSpacing: "-0.015em", whiteSpace: "nowrap" }}>
            {job.salary}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
          className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 transition-colors"
          style={{ color: saved ? C.coral : C.tide500 }}
          aria-label="Сохранить"
        >
          {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: C.abyss }} />
      </div>
    </motion.li>
  );
}
