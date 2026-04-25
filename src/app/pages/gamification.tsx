import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { C, EASE } from "../lib/design";
import {
  loadStats, recordEvent, getRank, getNextRank, getRankProgress,
  getLeague, getTotalSalaryBoost, getLeaderboard, getDailyQuests,
  RANKS, LEAGUES, ACHIEVEMENTS,
  type UserStats, type LeaderboardEntry,
} from "../lib/gamification";
import { useAuth } from "../lib/auth";
import { Link } from "react-router";

/* ═══════════════════════════════════════════════════════════════════
   CaspianMatch Gamification — "Depths of the Caspian"
   Visual concept: ocean depth meter. The deeper you go, the higher
   your rank. Each rank is a depth zone with its own color palette
   and sea creature. Leagues are tidal currents.
   ═══════════════════════════════════════════════════════════════════ */

export function Gamification() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>(loadStats);
  const [view, setView] = useState<"depth" | "tide" | "trophy">("depth");

  useEffect(() => {
    const result = recordEvent("DAILY_LOGIN");
    setStats(result.stats);
  }, []);

  const rank = useMemo(() => getRank(stats.xp), [stats.xp]);
  const next = useMemo(() => getNextRank(rank), [rank]);
  const progress = useMemo(() => getRankProgress(stats.xp), [stats.xp]);
  const league = useMemo(() => getLeague(rank), [rank]);
  const boost = useMemo(() => getTotalSalaryBoost(rank, league), [rank, league]);
  const board = useMemo(() => getLeaderboard(user?.name || "Вы", stats.xp), [user?.name, stats.xp]);
  const quests = useMemo(() => getDailyQuests(stats), [stats]);
  const pos = useMemo(() => board.findIndex((e) => e.isYou) + 1, [board]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* ── Depth Gauge Hero ─── */}
      <div className="relative mb-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative overflow-hidden rounded-[32px]"
          style={{
            background: `linear-gradient(180deg, #0B1D3A 0%, ${rank.color}30 40%, ${rank.color}10 100%)`,
            minHeight: 340,
          }}
        >
          {/* Animated water surface */}
          <svg className="absolute top-0 left-0 w-full" viewBox="0 0 800 60" preserveAspectRatio="none" style={{ height: 40 }}>
            <motion.path
              d="M0,30 C200,10 400,50 600,25 C700,15 750,35 800,30 L800,0 L0,0 Z"
              fill="rgba(255,255,255,0.04)"
              animate={{ d: [
                "M0,30 C200,10 400,50 600,25 C700,15 750,35 800,30 L800,0 L0,0 Z",
                "M0,25 C200,45 400,15 600,35 C700,45 750,20 800,25 L800,0 L0,0 Z",
                "M0,30 C200,10 400,50 600,25 C700,15 750,35 800,30 L800,0 L0,0 Z",
              ] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>

          {/* Depth lines */}
          <div className="absolute left-8 top-16 bottom-8 w-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          {RANKS.map((r, i) => {
            const y = 16 + (i / (RANKS.length - 1)) * 76;
            const active = stats.xp >= r.minXP;
            return (
              <motion.div
                key={r.id}
                className="absolute left-4 flex items-center gap-3"
                style={{ top: `${y}%` }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: active ? 1 : 0.25, x: 0 }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
              >
                <div
                  className="w-8 text-right text-[9px] font-mono tracking-wider"
                  style={{ color: active ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.15)", fontWeight: 700 }}
                >
                  {r.minXP}m
                </div>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: active ? r.color : "rgba(255,255,255,0.1)",
                    boxShadow: active ? `0 0 12px ${r.color}60` : "none",
                  }}
                />
                {r.id === rank.id && (
                  <motion.div
                    className="h-px flex-1"
                    style={{ background: `linear-gradient(90deg, ${r.color}, transparent)`, width: 80 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                )}
              </motion.div>
            );
          })}

          {/* Center content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center text-white px-8 py-16">
            {/* Rank emblem — glass morphism circle */}
            <motion.div
              className="relative mb-6"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center relative"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${rank.color}40, ${rank.color}15)`,
                  border: `2px solid ${rank.color}60`,
                  backdropFilter: "blur(20px)",
                  boxShadow: `0 0 60px ${rank.color}20, inset 0 0 30px ${rank.color}10`,
                }}
              >
                <span className="text-5xl">{rank.icon}</span>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: `1px solid ${rank.color}30` }}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </div>
              <div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-mono"
                style={{
                  background: rank.color,
                  color: "white",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  boxShadow: `0 4px 20px ${rank.color}50`,
                }}
              >
                {rank.id}
              </div>
            </motion.div>

            <div className="text-[10px] font-mono tracking-[0.25em] mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
              ГЛУБИНА
            </div>
            <h1 className="text-[clamp(28px,4vw,42px)] leading-none mb-2" style={{ fontWeight: 800, letterSpacing: "-0.04em" }}>
              {rank.labelRu}
            </h1>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
              {rank.label} · {stats.xp.toLocaleString()} XP · #{pos}
            </p>

            {/* XP bar — thin elegant */}
            {next && (
              <div className="w-full max-w-xs">
                <div className="flex justify-between text-[9px] font-mono mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                  <span>{rank.id}</span>
                  <span>{next.id} · {next.minXP.toLocaleString()}</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${rank.color}, ${next.color})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 1.5, ease: EASE.splash }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Salary boost badge — floating */}
          {boost > 0 && (
            <motion.div
              className="absolute top-6 right-6 px-4 py-2 rounded-2xl text-[13px]"
              style={{
                background: "rgba(255,255,255,0.07)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "white",
                fontWeight: 700,
              }}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              💰 +{boost}% ЗП
            </motion.div>
          )}
        </motion.div>

        {/* League strip below hero */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="-mt-6 mx-6 relative z-20 rounded-2xl px-5 py-3 flex items-center justify-between"
          style={{
            background: "white",
            boxShadow: "0 8px 40px rgba(10,31,61,0.08)",
            border: `1px solid ${C.tide100}`,
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{league.icon}</span>
            <div>
              <div className="text-[13px]" style={{ fontWeight: 700, color: C.abyss }}>{league.labelRu}</div>
              <div className="text-[10px] font-mono" style={{ color: C.tide500, letterSpacing: "0.06em" }}>{league.label}</div>
            </div>
          </div>
          <div className="flex gap-2">
            {league.perks.slice(0, 3).map((p) => (
              <span key={p} className="hidden sm:inline-flex text-[10px] px-2.5 py-1 rounded-full" style={{ background: C.tide50, color: C.tide700, fontWeight: 600 }}>{p}</span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── View Switcher ─── */}
      <div className="flex gap-2 mb-8 px-1">
        {([
          { id: "depth" as const, label: "Ежедневное", emoji: "🔥" },
          { id: "tide" as const, label: "Рейтинг", emoji: "🌊" },
          { id: "trophy" as const, label: "Достижения", emoji: "🏅" },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className="relative px-5 py-2.5 rounded-xl text-[13px] transition-all"
            style={{
              fontWeight: view === t.id ? 700 : 500,
              color: view === t.id ? C.abyss : C.tide500,
              background: view === t.id ? "white" : "transparent",
              boxShadow: view === t.id ? "0 2px 12px rgba(10,31,61,0.06)" : "none",
            }}
          >
            <span className="mr-1.5">{t.emoji}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ── Content ─── */}
      <AnimatePresence mode="wait">
        {view === "depth" && (
          <motion.div key="depth" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Quests */}
            <div className="rounded-2xl border p-5" style={{ borderColor: C.tide100, background: "white" }}>
              <div className="text-[10px] font-mono tracking-[0.2em] mb-4" style={{ color: C.tide500, fontWeight: 600 }}>ЗАДАНИЯ СЕГОДНЯ</div>
              {quests.map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4 py-3 border-b last:border-0"
                  style={{ borderColor: C.tide50 }}
                >
                  <span className="text-xl w-8 text-center">{q.icon}</span>
                  <div className="flex-1">
                    <div className="text-[13px] flex items-center gap-2" style={{ fontWeight: 600, color: q.done ? C.tide500 : C.abyss, textDecoration: q.done ? "line-through" : "none" }}>
                      {q.title}
                      {q.done && <span className="text-[9px] px-1.5 py-0.5 rounded-full text-white" style={{ background: "#0D5D5A", fontWeight: 800 }}>✓</span>}
                    </div>
                    <div className="h-[3px] mt-2 rounded-full overflow-hidden w-32" style={{ background: C.tide50 }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${(q.progress / q.target) * 100}%`, background: q.done ? "#0D5D5A" : C.tide500 }} />
                    </div>
                  </div>
                  <span className="text-[11px] font-mono" style={{ color: C.tide500, fontWeight: 700 }}>+{q.xp}</span>
                </motion.div>
              ))}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { v: stats.applicationsSubmitted, l: "Откликов", e: "📨" },
                { v: stats.interviewsCompleted, l: "Интервью", e: "🎤" },
                { v: stats.loginStreak, l: "Стрик", e: "🔥" },
                { v: stats.unlockedAchievements.length, l: "Наград", e: "🏅" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl border p-4" style={{ borderColor: C.tide100, background: "white" }}>
                  <div className="text-lg mb-1">{s.e}</div>
                  <div className="text-xl" style={{ fontWeight: 800, color: C.abyss }}>{s.v}</div>
                  <div className="text-[10px]" style={{ color: C.tide500, fontWeight: 600 }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Depth rank map — horizontal scroll */}
            <div className="rounded-2xl border p-5" style={{ borderColor: C.tide100, background: "white" }}>
              <div className="text-[10px] font-mono tracking-[0.2em] mb-4" style={{ color: C.tide500, fontWeight: 600 }}>КАРТА ГЛУБИН</div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {RANKS.map((r, i) => {
                  const active = stats.xp >= r.minXP;
                  const current = r.id === rank.id;
                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 }}
                      className="shrink-0 w-28 rounded-xl p-3 text-center relative overflow-hidden"
                      style={{
                        background: current ? `${r.color}12` : active ? "white" : C.tide50,
                        border: current ? `2px solid ${r.color}40` : `1px solid ${active ? C.tide100 : "transparent"}`,
                        opacity: active ? 1 : 0.35,
                      }}
                    >
                      {current && (
                        <motion.div
                          className="absolute top-0 left-0 right-0 h-0.5"
                          style={{ background: r.gradient }}
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                      <div className="text-2xl mb-1">{r.icon}</div>
                      <div className="text-[11px]" style={{ fontWeight: 700, color: active ? C.abyss : "#999" }}>{r.labelRu}</div>
                      <div className="text-[9px] font-mono mt-0.5" style={{ color: C.tide500 }}>{r.minXP.toLocaleString()} XP</div>
                      <div className="text-[9px] mt-1" style={{ color: r.color, fontWeight: 700 }}>+{r.salaryBoost}%</div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {view === "tide" && (
          <motion.div key="tide" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Podium */}
            <div className="flex items-end justify-center gap-3 mb-8 h-48">
              {[1, 0, 2].map((idx) => {
                const e = board[idx];
                if (!e) return null;
                const h = [160, 130, 110][idx === 0 ? 1 : idx === 1 ? 0 : 2];
                const medal = ["🥇", "🥈", "🥉"];
                return (
                  <motion.div
                    key={idx}
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.15 + 0.2 }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm mb-2"
                      style={{
                        background: e.rank.gradient,
                        fontWeight: 800,
                        border: e.isYou ? `3px solid ${C.tide700}` : "2px solid rgba(255,255,255,0.3)",
                        boxShadow: e.isYou ? `0 0 20px ${C.tide700}30` : "none",
                      }}
                    >
                      {e.avatar}
                    </div>
                    <div className="text-[11px] mb-1" style={{ fontWeight: e.isYou ? 800 : 600, color: e.isYou ? C.tide700 : C.abyss }}>
                      {e.isYou ? "Вы" : e.name.split(" ")[0]}
                    </div>
                    <motion.div
                      className="w-20 rounded-t-xl flex items-start justify-center pt-3"
                      style={{ background: `${e.rank.color}10`, borderTop: `3px solid ${e.rank.color}40` }}
                      initial={{ height: 0 }}
                      animate={{ height: h }}
                      transition={{ delay: 0.5, duration: 0.8, ease: EASE.splash }}
                    >
                      <span className="text-2xl">{medal[[1, 0, 2][idx === 0 ? 1 : idx === 1 ? 0 : 2]]}</span>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* Full list */}
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.tide100, background: "white" }}>
              {board.map((e, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 px-5 py-3 border-b last:border-0 hover:bg-[#FBFDFF] transition-colors"
                  style={{
                    borderColor: C.tide50,
                    background: e.isYou ? `${C.tide700}06` : "transparent",
                  }}
                >
                  <div className="w-6 text-center text-[12px] font-mono" style={{ fontWeight: 800, color: i < 3 ? ["#D4A020", "#8E8E93", "#A0522D"][i] : C.tide500 }}>
                    {i + 1}
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px]" style={{ background: e.rank.gradient, fontWeight: 700 }}>
                    {e.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px]" style={{ fontWeight: e.isYou ? 800 : 600, color: C.abyss }}>
                      {e.name}
                    </span>
                    {e.isYou && <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded text-white" style={{ background: C.tide700, fontWeight: 700 }}>ВЫ</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{e.rank.icon}</span>
                    <span className="text-[12px] font-mono" style={{ fontWeight: 700, color: e.rank.color }}>
                      {e.xp.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {view === "trophy" && (
          <motion.div key="trophy" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="grid sm:grid-cols-2 gap-3">
              {ACHIEVEMENTS.map((a, i) => {
                const done = stats.unlockedAchievements.includes(a.id);
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 p-4 rounded-xl border"
                    style={{
                      borderColor: done ? "#0D5D5A20" : C.tide100,
                      background: done ? "#0D5D5A06" : "white",
                      opacity: done ? 1 : 0.4,
                    }}
                  >
                    <div className="text-2xl w-10 text-center" style={{ filter: done ? "none" : "grayscale(1)" }}>{a.icon}</div>
                    <div className="flex-1">
                      <div className="text-[13px]" style={{ fontWeight: 700, color: done ? C.abyss : "#aaa" }}>
                        {a.titleRu}
                        {done && <span className="ml-1.5 text-[8px] px-1 py-0.5 rounded bg-[#0D5D5A] text-white" style={{ fontWeight: 800 }}>✓</span>}
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: done ? C.depth : "#ccc", fontWeight: 500 }}>{a.description}</div>
                    </div>
                    <span className="text-[10px] font-mono" style={{ color: done ? "#0D5D5A" : "#ddd", fontWeight: 700 }}>+{a.xpReward}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
