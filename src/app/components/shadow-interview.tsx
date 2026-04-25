import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, ArrowRight, Check, MessageSquare } from "lucide-react";
import { apiFetch } from "../lib/supabase";
import { C, EASE } from "../lib/design";
import { getLocalInterviewQuestions, getLocalInterviewSummary } from "../lib/mock-data";

type Summary = { summary: string; fit: number; flags: string[] };

export function ShadowInterview({
  jobId, open, onClose, onFinished,
}: {
  jobId: string;
  open: boolean;
  onClose: () => void;
  onFinished: (s: Summary, qa: { q: string; a: string }[]) => void;
}) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setIdx(0); setAnswers([]); setAnswer(""); setErr(null);
    setLoading(true);
    apiFetch<{ questions: string[] }>("/shadow-interview/start", {
      method: "POST", body: JSON.stringify({ jobId }),
    })
      .then(({ questions }) => {
        if (!questions || questions.length === 0) {
          // Fallback to local questions
          setQuestions(getLocalInterviewQuestions(jobId));
        } else setQuestions(questions);
      })
      .catch(() => {
        // Fallback: use local interview questions
        setQuestions(getLocalInterviewQuestions(jobId));
      })
      .finally(() => setLoading(false));
  }, [open, jobId]);

  const next = async () => {
    if (!answer.trim()) return;
    const newAnswers = [...answers, answer.trim()];
    setAnswers(newAnswers);
    setAnswer("");
    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
    } else {
      setSummarizing(true);
      try {
        const qa = questions.map((q, i) => ({ q, a: newAnswers[i] ?? "" }));
        let s: Summary;
        try {
          s = await apiFetch<Summary>("/shadow-interview/summarize", {
            method: "POST", body: JSON.stringify({ jobId, qa }),
          });
        } catch {
          // Fallback: generate local summary
          s = getLocalInterviewSummary(jobId, qa);
        }
        onFinished(s, qa);
      } catch (e: any) {
        setErr(e?.message ?? "Не удалось собрать саммари.");
      } finally {
        setSummarizing(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(10,31,61,0.45)", backdropFilter: "blur(6px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 14, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE.splash }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-white p-6 relative"
            style={{ boxShadow: "0 40px 80px -20px rgba(10,31,61,0.4)" }}
          >
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: C.tide50, color: C.tide700 }}>
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-3.5 h-3.5" style={{ color: C.tide700 }} />
              <span className="text-[10.5px] font-mono" style={{ color: C.tide700, letterSpacing: "0.18em", fontWeight: 700 }}>
                AI SHADOW INTERVIEWER
              </span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.025em", color: C.abyss }}>
              Работодатель просил уточнить.
            </div>
            <div className="text-[12.5px] mt-1 mb-5" style={{ color: C.depth, fontWeight: 500 }}>
              3 коротких вопроса. Ответь голосом или текстом — AI перешлёт саммари.
            </div>

            {loading ? (
              <div className="py-10 text-center">
                <Sparkles className="w-5 h-5 mx-auto animate-pulse mb-2" style={{ color: C.tide700 }} />
                <div className="text-[13px]" style={{ color: C.depth, fontWeight: 600 }}>Готовлю вопросы под эту роль…</div>
              </div>
            ) : err ? (
              <div className="text-[13px]" style={{ color: C.coral, fontWeight: 600 }}>{err}</div>
            ) : summarizing ? (
              <div className="py-10 text-center">
                <Sparkles className="w-5 h-5 mx-auto animate-pulse mb-2" style={{ color: C.tide700 }} />
                <div className="text-[13px]" style={{ color: C.depth, fontWeight: 600 }}>Собираю саммари для работодателя…</div>
              </div>
            ) : questions.length > 0 ? (
              <div>
                <div className="h-1 rounded-full overflow-hidden mb-4" style={{ background: C.tide100 }}>
                  <motion.div className="h-full" style={{ background: C.tide700 }}
                    animate={{ width: `${((idx) / questions.length) * 100}%` }} transition={{ duration: 0.4 }} />
                </div>
                <div className="text-[11px] font-mono mb-2" style={{ color: C.tide500, letterSpacing: "0.14em", fontWeight: 600 }}>
                  ВОПРОС {idx + 1} / {questions.length}
                </div>
                <div className="text-[16px] mb-4" style={{ color: C.abyss, fontWeight: 700, lineHeight: 1.35 }}>
                  {questions[idx]}
                </div>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={4}
                  placeholder="Ответь в 1-2 предложениях…"
                  className="w-full rounded-2xl border bg-white px-4 py-3 text-[13.5px] outline-none resize-none"
                  style={{ borderColor: C.tide100, fontFamily: "var(--font-sans)", fontWeight: 500, color: C.abyss, lineHeight: 1.5 }}
                />
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  disabled={!answer.trim()}
                  onClick={next}
                  className="mt-3 w-full h-11 rounded-full text-white inline-flex items-center justify-center gap-2 text-[13px] disabled:opacity-40"
                  style={{ background: C.abyss, fontWeight: 700, letterSpacing: "-0.01em" }}
                >
                  {idx + 1 < questions.length ? (<>Дальше <ArrowRight className="w-3.5 h-3.5" /></>) : (<>Отправить отклик <Check className="w-3.5 h-3.5" /></>)}
                </motion.button>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
