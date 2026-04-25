import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from "motion/react";
import {
  Search, Mic, MapPin, ArrowRight, ArrowUpRight,
  Sparkles, MessageSquare, Users, Waves, Languages, Compass, Zap,
  Coffee, Bike, Hammer, ShoppingBag, ChefHat, Baby, Heart,
} from "lucide-react";
import { useJobs } from "../lib/store";
import { categoryIcon, C, EASE } from "../lib/design";

const SUGGESTIONS = [
  "Бариста · 14 МКР",
  "Выходные · подработка",
  "Стройка",
  "Удалённо",
];

const STATS = [
  { v: "1 240", l: "вакансий сейчас" },
  { v: "38", l: "микрорайонов" },
  { v: "2.3×", l: "чаще отклик" },
];

const TICKER: { icon: any; text: string }[] = [
  { icon: Coffee,       text: "Бариста · 14 МКР · 180 000 ₸" },
  { icon: Bike,         text: "Курьер · 11 МКР · сегодня" },
  { icon: Hammer,       text: "Строитель · 27 МКР · вахта" },
  { icon: ShoppingBag,  text: "Кассир · 6 МКР · смена" },
  { icon: ChefHat,      text: "Помощник повара · Маяк · вечер" },
  { icon: Baby,         text: "Няня · 32 МКР · 4 часа" },
];

export function Landing() {
  const navigate = useNavigate();
  const { jobs } = useJobs();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [chip, setChip] = useState(0);
  const barRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const waveY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroShift = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 40, damping: 18 });
  const sy = useSpring(my, { stiffness: 40, damping: 18 });
  const orbX = useTransform(sx, (v) => `${v * 100}%`);
  const orbY = useTransform(sy, (v) => `${v * 100}%`);

  useEffect(() => {
    const t = setInterval(() => setChip((c) => (c + 1) % SUGGESTIONS.length), 2400);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX / window.innerWidth);
      my.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  const submit = (value: string) => {
    const v = value.trim();
    if (!v) return;
    navigate(`/app/browse?q=${encodeURIComponent(v)}`);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); barRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative overflow-hidden" style={{ background: C.foam, color: C.abyss }}>
      {/* HERO */}
      <section ref={heroRef} className="relative min-h-[88vh] flex flex-col items-center justify-center px-6 pt-10">
        {/* Cursor-follow glow */}
        <motion.div
          style={{ left: orbX, top: orbY, translateX: "-50%", translateY: "-50%" }}
          className="pointer-events-none absolute w-[560px] h-[560px] rounded-full"
        >
          <div className="w-full h-full rounded-full" style={{
            background: "radial-gradient(circle, rgba(58,143,204,0.22) 0%, rgba(58,143,204,0) 60%)",
            filter: "blur(50px)",
          }} />
        </motion.div>

        {/* Floating circles */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 6, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[12%] left-[8%] w-20 h-20 rounded-full pointer-events-none"
          style={{ background: "linear-gradient(135deg,#3A8FCC,#8FB8D9)", opacity: 0.5, filter: "blur(2px)" }}
        />
        <motion.div
          animate={{ y: [0, 16, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[22%] right-[10%] w-14 h-14 rounded-full pointer-events-none"
          style={{ background: "linear-gradient(135deg,#8FB8D9,#D6E4F0)", opacity: 0.7 }}
        />
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[30%] left-[14%] w-10 h-10 rounded-full pointer-events-none"
          style={{ background: "#D6E4F0", opacity: 0.8 }}
        />

        {/* Ocean waves bottom */}
        <motion.svg
          style={{ y: waveY }}
          viewBox="0 0 1400 300" preserveAspectRatio="none"
          className="pointer-events-none absolute -bottom-1 left-0 w-full h-[36%]"
          aria-hidden
        >
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8FB8D9" stopOpacity="0" />
              <stop offset="100%" stopColor="#3A8FCC" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3A8FCC" stopOpacity="0" />
              <stop offset="100%" stopColor="#1B5A8F" stopOpacity="0.55" />
            </linearGradient>
          </defs>
          <motion.path
            animate={{ d: [
              "M0 170 Q 350 110, 700 170 T 1400 170 L 1400 300 L 0 300 Z",
              "M0 160 Q 350 210, 700 160 T 1400 160 L 1400 300 L 0 300 Z",
              "M0 170 Q 350 110, 700 170 T 1400 170 L 1400 300 L 0 300 Z",
            ] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            fill="url(#g1)"
          />
          <motion.path
            animate={{ d: [
              "M0 220 Q 350 170, 700 220 T 1400 220 L 1400 300 L 0 300 Z",
              "M0 210 Q 350 260, 700 210 T 1400 210 L 1400 300 L 0 300 Z",
              "M0 220 Q 350 170, 700 220 T 1400 220 L 1400 300 L 0 300 Z",
            ] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            fill="url(#g2)"
          />
        </motion.svg>

        <motion.div style={{ y: heroShift }} className="relative z-10 text-center w-full max-w-[760px]">
          {/* Pill */}
          {/* Wordmark stagger: Caspian (ink) + Match (coral italic) */}
          <h1 style={{ fontSize: "clamp(72px, 13vw, 168px)", lineHeight: 0.88, letterSpacing: "-0.055em", color: C.abyss, fontWeight: 900 }}>
            <span className="inline-block">
              {"Caspian".split("").map((ch, i) => (
                <motion.span
                  key={`c-${i}`}
                  initial={{ opacity: 0, y: 50, filter: "blur(14px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.1 + 0.06 * i, duration: 0.75, ease: EASE.splash }}
                  className="inline-block"
                >
                  {ch}
                </motion.span>
              ))}
            </span>
            <br />
            <motion.span
              initial={{ opacity: 0, x: -40, skewX: 12 }}
              animate={{ opacity: 1, x: 0, skewX: -8 }}
              transition={{ delay: 0.7, duration: 0.8, ease: EASE.splash }}
              className="inline-block relative"
              style={{ color: "#FF4D2E", fontStyle: "italic", fontWeight: 900, letterSpacing: "-0.04em" }}
            >
              Match
              <motion.svg
                viewBox="0 0 260 20"
                className="absolute left-0 right-0 -bottom-2 w-full"
                height="14"
                aria-hidden
              >
                <motion.path
                  d="M6 14 Q 65 2, 130 10 T 254 8"
                  stroke="#FF4D2E"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1.15, duration: 0.9, ease: EASE.splash }}
                />
              </motion.svg>
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.5 }}
            className="mt-5 text-[18px] max-w-lg mx-auto"
            style={{ color: C.depth, fontWeight: 500, lineHeight: 1.45 }}
          >
            Работа рядом. На глубине одного запроса.
          </motion.p>

          {/* Search */}
          <motion.form
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.6, ease: EASE.splash }}
            onSubmit={(e) => { e.preventDefault(); submit(q); }}
            className="relative mt-7 mx-auto max-w-[600px]"
          >
            <motion.div
              animate={{
                boxShadow: focused
                  ? "0 4px 16px rgba(27,90,143,0.12), 0 32px 72px -24px rgba(27,90,143,0.4)"
                  : "0 2px 8px rgba(15,48,87,0.05), 0 18px 40px -16px rgba(15,48,87,0.18)",
                scale: focused ? 1.015 : 1,
              }}
              transition={{ duration: 0.3, ease: EASE.splash }}
              className="relative flex items-center h-[60px] rounded-full bg-white px-5"
              style={{ border: `1.5px solid ${focused ? C.tide500 : "transparent"}` }}
            >
              <Search className="w-5 h-5 shrink-0" style={{ color: focused ? C.tide700 : C.tide500 }} />
              <div className="relative flex-1 h-full">
                <input
                  ref={barRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  className="w-full h-full bg-transparent outline-none pl-3 text-[16px]"
                  style={{ color: C.abyss, fontWeight: 500 }}
                />
                {!q && !focused && (
                  <div className="pointer-events-none absolute inset-0 flex items-center pl-3">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={chip}
                        initial={{ y: 12, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -12, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE.splash }}
                        className="text-[16px]"
                        style={{ color: "#8FB8D9", fontWeight: 500 }}
                      >
                        Найди «{SUGGESTIONS[chip]}»
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )}
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                className="w-10 h-10 rounded-full hover:bg-[#F0F7FC] flex items-center justify-center mr-1"
                style={{ color: C.tide700 }}
              >
                <Mic className="w-[18px] h-[18px]" />
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="h-10 px-5 rounded-full text-white inline-flex items-center gap-1.5"
                style={{ background: C.tide700, fontSize: 14, fontWeight: 600 }}
              >
                Нырнуть
              </motion.button>
            </motion.div>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s, i) => (
                <motion.button
                  key={s}
                  type="button"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.25 + i * 0.06, duration: 0.4 }}
                  whileHover={{ y: -2, scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => submit(s)}
                  className="px-3.5 h-8 rounded-full bg-white text-[12.5px]"
                  style={{ color: C.depth, fontWeight: 600, border: `1px solid ${C.tide100}` }}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.form>
        </motion.div>
      </section>

      {/* TICKER */}

      {/* STATS */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div
            className="font-mono text-[11px] uppercase mb-10"
            style={{ color: C.tide500, fontWeight: 600, letterSpacing: "0.2em" }}
          >
            Что делает CaspianMatch
          </div>

          {[
            { lead: "WhatsApp",        tail: "превращаем в живые вакансии" },
            { lead: "Район",           tail: "ищем работу в пешем радиусе от дома" },
            { lead: "Работодатели",    tail: "видны по поручительствам, а не по рекламе" },
          ].map((row, i) => (
            <motion.div
              key={row.lead}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: EASE.splash }}
              className="flex flex-col md:flex-row md:items-baseline md:gap-8 py-6"
              style={{ borderTop: `1px solid ${C.abyss}` }}
            >
              <div
                className="md:w-[240px] shrink-0"
                style={{
                  fontSize: "clamp(28px, 3.6vw, 44px)",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: C.abyss,
                  lineHeight: 1,
                }}
              >
                {row.lead}
              </div>
              <div
                className="mt-2 md:mt-0 flex-1"
                style={{
                  fontSize: "clamp(16px, 1.6vw, 20px)",
                  fontWeight: 500,
                  color: C.depth,
                  lineHeight: 1.4,
                  letterSpacing: "-0.01em",
                }}
              >
                {row.tail}
              </div>
            </motion.div>
          ))}

          <div
            className="h-px mt-0"
            style={{ background: C.abyss }}
          />
        </div>
      </section>

      {/* STEPS */}
      <section className="py-16 px-6" style={{ background: C.foam }}>
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE.splash }}
            className="text-center"
            style={{ fontSize: "clamp(32px, 5vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.035em", color: C.abyss, fontWeight: 700 }}
          >
            От запроса — до контакта <span style={{ color: C.tide500 }}>за 90 секунд</span>
          </motion.h2>

          <div className="mt-12 grid md:grid-cols-3 gap-4">
            {DIVES.map((d, i) => (
              <motion.div
                key={d.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: EASE.splash }}
                className="relative pt-6"
                style={{ borderTop: `1px solid ${C.abyss}` }}
              >
                <div className="flex items-baseline justify-between mb-5">
                  <span
                    className="font-mono text-[11px] uppercase"
                    style={{ color: C.depth, fontWeight: 600, letterSpacing: "0.18em" }}
                  >
                    0{i + 1} / 0{DIVES.length}
                  </span>
                  <d.Icon className="w-5 h-5" strokeWidth={1.6} style={{ color: C.abyss }} />
                </div>
                <h3
                  className="text-[24px] mb-3"
                  style={{ color: C.abyss, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1 }}
                >
                  {d.title}
                </h3>
                <p className="text-[14px]" style={{ color: C.depth, fontWeight: 500, lineHeight: 1.6 }}>
                  {d.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MATCH — creative editorial + animated connector */}
      <section className="relative py-24 px-6 overflow-hidden bg-white">
        <div className="max-w-5xl mx-auto">
          <div
            className="font-mono text-[11px] uppercase mb-6"
            style={{ color: C.tide500, fontWeight: 600, letterSpacing: "0.2em" }}
          >
            Anatomy of a match
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE.splash }}
            className="max-w-3xl"
            style={{ fontSize: "clamp(34px, 5.5vw, 60px)", lineHeight: 1.02, letterSpacing: "-0.035em", color: C.abyss, fontWeight: 800 }}
          >
            Два человека, один район,
            {" "}
            <span style={{ color: "#FF4D2E", fontStyle: "italic" }}>одна строка текста.</span>
          </motion.h2>

          {/* Diagram */}
          <div className="mt-16 grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-10">
            {/* Seeker side */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE.splash }}
            >
              <div
                className="font-mono text-[10px] uppercase mb-3"
                style={{ color: C.depth, fontWeight: 700, letterSpacing: "0.2em" }}
              >
                Seeker
              </div>
              <div
                style={{
                  fontSize: "clamp(20px, 2.2vw, 28px)",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: C.abyss,
                  lineHeight: 1.15,
                }}
              >
                «Ищу кухню<br />рядом с 14 мкр,<br />вечерние смены»
              </div>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {["14 МКР", "kitchen", "evening", "ru+kz"].map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center h-6 px-2 text-[10.5px] font-mono uppercase"
                    style={{
                      border: `1px solid ${C.abyss}`,
                      color: C.abyss,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Connector */}
            <div className="relative w-[80px] md:w-[160px] h-[180px] shrink-0">
              <svg
                viewBox="0 0 160 180"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full"
                aria-hidden
              >
                <motion.path
                  d="M0 30 C 60 30, 100 90, 160 90"
                  stroke={C.abyss}
                  strokeWidth="1.5"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: EASE.splash }}
                />
                <motion.path
                  d="M0 150 C 60 150, 100 90, 160 90"
                  stroke={C.abyss}
                  strokeWidth="1.5"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15, duration: 1, ease: EASE.splash }}
                />
                {/* pulsing node */}
                <motion.circle
                  cx={80}
                  cy={90}
                  r={6}
                  fill="#FF4D2E"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1, type: "spring", stiffness: 260, damping: 14 }}
                />
                <motion.circle
                  cx={80}
                  cy={90}
                  r={14}
                  fill="none"
                  stroke="#FF4D2E"
                  strokeWidth="1.5"
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: [0.8, 0, 0.8], scale: [0.4, 2.2, 0.4] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut", delay: 1.2 }}
                />
              </svg>
              <div
                className="absolute left-1/2 -translate-x-1/2 bottom-0 font-mono text-[10px] uppercase"
                style={{ color: C.depth, fontWeight: 700, letterSpacing: "0.2em" }}
              >
                match
              </div>
            </div>

            {/* Employer side */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6, ease: EASE.splash }}
              className="text-right"
            >
              <div
                className="font-mono text-[10px] uppercase mb-3"
                style={{ color: C.depth, fontWeight: 700, letterSpacing: "0.2em" }}
              >
                Employer · WhatsApp
              </div>
              <div
                style={{
                  fontSize: "clamp(20px, 2.2vw, 28px)",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: C.abyss,
                  lineHeight: 1.15,
                }}
              >
                «Срочно помощник<br />повара, Шаурма №1,<br />18:00–00:00»
              </div>
              <div className="mt-5 flex flex-wrap gap-1.5 justify-end">
                {["Шаурма №1", "cook", "evening", "14 МКР"].map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center h-6 px-2 text-[10.5px] font-mono uppercase"
                    style={{
                      border: `1px solid ${C.abyss}`,
                      color: C.abyss,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Match strip */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6, ease: EASE.splash }}
            className="mt-16 flex items-center gap-5"
            style={{ borderTop: `1px solid ${C.abyss}`, paddingTop: 28 }}
          >
            <span
              className="font-mono text-[11px] uppercase"
              style={{ color: C.depth, fontWeight: 600, letterSpacing: "0.18em" }}
            >
              Gemini parses · in 2.1s
            </span>
            <span className="flex-1 h-px" style={{ background: C.abyss, opacity: 0.25 }} />
            <Link
              to="/sign-up"
              className="group inline-flex items-center gap-2"
              style={{ color: C.abyss, fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em" }}
            >
              Run a match on yourself
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* MANIFESTO / WHY */}
      <section className="py-24 px-6 relative overflow-hidden" style={{ background: C.foam }}>
        {/* decorative oversized word */}
        <div
          aria-hidden
          className="absolute -top-6 right-[-4vw] pointer-events-none select-none hidden md:block"
          style={{
            fontSize: "clamp(140px, 20vw, 280px)",
            fontWeight: 900,
            letterSpacing: "-0.06em",
            color: C.abyss,
            opacity: 0.04,
            lineHeight: 0.85,
            fontStyle: "italic",
          }}
        >
          Aktau
        </div>

        <div className="max-w-[1200px] mx-auto relative">
          <div className="grid md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5">
              <div
                className="font-mono text-[10.5px] uppercase mb-6 inline-flex items-center gap-2"
                style={{ color: C.depth, fontWeight: 700, letterSpacing: "0.22em" }}
              >
                <span className="w-6 h-px" style={{ background: C.abyss }} /> Почему иначе
              </div>
              <motion.h2
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6 }}
                style={{ fontSize: "clamp(36px, 5.2vw, 68px)", lineHeight: 0.98, letterSpacing: "-0.04em", color: C.abyss, fontWeight: 800 }}
              >
                Сделано<br />для Актау.<br />
                <span style={{ color: "#FF4D2E", fontStyle: "italic" }}>Не для&nbsp;HR.</span>
              </motion.h2>
              <p
                className="mt-6 max-w-sm"
                style={{ fontSize: 15, color: C.depth, fontWeight: 500, lineHeight: 1.55 }}
              >
                Никакого резюме с шаблонами. Никаких «лидов». Только живой язык города — и алгоритм, который знает, где 14-й микрорайон.
              </p>
            </div>

            <div className="md:col-span-7">
              <ManifestoLine
                index="01"
                delay={0}
                lead="Жемчуг"
                tail="AI-наставник, который пишет био из трёх вопросов, переводит с казахского и репетирует звонок работодателю."
                icon={Sparkles}
              />
              <ManifestoLine
                index="02"
                delay={0.08}
                lead="20 секунд"
                tail="Вставляешь сообщение из WhatsApp — CaspianMatch превращает его в структурированную вакансию."
                icon={Zap}
              />
              <ManifestoLine
                index="03"
                delay={0.16}
                lead="38 мкр"
                tail="Каждый микрорайон имеет вес. Ранжируем по пешей доступности, а не по рекламному бюджету."
                icon={Compass}
              />
              <ManifestoLine
                index="04"
                delay={0.24}
                lead="RU · KZ"
                tail="Два языка в одном окне — пиши, как говоришь. Gemini разбирает оба без потери смысла."
                icon={Languages}
                last
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA — oversized editorial closer */}
      <section className="relative px-6 overflow-hidden" style={{ background: C.abyss, color: "white" }}>
        {/* Drifting horizon lines */}
        <svg viewBox="0 0 1400 600" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <motion.path
              key={i}
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.35 - i * 0.07 }}
              viewport={{ once: true }}
              transition={{ duration: 2 + i * 0.4, delay: i * 0.15, ease: EASE.tide }}
              d={`M0 ${300 + i * 60} Q 350 ${240 + i * 50}, 700 ${300 + i * 60} T 1400 ${300 + i * 60}`}
              stroke={["#FF4D2E", "#3A8FCC", "#8FB8D9", "#D6E4F0"][i]}
              strokeWidth={1.4 - i * 0.2}
              fill="none"
            />
          ))}
        </svg>

        {/* top meta rule */}
        <div className="relative max-w-[1200px] mx-auto pt-10">
          <div
            className="font-mono text-[10.5px] uppercase flex items-center gap-3"
            style={{ color: "rgba(214,228,240,0.6)", fontWeight: 700, letterSpacing: "0.22em" }}
          >
            <span className="flex-1 h-px" style={{ background: "rgba(214,228,240,0.2)" }} />
            <span>Aktau · 43.65°N · 51.16°E</span>
            <span className="flex-1 h-px" style={{ background: "rgba(214,228,240,0.2)" }} />
          </div>
        </div>

        <div className="relative max-w-[1200px] mx-auto pt-14 pb-24 grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-8">
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE.splash }}
              style={{
                fontSize: "clamp(56px, 10vw, 168px)",
                lineHeight: 0.88,
                letterSpacing: "-0.055em",
                fontWeight: 900,
              }}
            >
              Найди<br />
              работу&nbsp;
              <motion.span
                initial={{ opacity: 0, x: -30, skewX: 10 }}
                whileInView={{ opacity: 1, x: 0, skewX: -8 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.8, ease: EASE.splash }}
                className="inline-block relative"
                style={{ color: "#FF4D2E", fontStyle: "italic" }}
              >
                рядом.
                <motion.svg
                  viewBox="0 0 260 20"
                  className="absolute left-0 right-0 -bottom-2 w-full"
                  height="14"
                  aria-hidden
                >
                  <motion.path
                    d="M6 14 Q 65 2, 130 10 T 254 8"
                    stroke="#FF4D2E"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1, duration: 0.9, ease: EASE.splash }}
                  />
                </motion.svg>
              </motion.span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-8 max-w-lg"
              style={{ color: "rgba(214,228,240,0.85)", fontSize: 17, fontWeight: 500, lineHeight: 1.5 }}
            >
              CaspianMatch — не доска объявлений. Это морская глубина одного запроса:
              скажи, что ищешь, и город откликнется.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="md:col-span-4 flex flex-col gap-4 md:items-end"
          >
            <Link
              to="/sign-up"
              className="group h-14 pl-5 pr-6 inline-flex items-center gap-3 relative overflow-hidden"
              style={{ background: "#FF4D2E", color: "white", fontWeight: 800, fontSize: 15, letterSpacing: "-0.005em" }}
            >
              <motion.span
                aria-hidden
                className="absolute inset-0"
                style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%)" }}
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
              />
              <span className="relative">Нырнуть в CaspianMatch</span>
              <ArrowRight className="relative w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/sign-up?role=employer"
              className="h-12 px-5 inline-flex items-center gap-2 group"
              style={{
                border: "1px solid rgba(214,228,240,0.35)",
                color: "#D6E4F0",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Я работодатель
              <span className="inline-block transition-transform group-hover:translate-x-1" aria-hidden>→</span>
            </Link>

            <div
              className="font-mono text-[10.5px] uppercase mt-2 inline-flex items-center gap-2"
              style={{ color: "rgba(214,228,240,0.55)", fontWeight: 600, letterSpacing: "0.2em" }}
            >
              <Heart className="w-3 h-3" fill="currentColor" style={{ color: "#FF4D2E" }} />
              Сделано в Актау
            </div>
          </motion.div>
        </div>

        {/* Oversized wordmark watermark */}
        <div
          aria-hidden
          className="relative max-w-[1200px] mx-auto pb-6 pointer-events-none select-none"
          style={{
            fontSize: "clamp(80px, 16vw, 260px)",
            fontWeight: 900,
            letterSpacing: "-0.065em",
            lineHeight: 0.82,
            color: "rgba(255,255,255,0.06)",
          }}
        >
          CaspianMatch<span style={{ color: "rgba(255,77,46,0.45)" }}>.</span>
        </div>
      </section>
    </div>
  );
}

function ManifestoLine({
  index,
  lead,
  tail,
  icon: Icon,
  delay,
  last,
}: {
  index: string;
  lead: string;
  tail: string;
  icon: any;
  delay: number;
  last?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: EASE.splash }}
      className="group grid grid-cols-[auto_auto_1fr] items-start gap-5 md:gap-7 py-6"
      style={{
        borderTop: `1px solid ${C.abyss}`,
        borderBottom: last ? `1px solid ${C.abyss}` : "none",
      }}
    >
      <span
        className="font-mono text-[11px] pt-1"
        style={{ color: C.depth, fontWeight: 700, letterSpacing: "0.18em" }}
      >
        {index}
      </span>
      <span
        className="inline-flex items-center justify-center w-9 h-9 transition-transform group-hover:-rotate-6"
        style={{ border: `1px solid ${C.abyss}`, color: C.abyss }}
      >
        <Icon className="w-4 h-4" strokeWidth={2} />
      </span>
      <div>
        <div
          style={{
            fontSize: "clamp(22px, 2.4vw, 30px)",
            fontWeight: 800,
            letterSpacing: "-0.028em",
            color: C.abyss,
            lineHeight: 1.05,
          }}
        >
          {lead}
        </div>
        <p
          className="mt-2 max-w-xl"
          style={{ fontSize: 14.5, color: C.depth, fontWeight: 500, lineHeight: 1.55 }}
        >
          {tail}
        </p>
      </div>
    </motion.div>
  );
}

const DIVES = [
  { title: "Скажи или напиши", body: "Голосом или текстом. Gemini понимает роль, район и оплату с одного запроса.", Icon: Waves },
  { title: "Совпадения",       body: "Близость, навыки, график — каждой вакансии своя оценка.",                       Icon: Compass },
  { title: "Контакт",          body: "Одобрил отклик — номер приходит в Telegram. Жемчуг поможет со звонком.",        Icon: MessageSquare },
];
