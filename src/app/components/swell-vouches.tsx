import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Share2, Check, Copy } from "lucide-react";
import { C, EASE } from "../lib/design";
import type { Vouch } from "../lib/trio";

export function VouchList({ vouches }: { vouches: Vouch[] }) {
  if (vouches.length === 0) {
    return (
      <div className="text-[12px]" style={{ color: C.tide500, fontWeight: 500 }}>
        Пока без рекомендаций.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {vouches.slice(0, 5).map((v, i) => (
        <motion.div
          key={v.id}
          initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05, duration: 0.35, ease: EASE.splash }}
          className="rounded-xl p-3 border"
          style={{ background: "white", borderColor: C.tide100 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white" style={{ background: C.tide700, fontWeight: 800 }}>
              {v.fromName.charAt(0).toUpperCase()}
            </div>
            <span className="text-[12.5px]" style={{ color: C.abyss, fontWeight: 700 }}>{v.fromName}</span>
            <span className="text-[10.5px] font-mono" style={{ color: C.tide500, letterSpacing: "0.06em", fontWeight: 500 }}>{v.fromPhone}</span>
          </div>
          {v.note && (
            <div className="text-[12.5px]" style={{ color: C.depth, fontWeight: 500, lineHeight: 1.5 }}>
              «{v.note}»
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

export function VouchCountPill({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px]" style={{ background: C.kelp, color: "white", fontWeight: 700 }}>
      <Users className="w-3 h-3" strokeWidth={2.4} />
      {count} рекомендац{count === 1 ? "ия" : count < 5 ? "ии" : "ий"}
    </span>
  );
}

export function VouchRequestCard({ userId }: { userId: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/vouch/${userId}` : `/vouch/${userId}`;

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };

  const share = async () => {
    const text = "Поручись за меня на CaspianMatch — это увеличивает шанс отклика.";
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try { await (navigator as any).share({ title: "CaspianMatch · Swell", text, url }); return; } catch {}
    }
    copy();
  };

  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: C.tide100, background: "white" }}>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: `linear-gradient(135deg, ${C.tide500}, ${C.tide700})` }}>
          <Users className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[15px]" style={{ fontWeight: 800, letterSpacing: "-0.02em", color: C.abyss }}>Swell · рекомендации</div>
          <div className="text-[12px] mt-0.5" style={{ color: C.depth, fontWeight: 500, lineHeight: 1.45 }}>
            Попроси друга поручиться — шанс отклика ×2.3.
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 h-10 rounded-full border px-3 mb-3" style={{ borderColor: C.tide100, background: C.tide50 }}>
        <div className="flex-1 text-[11.5px] font-mono truncate" style={{ color: C.depth, letterSpacing: "0.02em", fontWeight: 500 }}>{url}</div>
        <button onClick={copy} className="h-7 px-2.5 rounded-full inline-flex items-center gap-1 text-[11px]" style={{ background: "white", color: C.tide700, fontWeight: 700 }}>
          {copied ? <><Check className="w-3 h-3" /> Скопировано</> : <><Copy className="w-3 h-3" /> Копировать</>}
        </button>
      </div>

      <button
        onClick={share}
        className="w-full h-11 rounded-full text-white inline-flex items-center justify-center gap-2 text-[13px]"
        style={{ background: C.abyss, fontWeight: 700, letterSpacing: "-0.01em" }}
      >
        <Share2 className="w-3.5 h-3.5" /> Поделиться ссылкой
      </button>
    </div>
  );
}

export function VouchSuccessToast({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE.splash }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full px-5 h-12 flex items-center gap-2 text-white text-[13px]"
          style={{ background: C.kelp, fontWeight: 700, boxShadow: "0 18px 40px -12px rgba(13,93,90,0.4)" }}
        >
          <Check className="w-4 h-4" /> Рекомендация принята · спасибо!
        </motion.div>
      )}
    </AnimatePresence>
  );
}
