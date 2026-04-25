import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquareText, ArrowRight, CheckCircle2 } from "lucide-react";
import { C, EASE } from "../lib/design";

const Q = [
  "Расскажи о себе за 30 секунд.",
  "Почему именно эта вакансия?",
  "Сложная ситуация на прошлой работе — как решил?",
];

export function Interviewer() {
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState<string[]>(["", "", ""]);
  const done = step >= Q.length;

  return (
    <div>
      <header className="pb-6 border-b" style={{ borderColor: C.abyss }}>
        <div className="flex items-baseline justify-between pb-2">
          <span className="font-mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.abyss, fontWeight: 800 }}>
            ФУНКЦИЯ 02 · AI SHADOW INTERVIEW
          </span>
          <span className="font-mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: C.tide500, fontWeight: 700 }}>
            {done ? "ЗАВЕРШЕНО" : `${step + 1} / ${Q.length}`}
          </span>
        </div>
        <h1 className="mt-6" style={{ fontSize: "clamp(40px,6vw,80px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.92, color: C.abyss }}>
          Репетируй<br />
          <span style={{ fontStyle: "italic", color: C.coral }}>интервью</span> с AI.
        </h1>
      </header>

      <div className="mt-12 max-w-2xl">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: EASE.splash }}
            >
              <div className="flex items-start gap-3">
                <MessageSquareText className="w-5 h-5 mt-2 shrink-0" style={{ color: C.coral }} />
                <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", color: C.abyss, lineHeight: 1.2 }}>
                  {Q[step]}
                </div>
              </div>

              <textarea
                value={ans[step]}
                onChange={(e) => {
                  const next = [...ans]; next[step] = e.target.value; setAns(next);
                }}
                rows={5}
                placeholder="Твой ответ…"
                className="mt-8 w-full bg-transparent outline-none py-3 border-b"
                style={{ fontSize: 17, fontWeight: 500, color: C.abyss, borderColor: C.abyss }}
              />

              <button
                onClick={() => setStep(step + 1)}
                disabled={!ans[step].trim()}
                className="mt-8 h-12 px-6 inline-flex items-center gap-2 disabled:opacity-40"
                style={{ background: C.abyss, color: "white", fontWeight: 800, fontSize: 13 }}
              >
                <span>{step === Q.length - 1 ? "Закончить" : "Следующий"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="p-8 text-white" style={{ background: C.abyss }}
            >
              <CheckCircle2 className="w-6 h-6 mb-3" style={{ color: C.coral }} />
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
                Готово. Ты прогнал 3 вопроса.
              </div>
              <div className="mt-2 text-[13px] opacity-80" style={{ fontStyle: "italic" }}>
                — Реальное интервью пройдёт легче.
              </div>
              <button
                onClick={() => { setStep(0); setAns(["", "", ""]); }}
                className="mt-6 h-10 px-4 inline-flex items-center gap-2"
                style={{ background: C.coral, color: "white", fontWeight: 800, fontSize: 12 }}
              >
                Ещё раз <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
