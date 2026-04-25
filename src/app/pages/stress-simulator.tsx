import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, ShieldAlert, ArrowRight, RefreshCcw, CheckCircle2 } from "lucide-react";
import { C, EASE } from "../lib/design";

const SCENARIOS = [
  {
    id: "s1",
    scenario: "Полный зал гостей. Вы один на кассе. Внезапно зависает терминал оплаты, а очередь начинает возмущаться.",
    options: [
      { text: "Громко извиниться перед всеми и попросить подождать", stressPoints: 20 },
      { text: "Молча и быстро перезагрузить терминал, игнорируя крики", stressPoints: 10 },
      { text: "Улыбнуться, предложить пока выбрать десерты и позвать менеджера", stressPoints: 30 },
      { text: "Запаниковать и попытаться пробить заказ на другом кассовом аппарате без предупреждения", stressPoints: 0 },
    ]
  },
  {
    id: "s2",
    scenario: "Постоянный клиент гневно жалуется, что вы принесли ему остывший кофе, хотя вы сделали его буквально минуту назад.",
    options: [
      { text: "Начать доказывать, что кофе горячий, ведь вы его только сделали", stressPoints: 0 },
      { text: "Сразу извиниться и без вопросов переделать напиток", stressPoints: 30 },
      { text: "Спросить, хочет ли он подогреть его в микроволновке", stressPoints: 5 },
      { text: "Тактично уточнить, что возможно проблема в самой кружке, и предложить новый с комплиментом", stressPoints: 25 },
    ]
  },
  {
    id: "s3",
    scenario: "Конец смены (осталось 5 минут), вы уже переоделись. Приходит ваш сменщик и говорит, что опоздает на час.",
    options: [
      { text: "Отказаться и уйти домой, ведь ваша смена окончена", stressPoints: 5 },
      { text: "Согласиться остаться на час, но потребовать оплату переработки у менеджера", stressPoints: 25 },
      { text: "Без проблем выручить коллегу, мало ли что случилось", stressPoints: 30 },
      { text: "Остаться, но всю смену злиться и жаловаться другим", stressPoints: 10 },
    ]
  }
];

export function StressSimulator() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (points: number) => {
    setScore(score + points);
    if (step < SCENARIOS.length - 1) {
      setStep(step + 1);
    } else {
      setFinished(true);
    }
  };

  const reset = () => {
    setStep(0);
    setScore(0);
    setFinished(false);
  };

  const getLevel = () => {
    const percentage = Math.round((score / (SCENARIOS.length * 30)) * 100);
    if (percentage >= 80) return { label: "Алмазная выдержка", color: "#0D5D5A", desc: "Вы — настоящая стена Спокойствия. Не теряете голову в хаосе." };
    if (percentage >= 50) return { label: "Стабильный профи", color: C.coral, desc: "Хороший уровень контроля, но в пиковые моменты бывает тяжело." };
    return { label: "Чувствительный край", color: "#D14343", desc: "Стресс легко выбивает вас из колеи. Стоит потренировать реакцию на критику." };
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl mb-6 bg-slate-100 text-slate-800">
          <Activity className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: C.abyss }}>Стресс-симулятор</h1>
        <p className="text-lg text-slate-500 font-medium font-mono tracking-wide">ФУНКЦИЯ 04 · CASPIANMATCH</p>
      </header>

      <AnimatePresence mode="wait">
        {!finished ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ ease: EASE.splash }}
            className="bg-white rounded-[32px] p-8 shadow-xl border border-slate-100"
          >
            <div className="flex items-center justify-between mb-8">
              <span className="font-mono text-sm tracking-widest text-slate-400 font-bold">СИТУАЦИЯ {step + 1}/{SCENARIOS.length}</span>
              <div className="flex gap-1">
                {SCENARIOS.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i === step ? "bg-[#1B5A8F]" : i < step ? "bg-slate-300" : "bg-slate-100"}`} />
                ))}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 leading-snug mb-8">
              {SCENARIOS[step].scenario}
            </h2>

            <div className="space-y-3">
              {SCENARIOS[step].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt.stressPoints)}
                  className="w-full text-left p-5 rounded-2xl border-2 border-slate-100 hover:border-[#1B5A8F] hover:bg-slate-50 transition-all group flex gap-4 items-center"
                >
                  <div className="w-8 h-8 rounded-full border-2 border-slate-200 group-hover:border-[#1B5A8F] flex items-center justify-center flex-shrink-0 text-slate-400 group-hover:text-[#1B5A8F] transition-colors">
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className="font-medium text-slate-700">{opt.text}</span>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] p-10 text-center shadow-2xl border border-slate-100"
          >
            <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6" style={{ background: `${getLevel().color}15`, color: getLevel().color }}>
              <ShieldAlert className="w-12 h-12" />
            </div>
            
            <h2 className="text-3xl font-extrabold mb-2" style={{ color: C.abyss }}>Ваша устойчивость:</h2>
            <div className="text-[54px] font-black tracking-tight mb-4 tabular-nums" style={{ color: getLevel().color, lineHeight: 1 }}>
              {Math.round((score / (SCENARIOS.length * 30)) * 100)}%
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 font-bold" style={{ background: getLevel().color, color: "white" }}>
              <CheckCircle2 className="w-5 h-5" />
              {getLevel().label}
            </div>

            <p className="text-lg text-slate-500 font-medium max-w-md mx-auto mb-10 leading-relaxed">
              {getLevel().desc}
            </p>

            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
            >
              <RefreshCcw className="w-5 h-5" /> Попробовать снова
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
