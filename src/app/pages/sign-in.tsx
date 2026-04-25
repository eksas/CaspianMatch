import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, AlertCircle, ShieldAlert } from "lucide-react";
import { useAuth } from "../lib/auth";

const C = {
  abyss: "#0F3057",
  depth: "#1B5A8F",
  foam: "#FBFDFF",
  coral: "#FF4D2E",
};

export function SignIn() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = (loc.state as { from?: string })?.from || "/app";
  const sessionExpired = !!(loc.state as any)?.sessionExpired;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState<"email" | "password" | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      const u = await signIn(email, password);
      nav(u.role === "EMPLOYER" ? "/app/employer" : from);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const canSubmit = email && password && !loading;

  return (
    <div
      className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-20"
      style={{ background: C.foam, fontFamily: "var(--font-sans)" }}
    >
      <div className="w-full max-w-sm">
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="text-center"
          style={{
            fontSize: "clamp(44px, 6vw, 68px)",
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: "-0.04em",
            color: C.abyss,
          }}
        >
          С возвращением.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-5"
          style={{ fontSize: 15, color: C.depth, fontWeight: 500, lineHeight: 1.55 }}
        >
          Войди, чтобы продолжить.
        </motion.p>

        <form onSubmit={submit} className="mt-12 space-y-6">
          <InkField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            focused={focus === "email"}
            onFocus={() => setFocus("email")}
            onBlur={() => setFocus(null)}
          />
          <InkField
            label="Пароль"
            type="password"
            value={password}
            onChange={setPassword}
            focused={focus === "password"}
            onFocus={() => setFocus("password")}
            onBlur={() => setFocus(null)}
          />

          <AnimatePresence>
            {sessionExpired && !err && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2 text-[12.5px]"
                style={{ color: "#B45309", fontWeight: 600 }}
              >
                <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                Сессия истекла. Войди снова.
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {err && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-[12.5px]"
                style={{ color: C.coral, fontWeight: 700 }}
              >
                <AlertCircle className="w-3.5 h-3.5" /> {err}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={!canSubmit}
            className="relative w-full h-14 inline-flex items-center justify-between px-6 group disabled:opacity-40"
            style={{
              background: canSubmit ? C.abyss : "#94A3B8",
              color: "white",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: C.coral }} />
              {loading ? "Входим…" : "Войти"}
            </span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        <div
          className="mt-14 pt-6 flex items-center justify-between gap-4"
          style={{ borderTop: `1px solid ${C.abyss}` }}
        >
          <span
            className="font-mono uppercase"
            style={{ fontSize: 11, color: C.depth, fontWeight: 700, letterSpacing: "0.18em" }}
          >
            Впервые здесь?
          </span>
          <Link
            to="/sign-up"
            className="group inline-flex items-center gap-1.5"
            style={{ color: C.abyss, fontWeight: 700, fontSize: 13 }}
          >
            Создать аккаунт
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function InkField({
  label, type, value, onChange, focused, onFocus, onBlur,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}) {
  return (
    <div className="relative">
      <div
        className="font-mono uppercase mb-1.5"
        style={{
          fontSize: 11,
          color: focused ? C.coral : C.depth,
          opacity: focused ? 1 : 0.7,
          fontWeight: 700,
          letterSpacing: "0.18em",
        }}
      >
        {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        autoComplete={type === "password" ? "current-password" : "email"}
        className="w-full bg-transparent outline-none py-2"
        style={{ fontSize: 20, fontWeight: 600, color: C.abyss, letterSpacing: "-0.015em" }}
      />
      <div className="relative h-[2px] w-full" style={{ background: "rgba(15,48,87,0.15)" }}>
        <motion.div
          className="absolute inset-y-0 left-0"
          style={{ background: C.abyss }}
          initial={false}
          animate={{ width: focused || value ? "100%" : "0%" }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
