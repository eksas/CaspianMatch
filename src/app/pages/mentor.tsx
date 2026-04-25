import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GraduationCap, ArrowUpRight, Zap, X, BookOpen, CheckCircle2 } from "lucide-react";
import { C, EASE } from "../lib/design";

type Lesson = {
  id: string;
  title: string;
  mins: number;
  boost: number;
  topic: string;
  content: { title: string; text: string; list?: string[] }[];
};

const LESSONS: Lesson[] = [
  {
    id: "l1",
    title: "Охрана и безопасность (Security в баре)",
    mins: 25,
    boost: 15,
    topic: "БЕЗОПАСНОСТЬ",
    content: [
      {
        title: "1. Главная задача — предотвращение, а не конфликт",
        text: "Хороший охранник работает на опережение. Следите за языком тела гостей. Если кто-то начинает слишком громко разговаривать или вести себя агрессивно — подойдите, поздоровайтесь, спросите, все ли в порядке. Часто простое внимание сбивает агрессию."
      },
      {
        title: "2. Контроль на входе (Фейс-контроль)",
        text: "Оценивайте не только внешний вид, но и состояние человека. Если гость уже пришел в состоянии сильного опьянения, вежливо, но твердо откажите во входе. Не вступайте в долгие споры.",
        list: [
          "«Извините, сегодня вход закрыт»",
          "«К сожалению, правила заведения не позволяют пустить вас в таком состоянии»"
        ]
      },
      {
        title: "3. Правила общения при конфликте",
        text: "Ваша поза и тон голоса решают 90% успеха при решении конфликта.",
        list: [
          "Не повышайте голос: говорите спокойно и уверенно.",
          "Соблюдайте дистанцию: стойте на расстоянии вытянутой руки.",
          "Используйте «открытые руки»: держите руки перед собой, не скрещивайте их на груди (это вызывает агрессию) и не прячьте в карманы."
        ]
      },
      {
        title: "4. Алгоритм вывода из зала",
        text: "Никогда не применяйте силу первыми, если нет прямой угрозы жизни или здоровью других гостей. Предложите гостю выйти на улицу «поговорить» или «подышать свежим воздухом». Если гость отказывается и продолжает нарушать порядок, действуйте в команде с напарником: один блокирует обзор, второй мягко сопровождает гостя к выходу."
      }
    ]
  },
  {
    id: "l2",
    title: "Бариста за 30 минут: Эспрессо и Вспенивание",
    mins: 30,
    boost: 12,
    topic: "КАФЕ",
    content: [
      {
        title: "1. Идеальный эспрессо (База)",
        text: "Эспрессо — это основа почти всех напитков. Оптимальное время экстракции составляет 20-30 секунд. Если шот льется быстрее — помол слишком крупный (будет кислым). Если дольше 30 секунд — помол мелкий (будет горьким)."
      },
      {
        title: "2. Работа с холдером (Темперовка)",
        text: "Кофе в холдере нужно спрессовать ровно. Обоприте холдер о край стола, возьмите темпер как дверную ручку и надавите сверху вниз с усилием около 15 кг. Главное — чтобы таблетка была идеально ровной (параллельно краям холдера)."
      },
      {
        title: "3. Идеальная молочная пена (Микропена)",
        text: "Для латте-арта нужна микропена без крупных пузырей. Как ее сделать:",
        list: [
          "Опустите носик стимера чуть ниже поверхности холодного молока.",
          "Включите пар на полную мощность.",
          "Первые 3-5 секунд впускайте воздух (будет слышен характерный звук бумажного надрыва).",
          "Затем погрузите носик чуть глубже и создайте воронку. Молоко должно вращаться и перемешиваться."
        ]
      }
    ]
  },
  {
    id: "l3",
    title: "Касса и эквайринг без ошибок",
    mins: 20,
    boost: 8,
    topic: "РИТЕЙЛ",
    content: [
      {
        title: "1. Проверка наличных",
        text: "Всегда проверяйте крупные купюры на детекторе валют или на просвет, даже если очередь. Называйте сумму вслух при получении купюры: «Ваши пять тысяч тенге, ваша сдача…». Это исключает споры о том, какую купюру дал гость."
      },
      {
        title: "2. Ошибки по терминалу (Эквайринг)",
        text: "Если терминал выдал чек с надписью «ОТКЛОНЕНО» или завис:",
        list: [
          "Не отдавайте товар, пока не увидите чек с надписью «ОДОБРЕНО».",
          "Даже если клиенту пришло СМС о списании, а у вас чек «ОТКЛОНЕНО» — деньги вернутся клиенту в течение пары часов (бывает отмена операции банком). Попросите оплатить другой картой или наличными."
        ]
      },
      {
        title: "3. Отмена чека и возврат",
        text: "Если вы пробили лишнюю позицию, сразу зовите менеджера с картой доступа для отмены. Ни в коем случае не пытайтесь перекрыть ошибку своими деньгами или «договориться» с клиентом о замене товара на ту же сумму без чека — это нарушение кассовой дисциплины."
      }
    ]
  },
  {
    id: "l4",
    title: "Первый разговор с гостем",
    mins: 15,
    boost: 7,
    topic: "СЕРВИС",
    content: [
      {
        title: "1. Правило 30 секунд",
        text: "Гость должен быть замечен в течение 30 секунд после входа. Даже если вы заняты (несете поднос, пробиваете чек), поймайте взгляд гостя, улыбнитесь и скажите: «Добрый день, минуточку, сейчас я к вам подойду!». Гость будет готов ждать, если знает, что его заметили."
      },
      {
        title: "2. Забудьте фразу «Вам помочь?»",
        text: "Эта фраза вызывает автоматический ответ «Нет, я просто смотрю». Используйте открытые вопросы или комплименты:",
        list: [
          "«Добрый день! Подбираете что-то на подарок или для себя?»",
          "«Здравствуйте! Сегодня у нас отличный выбор свежих десертов на витрине»",
          "«Привет! Если ищете конкретный размер — дайте знать, я посмотрю на складе»"
        ]
      }
    ]
  }
];

export function Mentor() {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  return (
    <div>
      <header className="pb-6 border-b" style={{ borderColor: C.abyss }}>
        <div className="flex items-baseline justify-between pb-2">
          <span className="font-mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.abyss, fontWeight: 800 }}>
            ФУНКЦИЯ 03 · AI НАСТАВНИК
          </span>
          <span className="font-mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: C.tide500, fontWeight: 700 }}>
            {LESSONS.length.toString().padStart(2, "0")} ИНСТРУКЦИЙ
          </span>
        </div>
        <h1 className="mt-6" style={{ fontSize: "clamp(44px,7vw,92px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.9, color: C.abyss }}>
          Быстрые<br />
          <span style={{ fontStyle: "italic", color: C.coral }}>гайды.</span>
        </h1>
        <p className="mt-4 text-[15px] font-medium text-slate-500 max-w-md">
          Готовые чек-листы и рекомендации от AI, чтобы уверенно приступить к новой задаче или подготовиться к смене.
        </p>
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
                <BookOpen className="w-3.5 h-3.5" style={{ color: C.tide700 }} />
                <span className="font-mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: C.tide500, fontWeight: 700 }}>
                  {l.topic} · {l.mins} МИН ЧТЕНИЯ
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
      
      {/* Lesson Reading Modal */}
      <AnimatePresence>
        {activeLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-10"
            style={{ background: "rgba(10,31,61,0.5)", backdropFilter: "blur(12px)" }}
            onClick={() => setActiveLesson(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ ease: EASE.splash, duration: 0.4 }}
              className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white/90 backdrop-blur-md px-8 py-6 border-b border-slate-100 flex items-center justify-between z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1 text-slate-500 font-mono text-[10px] uppercase tracking-widest font-bold">
                    <BookOpen className="w-3.5 h-3.5" />
                    {activeLesson.topic}
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">
                    {activeLesson.title}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveLesson(null)}
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8">
                <div className="prose prose-slate max-w-none">
                  {activeLesson.content.map((section, idx) => (
                    <div key={idx} className="mb-10 last:mb-0">
                      <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-start gap-3">
                        {section.title}
                      </h3>
                      <p className="text-[15px] leading-relaxed text-slate-600 font-medium mb-4">
                        {section.text}
                      </p>
                      {section.list && (
                        <ul className="space-y-3 mt-4">
                          {section.list.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-start gap-3 text-[14.5px] leading-relaxed text-slate-700 font-medium bg-slate-50 p-4 rounded-2xl">
                              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                  <button
                    onClick={() => setActiveLesson(null)}
                    className="inline-flex items-center gap-2 h-14 px-8 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Я изучил(а) материал
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
