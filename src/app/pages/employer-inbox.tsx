import { motion } from "motion/react";
import { Check, Clock, Inbox, MapPin, UserCheck, User, Sparkles, Brain, BarChart3 } from "lucide-react";
import { useApplications, useJobs } from "../lib/store";

/* ── Structured Interview Note Renderer ────────────────────────────────── */
function InterviewNote({ note }: { note: string }) {
  const lines = note.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  const hasMarkers = lines.some(l => /^\[(INTERVIEW_HEADER|SUMMARY|FLAGS|Q\d|A\d)\]/.test(l));

  if (!hasMarkers) {
    return (
      <div className="mt-2 text-[12px] text-slate-600 italic" style={{ fontWeight: 500 }}>
        "{note}"
      </div>
    );
  }

  const elements: React.ReactNode[] = [];
  let personalNote = "";

  lines.forEach((line, i) => {
    const headerMatch = line.match(/^\[INTERVIEW_HEADER\](.+)/);
    const summaryMatch = line.match(/^\[SUMMARY\](.+)/);
    const flagsMatch = line.match(/^\[FLAGS\](.+)/);
    const qMatch = line.match(/^\[Q(\d+)\](.+)/);
    const aMatch = line.match(/^\[A(\d+)\](.+)/);

    if (headerMatch) {
      elements.push(
        <div key={`h-${i}`} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ width: 24, height: 24, borderRadius: 8, background: "#1B5A8F", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Brain style={{ width: 12, height: 12, color: "#fff" }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#1B5A8F", letterSpacing: "0.03em" }}>
            {headerMatch[1]}
          </span>
        </div>
      );
    } else if (summaryMatch) {
      elements.push(
        <div key={`s-${i}`} style={{ fontSize: 13, color: "#334155", fontWeight: 500, lineHeight: 1.6, marginBottom: 12, padding: "10px 12px", borderRadius: 10, background: "#F8FAFC", borderLeft: "3px solid #1B5A8F" }}>
          {summaryMatch[1]}
        </div>
      );
    } else if (flagsMatch) {
      const flags = flagsMatch[1].split("; ").filter(Boolean);
      elements.push(
        <div key={`f-${i}`} style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {flags.map((f, fi) => (
            <span key={fi} style={{ fontSize: 11, fontWeight: 600, color: "#D97706", background: "#FFFBEB", padding: "3px 10px", borderRadius: 20, border: "1px solid #FEF3C7" }}>
              📈 {f}
            </span>
          ))}
        </div>
      );
    } else if (qMatch) {
      elements.push(
        <div key={`q-${i}`} style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", marginTop: 8, marginBottom: 3, letterSpacing: "0.04em" }}>
          ВОПРОС {qMatch[1]}
        </div>
      );
      elements.push(
        <div key={`qt-${i}`} style={{ fontSize: 12, color: "#475569", fontWeight: 600, marginBottom: 4 }}>
          {qMatch[2]}
        </div>
      );
    } else if (aMatch) {
      const text = aMatch[2].trim();
      const isEmpty = text === "Ответ записан (транскрипция недоступна)" || !text;
      elements.push(
        <div key={`a-${i}`} style={{ fontSize: 13, color: isEmpty ? "#94A3B8" : "#1E293B", fontWeight: 500, lineHeight: 1.55, marginBottom: 10, paddingLeft: 12, borderLeft: "2px solid #E2E8F0" }}>
          {isEmpty ? <em>🎤 Аудио-ответ (транскрипция недоступна)</em> : text}
        </div>
      );
    } else if (line.trim() && !line.startsWith("[")) {
      personalNote += (personalNote ? "\n" : "") + line;
    }
  });

  return (
    <div style={{ marginTop: 12, borderRadius: 14, border: "1px solid #E2E8F0", padding: 16, background: "#FFFFFF" }}>
      {personalNote && (
        <div style={{ fontSize: 13, color: "#475569", fontStyle: "italic", fontWeight: 500, marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #F1F5F9" }}>
          "{personalNote}"
        </div>
      )}
      {elements}
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────── */
export function EmployerInbox() {
  const { apps, approve } = useApplications();
  const { jobs } = useJobs();

  const pending = apps.filter((a) => a.status === "PENDING");
  const approved = apps.filter((a) => a.status === "APPROVED");

  return (
    <div>
      <div className="text-[12px] uppercase tracking-[0.12em] text-slate-500" style={{ fontWeight: 700 }}>Inbox</div>
      <h1 className="mt-2" style={{ fontSize: "clamp(36px,5vw,52px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.02 }}>
        {apps.length} application{apps.length === 1 ? "" : "s"} <span style={{ color: "#1B5A8F" }}>waiting</span>
      </h1>
      <p className="mt-3 text-[15px] text-slate-600" style={{ fontWeight: 500 }}>
        Approve with one tap. Candidates get a Telegram ping the moment you do.
      </p>

      {apps.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white py-16 px-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1B5A8F]/10 text-[#1B5A8F] flex items-center justify-center">
            <Inbox className="w-6 h-6" />
          </div>
          <div className="mt-4 text-[16px] text-slate-900" style={{ fontWeight: 600 }}>Inbox is empty.</div>
          <div className="mt-1 text-[13px] text-slate-500" style={{ fontWeight: 500 }}>Publish a vacancy to start receiving candidates.</div>
        </div>
      ) : (
        <div className="mt-10 space-y-10">
          <Group title={`Pending · ${pending.length}`}>
            {pending.length === 0 ? (
              <div className="text-[13px] text-slate-400 py-4" style={{ fontWeight: 500 }}>No pending applications right now.</div>
            ) : (
              pending.map((a, i) => {
                const job = jobs.find((j) => j.id === a.jobId);
                return (
                  <motion.div
                    key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: "#1B5A8F" }}>
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] text-slate-900" style={{ fontWeight: 600 }}>{a.name}</div>
                        <div className="text-[12px] text-slate-500 flex items-center gap-2 flex-wrap" style={{ fontWeight: 500 }}>
                          <span>{job?.title ?? "Vacancy"}</span>
                          <span>·</span>
                          <span>{a.phone}</span>
                          {job && <><span>·</span><span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{job.microdistrict} МКР</span></>}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 h-7 rounded-full bg-slate-100 text-slate-600 text-[11px]" style={{ fontWeight: 600 }}>
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => approve(a.id)}
                        className="h-9 px-4 rounded-full text-white text-[12px] inline-flex items-center gap-1.5 bg-[#1B5A8F] hover:bg-[#163bc9] transition-colors"
                        style={{ fontWeight: 600 }}
                      >
                        <Check className="w-3 h-3" strokeWidth={3} /> Approve
                      </motion.button>
                    </div>
                    {a.note && <InterviewNote note={a.note} />}
                  </motion.div>
                );
              })
            )}
          </Group>

          {approved.length > 0 && (
            <Group title={`Approved · ${approved.length}`}>
              {approved.map((a) => {
                const job = jobs.find((j) => j.id === a.jobId);
                return (
                  <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: "#15803D" }}>
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] text-slate-900" style={{ fontWeight: 600 }}>{a.name}</div>
                      <div className="text-[12px] text-slate-500" style={{ fontWeight: 500 }}>{job?.title} · {a.phone}</div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 h-7 rounded-full bg-[#15803D]/10 text-[#15803D] text-[11px]" style={{ fontWeight: 600 }}>
                      <UserCheck className="w-3 h-3" /> Approved
                    </span>
                  </div>
                );
              })}
            </Group>
          )}
        </div>
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500 mb-3" style={{ fontWeight: 700 }}>{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
