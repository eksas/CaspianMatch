import { useState } from "react";
import { motion } from "motion/react";
import { X, MapPin, Sparkles, Check, Bookmark, BookmarkCheck, Coffee, Bike, ShoppingBag, ChefHat, Store, Briefcase } from "lucide-react";
import type { Job, Application } from "../lib/store";
import { CATEGORY_COLOR } from "../lib/colors";

const CAT_ICON: Record<string, typeof Coffee> = { waiter: Coffee, courier: Bike, cashier: ShoppingBag, cook: ChefHat, retail: Store };

type Props = {
  job: Job | null;
  onClose: () => void;
  onApply: (a: Application) => void;
  saved: boolean;
  onToggleSave: () => void;
};

export function JobDetail({ job, onClose, onApply, saved, onToggleSave }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  if (!job) return null;
  const accent = CATEGORY_COLOR[job.category] ?? "#4285F4";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    onApply({
      id: crypto.randomUUID(),
      jobId: job.id,
      name: name.trim(),
      phone: phone.trim(),
      note: note.trim(),
      status: "PENDING",
      createdAt: Date.now(),
    });
    setSent(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex justify-end"
      onClick={onClose}
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" />
      <motion.div
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 36 }}
        className="relative w-full max-w-md h-full bg-white border-l border-[#E5E7EB] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: `linear-gradient(90deg,#4285F4,${accent},#34A853)` }}
        />
        <div className="sticky top-0 bg-white/85 backdrop-blur-md border-b border-[#E5E7EB] px-5 py-3 flex items-center gap-2 z-10">
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[#F3F4F6] flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-slate-600" />
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={onToggleSave}
              className="h-8 px-3 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] flex items-center gap-1.5 text-[12px] text-slate-700 transition-colors"
              style={{ fontWeight: 600 }}
            >
              {saved ? <BookmarkCheck className="w-3.5 h-3.5" style={{ color: "#EA4335" }} /> : <Bookmark className="w-3.5 h-3.5" />}
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        <div className="p-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4"
            style={{ background: accent }}
          >
            {(() => { const Icon = CAT_ICON[job.category] ?? Briefcase; return <Icon className="w-6 h-6" />; })()}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span
              className="px-2.5 py-1 rounded-lg text-white text-[11px]"
              style={{ background: "linear-gradient(90deg,#4285F4,#34A853)", fontWeight: 700 }}
            >
              {job.match}% match
            </span>
            {job.isAIParsed && (
              <span
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-white text-[10px]"
                style={{ background: "linear-gradient(90deg,#FBBC04,#EA4335)", fontWeight: 700 }}
              >
                <Sparkles className="w-2.5 h-2.5" /> AI parsed
              </span>
            )}
          </div>

          <h2 className="text-slate-900" style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.05 }}>
            {job.title}
          </h2>
          <div className="mt-2 flex items-center gap-2 text-[13px] text-slate-500" style={{ fontWeight: 500 }}>
            <span>{job.company}</span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{job.microdistrict} МКР</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-900" style={{ fontWeight: 700 }}>{job.salary}</span>
          </div>

          <p className="mt-5 text-[14px] text-slate-700 leading-relaxed" style={{ fontWeight: 500 }}>{job.description}</p>

          <div className="mt-6">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2" style={{ fontWeight: 700 }}>Requirements</div>
            <div className="flex flex-wrap gap-1.5">
              {job.requirements.map((r) => (
                <span key={r} className="px-2.5 py-1 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] text-[12px] text-slate-700" style={{ fontWeight: 600 }}>{r}</span>
              ))}
            </div>
          </div>

          <div className="mt-7 pt-6 border-t border-[#E5E7EB]">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-3" style={{ fontWeight: 700 }}>Apply</div>
            {sent ? (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-xl p-4 flex items-center gap-2 text-[13px] text-white"
                style={{ background: "linear-gradient(135deg,#34A853,#4285F4)", fontWeight: 600 }}
              >
                <Check className="w-4 h-4" /> Sent — employer notified via Telegram.
              </motion.div>
            ) : (
              <form onSubmit={submit} className="space-y-2.5">
                <Input value={name} onChange={setName} placeholder="Your name" />
                <Input value={phone} onChange={setPhone} placeholder="Phone / Telegram" />
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Short note (optional)"
                  rows={3}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#4285F4] focus:ring-4 focus:ring-[#4285F4]/10 resize-none transition-all"
                  style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}
                />
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full h-11 rounded-xl text-white text-[13px] disabled:opacity-40 shadow-lg"
                  disabled={!name.trim() || !phone.trim()}
                  style={{
                    background: "linear-gradient(135deg,#4285F4 0%,#34A853 100%)",
                    fontWeight: 700,
                    boxShadow: "0 12px 28px -8px rgba(66,133,244,0.5)",
                  }}
                >
                  Send Application →
                </motion.button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 h-11 text-[13px] outline-none focus:border-[#4285F4] focus:ring-4 focus:ring-[#4285F4]/10 transition-all"
      style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}
    />
  );
}
