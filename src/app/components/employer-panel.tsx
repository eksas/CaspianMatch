import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Loader2, Check, Send, UserCheck, User } from "lucide-react";
import { parseAd } from "../lib/parse";
import type { Job, Application } from "../lib/store";

type Props = {
  onPublish: (j: Job) => void;
  applications: Application[];
  jobs: Job[];
  onApprove: (id: string) => void;
};

export function EmployerPanel({ onPublish, applications, jobs, onApprove }: Props) {
  const [raw, setRaw] = useState("Ищем официанта в кафе, 14 мкр Актау. Зп 250 000 тг. Опыт приветствуется, смены 2/2.");
  const [parsed, setParsed] = useState<ReturnType<typeof parseAd> | null>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [salary, setSalary] = useState("");
  const [district, setDistrict] = useState("");
  const [cat, setCat] = useState("waiter");
  const [desc, setDesc] = useState("");
  const [justPublished, setJustPublished] = useState(false);

  const run = () => {
    setLoading(true);
    setTimeout(() => {
      const p = parseAd(raw);
      setParsed(p);
      setTitle(p.title);
      setSalary(p.salary);
      setDistrict(p.microdistrict ? String(p.microdistrict) : "");
      setCat(p.category);
      setDesc(p.description);
      setLoading(false);
    }, 600);
  };

  const publish = () => {
    const d = parseInt(district);
    if (!title.trim() || !company.trim() || !d) return;
    const job: Job = {
      id: crypto.randomUUID(),
      title, company,
      salary: salary || "Negotiable",
      microdistrict: d,
      category: cat,
      isAIParsed: !!parsed,
      description: desc || "No description provided.",
      requirements: parsed?.requirements ?? ["No special requirements"],
      createdAt: Date.now(),
      match: 80 + Math.floor(Math.random() * 15),
    };
    onPublish(job);
    setTitle(""); setCompany(""); setSalary(""); setDistrict(""); setDesc(""); setParsed(null); setRaw("");
    setJustPublished(true);
    setTimeout(() => setJustPublished(false), 2200);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-3xl border border-slate-200 bg-white p-6"
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: "#1B5A8F" }}>
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-slate-900" style={{ letterSpacing: "-0.02em", fontWeight: 700, fontSize: 16 }}>Smart Parser</h3>
          <span className="ml-auto text-[11px] text-slate-400" style={{ fontWeight: 600 }}>Paste WhatsApp ad</span>
        </div>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-[13px] text-slate-800 outline-none focus:border-[#1B5A8F] focus:ring-4 focus:ring-[#1B5A8F]/10 resize-none transition-all"
          style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}
        />
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={run}
          disabled={loading || !raw.trim()}
          className="mt-3 px-5 h-10 rounded-full bg-[#1B5A8F] text-white text-[12px] inline-flex items-center gap-1.5 hover:bg-[#163bc9] transition-colors disabled:opacity-40"
          style={{ fontWeight: 600 }}
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Parse with AI
        </motion.button>

        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-2.5">
          <Input label="Title" value={title} onChange={setTitle} />
          <Input label="Company" value={company} onChange={setCompany} placeholder="e.g. Coffee Boom" />
          <Input label="Salary" value={salary} onChange={setSalary} />
          <Input label="Microdistrict" value={district} onChange={setDistrict} placeholder="14" />
          <div className="col-span-2">
            <Label>Category</Label>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white px-4 h-11 text-[13px] outline-none focus:border-[#1B5A8F] focus:ring-4 focus:ring-[#1B5A8F]/10 transition-all"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}
            >
              <option value="waiter">Waiter / Barista</option>
              <option value="courier">Courier</option>
              <option value="cashier">Cashier</option>
              <option value="cook">Cook</option>
              <option value="retail">Retail</option>
            </select>
          </div>
          <div className="col-span-2">
            <Label>Description</Label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[13px] outline-none focus:border-[#1B5A8F] focus:ring-4 focus:ring-[#1B5A8F]/10 resize-none transition-all"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}
            />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={publish}
          disabled={!title.trim() || !company.trim() || !district.trim()}
          className="mt-5 w-full h-11 rounded-full text-white text-[13px] inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
          style={{
            background: justPublished ? "#15803D" : "#1B5A8F",
            fontWeight: 600,
          }}
        >
          <Check className="w-3.5 h-3.5" />
          {justPublished ? "Published — Telegram notified" : "Publish vacancy"}
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="rounded-3xl border border-slate-200 bg-white p-6"
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: "#D7A500" }}>
            <Send className="w-4 h-4" />
          </div>
          <h3 className="text-slate-900" style={{ letterSpacing: "-0.02em", fontWeight: 700, fontSize: 16 }}>Inbox</h3>
          <span className="ml-auto text-[11px] text-slate-400" style={{ fontWeight: 600 }}>{applications.length} application{applications.length === 1 ? "" : "s"}</span>
        </div>
        {applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center text-[13px] text-slate-500" style={{ fontWeight: 500 }}>
            No applications yet. Publish a vacancy to start receiving candidates.
          </div>
        ) : (
          <div className="space-y-2">
            {applications.map((a, i) => {
              const job = jobs.find((j) => j.id === a.jobId);
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                      style={{ background: a.status === "APPROVED" ? "#15803D" : "#1B5A8F" }}
                    >
                      {a.status === "APPROVED" ? <UserCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] text-slate-900" style={{ fontWeight: 600 }}>{a.name}</div>
                      <div className="text-[11px] text-slate-500 truncate" style={{ fontWeight: 500 }}>{job?.title ?? "Job"} · {a.phone}</div>
                    </div>
                    {a.status === "APPROVED" ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-3 h-7 rounded-full bg-[#15803D]/10 text-[#15803D] text-[11px]"
                        style={{ fontWeight: 600 }}
                      >
                        <UserCheck className="w-3 h-3" /> Approved
                      </span>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onApprove(a.id)}
                        className="px-3 h-8 rounded-full bg-[#1B5A8F] text-white text-[11px] hover:bg-[#163bc9] transition-colors"
                        style={{ fontWeight: 600 }}
                      >
                        Approve
                      </motion.button>
                    )}
                  </div>
                  {a.note && <div className="mt-2.5 text-[12px] text-slate-600 italic" style={{ fontWeight: 500 }}>"{a.note}"</div>}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] text-slate-400 uppercase tracking-[0.12em] mb-1.5" style={{ fontWeight: 700 }}>{children}</div>;
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-slate-200 bg-white px-4 h-11 text-[13px] outline-none focus:border-[#1B5A8F] focus:ring-4 focus:ring-[#1B5A8F]/10 transition-all"
        style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}
      />
    </div>
  );
}
