import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Bookmark, BookmarkCheck, MapPin, Sparkles, Check, Send, Share2 } from "lucide-react";
import { useApplications, useJobs, useSaved } from "../lib/store";
import { useAuth } from "../lib/auth";
import { CATEGORY, categoryIcon, C } from "../lib/design";
import { LighthouseBadge } from "../components/lighthouse-badge";
import { SeaLevelPanel } from "../components/sea-level";
import { VouchCountPill, VouchList, VouchRequestCard } from "../components/swell-vouches";
import { useLighthouseByJob, useSalaryStats, useVouches, roleKey } from "../lib/trio";
import { ShadowInterview } from "../components/shadow-interview";
import { BoostTipsModal } from "../components/boost-tips";
import { GraduationCap, MessageSquare } from "lucide-react";

function parseSalary(s: string): number | null {
  const m = s.replace(/\s/g, "").match(/(\d{4,})/);
  return m ? parseInt(m[1]) : null;
}

export function JobDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { jobs } = useJobs();
  const { user } = useAuth();
  const { has, toggle } = useSaved();
  const { add } = useApplications();

  const job = jobs.find((j) => j.id === id);
  const { data: lighthouse } = useLighthouseByJob(id);
  const stats = useSalaryStats(job ? roleKey(job.title) : undefined, job?.microdistrict);
  const { vouches } = useVouches(user?.id);

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [boostOpen, setBoostOpen] = useState(false);

  if (!job) {
    return (
      <div className="py-20 text-center">
        <div className="text-[15px] mb-4" style={{ color: C.abyss, fontWeight: 700 }}>Вакансия не найдена.</div>
        <Link to="/app/browse" className="text-[13px] underline" style={{ color: C.tide700, fontWeight: 600 }}>К списку</Link>
      </div>
    );
  }

  const accent = CATEGORY[job.category] ?? C.tide700;
  const JobIcon = categoryIcon(job.category);
  const saved = has(job.id);
  const currentSalary = parseSalary(job.salary);

  const doSubmit = (finalNote: string) => {
    add({
      id: crypto.randomUUID(),
      jobId: job!.id,
      name: name.trim(),
      phone: phone.trim(),
      note: finalNote,
      status: "PENDING",
      createdAt: Date.now(),
    });
    setSent(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setInterviewOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <button
        onClick={() => nav(-1)}
        className="inline-flex items-center gap-1.5 text-[13px] mb-6 hover:text-[#0A1F3D] transition-colors"
        style={{ color: C.depth, fontWeight: 600 }}
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Назад
      </button>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        <div>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-5"
            style={{ background: accent }}
          >
            <JobIcon className="w-7 h-7" />
          </div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center h-7 px-3 rounded-full text-[11px] text-white" style={{ background: C.tide700, fontWeight: 700 }}>
              {job.match}% матч
            </span>
            <LighthouseBadge data={lighthouse} />
            <VouchCountPill count={vouches.length} />
            {job.isAIParsed && (
              <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px]" style={{ background: C.tide50, color: C.tide700, fontWeight: 700 }}>
                <Sparkles className="w-3 h-3" /> AI-парсинг
              </span>
            )}
            <span className="inline-flex items-center h-7 px-3 rounded-full text-[11px]" style={{ background: C.tide50, color: C.depth, fontWeight: 600 }}>
              {Math.floor((Date.now() - job.createdAt) / 3600000)} ч назад
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(36px,4.5vw,48px)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.02, color: C.abyss }}>{job.title}</h1>
          <div className="mt-3 flex items-center gap-2 text-[14px] flex-wrap" style={{ color: C.depth, fontWeight: 500 }}>
            <span style={{ color: C.abyss, fontWeight: 700 }}>{job.company}</span>
            <span style={{ color: C.tide300 }}>·</span>
            <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.microdistrict} МКР</span>
            <span style={{ color: C.tide300 }}>·</span>
            <span style={{ color: C.abyss, fontWeight: 700 }}>{job.salary}</span>
          </div>

          <div className="mt-5 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setBoostOpen(true)}
              className="h-10 px-4 rounded-full inline-flex items-center gap-1.5 text-white text-[12px]"
              style={{ background: `linear-gradient(90deg, ${C.tide700}, ${C.abyss})`, fontWeight: 700 }}
            >
              <GraduationCap className="w-3.5 h-3.5" /> Повысить шансы
            </button>
            <button
              onClick={() => toggle(job.id)}
              className="h-10 px-4 rounded-full text-[12px] inline-flex items-center gap-1.5 transition-colors"
              style={{
                background: saved ? C.tide700 : "white",
                color: saved ? "white" : C.depth,
                border: saved ? "none" : `1px solid ${C.tide100}`,
                fontWeight: 700,
              }}
            >
              {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              {saved ? "В якорях" : "В якоря"}
            </button>
            <button className="h-10 px-4 rounded-full bg-white border transition-colors text-[12px] flex items-center gap-1.5" style={{ borderColor: C.tide100, color: C.depth, fontWeight: 700 }}>
              <Share2 className="w-3.5 h-3.5" /> Поделиться
            </button>
          </div>

          <div className="mt-10 rounded-2xl bg-white border p-6" style={{ borderColor: C.tide100 }}>
            <div className="text-[10px] font-mono mb-3" style={{ color: C.tide500, letterSpacing: "0.18em", fontWeight: 600 }}>О РОЛИ</div>
            <p className="text-[15px]" style={{ color: C.depth, fontWeight: 500, lineHeight: 1.7 }}>{job.description}</p>

            <div className="mt-6 pt-6 border-t" style={{ borderColor: C.tide100 }}>
              <div className="text-[10px] font-mono mb-3" style={{ color: C.tide500, letterSpacing: "0.18em", fontWeight: 600 }}>ТРЕБОВАНИЯ</div>
              <div className="flex flex-wrap gap-1.5">
                {job.requirements.map((r) => (
                  <span key={r} className="px-3 h-8 rounded-full text-[12px] inline-flex items-center" style={{ background: C.tide50, color: C.depth, fontWeight: 600 }}>{r}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Sea Level */}
          <div className="mt-4">
            <SeaLevelPanel stats={stats} role={roleKey(job.title)} microdistrict={job.microdistrict} currentSalary={currentSalary} />
          </div>

          {/* Swell: show request if this is the viewer's own profile context — show vouch list always */}
          {user && (
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <VouchRequestCard userId={user.id} />
              <div className="rounded-2xl border p-5" style={{ borderColor: C.tide100, background: "white" }}>
                <div className="text-[10px] font-mono mb-3" style={{ color: C.tide500, letterSpacing: "0.18em", fontWeight: 600 }}>ТВОИ РЕКОМЕНДАЦИИ</div>
                <VouchList vouches={vouches} />
              </div>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <div className="rounded-2xl bg-white border p-6" style={{ borderColor: C.tide100, boxShadow: "0 30px 60px -30px rgba(15,48,87,0.18)" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: C.tide700 }}>
                <Send className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[15px]" style={{ color: C.abyss, fontWeight: 800, letterSpacing: "-0.02em" }}>Отклик в один тап</div>
                <div className="text-[11px]" style={{ color: C.tide500, fontWeight: 500 }}>Telegram-уведомление работодателю</div>
              </div>
            </div>
            {sent ? (
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="rounded-xl p-4 flex items-center gap-2 text-[13px] text-white"
                style={{ background: C.kelp, fontWeight: 700 }}
              >
                <Check className="w-4 h-4" /> Отправлено — работодатель уведомлён.
              </motion.div>
            ) : (
              <form onSubmit={submit} className="space-y-2.5">
                <Input placeholder="Имя" value={name} onChange={setName} />
                <Input placeholder="Телефон или Telegram" value={phone} onChange={setPhone} />
                <textarea
                  value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                  placeholder="Пара слов (не обязательно)"
                  className="w-full rounded-2xl border bg-white px-4 py-3 text-[13px] outline-none resize-none"
                  style={{ borderColor: C.tide100, fontFamily: "var(--font-sans)", fontWeight: 500, color: C.abyss }}
                />
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!name.trim() || !phone.trim()}
                  className="w-full h-11 rounded-full text-white inline-flex items-center justify-center gap-2 disabled:opacity-40"
                  style={{ background: C.abyss, fontWeight: 700, fontSize: 13, letterSpacing: "-0.01em" }}
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Пройти AI-интервью и откликнуться
                </motion.button>
                <div className="text-[11px] text-center pt-1" style={{ color: C.tide500, fontWeight: 500 }}>
                  Контакт виден работодателю только после одобрения.
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <ShadowInterview
        jobId={job.id}
        open={interviewOpen}
        onClose={() => setInterviewOpen(false)}
        onFinished={(s, qa) => {
          setInterviewOpen(false);
          const block = [
            note.trim(),
            `— AI-интервью (fit ${s.fit}%) —`,
            s.summary,
            ...qa.map((x) => `Q: ${x.q}\nA: ${x.a}`),
          ].filter(Boolean).join("\n\n");
          doSubmit(block);
        }}
      />
      <BoostTipsModal jobId={job.id} open={boostOpen} onClose={() => setBoostOpen(false)} />
    </motion.div>
  );
}

function Input({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full h-11 px-4 rounded-full border bg-white text-[13px] outline-none"
      style={{ borderColor: C.tide100, fontFamily: "var(--font-sans)", fontWeight: 500, color: C.abyss }}
    />
  );
}
