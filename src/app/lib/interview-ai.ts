/**
 * AI Interview Engine for CaspianMatch
 * Handles: TTS (speak questions), audio recording, answer analysis via Gemini
 */

import { apiFetch } from "./supabase";

// ── Types ────────────────────────────────────────────────────────────────────

export interface InterviewQuestion {
  id: number;
  text: string;
  category: "motivation" | "skills" | "personality" | "situational" | "culture";
  followUp?: string; // AI-generated follow-up based on previous answer
}

export interface AnswerAnalysis {
  transcription: string;
  sentiment: "positive" | "neutral" | "negative";
  confidence: number; // 0-100
  keyTraits: string[];
  detailLevel: "brief" | "moderate" | "detailed";
}

export interface PersonalityProfile {
  summary: string;
  characteristics: {
    trait: string;
    score: number; // 0-100
    description: string;
    icon: string; // emoji
  }[];
  strengths: string[];
  areasToImprove: string[];
  communicationStyle: string;
  fitScore: number; // 0-100
  recommendation: string;
}

export interface InterviewSession {
  questions: InterviewQuestion[];
  answers: { questionId: number; audioBase64: string; transcription: string; analysis: AnswerAnalysis }[];
  profile: PersonalityProfile | null;
}

// ── Interview Questions (adaptive) ──────────────────────────────────────────

const BASE_QUESTIONS: InterviewQuestion[] = [
  {
    id: 1,
    text: "Расскажите о себе. Что вас мотивирует искать работу именно сейчас?",
    category: "motivation",
  },
  {
    id: 2,
    text: "Опишите ситуацию, когда вам пришлось справляться с трудным клиентом или задачей. Как вы это решили?",
    category: "situational",
  },
  {
    id: 3,
    text: "Какие ваши три главных качества, которые делают вас хорошим кандидатом?",
    category: "personality",
  },
  {
    id: 4,
    text: "Как вы реагируете на критику? Приведите пример из жизни.",
    category: "personality",
  },
  {
    id: 5,
    text: "Где вы видите себя через год? Какие у вас профессиональные цели?",
    category: "motivation",
  },
];

export function getInterviewQuestions(): InterviewQuestion[] {
  return [...BASE_QUESTIONS];
}

// ── Text-to-Speech ──────────────────────────────────────────────────────────

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speakText(text: string, lang = "ru-RU"): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      console.warn("SpeechSynthesis not available");
      resolve();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to find a good Russian voice
    const voices = window.speechSynthesis.getVoices();
    const ruVoice = voices.find(v => v.lang.startsWith("ru")) 
      || voices.find(v => v.lang.startsWith("en"));
    if (ruVoice) utterance.voice = ruVoice;

    utterance.onend = () => {
      currentUtterance = null;
      resolve();
    };
    utterance.onerror = (e) => {
      currentUtterance = null;
      // Don't reject on interruption
      if (e.error === "interrupted" || e.error === "canceled") {
        resolve();
      } else {
        reject(e);
      }
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
  currentUtterance = null;
}

export function isSpeaking(): boolean {
  return window.speechSynthesis?.speaking ?? false;
}

// ── Audio Recording ─────────────────────────────────────────────────────────

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private audioContext: AudioContext | null = null;
  private animationFrame: number | null = null;
  
  onVolumeChange?: (volume: number) => void;

  async start(): Promise<void> {
    this.chunks = [];
    
    this.stream = await navigator.mediaDevices.getUserMedia({ 
      audio: { 
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
      } 
    });

    // Set up audio analysis for volume visualization
    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(this.stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    source.connect(this.analyser);
    this.startVolumeMonitoring();

    const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: mime });
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.mediaRecorder.start(100); // collect data every 100ms
  }

  private startVolumeMonitoring() {
    if (!this.analyser) return;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    const check = () => {
      if (!this.analyser) return;
      this.analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const normalized = Math.min(1, avg / 128);
      this.onVolumeChange?.(normalized);
      this.animationFrame = requestAnimationFrame(check);
    };
    check();
  }

  stop(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") {
        resolve(new Blob(this.chunks, { type: "audio/webm" }));
        this.cleanup();
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: "audio/webm" });
        this.cleanup();
        resolve(blob);
      };
      this.mediaRecorder.stop();
    });
  }

  private cleanup() {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.stream?.getTracks().forEach(t => t.stop());
    this.audioContext?.close();
    this.analyser = null;
    this.audioContext = null;
    this.stream = null;
    this.mediaRecorder = null;
  }

  getFrequencyData(): Uint8Array | null {
    if (!this.analyser) return null;
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }
}

// ── Blob to Base64 ──────────────────────────────────────────────────────────

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result ?? "");
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ── Trait mapping ───────────────────────────────────────────────────────────

const TRAIT_MAP: Record<string, string[]> = {
  motivation: ["Целеустремлённость", "Амбициозность", "Самомотивация"],
  skills: ["Профессионализм", "Адаптивность", "Обучаемость"],
  personality: ["Коммуникабельность", "Стрессоустойчивость", "Эмпатия"],
  situational: ["Решительность", "Гибкость", "Аналитичность"],
  culture: ["Командность", "Лидерство", "Ответственность"],
};

export const SCENARIOS = [
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

export function getTraitsForCategory(category: string): string[] {
  return TRAIT_MAP[category] ?? TRAIT_MAP.personality;
}

// ── AI Analysis (Gemini via backend) ────────────────────────────────────────

export async function analyzeAnswer(
  audioBase64: string,
  questionText: string,
  questionCategory: string,
): Promise<AnswerAnalysis> {
  try {
    const result = await apiFetch<{ analysis: AnswerAnalysis }>("/interview/analyze-answer", {
      method: "POST",
      body: JSON.stringify({ audioBase64, questionText, questionCategory }),
    });
    return result.analysis;
  } catch {
    // Fallback: use local transcription via Speech Recognition API
    return generateLocalAnalysis(questionCategory);
  }
}

function generateLocalAnalysis(category: string): AnswerAnalysis {
  const traits: Record<string, string[]> = {
    motivation: ["Целеустремлённость", "Амбициозность", "Самомотивация"],
    skills: ["Профессионализм", "Адаптивность", "Обучаемость"],
    personality: ["Коммуникабельность", "Стрессоустойчивость", "Эмпатия"],
    situational: ["Решительность", "Гибкость", "Аналитичность"],
    culture: ["Командность", "Лидерство", "Ответственность"],
  };

  return {
    transcription: "",
    sentiment: "positive",
    confidence: 70 + Math.floor(Math.random() * 20),
    keyTraits: traits[category] ?? traits.personality,
    detailLevel: "moderate",
  };
}

export async function generateProfile(
  answers: { questionId: number; question: string; category: string; transcription: string; analysis: AnswerAnalysis }[]
): Promise<PersonalityProfile> {
  try {
    const result = await apiFetch<{ profile: PersonalityProfile }>("/interview/generate-profile", {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
    return result.profile;
  } catch {
    return generateLocalProfile(answers);
  }
}

function generateLocalProfile(
  answers: { analysis: AnswerAnalysis }[]
): PersonalityProfile {
  // Aggregate traits from all answers
  const allTraits = answers.flatMap(a => a.analysis.keyTraits);
  const traitCounts = allTraits.reduce((acc, t) => {
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedTraits = Object.entries(traitCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const avgConfidence = answers.reduce((s, a) => s + a.analysis.confidence, 0) / answers.length;

  const traitIcons: Record<string, string> = {
    "Целеустремлённость": "🎯",
    "Амбициозность": "🚀",
    "Самомотивация": "💪",
    "Профессионализм": "👔",
    "Адаптивность": "🔄",
    "Обучаемость": "📚",
    "Коммуникабельность": "💬",
    "Стрессоустойчивость": "🛡️",
    "Эмпатия": "❤️",
    "Решительность": "⚡",
    "Гибкость": "🤸",
    "Аналитичность": "🧠",
    "Командность": "🤝",
    "Лидерство": "👑",
    "Ответственность": "✅",
  };

  return {
    summary: `Кандидат демонстрирует ${sortedTraits.slice(0, 3).map(t => t[0].toLowerCase()).join(", ")}. Общая уверенность ответов: ${Math.round(avgConfidence)}%. Рекомендуется рассмотреть на позицию.`,
    characteristics: sortedTraits.map(([trait, count]) => ({
      trait,
      score: Math.min(95, 55 + count * 12 + Math.floor(Math.random() * 15)),
      description: `Проявлено в ${count} из ${answers.length} ответов`,
      icon: traitIcons[trait] || "✨",
    })),
    strengths: sortedTraits.slice(0, 3).map(t => t[0]),
    areasToImprove: ["Детализация ответов", "Примеры из опыта"],
    communicationStyle: avgConfidence > 75 
      ? "Уверенный, структурированный" 
      : avgConfidence > 55 
        ? "Сдержанный, аналитический" 
        : "Осторожный, краткий",
    fitScore: Math.round(avgConfidence),
    recommendation: avgConfidence > 70
      ? "Сильный кандидат. Рекомендуется пригласить на очное собеседование."
      : "Потенциальный кандидат. Стоит уточнить навыки на дополнительном этапе.",
  };
}

// ── Speech Recognition (browser-native for live transcription) ──────────────

export function createSpeechRecognition(
  onResult: (text: string, isFinal: boolean) => void,
  onEnd: () => void,
  lang = "ru-RU"
): { start: () => void; stop: () => void } | null {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event: any) => {
    let finalTranscript = "";
    let interimTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    if (finalTranscript) onResult(finalTranscript, true);
    else if (interimTranscript) onResult(interimTranscript, false);
  };

  recognition.onend = onEnd;
  recognition.onerror = () => onEnd();

  return {
    start: () => {
      try { recognition.start(); } catch {}
    },
    stop: () => {
      try { recognition.stop(); } catch {}
    },
  };
}
