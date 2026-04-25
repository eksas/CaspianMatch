import { useState, useMemo } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { MapPin, Calendar, Briefcase, Star, Plus, X, ChevronRight, ExternalLink, Award, Clock, TrendingUp } from "lucide-react";
import { useAuth } from "../lib/auth";
import { C, EASE } from "../lib/design";
import { loadStats, getRank, getLeague, getTotalSalaryBoost, ACHIEVEMENTS } from "../lib/gamification";
import { getTrustTier, calculateTrustScore, loadReviews, loadReferrals } from "../lib/trust";

/* ═══════════════════════════════════════════════════════════════════
   LinkedIn-style Profile — "Career Passport"
   ═══════════════════════════════════════════════════════════════════ */

type Experience = {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
  current: boolean;
};

const LS_EXP_KEY = "caspian.experiences";
const LS_HEADLINE_KEY = "caspian.headline";

function loadExperiences(): Experience[] {
  try { const r = localStorage.getItem(LS_EXP_KEY); return r ? JSON.parse(r) : []; }
  catch { return []; }
}
function saveExperiences(e: Experience[]) {
  try { localStorage.setItem(LS_EXP_KEY, JSON.stringify(e)); } catch {}
}
function loadHeadline(): string {
  try { return localStorage.getItem(LS_HEADLINE_KEY) || ""; } catch { return ""; }
}
function saveHeadline(h: string) {
  try { localStorage.setItem(LS_HEADLINE_KEY, h); } catch {}
}

export function Profile() {
  const { user, update } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [company, setCompany] = useState(user?.company ?? "");
  const [district, setDistrict] = useState(user?.microdistrict?.toString() ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [skills, setSkills] = useState<string[]>(user?.skills ?? []);
  const [skillInput, setSkillInput] = useState("");
  const [headline, setHeadline] = useState(loadHeadline);
  const [experiences, setExperiences] = useState<Experience[]>(loadExperiences);
  const [addingExp, setAddingExp] = useState(false);
  const [saved, setSaved] = useState(false);

  // New experience form
  const [expTitle, setExpTitle] = useState("");
  const [expCompany, setExpCompany] = useState("");
  const [expPeriod, setExpPeriod] = useState("");
  const [expDesc, setExpDesc] = useState("");
  const [expCurrent, setExpCurrent] = useState(false);

  const stats = useMemo(() => loadStats(), []);
  const rank = useMemo(() => getRank(stats.xp), [stats.xp]);
  const league = useMemo(() => getLeague(rank), [rank]);
  const boost = useMemo(() => getTotalSalaryBoost(rank, league), [rank, league]);
  const unlockedCount = stats.unlockedAchievements.length;

  const reviews = useMemo(() => loadReviews(user?.id), [user?.id]);
  const referrals = useMemo(() => loadReferrals(user?.id), [user?.id]);
  const trust = useMemo(() => calculateTrustScore(reviews, referrals), [reviews, referrals]);
  const tier = useMemo(() => getTrustTier(trust.score), [trust.score]);

  if (!user) return null;
  const isEmployer = user.role === "EMPLOYER";

  const save = () => {
    update({
      name: name.trim(),
      company: company.trim() || undefined,
      microdistrict: district ? parseInt(district) : undefined,
      bio: bio.trim(),
      skills,
    });
    saveHeadline(headline);
    saveExperiences(experiences);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const addExperience = () => {
    if (!expTitle.trim()) return;
    const exp: Experience = {
      id: Date.now().toString(),
      title: expTitle.trim(),
      company: expCompany.trim(),
      period: expPeriod.trim(),
      description: expDesc.trim(),
      current: expCurrent,
    };
    const updated = [exp, ...experiences];
    setExperiences(updated);
    saveExperiences(updated);
    setAddingExp(false);
    setExpTitle(""); setExpCompany(""); setExpPeriod(""); setExpDesc(""); setExpCurrent(false);
  };

  const removeExperience = (id: string) => {
    const updated = experiences.filter((e) => e.id !== id);
    setExperiences(updated);
    saveExperiences(updated);
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput("");
  };

  const hue = user.avatarHue || 210;

  return (
    <div className="max-w-4xl mx-auto -mt-4">
      {/* ── Cover + Avatar ─── */}
      <div className="relative">
        {/* Cover */}
        <div
          className="h-40 sm:h-52 rounded-t-[28px] relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, hsl(${hue}, 60%, 25%) 0%, hsl(${hue + 30}, 50%, 18%) 50%, ${C.abyss} 100%)`,
          }}
        >
          {/* Subtle wave */}
          <svg className="absolute bottom-0 w-full" viewBox="0 0 800 40" preserveAspectRatio="none" style={{ height: 30 }}>
            <motion.path
              d="M0,20 C150,35 350,5 500,20 C650,35 750,10 800,20 L800,40 L0,40 Z"
              fill="white"
              animate={{ d: [
                "M0,20 C150,35 350,5 500,20 C650,35 750,10 800,20 L800,40 L0,40 Z",
                "M0,25 C150,10 350,35 500,25 C650,10 750,30 800,25 L800,40 L0,40 Z",
                "M0,20 C150,35 350,5 500,20 C650,35 750,10 800,20 L800,40 L0,40 Z",
              ] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
          {/* Rank badge on cover */}
          <motion.div
            className="absolute top-4 right-5 flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.15)" }}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <span className="text-sm">{rank.icon}</span>
            <span className="text-[11px] text-white font-mono" style={{ fontWeight: 700 }}>{rank.id} · {rank.labelRu}</span>
          </motion.div>
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-14 left-8">
          <div
            className="w-28 h-28 rounded-3xl flex items-center justify-center text-white text-3xl border-4 border-white"
            style={{
              background: `linear-gradient(135deg, hsl(${hue}, 55%, 40%), hsl(${hue + 20}, 50%, 30%))`,
              fontWeight: 800,
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            }}
          >
            {(user.name || "?").charAt(0).toUpperCase()}
          </div>
          {/* League mini badge */}
          <div
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg flex items-center justify-center text-sm border-2 border-white"
            style={{ background: league.gradient, boxShadow: `0 2px 8px ${league.color}40` }}
          >
            {league.icon}
          </div>
        </div>

        {/* Edit button */}
        <div className="absolute -bottom-14 right-6 flex gap-2">
          {!editing && (
            <Link
              to={`/app/u/${user.id}`}
              className="h-9 px-4 rounded-full text-[12px] flex items-center gap-1.5 transition-all bg-white hover:bg-gray-50 text-slate-700 border"
              style={{ fontWeight: 600, borderColor: C.tide100, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <ExternalLink className="w-3.5 h-3.5" /> Публичный профиль
            </Link>
          )}
          <button
            onClick={() => editing ? save() : setEditing(true)}
            className="h-9 px-5 rounded-full text-[12px] transition-all"
            style={{
              fontWeight: 700,
              background: saved ? "#0D5D5A" : editing ? C.tide700 : "white",
              color: saved ? "white" : editing ? "white" : C.abyss,
              border: `1px solid ${saved ? "#0D5D5A" : editing ? C.tide700 : C.tide100}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            {saved ? "✓ Сохранено" : editing ? "Сохранить" : "Редактировать"}
          </button>
        </div>
      </div>

      {/* ── Profile Info ─── */}
      <div className="pt-20 px-2">
        {/* Name + headline */}
        <div className="mb-6">
          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-2xl w-full bg-transparent outline-none border-b-2 pb-1 transition-colors"
              style={{ fontWeight: 800, letterSpacing: "-0.03em", color: C.abyss, borderColor: C.tide300 }}
              placeholder="Ваше имя"
            />
          ) : (
            <h1 className="text-2xl" style={{ fontWeight: 800, letterSpacing: "-0.03em", color: C.abyss }}>{user.name}</h1>
          )}

          {editing ? (
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="mt-2 w-full bg-transparent outline-none border-b pb-1 text-[14px] transition-colors"
              style={{ fontWeight: 500, color: C.depth, borderColor: C.tide100 }}
              placeholder="Заголовок профиля (напр. Бариста с опытом 2 года)"
            />
          ) : headline ? (
            <p className="mt-1 text-[14px]" style={{ fontWeight: 500, color: C.depth }}>{headline}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 mt-3 text-[12px]" style={{ color: C.tide500, fontWeight: 500 }}>
            {user.microdistrict && (
              <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{user.microdistrict} МКР, Актау</span>
            )}
            <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />На платформе</span>
            {isEmployer && user.company && (
              <span className="inline-flex items-center gap-1"><Briefcase className="w-3 h-3" />{user.company}</span>
            )}
          </div>
          {editing && isEmployer && (
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="mt-2 w-full h-9 px-3 rounded-lg border text-[13px] outline-none"
              style={{ borderColor: C.tide100, fontWeight: 500 }}
              placeholder="Название компании"
            />
          )}
          {editing && (
            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="mt-2 w-24 h-9 px-3 rounded-lg border text-[13px] outline-none"
              style={{ borderColor: C.tide100, fontWeight: 500 }}
              placeholder="МКР"
            />
          )}
        </div>

        {/* Stat chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          <StatChip icon="⚡" label="XP" value={stats.xp.toLocaleString()} color={rank.color} />
          <StatChip icon={rank.icon} label="Ранг" value={rank.labelRu} color={rank.color} />
          <StatChip icon={league.icon} label="Лига" value={league.labelRu} color={league.color} />
          {boost > 0 && <StatChip icon="💰" label="Бонус ЗП" value={`+${boost}%`} color="#0D5D5A" />}
          <StatChip icon="🏅" label="Награды" value={`${unlockedCount}/${ACHIEVEMENTS.length}`} color="#7C5AE2" />
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* ── Left column ─── */}
          <div className="space-y-6">
            {/* Bio */}
            {(!isEmployer || editing) && (
              <Section title="О себе" icon="📝">
                {editing ? (
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border px-4 py-3 text-[13px] outline-none resize-none transition-all"
                    style={{ borderColor: C.tide100, fontWeight: 500 }}
                    placeholder="Расскажите о себе, своих целях и мотивации..."
                  />
                ) : bio ? (
                  <p className="text-[14px] leading-relaxed" style={{ color: C.depth, fontWeight: 500 }}>{bio}</p>
                ) : (
                  <p className="text-[13px] italic" style={{ color: C.tide500 }}>Заполните раздел «О себе» чтобы повысить видимость профиля</p>
                )}
              </Section>
            )}

            {/* Experience */}
            <Section
              title="Опыт работы"
              icon="💼"
              action={editing ? (
                <button onClick={() => setAddingExp(true)} className="text-[11px] px-3 py-1 rounded-full" style={{ background: C.tide50, color: C.tide700, fontWeight: 700 }}>
                  <Plus className="w-3 h-3 inline mr-1" />Добавить
                </button>
              ) : undefined}
            >
              {addingExp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-4 rounded-xl border p-4 space-y-3"
                  style={{ borderColor: C.tide100, background: C.tide50 }}
                >
                  <input value={expTitle} onChange={(e) => setExpTitle(e.target.value)} placeholder="Должность *" className="w-full h-9 px-3 rounded-lg border text-[13px] outline-none" style={{ borderColor: C.tide100, fontWeight: 600 }} />
                  <input value={expCompany} onChange={(e) => setExpCompany(e.target.value)} placeholder="Компания" className="w-full h-9 px-3 rounded-lg border text-[13px] outline-none" style={{ borderColor: C.tide100, fontWeight: 500 }} />
                  <input value={expPeriod} onChange={(e) => setExpPeriod(e.target.value)} placeholder="Период (напр. Янв 2024 — настоящее время)" className="w-full h-9 px-3 rounded-lg border text-[13px] outline-none" style={{ borderColor: C.tide100, fontWeight: 500 }} />
                  <textarea value={expDesc} onChange={(e) => setExpDesc(e.target.value)} placeholder="Описание обязанностей..." rows={3} className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none resize-none" style={{ borderColor: C.tide100, fontWeight: 500 }} />
                  <label className="flex items-center gap-2 text-[12px]" style={{ fontWeight: 600, color: C.depth }}>
                    <input type="checkbox" checked={expCurrent} onChange={(e) => setExpCurrent(e.target.checked)} />
                    Текущее место работы
                  </label>
                  <div className="flex gap-2">
                    <button onClick={addExperience} className="h-8 px-4 rounded-lg text-white text-[12px]" style={{ background: C.tide700, fontWeight: 700 }}>Добавить</button>
                    <button onClick={() => setAddingExp(false)} className="h-8 px-4 rounded-lg text-[12px] border" style={{ borderColor: C.tide100, fontWeight: 600, color: C.tide500 }}>Отмена</button>
                  </div>
                </motion.div>
              )}

              {experiences.length === 0 ? (
                <p className="text-[13px] italic py-2" style={{ color: C.tide500 }}>
                  {editing ? "Добавьте опыт работы нажав кнопку выше" : "Нет записей об опыте работы"}
                </p>
              ) : (
                <div className="space-y-0">
                  {experiences.map((exp, i) => (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="relative pl-6 pb-6 last:pb-0"
                    >
                      {/* Timeline line */}
                      {i < experiences.length - 1 && (
                        <div className="absolute left-[7px] top-6 bottom-0 w-px" style={{ background: C.tide100 }} />
                      )}
                      {/* Timeline dot */}
                      <div
                        className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2"
                        style={{
                          borderColor: exp.current ? C.tide700 : C.tide300,
                          background: exp.current ? C.tide700 : "white",
                        }}
                      >
                        {exp.current && <div className="w-full h-full rounded-full" style={{ background: C.tide700 }} />}
                      </div>

                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[14px] flex items-center gap-2" style={{ fontWeight: 700, color: C.abyss }}>
                            {exp.title}
                            {exp.current && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full text-white" style={{ background: "#0D5D5A", fontWeight: 700 }}>СЕЙЧАС</span>
                            )}
                          </div>
                          {exp.company && (
                            <div className="text-[13px] mt-0.5" style={{ fontWeight: 600, color: C.depth }}>{exp.company}</div>
                          )}
                          {exp.period && (
                            <div className="text-[11px] mt-1 flex items-center gap-1" style={{ color: C.tide500, fontWeight: 500 }}>
                              <Clock className="w-3 h-3" />{exp.period}
                            </div>
                          )}
                          {exp.description && (
                            <p className="mt-2 text-[13px] leading-relaxed" style={{ color: C.depth, fontWeight: 500 }}>{exp.description}</p>
                          )}
                        </div>
                        {editing && (
                          <button onClick={() => removeExperience(exp.id)} className="p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors shrink-0">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Section>

            {/* Skills */}
            {!isEmployer && (
              <Section title="Навыки" icon="🎯">
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px]"
                      style={{ background: C.tide50, color: C.tide700, fontWeight: 600 }}
                    >
                      {s}
                      {editing && (
                        <button onClick={() => setSkills(skills.filter((x) => x !== s))} className="text-red-400 hover:text-red-600 ml-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                  {skills.length === 0 && !editing && (
                    <span className="text-[13px] italic" style={{ color: C.tide500 }}>Добавьте навыки для лучшего подбора</span>
                  )}
                </div>
                {editing && (
                  <div className="flex items-center gap-2 mt-3">
                    <input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                      placeholder="Добавить навык..."
                      className="flex-1 h-9 px-3 rounded-lg border text-[13px] outline-none"
                      style={{ borderColor: C.tide100, fontWeight: 500 }}
                    />
                    <button onClick={addSkill} className="h-9 px-4 rounded-lg text-[12px]" style={{ background: C.tide50, color: C.tide700, fontWeight: 700 }}>Добавить</button>
                  </div>
                )}
              </Section>
            )}
          </div>

          {/* ── Right sidebar ─── */}
          <div className="space-y-5">
            {/* Rank card */}
            <div
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${C.abyss}, ${rank.color}40)`,
                border: "none",
              }}
            >
              <div className="relative z-10 text-white">
                <div className="text-[10px] font-mono tracking-[0.2em] mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>РАНГ И ЛИГА</div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">{rank.icon}</div>
                  <div>
                    <div className="text-lg" style={{ fontWeight: 800 }}>{rank.labelRu}</div>
                    <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>{league.labelRu}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                  <TrendingUp className="w-3 h-3" />
                  <span>{stats.xp.toLocaleString()} XP</span>
                  {boost > 0 && <span style={{fontWeight:700}}>· +{boost}% ЗП</span>}
                </div>
              </div>
            </div>

            {/* Trust / Reputation Card */}
            <div
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${tier.color}15, white)`, border: `1px solid ${tier.color}30` }}
            >
              <div className="text-[10px] font-mono tracking-[0.2em] mb-3" style={{ color: C.tide500, fontWeight: 700 }}>РЕПУТАЦИЯ И ДОВЕРИЕ</div>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-12 h-12 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke={C.tide50} strokeWidth="8" />
                    <motion.circle
                      cx="50" cy="50" r="42"
                      fill="none" stroke={tier.color} strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${trust.score * 2.64} 264`}
                      initial={{ strokeDasharray: "0 264" }}
                      animate={{ strokeDasharray: `${trust.score * 2.64} 264` }}
                      transition={{ duration: 1.5, ease: EASE.splash }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xl">{tier.emoji}</div>
                </div>
                <div>
                  <div className="text-[16px]" style={{ fontWeight: 800, color: C.abyss }}>{tier.label}</div>
                  <div className="text-[11px]" style={{ color: C.tide500, fontWeight: 600 }}>{trust.score} / 100 Волна доверия</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-xl" style={{ background: "white", border: `1px solid ${C.tide100}` }}>
                  <div style={{ color: C.tide500, fontWeight: 500 }}>Отзывы</div>
                  <div className="mt-0.5" style={{ fontWeight: 700, color: C.abyss }}>⭐ {trust.avgRating > 0 ? trust.avgRating.toFixed(1) : "—"} ({trust.reviewsReceived})</div>
                </div>
                <div className="p-2 rounded-xl" style={{ background: "white", border: `1px solid ${C.tide100}` }}>
                  <div style={{ color: C.tide500, fontWeight: 500 }}>Рекомендации</div>
                  <div className="mt-0.5" style={{ fontWeight: 700, color: C.abyss }}>🤝 {trust.referralsSuccessful} из {trust.referralsMade}</div>
                </div>
              </div>
            </div>

            {/* Achievements preview */}
            <div className="rounded-2xl border p-5" style={{ borderColor: C.tide100, background: "white" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] font-mono tracking-[0.2em]" style={{ color: C.tide500, fontWeight: 600 }}>ДОСТИЖЕНИЯ</div>
                <span className="text-[11px] font-mono" style={{ color: C.tide700, fontWeight: 700 }}>{unlockedCount}/{ACHIEVEMENTS.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ACHIEVEMENTS.slice(0, 12).map((a) => {
                  const done = stats.unlockedAchievements.includes(a.id);
                  return (
                    <div
                      key={a.id}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-sm"
                      style={{
                        background: done ? "#0D5D5A10" : C.tide50,
                        filter: done ? "none" : "grayscale(1)",
                        opacity: done ? 1 : 0.3,
                      }}
                      title={a.titleRu}
                    >
                      {a.icon}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick stats */}
            <div className="rounded-2xl border p-5" style={{ borderColor: C.tide100, background: "white" }}>
              <div className="text-[10px] font-mono tracking-[0.2em] mb-3" style={{ color: C.tide500, fontWeight: 600 }}>АКТИВНОСТЬ</div>
              <div className="space-y-3">
                {[
                  { l: "Откликов отправлено", v: stats.applicationsSubmitted, e: "📨" },
                  { l: "AI-интервью пройдено", v: stats.interviewsCompleted, e: "🎤" },
                  { l: "Рекомендаций", v: stats.vouchesReceived, e: "🤝" },
                  { l: "Дней подряд", v: stats.loginStreak, e: "🔥" },
                ].map((s) => (
                  <div key={s.l} className="flex items-center justify-between">
                    <span className="text-[12px] flex items-center gap-2" style={{ color: C.depth, fontWeight: 500 }}>
                      <span className="text-sm">{s.e}</span>{s.l}
                    </span>
                    <span className="text-[13px] font-mono" style={{ fontWeight: 700, color: C.abyss }}>{s.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helper Components ─── */

function Section({ title, icon, action, children }: { title: string; icon: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: C.tide100, background: "white" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="text-[13px]" style={{ fontWeight: 700, color: C.abyss }}>{title}</span>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function StatChip({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px]"
      style={{ background: `${color}08`, border: `1px solid ${color}15`, fontWeight: 600, color }}
    >
      <span className="text-xs">{icon}</span>
      <span style={{ color: C.tide500 }}>{label}</span>
      <span style={{ fontWeight: 800 }}>{value}</span>
    </div>
  );
}
