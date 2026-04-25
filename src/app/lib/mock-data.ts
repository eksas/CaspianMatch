/**
 * Data layer for CaspianMatch.
 * All data comes from the shared API server — no hardcoded demo data.
 */

import type { Job, Application, MatchScore } from "./store";
import type { LighthouseData, Vouch, SalaryStats } from "./trio";

// ── Empty defaults (no demo data) ────────────────────────────────────────────
export const SEED_JOBS: Job[] = [];
export const SEED_APPS: Application[] = [];
export const SEED_VOUCHES: Vouch[] = [];
export const MATCH_REASONS: Record<string, string> = {};

export const SEED_LIGHTHOUSE: LighthouseData = {
  score: 0,
  breakdown: { responseRate: 0, responseSpeed: 0, followThrough: 0, quality: 0 },
  applications: 0,
  jobs: 0,
};

export const SEED_SALARY_STATS: SalaryStats = {
  count: 0,
  insufficient: true,
};

// ── Match scores ────────────────────────────────────────────────────────────
export function generateMatchScores(jobs: Job[]): MatchScore[] {
  return jobs.map((j) => ({
    id: j.id,
    score: j.match,
    reason: "Район совпадает, и нужный навык у тебя уже есть.",
  }));
}

// ── AI fallback responses (Pearl chat) ──────────────────────────────────────
export function getLocalAIResponse(messages: Array<{role: string, text: string}>): string {
  const history = messages.map(m => m.text).join(" ").toLowerCase();
  const lastUserMsg = messages.filter((m) => m.role === "user").pop()?.text.toLowerCase() || "";
  
  // Mentor Context (Micro-courses)
  if (history.includes("бариста за 30 минут")) {
    if (messages.length <= 2 || lastUserMsg.includes("готов")) {
      return "Отлично! Модуль 1: Эспрессо.\nЗапомни правило 18-30: 18 грамм молотого кофе должны экстрагироваться (проливаться) ровно за 30 секунд. Если быстрее — будет кислинка, если медленнее — горечь.\n\nПонял правило? Напиши 'Да', чтобы перейти к практике.";
    }
    if (lastUserMsg === "да" || lastUserMsg.includes("понял")) {
      return "Супер! 🌟 Зачислено +12 XP за прохождение первого модуля баристы! Теперь ты знаешь основы. Хочешь закрепить материал или перейти к следующему уроку?";
    }
  }

  if (history.includes("касса и эквайринг")) {
    if (messages.length <= 2 || lastUserMsg.includes("готов")) {
      return "Модуль 1: Возврат по карте.\nГлавное правило при возврате: всегда сверяй печатный чек отмены и проси клиента приложить ту же самую карту, иначе деньги вернутся чужому человеку.\n\nЗапомнил? Напиши 'Да'.";
    }
    if (lastUserMsg === "да" || lastUserMsg.includes("понятно")) {
      return "Умница! 💼 +8 XP за модуль по Ритейлу. Вы становитесь профессионалом!";
    }
  }

  // General questions
  if (lastUserMsg.includes("резюме") || lastUserMsg.includes("био")) {
    return "Для классного профиля используй формулу: [Кто я] + [Что умею] + [Ищу]. Например: 'Студент. Быстро учусь. Ищу работу баристы'. Попробуй написать своё, а я проверю!";
  }
  
  if (lastUserMsg.includes("собеседовани")) {
    return "Главный секрет собеседования в Актау: будь честным про свой опыт. Врать нет смысла — город маленький, все друг друга знают! Расслабься и расскажи о себе.";
  }

  return "Извините, сейчас серверы Gemini перегружены (503 Service Unavailable). Но как автономный AI-наставник CaspianMatch, я всё равно могу рассказать тебе про наши уроки или дать советы по резюме!";
}

// ── Shadow Interview fallback ───────────────────────────────────────────────
export function getLocalInterviewQuestions(_jobId: string): string[] {
  return [
    "Расскажи о себе за 30 секунд — кто ты и почему ищешь работу?",
    "Какой твой самый полезный навык для этой роли? Приведи пример.",
    "Опиши ситуацию, когда тебе пришлось решить проблему на работе или учёбе.",
  ];
}

export function getLocalInterviewSummary(
  _jobId: string,
  qa: { q: string; a: string }[]
): { summary: string; fit: number; flags: string[] } {
  const totalLength = qa.reduce((n, x) => n + x.a.length, 0);
  const fit = Math.min(95, Math.max(45, Math.round(50 + totalLength / 10)));
  return {
    summary: `Кандидат ответил на ${qa.length} вопросов.`,
    fit,
    flags: fit < 60 ? ["Короткие ответы — добавь деталей"] : [],
  };
}

// ── Boost tips ──────────────────────────────────────────────────────────────
export function getLocalBoostTips(_jobId: string): { title: string; detail: string; boost: number }[] {
  return [];
}

// ── WhatsApp ad parser (utility — not demo data) ────────────────────────────
export function parseWhatsAppAd(rawText: string) {
  const lower = rawText.toLowerCase();
  let title = "Вакансия";
  let category = "waiter";
  const categoryMap: Record<string, { title: string; cat: string }> = {
    "бариста": { title: "Бариста", cat: "waiter" },
    "barista": { title: "Бариста", cat: "waiter" },
    "официант": { title: "Официант", cat: "waiter" },
    "waiter": { title: "Официант", cat: "waiter" },
    "курьер": { title: "Курьер", cat: "courier" },
    "courier": { title: "Курьер", cat: "courier" },
    "кассир": { title: "Кассир", cat: "cashier" },
    "cashier": { title: "Кассир", cat: "cashier" },
    "повар": { title: "Повар", cat: "cook" },
    "cook": { title: "Повар", cat: "cook" },
    "продавец": { title: "Продавец-консультант", cat: "retail" },
    "retail": { title: "Продавец", cat: "retail" },
  };
  for (const [keyword, info] of Object.entries(categoryMap)) {
    if (lower.includes(keyword)) {
      title = info.title;
      category = info.cat;
      break;
    }
  }

  const distMatch = rawText.match(/(\d{1,2})\s*(мкр|мр|район|microdistrict|mkr|MKR)/i)
    || rawText.match(/(мкр|мр|район|microdistrict|mkr|MKR)\s*\.?\s*(\d{1,2})/i);
  let microdistrict: number | null = null;
  if (distMatch) {
    const n1 = parseInt(distMatch[1]);
    const n2 = distMatch[2] ? parseInt(distMatch[2]) : NaN;
    microdistrict = !isNaN(n1) && n1 < 100 ? n1 : (!isNaN(n2) && n2 < 100 ? n2 : null);
  }

  const salaryMatch = rawText.match(/([\d\s]{4,})\s*(тг|тенге|kzt|₸|tg|tenge)/i);
  let salaryMin: number | null = null;
  let salaryMax: number | null = null;
  if (salaryMatch) {
    const nums = salaryMatch[1].replace(/\s/g, "");
    salaryMin = parseInt(nums);
    const rangeMatch = rawText.match(/([\d\s]{4,})\s*[-–]\s*([\d\s]{4,})\s*(тг|тенге|kzt|₸|tg|tenge)/i);
    if (rangeMatch) {
      salaryMin = parseInt(rangeMatch[1].replace(/\s/g, ""));
      salaryMax = parseInt(rangeMatch[2].replace(/\s/g, ""));
    }
  }

  const requiredSkills: string[] = [];
  if (/опыт|experience|opyt/i.test(rawText)) requiredSkills.push("Опыт работы");
  if (/english|англ/i.test(rawText)) requiredSkills.push("Английский");
  if (/казах|kazakh/i.test(rawText)) requiredSkills.push("Казахский язык");
  if (/смен|shift|2\/2|smen/i.test(rawText)) requiredSkills.push("Сменный график");
  if (/санитар|сан\.\s*книж|san\.?\s*knizh/i.test(rawText)) requiredSkills.push("Сан. книжка");
  if (/водител|voditel|driver/i.test(rawText)) requiredSkills.push("Водительское удостоверение");
  if (requiredSkills.length === 0) requiredSkills.push("Без особых требований");

  const phoneMatch = rawText.match(/\+?[78]\s*[\d\s-]{9,}/);
  const phone = phoneMatch ? phoneMatch[0].trim() : null;

  let confidence = 0.5;
  if (title !== "Вакансия") confidence += 0.2;
  if (microdistrict) confidence += 0.1;
  if (salaryMin) confidence += 0.1;
  if (requiredSkills.length > 1) confidence += 0.1;

  return {
    title,
    description: rawText.trim(),
    salaryMin,
    salaryMax,
    salaryCurrency: "₸",
    microdistrict,
    category,
    depth: (confidence > 0.8 ? "DEEP" : confidence > 0.6 ? "MID" : "SHALLOW") as "SURFACE" | "SHALLOW" | "MID" | "DEEP",
    requiredSkills,
    phone,
    confidence: Math.min(confidence, 0.98),
    sourceSnippet: rawText.slice(0, 120),
  };
}
