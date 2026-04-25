import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowRight, Mail, Lock, User as UserIcon, Building2, AlertCircle,
  Compass, MapPin, Waves, Sparkles, Briefcase, Search, Coffee, Bike, ShoppingBag, Hammer,
  ChefHat, Baby, Heart, Plus, X, Check,
} from "lucide-react";
import { useAuth, type Role } from "../lib/auth";
import { apiFetch } from "../lib/supabase";

export function SignUp() {
  const { signUp } = useAuth();
  const nav = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<Role>("SEEKER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [district, setDistrict] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [bio, setBio] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const accountReady = !!email && password.length >= 6 && !!name && !!district;
  const profileReady = interests.length > 0 && skills.length > 0 && bio.trim().length >= 10;

  const toggleInterest = (id: string) => {
    setInterests((xs) => xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]);
  };
  const addCustomInterest = () => {
    const t = customInterest.trim();
    if (!t || interests.includes(t)) return;
    setInterests([...interests, t]);
    setCustomInterest("");
  };
  const addSkill = (s: string) => {
    const t = s.trim();
    if (!t || skills.includes(t)) return;
    setSkills([...skills, t]);
    setSkillInput("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      const u = await signUp({
        email, password, name, role,
        company: role === "EMPLOYER" ? company : undefined,
        microdistrict: district ? parseInt(district) : undefined,
        skills: role === "SEEKER" ? skills : undefined,
        bio: role === "SEEKER" ? bio.trim() : undefined,
        interests: role === "SEEKER" ? interests : undefined,
      });

      // Safety net: if the deployed server is an older build that ignores
      // skills/bio/interests in /auth/signup, sync them via PUT /me. Swallow
      // any error — a failed sync must not bounce the user back to sign-in.
      if (role === "SEEKER") {
        try {
          await apiFetch("/me", {
            method: "PUT",
            body: JSON.stringify({ skills, bio: bio.trim(), interests, microdistrict: district ? parseInt(district) : undefined }),
          });
        } catch {}
      }

      nav(u.role === "EMPLOYER" ? "/app/employer" : "/app/browse?fresh=1");
    } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-start justify-center px-6 py-16" style={{ background: "#FBFDFF" }}>
      <div className="max-w-md w-full">
          <StepIndicator step={step} role={role} />

          <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {step === 1 && (
              <>
                <h1 className="mt-8" style={{ fontSize: "clamp(40px, 5.5vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, color: "#0F3057" }}>
                  Кто ты<br />
                  <span style={{ color: "#FF4D2E", fontStyle: "italic" }}>сегодня?</span>
                </h1>
                <p className="mt-3 text-[15px] text-slate-600" style={{ fontWeight: 500, lineHeight: 1.55 }}>
                  CaspianMatch works differently depending on which side of the handshake you're on.
                </p>

                <div className="mt-8 space-y-3">
                  <RoleRow
                    active={role === "SEEKER"}
                    onClick={() => setRole("SEEKER")}
                    icon={<Search className="w-5 h-5" />}
                    title="I'm looking for work"
                    tag="Seeker"
                    desc="Cafés, shops, courier gigs, workshops — filtered by your street."
                    bullets={[
                      { icon: <MapPin className="w-3.5 h-3.5" />, text: "Walk-to-work filter" },
                      { icon: <Sparkles className="w-3.5 h-3.5" />, text: "AI match score" },
                    ]}
                    color="#1B5A8F"
                  />
                  <RoleRow
                    active={role === "EMPLOYER"}
                    onClick={() => setRole("EMPLOYER")}
                    icon={<Briefcase className="w-5 h-5" />}
                    title="I'm hiring for my business"
                    tag="Employer"
                    desc="Paste a WhatsApp ad. We publish a real listing, you review candidates."
                    bullets={[
                      { icon: <Sparkles className="w-3.5 h-3.5" />, text: "Ad auto-parse" },
                      { icon: <UserIcon className="w-3.5 h-3.5" />, text: "Telegram approvals" },
                    ]}
                    color="#FF4D2E"
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(2)}
                  className="mt-6 w-full h-12 rounded-full bg-slate-900 text-white inline-flex items-center justify-center gap-2 hover:bg-[#1B5A8F] transition-colors"
                  style={{ fontWeight: 600, fontSize: 14 }}
                >
                  Continue as {role === "SEEKER" ? "Seeker" : "Employer"}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="mt-8" style={{ fontSize: "clamp(40px, 5.5vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, color: "#0F3057" }}>
                  Пара<br />
                  <span style={{ color: "#FF4D2E", fontStyle: "italic" }}>деталей.</span>
                </h1>
                <p className="mt-3 text-[15px] text-slate-600" style={{ fontWeight: 500, lineHeight: 1.55 }}>
                  {role === "EMPLOYER" ? "Tell us about your business." : "Tell us where in Aktau you live."}
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (role === "EMPLOYER") submit(e);
                    else setStep(3);
                  }}
                  className="mt-7 space-y-3"
                >
                  <Field icon={<UserIcon className="w-4 h-4" />} placeholder="Full name" value={name} onChange={setName} />
                  {role === "EMPLOYER" && (
                    <Field icon={<Building2 className="w-4 h-4" />} placeholder="Company or café name" value={company} onChange={setCompany} />
                  )}
                  <Field icon={<Mail className="w-4 h-4" />} placeholder="you@example.com" type="email" value={email} onChange={setEmail} />
                  <Field icon={<Lock className="w-4 h-4" />} placeholder="Password · 6+ characters" type="password" value={password} onChange={setPassword} />
                  <Field icon={<Compass className="w-4 h-4" />} placeholder="Microdistrict · e.g. 14" value={district} onChange={setDistrict} />

                  {err && (
                    <div className="flex items-center gap-2 text-[12px] text-[#FF4D2E] px-1" style={{ fontWeight: 600 }}>
                      <AlertCircle className="w-3.5 h-3.5" /> {err}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="h-12 px-5 rounded-full border border-slate-200 bg-white text-[13px] text-slate-700 hover:border-slate-900 transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      Back
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading || !accountReady}
                      className="flex-1 h-12 rounded-full bg-[#1B5A8F] text-white inline-flex items-center justify-center gap-2 hover:bg-[#163bc9] transition-colors disabled:opacity-40 disabled:hover:bg-[#1B5A8F]"
                      style={{ fontWeight: 600, fontSize: 14 }}
                    >
                      {role === "EMPLOYER"
                        ? (loading ? "Creating your account…" : <>Open my CaspianMatch <ArrowRight className="w-4 h-4" /></>)
                        : <>Next: match profile <ArrowRight className="w-4 h-4" /></>}
                    </motion.button>
                  </div>
                </form>
              </>
            )}

            {step === 3 && (
              <>
                <h1 className="mt-8" style={{ fontSize: "clamp(40px, 5.5vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, color: "#0F3057" }}>
                  Твой<br />
                  <span style={{ color: "#FF4D2E", fontStyle: "italic" }}>профиль.</span>
                </h1>
                <p className="mt-3 text-[15px] text-slate-600" style={{ fontWeight: 500, lineHeight: 1.55 }}>
                  This is what our AI uses to rank every vacancy for you.
                </p>

                <form onSubmit={submit} className="mt-7 space-y-5">
                  <div>
                    <div className="text-[11px] text-slate-500 mb-2" style={{ fontWeight: 700, letterSpacing: "0.08em" }}>
                      INTERESTS · pick at least one
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {INTEREST_POOL.map(({ id, label, Icon }) => {
                        const on = interests.includes(id);
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => toggleInterest(id)}
                            className={"h-14 px-3 rounded-xl border text-left flex items-center gap-2.5 transition-all " + (on ? "bg-[#EAF2FA] border-[#1B5A8F]" : "bg-white border-slate-200 hover:border-slate-400")}
                          >
                            <span className={"w-8 h-8 rounded-lg flex items-center justify-center shrink-0 " + (on ? "bg-[#1B5A8F] text-white" : "bg-slate-100 text-slate-700")}>
                              <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />
                            </span>
                            <span className="text-[12.5px]" style={{ fontWeight: 600, letterSpacing: "-0.01em" }}>{label}</span>
                            {on && <Check className="w-3.5 h-3.5 text-[#1B5A8F] ml-auto" strokeWidth={2.5} />}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-2.5 flex gap-2">
                      <input
                        value={customInterest}
                        onChange={(e) => setCustomInterest(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomInterest(); } }}
                        placeholder="Add your own — e.g. Фотограф"
                        className="flex-1 h-10 px-3.5 rounded-full border border-slate-200 bg-white text-[13px] outline-none focus:border-[#1B5A8F]"
                        style={{ fontWeight: 500 }}
                      />
                      <button
                        type="button"
                        onClick={addCustomInterest}
                        disabled={!customInterest.trim()}
                        className="h-10 px-4 rounded-full bg-slate-900 text-white inline-flex items-center gap-1 text-[12px] disabled:opacity-40"
                        style={{ fontWeight: 600 }}
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                    {interests.filter((i) => !INTEREST_POOL.some((p) => p.id === i)).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {interests.filter((i) => !INTEREST_POOL.some((p) => p.id === i)).map((i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-[#1B5A8F] text-white text-[11.5px]" style={{ fontWeight: 600 }}>
                            {i}
                            <button type="button" onClick={() => setInterests(interests.filter((x) => x !== i))}>
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-500 mb-2" style={{ fontWeight: 700, letterSpacing: "0.08em" }}>
                      SKILLS · at least one
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }}
                        placeholder="e.g. Latte art"
                        className="flex-1 h-11 px-4 rounded-full border border-slate-200 bg-white text-[13.5px] outline-none focus:border-[#1B5A8F]"
                        style={{ fontWeight: 500 }}
                      />
                      <button
                        type="button"
                        onClick={() => addSkill(skillInput)}
                        disabled={!skillInput.trim()}
                        className="h-11 px-4 rounded-full bg-slate-900 text-white inline-flex items-center gap-1 text-[12.5px] disabled:opacity-40"
                        style={{ fontWeight: 600 }}
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                    {skills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {skills.map((s) => (
                          <span key={s} className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-[#1B5A8F] text-white text-[11.5px]" style={{ fontWeight: 600 }}>
                            {s}
                            <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))}>
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {SKILL_SUGGEST.filter((s) => !skills.includes(s)).slice(0, 8).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => addSkill(s)}
                          className="h-7 px-2.5 rounded-full border border-slate-200 bg-white text-[11.5px] text-slate-600 hover:border-slate-900"
                          style={{ fontWeight: 500 }}
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-500 mb-2" style={{ fontWeight: 700, letterSpacing: "0.08em" }}>
                      ABOUT YOU · at least 10 characters
                    </div>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      placeholder="Hi, I'm Ilyas, 19. Studying, looking for evening shifts…"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[13.5px] outline-none focus:border-[#1B5A8F] resize-none"
                      style={{ fontWeight: 500, lineHeight: 1.55 }}
                    />
                    <div className="mt-1 text-[11px] text-slate-400" style={{ fontWeight: 500 }}>
                      {bio.trim().length} / 10
                    </div>
                  </div>

                  {err && (
                    <div className="flex items-center gap-2 text-[12px] text-[#FF4D2E] px-1" style={{ fontWeight: 600 }}>
                      <AlertCircle className="w-3.5 h-3.5" /> {err}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="h-12 px-5 rounded-full border border-slate-200 bg-white text-[13px] text-slate-700 hover:border-slate-900 transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      Back
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading || !accountReady || !profileReady}
                      className="flex-1 h-12 rounded-full bg-[#1B5A8F] text-white inline-flex items-center justify-center gap-2 hover:bg-[#163bc9] transition-colors disabled:opacity-40 disabled:hover:bg-[#1B5A8F]"
                      style={{ fontWeight: 600, fontSize: 14 }}
                    >
                      {loading ? "Creating your account…" : <><Sparkles className="w-4 h-4" /> Open my CaspianMatch</>}
                    </motion.button>
                  </div>
                </form>
              </>
            )}
          </motion.div>

          <div className="mt-10 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-300/60" />
            <span className="text-[11px] text-slate-500" style={{ fontWeight: 500, letterSpacing: "0.04em" }}>
              Already a member?
            </span>
            <div className="flex-1 h-px bg-slate-300/60" />
          </div>
          <Link to="/sign-in" className="mt-4 h-11 flex items-center justify-center rounded-full border border-slate-200 bg-white text-[13px] text-slate-800 hover:border-slate-900 transition-colors" style={{ fontWeight: 600 }}>
            Sign in to your account
          </Link>
      </div>
    </div>
  );
}

const INTEREST_POOL: Array<{ id: string; label: string; Icon: any }> = [
  { id: "waiter",  label: "Cafe · Barista", Icon: Coffee },
  { id: "courier", label: "Delivery",        Icon: Bike },
  { id: "cook",    label: "Kitchen",         Icon: ChefHat },
  { id: "retail",  label: "Retail",          Icon: ShoppingBag },
  { id: "build",   label: "Construction",    Icon: Hammer },
  { id: "care",    label: "Childcare",       Icon: Baby },
];
const SKILL_SUGGEST = [
  "Latte art", "Driving licence", "Own transport", "Kazakh", "English",
  "Excel", "1С", "Food safety card", "Communication", "Punctual",
];

function StepIndicator({ step, role }: { step: 1 | 2 | 3; role: Role }) {
  const labels = role === "EMPLOYER" ? ["Role", "Account"] : ["Role", "Account", "Profile"];
  return (
    <div className="flex items-stretch gap-2">
      {labels.map((l, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        const fillColor = done ? "#0F3057" : active ? "#FF4D2E" : "rgba(15,48,87,0.15)";
        return (
          <div key={l} className="flex-1 flex flex-col gap-1.5">
            <div className="relative h-[3px] w-full overflow-hidden" style={{ background: "rgba(15,48,87,0.1)" }}>
              <motion.div
                initial={false}
                animate={{ width: done ? "100%" : active ? "100%" : "0%" }}
                transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                className="absolute inset-y-0 left-0"
                style={{ background: fillColor }}
              />
              {active && (
                <motion.span
                  className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                  style={{ background: "#FF4D2E", boxShadow: "0 0 14px #FF4D2E" }}
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                />
              )}
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span
                className="font-mono uppercase"
                style={{
                  fontSize: 11,
                  color: active ? "#FF4D2E" : done ? "#0F3057" : "rgba(15,48,87,0.45)",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                }}
              >
                0{n} · {l}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RoleRow({
  active, onClick, icon, title, tag, desc, bullets, color,
}: {
  active: boolean; onClick: () => void; icon: React.ReactNode; title: string; tag: string;
  desc: string; bullets: { icon: React.ReactNode; text: string }[]; color: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      type="button"
      className={
        "w-full relative rounded-2xl p-5 text-left transition-all overflow-hidden " +
        (active ? "bg-white ring-2 ring-[#1B5A8F]" : "bg-white/50 hover:bg-white ring-1 ring-slate-200")
      }
    >
      {active && (
        <motion.span
          layoutId="roleGlow"
          className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-20"
          style={{ background: color }}
        />
      )}
      <div className="relative flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
          style={{ background: color }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[15px]" style={{ fontWeight: 700, letterSpacing: "-0.01em" }}>{title}</span>
            <span className="text-[10px] uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full bg-slate-900 text-white" style={{ fontWeight: 700 }}>
              {tag}
            </span>
          </div>
          <p className="mt-1 text-[12.5px] text-slate-600" style={{ fontWeight: 500, lineHeight: 1.55 }}>{desc}</p>
          <div className="mt-3 flex items-center gap-4">
            {bullets.map((b, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 text-[11px] text-slate-500" style={{ fontWeight: 600 }}>
                <span style={{ color }}>{b.icon}</span>
                {b.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function Field({
  icon, placeholder, type = "text", value, onChange,
}: { icon?: React.ReactNode; placeholder: string; type?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={"w-full h-12 pr-4 rounded-full border border-slate-200 bg-white text-[14px] text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#1B5A8F] focus:ring-4 focus:ring-[#1B5A8F]/10 transition-all " + (icon ? "pl-11" : "pl-4")}
        style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 500 }}
      />
    </div>
  );
}

/* ─────────── LEFT IMMERSIVE POSTER (removed) ─────────── */
function _PosterPanel_unused() {
  return (
    <div className="relative hidden lg:flex overflow-hidden" style={{ background: "#0A0A0A" }}>
      {/* Abyssal gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 30%, #1B5A8F33 0%, transparent 55%), radial-gradient(ellipse at 75% 85%, #FF4D2E22 0%, transparent 60%)",
        }}
      />

      {/* Depth gauge */}
      <div
        className="absolute left-8 top-10 bottom-10 w-px"
        style={{ background: "rgba(255,255,255,0.18)" }}
      >
        {[0, 25, 50, 75, 100].map((d) => (
          <div
            key={d}
            className="absolute -left-1 flex items-center gap-2 font-mono"
            style={{
              top: `${d}%`,
              color: "rgba(255,255,255,0.55)",
              fontSize: 9,
              letterSpacing: "0.18em",
              fontWeight: 600,
            }}
          >
            <span className="w-2 h-px bg-white/40" />
            <span>−{d * 40}m</span>
          </div>
        ))}
      </div>

      {/* Animated horizon lines */}
      <svg viewBox="0 0 600 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="none" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <motion.path
            key={i}
            d={`M0 ${500 + i * 80} Q 150 ${440 + i * 70}, 300 ${500 + i * 80} T 600 ${500 + i * 80}`}
            stroke={["#FF4D2E", "#3A8FCC", "#8FB8D9", "#D6E4F0"][i]}
            strokeOpacity={0.4 - i * 0.07}
            strokeWidth={1.6 - i * 0.25}
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: i * 0.15, duration: 1.6, ease: [0.2, 0.8, 0.2, 1] }}
          />
        ))}
      </svg>

      {/* Oversized italic outline wordmark */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between p-14">
        <div
          className="font-mono text-[10.5px] uppercase inline-flex items-center gap-3"
          style={{ color: "rgba(214,228,240,0.65)", fontWeight: 700, letterSpacing: "0.22em" }}
        >
          <motion.span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: "#FF4D2E" }}
            animate={{ opacity: [1, 0.25, 1], scale: [1, 1.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
          FILE · 001 / ONBOARD
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none select-none"
            style={{
              fontSize: "clamp(120px, 18vw, 240px)",
              fontWeight: 900,
              fontStyle: "italic",
              letterSpacing: "-0.06em",
              lineHeight: 0.82,
              color: "transparent",
              WebkitTextStroke: "1px rgba(214,228,240,0.18)",
            }}
          >
            Новый
          </div>
          <div
            aria-hidden
            className="pointer-events-none select-none -mt-3"
            style={{
              fontSize: "clamp(120px, 18vw, 240px)",
              fontWeight: 900,
              fontStyle: "italic",
              letterSpacing: "-0.06em",
              lineHeight: 0.82,
              color: "#FF4D2E",
              mixBlendMode: "screen",
            }}
          >
            берег.
          </div>

          <motion.div
            className="absolute rounded-full"
            style={{
              right: "10%",
              top: "-6%",
              width: 22,
              height: 22,
              background: "#FF4D2E",
              boxShadow: "0 0 48px #FF4D2E",
            }}
            animate={{ scale: [1, 1.2, 1], boxShadow: ["0 0 48px #FF4D2E", "0 0 80px #FF4D2E", "0 0 48px #FF4D2E"] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="flex items-end justify-between gap-6">
          <p
            className="max-w-xs"
            style={{ color: "rgba(214,228,240,0.8)", fontSize: 13.5, fontWeight: 500, lineHeight: 1.55, fontStyle: "italic" }}
          >
            «Одна минута — и город начнёт откликаться на твоё имя.»
          </p>
          <div
            className="font-mono text-[10px] uppercase text-right shrink-0"
            style={{ color: "rgba(214,228,240,0.5)", fontWeight: 600, letterSpacing: "0.2em" }}
          >
            Aktau · Mangystau
            <br />
            43.65°N · 51.16°E
          </div>
        </div>
      </div>
    </div>
  );
}

