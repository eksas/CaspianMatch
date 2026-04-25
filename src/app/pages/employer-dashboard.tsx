import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, Briefcase, Inbox, Plus, TrendingUp, Sparkles, MapPin } from "lucide-react";
import { useApplications, useJobs } from "../lib/store";
import { useAuth } from "../lib/auth";
import { categoryIcon, CATEGORY } from "../lib/design";

export function EmployerDashboard() {
  const { user } = useAuth();
  const { jobs } = useJobs();
  const { apps } = useApplications();
  const myJobs = jobs.slice(0, 5);
  const pending = apps.filter((a) => a.status === "PENDING").length;
  const approved = apps.filter((a) => a.status === "APPROVED").length;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl bg-[#0A0A0A] text-white p-8">
        <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none" viewBox="0 0 800 200">
          <path d="M0 140 Q 200 100 400 140 T 800 140 L 800 200 L 0 200 Z" fill="#1B5A8F" />
          <path d="M0 160 Q 200 120 400 160 T 800 160 L 800 200 L 0 200 Z" fill="#1B5A8F" opacity="0.5" />
        </svg>
        <div className="relative">
          <div className="text-[12px] uppercase tracking-[0.12em] text-white/50" style={{ fontWeight: 700 }}>Employer desk</div>
          <h1 className="mt-2" style={{ fontSize: "clamp(34px,5vw,48px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.02 }}>
            {user?.company ?? "Your company"}
          </h1>
          <p className="mt-2 text-[14px] text-white/70" style={{ fontWeight: 500 }}>
            Paste an ad, publish a vacancy, watch the inbox fill up.
          </p>
        </div>
      </motion.div>

      <div className="mt-6 grid md:grid-cols-4 gap-2.5">
        <Stat color="#1B5A8F" icon={<Briefcase className="w-4 h-4" />} label="Active vacancies" value={jobs.length} />
        <Stat color="#D7A500" icon={<Inbox className="w-4 h-4" />} label="Pending apps" value={pending} />
        <Stat color="#15803D" icon={<TrendingUp className="w-4 h-4" />} label="Approved" value={approved} />
        <Stat color="#FF4D2E" icon={<Sparkles className="w-4 h-4" />} label="AI parses" value={jobs.filter((j) => j.isAIParsed).length} />
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-2.5">
        <QuickAction to="/app/employer/post" color="#1B5A8F" title="Post vacancy" desc="Paste a WhatsApp ad. Publish in one click." icon={<Plus className="w-4 h-4" />} />
        <QuickAction to="/app/employer/inbox" color="#D7A500" title="Review inbox" desc={`${pending} new application${pending === 1 ? "" : "s"} waiting.`} icon={<Inbox className="w-4 h-4" />} />
        <QuickAction to="/app/employer/vacancies" color="#15803D" title="Manage vacancies" desc="Edit, pause, or close listings." icon={<Briefcase className="w-4 h-4" />} />
      </div>

      <div className="mt-10 flex items-center justify-between mb-3">
        <div>
          <div className="text-[12px] uppercase tracking-[0.12em] text-slate-500" style={{ fontWeight: 700 }}>Recent vacancies</div>
          <div className="mt-1 text-[18px] text-slate-900" style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>Your last {myJobs.length} listings</div>
        </div>
        <Link to="/app/employer/vacancies" className="text-[12px] text-[#1B5A8F] inline-flex items-center gap-1 hover:underline" style={{ fontWeight: 600 }}>
          See all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden">
        {myJobs.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-[15px] text-slate-900" style={{ fontWeight: 600 }}>Nothing posted yet.</div>
            <Link to="/app/employer/post" className="mt-4 inline-flex h-11 px-5 rounded-full bg-[#1B5A8F] text-white items-center gap-1.5 hover:bg-[#163bc9] transition-colors" style={{ fontWeight: 600, fontSize: 13 }}>
              <Plus className="w-3.5 h-3.5" /> Post your first vacancy
            </Link>
          </div>
        ) : (
          myJobs.map((j, i) => {
            const Icon = categoryIcon(j.category);
            const color = CATEGORY[j.category] ?? "#1B5A8F";
            return (
            <motion.div
              key={j.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className={"flex items-center gap-4 px-5 py-4 " + (i < myJobs.length - 1 ? "border-b border-slate-100" : "")}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: color }}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] truncate text-slate-900" style={{ fontWeight: 600 }}>{j.title}</div>
                <div className="text-[12px] text-slate-500 flex items-center gap-2 flex-wrap" style={{ fontWeight: 500 }}>
                  <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{j.microdistrict} МКР</span>
                  <span>·</span>
                  <span>{j.salary}</span>
                </div>
              </div>
              <span className="px-3 h-7 rounded-full bg-[#1B5A8F]/10 text-[#1B5A8F] text-[11px] inline-flex items-center" style={{ fontWeight: 600 }}>
                {j.match}% match
              </span>
            </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

function Stat({ color, icon, label, value }: { color: string; icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white mb-3" style={{ background: color }}>
        {icon}
      </div>
      <div className="text-slate-900" style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
      <div className="mt-1 text-[12px] text-slate-500" style={{ fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function QuickAction({ to, color, title, desc, icon }: { to: string; color: string; title: string; desc: string; icon: React.ReactNode }) {
  return (
    <Link to={to} className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: color }}>
          {icon}
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
      </div>
      <div className="text-[14px] mb-1 text-slate-900" style={{ fontWeight: 700 }}>{title}</div>
      <div className="text-[12px] text-slate-500" style={{ fontWeight: 500 }}>{desc}</div>
    </Link>
  );
}
