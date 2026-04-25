import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Mic, MicOff, Volume2, VolumeX, User, Brain, ChevronRight, BarChart3, Award, Target, MessageSquare, Loader2, Activity } from "lucide-react";
import { C, EASE } from "../lib/design";
import {
  getInterviewQuestions,
  speakText,
  stopSpeaking,
  AudioRecorder,
  blobToBase64,
  createSpeechRecognition,
  generateProfile,
  getTraitsForCategory,
  SCENARIOS,
  type InterviewQuestion,
  type AnswerAnalysis,
  type PersonalityProfile,
} from "../lib/interview-ai";

type Summary = { summary: string; fit: number; flags: string[] };

type Phase = "intro" | "speaking" | "listening" | "analyzing" | "transition" | "stress" | "profile";

interface RecordedAnswer {
  questionId: number;
  question: string;
  category: string;
  transcription: string;
  analysis: AnswerAnalysis;
}

/* ── Waveform Visualizer ─────────────────────────────────────────────── */
function WaveformViz({ volume, active, color }: { volume: number; active: boolean; color: string }) {
  const bars = 24;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, height: 48 }}>
      {Array.from({ length: bars }).map((_, i) => {
        const dist = Math.abs(i - bars / 2) / (bars / 2);
        const h = active ? Math.max(4, (1 - dist * 0.6) * volume * 44 + Math.random() * 8) : 4;
        return (
          <motion.div
            key={i}
            animate={{ height: h }}
            transition={{ duration: 0.1 }}
            style={{ width: 3, borderRadius: 2, background: color, opacity: active ? 0.5 + volume * 0.5 : 0.2 }}
          />
        );
      })}
    </div>
  );
}

/* ── Trait Bar ────────────────────────────────────────────────────────── */
function TraitBar({ trait, score, icon, delay }: { trait: string; score: number; icon: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      style={{ marginBottom: 10 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.abyss }}>{icon} {trait}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.tide700 }}>{score}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: C.tide100, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
          style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${C.tide500}, ${C.tide700})` }}
        />
      </div>
    </motion.div>
  );
}

/* ── Main Component ──────────────────────────────────────────────────── */
export function ShadowInterview({
  jobId, open, onClose, onFinished,
}: {
  jobId: string;
  open: boolean;
  onClose: () => void;
  onFinished: (s: Summary, qa: { q: string; a: string }[]) => void;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<RecordedAnswer[]>([]);
  const [volume, setVolume] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [fullTranscript, setFullTranscript] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [profile, setProfile] = useState<PersonalityProfile | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [stressIdx, setStressIdx] = useState(0);
  const [stressScore, setStressScore] = useState(0);
  const [stressAnswers, setStressAnswers] = useState<{q: string, a: string}[]>([]);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const speechRecRef = useRef<{ start: () => void; stop: () => void } | null>(null);
  const timerRef = useRef<number | null>(null);

  // Reset on open
  useEffect(() => {
    if (!open) return;
    setPhase("intro");
    setIdx(0);
    setAnswers([]);
    setTranscript("");
    setFullTranscript("");
    setProfile(null);
    setErr(null);
    setStressIdx(0);
    setStressScore(0);
    setStressAnswers([]);
    setSeconds(0);
    setQuestions(getInterviewQuestions());
  }, [open, jobId]);

  // Cleanup on close
  useEffect(() => {
    return () => {
      stopSpeaking();
      recorderRef.current?.stop();
      speechRecRef.current?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startInterview = useCallback(async () => {
    const qs = getInterviewQuestions();
    setQuestions(qs);
    setIdx(0);
    setPhase("speaking");

    if (!muted) {
      try {
        await speakText(qs[0].text);
      } catch { /* TTS not available */ }
    }
    setPhase("listening");
    startRecording();
  }, [muted]);

  const startRecording = async () => {
    setTranscript("");
    setFullTranscript("");
    setSeconds(0);
    setErr(null);

    try {
      const recorder = new AudioRecorder();
      recorder.onVolumeChange = setVolume;
      await recorder.start();
      recorderRef.current = recorder;

      // Start speech recognition for live transcript
      const sr = createSpeechRecognition(
        (text, isFinal) => {
          if (isFinal) {
            setFullTranscript(prev => prev + " " + text);
            setTranscript("");
          } else {
            setTranscript(text);
          }
        },
        () => {}
      );
      if (sr) { sr.start(); speechRecRef.current = sr; }

      timerRef.current = window.setInterval(() => setSeconds(s => s + 1), 1000);
    } catch (e: any) {
      setErr("Микрофон недоступен: " + (e?.message ?? "проверьте настройки браузера"));
    }
  };

  const stopRecording = async () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    speechRecRef.current?.stop();
    setVolume(0);

    const blob = recorderRef.current ? await recorderRef.current.stop() : null;
    recorderRef.current = null;

    setPhase("analyzing");

    const finalText = (fullTranscript + " " + transcript).trim();

    // Build analysis locally based on transcript
    const currentQ = questions[idx];
    const analysis: AnswerAnalysis = {
      transcription: finalText || "Ответ записан (транскрипция недоступна)",
      sentiment: finalText.length > 50 ? "positive" : finalText.length > 20 ? "neutral" : "negative",
      confidence: Math.min(95, 40 + finalText.length / 3),
      keyTraits: getTraitsForCategory(currentQ.category),
      detailLevel: finalText.length > 100 ? "detailed" : finalText.length > 40 ? "moderate" : "brief",
    };

    const recorded: RecordedAnswer = {
      questionId: currentQ.id,
      question: currentQ.text,
      category: currentQ.category,
      transcription: analysis.transcription,
      analysis,
    };

    const newAnswers = [...answers, recorded];
    setAnswers(newAnswers);

    // Move to next or generate profile
    if (idx + 1 < questions.length) {
      await new Promise(r => setTimeout(r, 800));
      const nextIdx = idx + 1;
      setIdx(nextIdx);
      setTranscript("");
      setFullTranscript("");
      setPhase("speaking");

      if (!muted) {
        try { await speakText(questions[nextIdx].text); } catch {}
      }
      setPhase("listening");
      startRecording();
    } else {
      // All audio done — go to stress test
      setPhase("stress");
    }
  };

  const handleStressAnswer = async (points: number, text: string) => {
    const currentScen = SCENARIOS[stressIdx];
    const newScore = stressScore + points;
    const newAnswers = [...stressAnswers, { q: "Стресс-тест: " + currentScen.scenario, a: text }];
    
    setStressScore(newScore);
    setStressAnswers(newAnswers);

    if (stressIdx + 1 < SCENARIOS.length) {
      setStressIdx(stressIdx + 1);
    } else {
      // All done — generate profile
      setPhase("analyzing");
      try {
        const stressPercentage = Math.round((newScore / (SCENARIOS.length * 30)) * 100);
        const finalAnswers = [...answers, {
          questionId: 999,
          question: "Стрессоустойчивость",
          category: "situational",
          transcription: `Кандидат прошел стресс-тест. Устойчивость: ${stressPercentage}%. Ответы: ${newAnswers.map(a => a.a).join("; ")}`,
          analysis: {
            transcription: "",
            sentiment: "neutral" as const,
            confidence: 100,
            keyTraits: ["Стрессоустойчивость", stressPercentage >= 70 ? "Хладнокровие" : "Эмоциональность"],
            detailLevel: "moderate" as const
          }
        }];
        
        const p = await generateProfile(finalAnswers);
        setProfile(p);
        setPhase("profile");

        const qa = [...answers.map(a => ({ q: a.question, a: a.transcription })), ...newAnswers];
        onFinished(
          { summary: p.summary, fit: p.fitScore, flags: p.areasToImprove },
          qa
        );
      } catch {
        setErr("Не удалось сгенерировать профиль");
        setPhase("profile");
      }
    }
  };

  const handleClose = () => {
    stopSpeaking();
    recorderRef.current?.stop();
    speechRecRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    onClose();
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(10,31,61,0.55)", backdropFilter: "blur(12px)" }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE.splash }}
            onClick={e => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 520, borderRadius: 24, background: "#fff", position: "relative", overflow: "hidden", boxShadow: "0 40px 80px -20px rgba(10,31,61,0.5)" }}
          >
            {/* Header gradient */}
            <div style={{ height: 4, background: `linear-gradient(90deg, ${C.tide500}, ${C.tide700}, ${C.kelp})` }} />

            <div style={{ padding: "20px 24px 24px" }}>
              {/* Close button */}
              <button
                onClick={handleClose}
                style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", background: C.tide50, color: C.tide700, border: "none", cursor: "pointer" }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>

              {/* Badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Brain style={{ width: 14, height: 14, color: C.tide700 }} />
                <span style={{ fontSize: 10.5, fontFamily: "monospace", color: C.tide700, letterSpacing: "0.18em", fontWeight: 700 }}>
                  AI VOICE INTERVIEW
                </span>
              </div>

              {/* ── INTRO PHASE ──────────────────────────── */}
              {phase === "intro" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.abyss, letterSpacing: "-0.025em", marginBottom: 4 }}>
                    Голосовое интервью с AI
                  </div>
                  <div style={{ fontSize: 13, color: C.depth, fontWeight: 500, lineHeight: 1.5, marginBottom: 20 }}>
                    AI задаст {questions.length || 5} вопросов голосом. Отвечайте голосом — AI проанализирует ваши ответы и составит профиль характеристик.
                  </div>

                  {/* Instructions */}
                  <div style={{ borderRadius: 16, background: C.tide50, padding: 16, marginBottom: 20 }}>
                    {[
                      { icon: <Volume2 style={{ width: 16, height: 16 }} />, text: "AI озвучит каждый вопрос" },
                      { icon: <Mic style={{ width: 16, height: 16 }} />, text: "Отвечайте голосом — речь будет записана" },
                      { icon: <Brain style={{ width: 16, height: 16 }} />, text: "AI проанализирует ответы и создаст профиль" },
                    ].map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < 2 ? 10 : 0 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: C.tide700, flexShrink: 0 }}>
                          {item.icon}
                        </div>
                        <span style={{ fontSize: 13, color: C.abyss, fontWeight: 600 }}>{item.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Mute toggle */}
                  <button
                    onClick={() => setMuted(!muted)}
                    style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.depth, fontWeight: 600, background: "none", border: "none", cursor: "pointer", marginBottom: 16 }}
                  >
                    {muted ? <VolumeX style={{ width: 14, height: 14 }} /> : <Volume2 style={{ width: 14, height: 14 }} />}
                    {muted ? "Озвучка выключена (текст)" : "Озвучка включена"}
                  </button>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={startInterview}
                    style={{ width: "100%", height: 48, borderRadius: 24, background: `linear-gradient(135deg, ${C.tide700}, ${C.depth})`, color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    <Mic style={{ width: 16, height: 16 }} /> Начать интервью
                  </motion.button>
                </motion.div>
              )}

              {/* ── SPEAKING PHASE (AI asking question) ── */}
              {phase === "speaking" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "20px 0" }}>
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ width: 64, height: 64, borderRadius: 32, background: `linear-gradient(135deg, ${C.tide500}, ${C.tide700})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: `0 8px 32px ${C.tide500}40` }}
                  >
                    <Volume2 style={{ width: 28, height: 28, color: "#fff" }} />
                  </motion.div>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: C.tide700, letterSpacing: "0.14em", fontWeight: 600, marginBottom: 8 }}>
                    ВОПРОС {idx + 1} / {questions.length}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.abyss, lineHeight: 1.4, marginBottom: 8 }}>
                    {questions[idx]?.text}
                  </div>
                  <div style={{ fontSize: 12, color: C.tide500, fontWeight: 500 }}>AI озвучивает вопрос…</div>
                </motion.div>
              )}

              {/* ── LISTENING PHASE (recording user) ──── */}
              {phase === "listening" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* Progress */}
                  <div style={{ height: 3, borderRadius: 2, background: C.tide100, marginBottom: 16, marginTop: 8, overflow: "hidden" }}>
                    <motion.div
                      animate={{ width: `${((idx) / questions.length) * 100}%` }}
                      style={{ height: "100%", background: C.tide700, borderRadius: 2 }}
                    />
                  </div>

                  <div style={{ fontSize: 11, fontFamily: "monospace", color: C.tide500, letterSpacing: "0.14em", fontWeight: 600, marginBottom: 6 }}>
                    ВОПРОС {idx + 1} / {questions.length}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.abyss, lineHeight: 1.4, marginBottom: 16 }}>
                    {questions[idx]?.text}
                  </div>

                  {/* Waveform */}
                  <div style={{ borderRadius: 16, background: C.tide50, padding: "16px 12px", marginBottom: 16 }}>
                    <WaveformViz volume={volume} active={true} color={C.tide700} />
                    <div style={{ textAlign: "center", marginTop: 8 }}>
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: C.coral, fontWeight: 700 }}
                      >
                        <div style={{ width: 8, height: 8, borderRadius: 4, background: C.coral }} />
                        REC {fmtTime(seconds)}
                      </motion.div>
                    </div>
                  </div>

                  {/* Live transcript */}
                  {(fullTranscript || transcript) && (
                    <div style={{ borderRadius: 12, border: `1px solid ${C.tide100}`, padding: 12, marginBottom: 16, minHeight: 48 }}>
                      <div style={{ fontSize: 10, fontFamily: "monospace", color: C.tide500, fontWeight: 600, marginBottom: 4 }}>ТРАНСКРИПЦИЯ</div>
                      <div style={{ fontSize: 13, color: C.abyss, fontWeight: 500, lineHeight: 1.5 }}>
                        {fullTranscript}
                        {transcript && <span style={{ color: C.tide500 }}> {transcript}</span>}
                      </div>
                    </div>
                  )}

                  {err && (
                    <div style={{ fontSize: 12, color: C.coral, fontWeight: 600, marginBottom: 12 }}>{err}</div>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={stopRecording}
                    style={{ width: "100%", height: 48, borderRadius: 24, background: C.coral, color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    <MicOff style={{ width: 16, height: 16 }} />
                    {idx + 1 < questions.length ? "Ответил — следующий вопрос" : "Завершить интервью"}
                  </motion.button>
                </motion.div>
              )}

              {/* ── STRESS PHASE ────────────────────────── */}
              {phase === "stress" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: `${C.coral}15`, display: "flex", alignItems: "center", justifyContent: "center", color: C.coral }}>
                      <Activity style={{ width: 18, height: 18 }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.coral }}>Стресс-тест</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.tide500 }}>Ситуация {stressIdx + 1} / {SCENARIOS.length}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: 16, fontWeight: 700, color: C.abyss, lineHeight: 1.4, marginBottom: 20 }}>
                    {SCENARIOS[stressIdx].scenario}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {SCENARIOS[stressIdx].options.map((opt, i) => (
                      <motion.button
                        key={i}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleStressAnswer(opt.stressPoints, opt.text)}
                        style={{ textAlign: "left", padding: 16, borderRadius: 16, background: "#fff", border: `2px solid ${C.tide100}`, color: C.abyss, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "border-color 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.coral)}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.tide100)}
                      >
                        {opt.text}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── ANALYZING ────────────────────────────── */}
              {phase === "analyzing" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "32px 0" }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{ width: 48, height: 48, margin: "0 auto 16px" }}
                  >
                    <Loader2 style={{ width: 48, height: 48, color: C.tide700 }} />
                  </motion.div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.abyss, marginBottom: 4 }}>
                    AI анализирует ответ…
                  </div>
                  <div style={{ fontSize: 12, color: C.depth, fontWeight: 500 }}>
                    Оцениваем уверенность, содержание и soft-skills
                  </div>
                </motion.div>
              )}

              {/* ── PROFILE PHASE ────────────────────────── */}
              {phase === "profile" && profile && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.abyss, letterSpacing: "-0.025em", marginBottom: 4 }}>
                    Профиль кандидата
                  </div>
                  <div style={{ fontSize: 12, color: C.depth, fontWeight: 500, marginBottom: 16 }}>
                    На основе AI-анализа {answers.length} ответов
                  </div>

                  {/* Fit Score */}
                  <motion.div
                    initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                    style={{ borderRadius: 16, background: `linear-gradient(135deg, ${C.tide50}, #EDF5FF)`, padding: 20, marginBottom: 16, textAlign: "center" }}
                  >
                    <div style={{ fontSize: 11, fontFamily: "monospace", color: C.tide700, fontWeight: 700, letterSpacing: "0.14em", marginBottom: 8 }}>FIT SCORE</div>
                    <div style={{ fontSize: 48, fontWeight: 800, color: C.tide700, lineHeight: 1 }}>{profile.fitScore}%</div>
                    <div style={{ fontSize: 12, color: C.depth, fontWeight: 600, marginTop: 4 }}>{profile.communicationStyle}</div>
                  </motion.div>

                  {/* Traits */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                      <BarChart3 style={{ width: 14, height: 14, color: C.tide700 }} />
                      <span style={{ fontSize: 12, fontFamily: "monospace", color: C.tide700, fontWeight: 700, letterSpacing: "0.12em" }}>ХАРАКТЕРИСТИКИ</span>
                    </div>
                    {profile.characteristics.map((c, i) => (
                      <TraitBar key={c.trait} trait={c.trait} score={c.score} icon={c.icon} delay={i * 0.1} />
                    ))}
                  </div>

                  {/* Strengths & Improve */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <div style={{ borderRadius: 12, background: "#F0FFF4", padding: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.kelp, marginBottom: 6 }}>💪 Сильные стороны</div>
                      {profile.strengths.map(s => (
                        <div key={s} style={{ fontSize: 12, color: C.abyss, fontWeight: 500, marginBottom: 2 }}>• {s}</div>
                      ))}
                    </div>
                    <div style={{ borderRadius: 12, background: "#FFF8F0", padding: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.coral, marginBottom: 6 }}>📈 Зоны роста</div>
                      {profile.areasToImprove.map(a => (
                        <div key={a} style={{ fontSize: 12, color: C.abyss, fontWeight: 500, marginBottom: 2 }}>• {a}</div>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div style={{ borderRadius: 12, border: `1px solid ${C.tide100}`, padding: 12, marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontFamily: "monospace", color: C.tide700, fontWeight: 700, marginBottom: 4 }}>РЕКОМЕНДАЦИЯ AI</div>
                    <div style={{ fontSize: 13, color: C.abyss, fontWeight: 500, lineHeight: 1.5 }}>{profile.recommendation}</div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleClose}
                    style={{ width: "100%", height: 44, borderRadius: 22, background: C.abyss, color: "#fff", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}
                  >
                    Закрыть
                  </motion.button>
                </motion.div>
              )}

              {phase === "profile" && !profile && err && (
                <div style={{ fontSize: 13, color: C.coral, fontWeight: 600, padding: "20px 0" }}>{err}</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
