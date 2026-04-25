import { motion } from "motion/react";
import { Check, Clock, Inbox, MapPin, UserCheck, User } from "lucide-react";
import { useApplications, useJobs } from "../lib/store";

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
                    className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-4 hover:border-slate-300 transition-colors"
                  >
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
                      {a.note && <div className="mt-1.5 text-[12px] text-slate-600 italic" style={{ fontWeight: 500 }}>"{a.note}"</div>}
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
