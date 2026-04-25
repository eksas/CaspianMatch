import { useState } from "react";
import { useParams, Link } from "react-router";
import { motion } from "motion/react";
import { Users, ArrowRight, Check, Waves } from "lucide-react";
import { C, EASE } from "../lib/design";
import { submitVouch, useVouches } from "../lib/trio";

export function VouchPublic() {
  const { userId } = useParams();
  const { vouches, userName } = useVouches(userId);
  const [fromName, setFromName] = useState("");
  const [fromPhone, setFromPhone] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!userId) return <div className="p-10">Ссылка повреждена.</div>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromName.trim() || !fromPhone.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      await submitVouch({ toUserId: userId, fromName: fromName.trim(), fromPhone: fromPhone.trim(), note: note.trim() });
      setSent(true);
    } catch (e: any) {
      setErr(e?.message ?? "Не получилось отправить");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: C.foam, fontFamily: "var(--font-sans)", color: C.abyss }}>
      {/* Ambient waves */}
      <svg viewBox="0 0 1200 400" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 w-full h-[380px] pointer-events-none" aria-hidden>
        <motion.path
          d="M0 260 Q 300 200, 600 260 T 1200 260 L 1200 400 L 0 400 Z"
          fill={C.tide100}
          animate={{ d: ["M0 260 Q 300 200, 600 260 T 1200 260 L 1200 400 L 0 400 Z","M0 260 Q 300 300, 600 260 T 1200 260 L 1200 400 L 0 400 Z","M0 260 Q 300 200, 600 260 T 1200 260 L 1200 400 L 0 400 Z"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M0 310 Q 300 270, 600 310 T 1200 310 L 1200 400 L 0 400 Z"
          fill={C.tide50}
          animate={{ d: ["M0 310 Q 300 270, 600 310 T 1200 310 L 1200 400 L 0 400 Z","M0 310 Q 300 340, 600 310 T 1200 310 L 1200 400 L 0 400 Z","M0 310 Q 300 270, 600 310 T 1200 310 L 1200 400 L 0 400 Z"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      <div className="relative max-w-xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <Waves className="w-4 h-4" style={{ color: C.tide500 }} />
          <span style={{ fontWeight: 800, letterSpacing: "-0.02em", color: C.abyss, fontSize: 16 }}>
            Caspian<span style={{ color: "#FF4D2E", fontStyle: "italic" }}>Match</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4" style={{ color: C.tide500 }} />
          <span className="text-[11px] font-mono" style={{ color: C.tide500, letterSpacing: "0.18em", fontWeight: 600 }}>SWELL · РЕКОМЕНДАЦИЯ</span>
        </div>
        <h1 style={{ fontSize: "clamp(32px,5vw,46px)", fontWeight: 800, letterSpacing: "-0.035em", color: C.abyss, lineHeight: 1.05 }}>
          Поручись за{userName ? ` ${userName.split(" ")[0]}` : " друга"}.
        </h1>
        <p className="mt-3 text-[14px] max-w-md" style={{ color: C.depth, fontWeight: 500, lineHeight: 1.55 }}>
          Одна рекомендация увеличивает шанс отклика в 2.3×. Это займёт 30 секунд.
        </p>

        {vouches.length > 0 && (
          <div className="mt-5 inline-flex items-center gap-2 h-8 px-3 rounded-full" style={{ background: C.kelp, color: "white", fontWeight: 700 }}>
            <Users className="w-3 h-3" />
            <span className="text-[12px]">Уже {vouches.length} рекомендаци{vouches.length === 1 ? "я" : vouches.length < 5 ? "и" : "й"}</span>
          </div>
        )}

        {sent ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE.splash }}
            className="mt-8 rounded-2xl p-6 text-white text-center"
            style={{ background: `linear-gradient(135deg, ${C.kelp}, ${C.tide700})` }}
          >
            <Check className="w-8 h-8 mx-auto mb-3" strokeWidth={2.5} />
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>Спасибо!</div>
            <div className="text-[13px] mt-2 opacity-90" style={{ fontWeight: 500 }}>
              Твоя рекомендация добавлена. {userName ?? "Друг"} увидит её при следующем отклике.
            </div>
          </motion.div>
        ) : (
          <form onSubmit={submit} className="mt-8 rounded-2xl border p-5 space-y-3" style={{ background: "white", borderColor: C.tide100 }}>
            <Field label="Твоё имя" value={fromName} onChange={setFromName} placeholder="Айгерим" />
            <Field label="Телефон" value={fromPhone} onChange={setFromPhone} placeholder="+7 702 ..." />
            <div>
              <div className="text-[10px] font-mono mb-1.5" style={{ color: C.tide500, letterSpacing: "0.14em", fontWeight: 600 }}>ПАРА СЛОВ (не обязательно)</div>
              <textarea
                value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                maxLength={240}
                placeholder="Работали вместе полгода, ответственный, быстро учится."
                className="w-full rounded-xl border bg-white px-3.5 py-2.5 text-[13px] outline-none resize-none"
                style={{ borderColor: C.tide100, fontWeight: 500, color: C.abyss, fontFamily: "var(--font-sans)", lineHeight: 1.5 }}
              />
            </div>
            {err && <div className="text-[12px] px-2" style={{ color: C.coral, fontWeight: 600 }}>{err}</div>}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!fromName.trim() || !fromPhone.trim() || busy}
              className="w-full h-12 rounded-full text-white inline-flex items-center justify-center gap-2 text-[14px] disabled:opacity-40"
              style={{ background: C.abyss, fontWeight: 700, letterSpacing: "-0.01em" }}
            >
              {busy ? "Отправляем…" : (<>Поручиться <ArrowRight className="w-3.5 h-3.5" /></>)}
            </motion.button>
            <div className="text-[10.5px] text-center pt-1" style={{ color: C.tide500, fontWeight: 500 }}>
              Работодатель увидит имя, не телефон. 3 рекомендации в неделю с одного телефона.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <div className="text-[10px] font-mono mb-1.5" style={{ color: C.tide500, letterSpacing: "0.14em", fontWeight: 600 }}>{label.toUpperCase()}</div>
      <input
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full h-11 px-3.5 rounded-full border bg-white text-[13.5px] outline-none"
        style={{ borderColor: C.tide100, fontWeight: 500, color: C.abyss }}
      />
    </div>
  );
}
