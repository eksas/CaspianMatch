import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GraduationCap, ArrowUpRight, Zap } from "lucide-react";
import { C, EASE } from "../lib/design";
import { PearlDrawer } from "../components/pearl-drawer";

const LESSONS = [
  { id: "l1", title: "Бариста за 30 минут", mins: 30, boost: 12, topic: "КАФЕ" },
  { id: "l2", title: "Касса и эквайринг без ошибок", mins: 20, boost: 8, topic: "РИТЕЙЛ" },
  { id: "l3", title: "Логистика доставки в Актау", mins: 25, boost: 10, topic: "ДОСТАВКА" },
  { id: "l4", title: "Первый разговор с гостем", mins: 15, boost: 7, topic: "СЕРВИС" },
  { id: "l5", title: "Excel — базовые формулы", mins: 45, boost: 14, topic: "ОФИС" },
];

export function Mentor() {
  const [activeLesson, setActiveLesson] = useState<typeof LESSONS[0] | null>(null);

  return (
    <div>
      <header className="pb-6 border-b" style={{ borderColor: C.abyss }}>
        <div className="flex items-baseline justify-between pb-2">
          <span className="font-mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.abyss, fontWeight: 800 }}>
            ФУНКЦИЯ 03 · AI НАСТАВНИК
          </span>
          <span className="font-mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: C.tide500, fontWeight: 700 }}>
            {LESSONS.length.toString().padStart(2, "0")} УРОКОВ
          </span>
        </div>
        <h1 className="mt-6" style={{ fontSize: "clamp(44px,7vw,92px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.9, color: C.abyss }}>
          Прокачайся<br />
          <span style={{ fontStyle: "italic", color: C.coral }}>за обед.</span>
        </h1>
      </header>

      <ul className="mt-10">
        {LESSONS.map((l, i) => (
          <motion.li
            key={l.id}
            onClick={() => setActiveLesson(l)}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.04, ease: EASE.tide }}
            className="group grid grid-cols-[56px_1fr_auto] items-baseline gap-5 py-5 border-b cursor-pointer hover:pl-2 transition-all"
            style={{ borderColor: C.tide100 }}
          >
            <div className="font-mono tabular-nums" style={{ fontSize: 11, letterSpacing: "0.12em", color: C.tide500, fontWeight: 700 }}>
              {(i + 1).toString().padStart(2, "0")}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-3.5 h-3.5" style={{ color: C.tide700 }} />
                <span className="font-mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: C.tide500, fontWeight: 700 }}>
                  {l.topic} · {l.mins} МИН
                </span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.abyss, letterSpacing: "-0.02em" }}>
                {l.title}
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className="inline-flex items-center gap-1 font-mono" style={{ fontSize: 12, color: C.coral, fontWeight: 800 }}>
                <Zap className="w-3 h-3" /> +{l.boost} MATCH
              </span>
              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: C.abyss }} />
            </div>
          </motion.li>
        ))}
      </ul>
      
      {/* Launch AI Tutor via PearlDrawer */}
      <PearlDrawer 
        open={!!activeLesson} 
        onClose={() => setActiveLesson(null)} 
        initialMessage={activeLesson ? `Привет! Мы начинаем микро-курс "${activeLesson.title}". Я буду вести тебя шаг за шагом. Напиши "Готово", чтобы начать первый модуль!` : undefined} 
      />
    </div>
  );
}
