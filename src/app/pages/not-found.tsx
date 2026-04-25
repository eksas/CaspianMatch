import { Link } from "react-router";
import { ArrowLeft, Waves, Search } from "lucide-react";
import { motion } from "motion/react";
import { Aurora } from "../components/aurora";
import { Logo } from "../components/logo";

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col relative text-slate-900" style={{ fontFamily: "'Montserrat',sans-serif" }}>
      <Aurora />
      <header className="h-16 px-6 flex items-center">
        <Logo />
      </header>
      <main className="flex-1 flex items-center px-6">
        <div className="max-w-5xl mx-auto w-full grid md:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-[#1B5A8F]/10 text-[#1B5A8F] text-[11px]" style={{ fontWeight: 600 }}>
              <Waves className="w-3 h-3" /> Lost at sea
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-5"
              style={{ fontSize: "clamp(44px,7vw,84px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.02 }}
            >
              This page <span style={{ color: "#1B5A8F" }}>drifted off.</span>
            </motion.h1>
            <p className="mt-5 text-[16px] text-slate-600 max-w-md" style={{ fontWeight: 500, lineHeight: 1.6 }}>
              We couldn't find what you were looking for. Maybe it moved, maybe it never existed — either way, let's get you back to solid ground.
            </p>
            <div className="mt-7 flex items-center gap-3 flex-wrap">
              <Link to="/" className="h-12 px-6 rounded-full bg-slate-900 text-white inline-flex items-center gap-2 hover:bg-[#1B5A8F] transition-colors" style={{ fontWeight: 600, fontSize: 14 }}>
                <ArrowLeft className="w-4 h-4" /> Back to home
              </Link>
              <Link to="/app/browse" className="h-12 px-6 rounded-full border border-slate-200 bg-white inline-flex items-center gap-2 hover:border-slate-900 transition-colors" style={{ fontWeight: 600, fontSize: 14 }}>
                <Search className="w-4 h-4" /> Browse jobs
              </Link>
            </div>
          </div>

          <div className="relative aspect-square max-w-md mx-auto w-full rounded-[40px] overflow-hidden" style={{ background: "#0A0A0A" }}>
            <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full" aria-hidden>
              <motion.path
                d="M0 260 Q 100 220, 200 260 T 400 260 L 400 400 L 0 400 Z"
                fill="rgba(29,74,245,0.3)"
                animate={{ x: [0, -30, 0] }}
                transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
              />
              <motion.path
                d="M0 300 Q 100 260, 200 300 T 400 300 L 400 400 L 0 400 Z"
                fill="#1B5A8F"
                animate={{ x: [0, 30, 0] }}
                transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.85, rotate: -6 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 12 }}
                className="text-white text-center"
              >
                <div style={{ fontSize: 140, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 0.9 }}>404</div>
                <div className="text-white/60 text-[12px] uppercase tracking-[0.2em] mt-2" style={{ fontWeight: 600 }}>
                  No such port
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
