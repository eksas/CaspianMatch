/**
 * 🌊 CaspianMatch Telegram Bot
 * Employment platform bot for Aktau, Kazakhstan
 * 
 * Clean platform — no demo data.
 * Employers post vacancies → employees see them instantly.
 */

import TelegramBot from "node-telegram-bot-api";
import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ── Config ────────────────────────────────────────────────────────────────────
const TOKEN = "8787888388:AAGcF8BivoBEmh-NQpiW3mRXOwMh8U5aj6E";
const WEB_APP_URL = "https://caspianmatch.kz";
const API_PORT = 3000;

const bot = new TelegramBot(TOKEN, { polling: true });

// ── Shared data store (in-memory) ────────────────────────────────────────────
let JOBS = [
  { id: "j1", title: "Бариста", company: "Coffee Point", salary: "180 000 ₸", microdistrict: 14, category: "waiter", isAIParsed: true, description: "Утренние смены на набережной. Приветствуем латте-арт.", requirements: ["Смена 2/2", "Базовый английский"], match: 94 },
  { id: "j2", title: "Доставщик", company: "DIDI Food", salary: "150 000 ₸", microdistrict: 22, category: "courier", isAIParsed: false, description: "Своя машина или скутер. Гибкий график, еженедельные выплаты.", requirements: ["Свой транспорт"], match: 82 },
];
let APPLICATIONS = [];

// ── Express API server (shared between bot + web app) ────────────────────────
const api = express();
api.use(cors());
api.use(express.json());

// Health check
api.get("/health", (_req, res) => res.json({ ok: true }));

// GET all jobs
api.get("/jobs", (_req, res) => {
  res.json({ jobs: JOBS });
});

// POST new job (employer creates vacancy)
api.post("/jobs", (req, res) => {
  const body = req.body;
  const job = {
    id: "j" + Date.now(),
    title: body.title || "Вакансия",
    company: body.company || "Компания",
    salary: body.salary || "Договорная",
    microdistrict: body.microdistrict || 14,
    category: body.category || "waiter",
    isAIParsed: body.isAIParsed || false,
    description: body.description || "",
    requirements: body.requirements || [],
    createdAt: Date.now(),
    match: body.match || Math.floor(Math.random() * 30 + 70),
    urgent: body.urgent || false,
  };
  JOBS.unshift(job);
  res.json({ job });
});

// GET applications
api.get("/applications", (_req, res) => {
  res.json({ applications: APPLICATIONS });
});

// POST new application
api.post("/applications", (req, res) => {
  const body = req.body;
  const application = {
    id: "a" + Date.now(),
    jobId: body.jobId,
    applicantId: body.applicantId || "tg-user",
    name: body.name || "Аноним",
    phone: body.phone || "",
    note: body.note || "",
    status: "PENDING",
    createdAt: Date.now(),
  };
  APPLICATIONS.unshift(application);
  res.json({ application });
});

// POST approve application
api.post("/applications/:id/approve", (req, res) => {
  const app = APPLICATIONS.find((a) => a.id === req.params.id);
  if (app) {
    app.status = "APPROVED";
    res.json({ application: app });
  } else {
    res.status(404).json({ error: "Not found" });
  }
});

// Saved jobs
let SAVED = [];
api.get("/saved", (_req, res) => res.json({ saved: SAVED }));
api.post("/saved/toggle", (req, res) => {
  const { jobId } = req.body;
  if (SAVED.includes(jobId)) {
    SAVED = SAVED.filter((id) => id !== jobId);
  } else {
    SAVED.push(jobId);
  }
  res.json({ saved: SAVED });
});

// Match jobs
api.post("/match-jobs", async (req, res) => {
  try {
    const { jobs, seeker } = req.body;
    const system = `Ты — AI-матчер вакансий Caspian. На основе анкеты соискателя оцени каждую вакансию от 0 до 100.
Учитывай: совпадение навыков, близость района (±3 МКР — сильный плюс), интересы.
Верни JSON без прозы: {"scores":[{"id":string,"score":number,"reason":string(<=60 симв. по-русски)}]}`;
    const prompt = `Соискатель: ${JSON.stringify(seeker)}\nВакансии: ${JSON.stringify(jobs.slice(0, 10))}`;
    const result = await geminiModel.generateContent(system + "\n\n" + prompt);
    const parsed = JSON.parse(result.response.text().replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim());
    res.json({ scores: parsed.scores || [] });
  } catch (error) {
    console.error("Match Jobs Error:", error);
    res.json({ scores: [] });
  }
});

// ── Gemini AI endpoints ────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI("AIzaSyBtqWYxvemb-XBGC4xecIpNgP038nv6fo0");
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

api.post("/pearl/message", async (req, res) => {
  try {
    const { messages } = req.body;
    let text = "Извините, я не понял ваш запрос.";
    
    // We get messages in the format: [{role: "user"|"model", text: "..."}]
    const p = messages.map(m => m.role + ": " + m.text).join("\n") + "\nmodel: ";
    
    // Set a very strict prompt for "Жемчуг"
    const prompt = `Ты - Жемчуг (Pearl), умный и дружелюбный AI-наставник платформы поиска работы CaspianMatch в городе Актау. Помогай соискателям составлять резюме, готовиться к собеседованиям и узнавать о зарплатах.\n\nКонтекст диалога:\n${p}`;
    
    const result = await geminiModel.generateContent(prompt);
    if (result && result.response) {
      text = result.response.text();
    }
    res.json({ text });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.json({ text: "Не удалось получить ответ от AI. Пожалуйста, попробуйте позже." });
  }
});

api.post("/parse-voice", async (req, res) => {
  try {
    const { audioBase64, mimeType } = req.body;
    
    // Use gemini to parse voice from audio
    const prompt = `Это аудио-запись соискателя или работодателя для проекта CaspianMatch.
Если это работодатель, который говорит о вакансии (например, "Ищу баристу в 14 мкр, зарплата 180000"), верни JSON-объект: 
{"type": "vacancy", "title": "...", "salaryMin": 180000, "microdistrict": 14, "category": "waiter", "requiredSkills": [], "description": "..."}

Если это соискатель (например, "Я хочу работать курьером, 18 лет, есть права"):
{"type": "candidate", "role": "Курьер", "age": 18, "skills": ["Водительское удостоверение"]}

Верни ТОЛЬКО валидный JSON, без маркдауна, без \`\`\`json.`;

    const result = await geminiModel.generateContent([
      prompt,
      {
        inlineData: {
          data: audioBase64.includes(",") ? audioBase64.split(",")[1] : audioBase64, // Trim prefix if exists
          mimeType: mimeType || "audio/mp3",
        }
      }
    ]);
    
    let rawText = result.response.text().trim();
    // Strip possible markdown
    if (rawText.startsWith("\`\`\`json")) {
        rawText = rawText.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
    } else if (rawText.startsWith("\`\`\`")) {
        rawText = rawText.replace(/\`\`\`/g, "").trim();
    }

    res.json({ parsed: JSON.parse(rawText) });
  } catch (error) {
    console.error("Parse Voice Error:", error);
    res.status(500).json({ error: "Failed to parse voice audio." });
  }
});

api.post("/parse-query", async (req, res) => {
  try {
    const { query } = req.body;
    const system = `Extract structured intent from a job search query in Russian, Kazakh, or English.
Return JSON only, no prose. Null unknown fields.
Shape: {"role": string|null, "microdistricts": number[], "minSalary": number|null, "depth": "SURFACE"|"SHALLOW"|"MID"|"DEEP"|null, "schedule": string|null, "language": "RU"|"KZ"|"EN"}`;
    const result = await geminiModel.generateContent(system + "\n\nQuery: " + query);
    res.json({ intent: JSON.parse(result.response.text().replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim()) });
  } catch (error) {
    console.error("Parse Query Error:", error);
    res.status(500).json({ error: "Failed to parse query." });
  }
});

api.post("/vacancies/parse-whatsapp", async (req, res) => {
  try {
    const { rawText } = req.body;
    const system = `You extract a structured job posting from an informal Kazakh/Russian chat message.
Return JSON. Use null for missing fields. Shape: {"title": string, "description": string, "salaryMin": number|null, "salaryMax": number|null, "salaryCurrency": "KZT", "microdistrict": number|null, "category": "food"|"retail"|"construction"|"logistics"|"childcare"|"beauty"|"other", "depth": "SURFACE"|"SHALLOW"|"MID"|"DEEP", "requiredSkills": string[], "phone": string|null, "confidence": number, "sourceSnippet": string}`;
    const result = await geminiModel.generateContent(system + "\n\nInput:\n" + rawText);
    res.json({ parsed: JSON.parse(result.response.text().replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim()) });
  } catch (error) {
    console.error("Parse WhatsApp Error:", error);
    res.status(500).json({ error: "Failed to parse advertisement." });
  }
});

api.post("/shadow-interview/start", async (req, res) => {
  try {
    const { jobId } = req.body;
    const job = JOBS.find(j => j.id === jobId) || JOBS[0];
    const system = `Ты — AI-рекрутер Caspian. Работодатель просит задать 3 коротких вопроса кандидату перед откликом.
Вопросы — на русском, практичные, проверяют надёжность. Верни JSON: {"questions": string[]}`;
    const result = await geminiModel.generateContent(system + "\n\nJob: " + JSON.stringify(job));
    res.json({ questions: JSON.parse(result.response.text().replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim()).questions });
  } catch (error) {
    console.error("Shadow Interview Error:", error);
    res.json({ questions: ["Расскажите о своем опыте?", "Почему вы хотите у нас работать?"] });
  }
});

// Catch-all for unknown routes
api.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

api.listen(API_PORT, () => {
  console.log(`  📡 Shared API: http://localhost:${API_PORT}`);
});

// ── Emoji ─────────────────────────────────────────────────────────────────────
const E = {
  wave: "🌊", fire: "🔥", star: "⭐", briefcase: "💼", pin: "📍",
  money: "💰", search: "🔍", pearl: "🦪", sparkle: "✨",
  check: "✅", chart: "📊", user: "👤",
  coffee: "☕", truck: "🚚", chef: "👨‍🍳", store: "🏪", cash: "💳",
  rocket: "🚀", heart: "❤️", brain: "🧠",
  arrow: "➡️", back: "◀️", next: "▶️",
  zap: "⚡", globe: "🌍", home: "🏠", plus: "➕",
};

const CATEGORIES = {
  all: { label: "Все вакансии", emoji: E.briefcase },
  waiter: { label: "Кафе / Ресторан", emoji: E.coffee },
  courier: { label: "Доставка", emoji: E.truck },
  cashier: { label: "Касса", emoji: E.cash },
  cook: { label: "Кухня", emoji: E.chef },
  retail: { label: "Торговля", emoji: E.store },
};

// ── User state ────────────────────────────────────────────────────────────────
const userState = new Map();
function getState(chatId) {
  if (!userState.has(chatId)) {
    userState.set(chatId, {
      page: 0, filter: "all", district: null,
      applying: null,        // jobId being applied to
      posting: null,         // step in posting flow
      postingData: {},       // accumulated vacancy data
    });
  }
  return userState.get(chatId);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function esc(text) {
  return String(text).replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

function jobCard(job, i = null) {
  const idx = i !== null ? `*${String(i + 1).padStart(2, "0")}*  ` : "";
  const urgent = job.urgent ? ` ${E.zap}` : "";
  return `${idx}${E.briefcase} *${esc(job.title)}*${urgent}
${E.home} ${esc(job.company)} · ${E.pin} ${job.microdistrict} МКР
${E.money} ${esc(job.salary)}`;
}

function jobDetail(job) {
  const urgent = job.urgent ? `\n${E.zap} *СРОЧНАЯ ВАКАНСИЯ*` : "";
  const reqs = (job.requirements || []).map((r) => `  • ${esc(r)}`).join("\n") || "  • Не указаны";
  return `${E.wave} *CASPIANMATCH*
━━━━━━━━━━━━━━━━━━━

${E.briefcase} *${esc(job.title)}*${urgent}
${E.home} ${esc(job.company)}
${E.pin} Район: *${job.microdistrict} МКР*
${E.money} Зарплата: *${esc(job.salary)}*

━━━━━━━━━━━━━━━━━━━

*Описание:*
${esc(job.description || "Не указано")}

*Требования:*
${reqs}`;
}

const PAGE_SIZE = 5;

// ── /start ────────────────────────────────────────────────────────────────────
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const name = esc(msg.from?.first_name ?? "друг");
  getState(chatId);

  const text = `${E.wave} *Салем, ${name}\\!*

Добро пожаловать в *CaspianMatch* — платформу поиска работы в Актау\\.

*Для соискателей:*
${E.search} /jobs — Все вакансии
${E.fire} /hot — Срочные вакансии

*Для работодателей:*
${E.plus} /post — Разместить вакансию

${E.chart} /stats — Статистика
${E.globe} /webapp — Веб\\-приложение`;

  await bot.sendMessage(chatId, text, {
    parse_mode: "MarkdownV2",
    reply_markup: {
      inline_keyboard: [
        [
          { text: `${E.search} Вакансии`, callback_data: "cat_all" },
          { text: `${E.plus} Разместить`, callback_data: "post_start" },
        ],
        [
          { text: `${E.globe} Открыть приложение`, url: WEB_APP_URL },
        ],
      ],
    },
  });
});

// ── /jobs ─────────────────────────────────────────────────────────────────────
bot.onText(/\/jobs/, async (msg) => {
  const s = getState(msg.chat.id);
  s.page = 0; s.filter = "all"; s.district = null;
  await sendJobList(msg.chat.id, s);
});

// ── Category shortcuts ───────────────────────────────────────────────────────
for (const [cmd, cat] of [
  ["cafe", "waiter"], ["delivery", "courier"],
  ["kitchen", "cook"], ["cashier", "cashier"], ["retail", "retail"],
]) {
  bot.onText(new RegExp(`\\/${cmd}`), async (msg) => {
    const s = getState(msg.chat.id);
    s.page = 0; s.filter = cat; s.district = null;
    await sendJobList(msg.chat.id, s);
  });
}

// ── /hot ──────────────────────────────────────────────────────────────────────
bot.onText(/\/hot/, async (msg) => {
  const chatId = msg.chat.id;
  const urgent = JOBS.filter((j) => j.urgent);
  if (urgent.length === 0) {
    await bot.sendMessage(chatId, `${E.check} Сейчас нет срочных вакансий\\.`, { parse_mode: "MarkdownV2" });
    return;
  }
  const lines = urgent.map((j, i) => jobCard(j, i)).join("\n\n");
  const btns = urgent.map((j) => [{ text: `${E.arrow} ${j.title} — ${j.company}`, callback_data: `job_${j.id}` }]);
  await bot.sendMessage(chatId, `${E.zap} *ГОРЯЩИЕ ВАКАНСИИ*\n━━━━━━━━━━━━━━━━━━━\n\n${lines}`, {
    parse_mode: "MarkdownV2",
    reply_markup: { inline_keyboard: btns },
  });
});

// ── /post — Employer posts a vacancy ─────────────────────────────────────────
bot.onText(/\/post/, async (msg) => {
  const chatId = msg.chat.id;
  const s = getState(chatId);
  s.posting = "title";
  s.postingData = {};
  await bot.sendMessage(chatId,
    `${E.plus} *Создание вакансии*\n\nШаг 1/6: Напиши *название должности*\n_\\(Например: Бариста, Курьер, Повар\\)_`,
    { parse_mode: "MarkdownV2" }
  );
});

// ── /stats ────────────────────────────────────────────────────────────────────
bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  const total = JOBS.length;
  const urgentCount = JOBS.filter((j) => j.urgent).length;
  const appsCount = APPLICATIONS.length;

  const text = total === 0
    ? `${E.chart} *СТАТИСТИКА*\n━━━━━━━━━━━━━━━━━━━\n\nПлатформа пока пуста\\.\nРазмести первую вакансию: /post`
    : `${E.chart} *СТАТИСТИКА*\n━━━━━━━━━━━━━━━━━━━\n\n${E.briefcase} Вакансий: *${total}*\n${E.zap} Срочных: *${urgentCount}*\n${E.user} Откликов: *${appsCount}*`;

  await bot.sendMessage(chatId, text, { parse_mode: "MarkdownV2" });
});

// ── /webapp ───────────────────────────────────────────────────────────────────
bot.onText(/\/webapp/, async (msg) => {
  await bot.sendMessage(msg.chat.id,
    `${E.globe} *Открой полное приложение CaspianMatch:*`,
    {
      parse_mode: "MarkdownV2",
      reply_markup: {
        inline_keyboard: [[{ text: `${E.rocket} Открыть CaspianMatch`, url: WEB_APP_URL }]],
      },
    }
  );
});

// ── /cancel ───────────────────────────────────────────────────────────────────
bot.onText(/\/cancel/, async (msg) => {
  const s = getState(msg.chat.id);
  s.applying = null;
  s.posting = null;
  s.postingData = {};
  await bot.sendMessage(msg.chat.id, `${E.check} Отменено\\.`, { parse_mode: "MarkdownV2" });
});

// ── Send paginated job list ──────────────────────────────────────────────────
async function sendJobList(chatId, state) {
  let filtered = [...JOBS];
  if (state.filter !== "all") filtered = filtered.filter((j) => j.category === state.filter);
  if (state.district) filtered = filtered.filter((j) => j.microdistrict === state.district);

  if (filtered.length === 0) {
    const emptyText = JOBS.length === 0
      ? `${E.search} Пока нет вакансий\\.\n\nРазместите первую: /post`
      : `${E.search} Вакансий не найдено по фильтру\\.`;
    await bot.sendMessage(chatId, emptyText, {
      parse_mode: "MarkdownV2",
      reply_markup: {
        inline_keyboard: [
          [{ text: `${E.briefcase} Все вакансии`, callback_data: "cat_all" }],
          [{ text: `${E.plus} Разместить вакансию`, callback_data: "post_start" }],
        ],
      },
    });
    return;
  }

  const start = state.page * PAGE_SIZE;
  const page = filtered.slice(start, start + PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const catInfo = CATEGORIES[state.filter] || CATEGORIES.all;
  const lines = page.map((j, i) => jobCard(j, start + i)).join("\n\n");

  const header = `${catInfo.emoji} *${esc(catInfo.label)}*
${E.chart} ${filtered.length} вакансий · Стр\\. ${state.page + 1}/${totalPages}
━━━━━━━━━━━━━━━━━━━\n\n`;

  const jobBtns = page.map((j) => [
    { text: `${j.urgent ? E.zap : E.arrow} ${j.title} — ${j.company}`, callback_data: `job_${j.id}` },
  ]);

  const nav = [];
  if (state.page > 0) nav.push({ text: `${E.back} Назад`, callback_data: "page_prev" });
  if (state.page < totalPages - 1) nav.push({ text: `${E.next} Далее`, callback_data: "page_next" });

  const keyboard = [...jobBtns];
  if (nav.length > 0) keyboard.push(nav);
  keyboard.push([
    { text: `${E.coffee} Кафе`, callback_data: "cat_waiter" },
    { text: `${E.truck} Доставка`, callback_data: "cat_courier" },
    { text: `${E.chef} Кухня`, callback_data: "cat_cook" },
  ]);
  keyboard.push([
    { text: `${E.cash} Касса`, callback_data: "cat_cashier" },
    { text: `${E.store} Торговля`, callback_data: "cat_retail" },
    { text: `${E.briefcase} Все`, callback_data: "cat_all" },
  ]);

  await bot.sendMessage(chatId, header + lines, {
    parse_mode: "MarkdownV2",
    reply_markup: { inline_keyboard: keyboard },
  });
}

// ── Callback queries ─────────────────────────────────────────────────────────
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const state = getState(chatId);
  await bot.answerCallbackQuery(query.id);

  // Category filter
  if (data.startsWith("cat_")) {
    state.filter = data.replace("cat_", "");
    state.page = 0;
    await sendJobList(chatId, state);
    return;
  }

  // Pagination
  if (data === "page_next") { state.page++; await sendJobList(chatId, state); return; }
  if (data === "page_prev") { state.page = Math.max(0, state.page - 1); await sendJobList(chatId, state); return; }

  // Job detail
  if (data.startsWith("job_")) {
    const job = JOBS.find((j) => j.id === data.replace("job_", ""));
    if (!job) return;
    await bot.sendMessage(chatId, jobDetail(job), {
      parse_mode: "MarkdownV2",
      reply_markup: {
        inline_keyboard: [
          [{ text: `${E.rocket} Откликнуться`, callback_data: `apply_${job.id}` }],
          [{ text: `${E.back} К вакансиям`, callback_data: "cat_all" }],
        ],
      },
    });
    return;
  }

  // Apply
  if (data.startsWith("apply_")) {
    const jobId = data.replace("apply_", "");
    const job = JOBS.find((j) => j.id === jobId);
    if (!job) return;
    state.applying = jobId;
    await bot.sendMessage(chatId,
      `${E.rocket} *Отклик на вакансию*\n\n${E.briefcase} *${esc(job.title)}* — ${esc(job.company)}\n\nНапиши сообщение для работодателя:\n\nИли /cancel чтобы отменить\\.`,
      { parse_mode: "MarkdownV2" }
    );
    return;
  }

  // Start posting flow
  if (data === "post_start") {
    state.posting = "title";
    state.postingData = {};
    await bot.sendMessage(chatId,
      `${E.plus} *Создание вакансии*\n\nШаг 1/6: Напиши *название должности*\n_\\(Например: Бариста, Курьер, Повар\\)_`,
      { parse_mode: "MarkdownV2" }
    );
    return;
  }

  // Category selection during posting
  if (data.startsWith("postcat_")) {
    const cat = data.replace("postcat_", "");
    state.postingData.category = cat;
    state.posting = "district";
    await bot.sendMessage(chatId,
      `${E.check} Категория: *${esc(CATEGORIES[cat]?.label || cat)}*\n\nШаг 4/6: Укажи *номер МКР* \\(район\\)\n_\\(Например: 14\\)_`,
      { parse_mode: "MarkdownV2" }
    );
    return;
  }

  // Urgent selection during posting
  if (data === "urgent_yes" || data === "urgent_no") {
    state.postingData.urgent = data === "urgent_yes";
    // Create the job
    const d = state.postingData;
    const job = {
      id: "j" + Date.now(),
      title: d.title,
      company: d.company,
      salary: d.salary,
      microdistrict: d.microdistrict,
      category: d.category || "waiter",
      isAIParsed: false,
      description: d.description || "",
      requirements: d.requirements || [],
      createdAt: Date.now(),
      match: Math.floor(Math.random() * 30 + 70),
      urgent: d.urgent,
    };
    JOBS.unshift(job);
    state.posting = null;
    state.postingData = {};

    await bot.sendMessage(chatId,
      `${E.check} *Вакансия создана\\!*\n\n${E.briefcase} *${esc(job.title)}*\n${E.home} ${esc(job.company)}\n${E.money} ${esc(job.salary)}\n${E.pin} ${job.microdistrict} МКР\n${job.urgent ? E.zap + " Срочная" : ""}\n\n_Вакансия уже видна соискателям в боте и веб\\-приложении\\!_`,
      {
        parse_mode: "MarkdownV2",
        reply_markup: {
          inline_keyboard: [
            [{ text: `${E.search} Посмотреть вакансии`, callback_data: "cat_all" }],
            [{ text: `${E.plus} Разместить ещё`, callback_data: "post_start" }],
          ],
        },
      }
    );
    return;
  }
});

// ── Free text handler ────────────────────────────────────────────────────────
bot.on("message", async (msg) => {
  if (!msg.text || msg.text.startsWith("/")) return;
  const chatId = msg.chat.id;
  const state = getState(chatId);
  const text = msg.text.trim();

  // ── Posting flow ───────────────────────
  if (state.posting) {
    switch (state.posting) {
      case "title":
        state.postingData.title = text;
        state.posting = "company";
        await bot.sendMessage(chatId,
          `${E.check} Должность: *${esc(text)}*\n\nШаг 2/6: Название *компании*`,
          { parse_mode: "MarkdownV2" }
        );
        return;

      case "company":
        state.postingData.company = text;
        state.posting = "salary";
        await bot.sendMessage(chatId,
          `${E.check} Компания: *${esc(text)}*\n\nШаг 3/6: Укажи *зарплату*\n_\\(Например: 180 000 ₸ или Договорная\\)_`,
          { parse_mode: "MarkdownV2" }
        );
        return;

      case "salary":
        state.postingData.salary = text;
        state.posting = "category";
        await bot.sendMessage(chatId,
          `${E.check} Зарплата: *${esc(text)}*\n\nШаг 4/6: Выбери *категорию*:`,
          {
            parse_mode: "MarkdownV2",
            reply_markup: {
              inline_keyboard: [
                [
                  { text: `${E.coffee} Кафе`, callback_data: "postcat_waiter" },
                  { text: `${E.truck} Доставка`, callback_data: "postcat_courier" },
                ],
                [
                  { text: `${E.chef} Кухня`, callback_data: "postcat_cook" },
                  { text: `${E.cash} Касса`, callback_data: "postcat_cashier" },
                ],
                [
                  { text: `${E.store} Торговля`, callback_data: "postcat_retail" },
                ],
              ],
            },
          }
        );
        return;

      case "district":
        const num = parseInt(text);
        if (isNaN(num) || num < 1 || num > 50) {
          await bot.sendMessage(chatId, `Укажи номер МКР от 1 до 50:`);
          return;
        }
        state.postingData.microdistrict = num;
        state.posting = "description";
        await bot.sendMessage(chatId,
          `${E.check} Район: *${num} МКР*\n\nШаг 5/6: Напиши *описание вакансии*\n_\\(Обязанности, график, условия\\)_`,
          { parse_mode: "MarkdownV2" }
        );
        return;

      case "description":
        state.postingData.description = text;
        state.posting = "urgent";
        await bot.sendMessage(chatId,
          `${E.check} Описание сохранено\\.\n\nШаг 6/6: Вакансия *срочная*?`,
          {
            parse_mode: "MarkdownV2",
            reply_markup: {
              inline_keyboard: [
                [
                  { text: `${E.zap} Да, срочная`, callback_data: "urgent_yes" },
                  { text: "Нет", callback_data: "urgent_no" },
                ],
              ],
            },
          }
        );
        return;
    }
    return;
  }

  // ── Application flow ───────────────────
  if (state.applying) {
    const job = JOBS.find((j) => j.id === state.applying);
    const userName = msg.from?.first_name ?? "Аноним";
    const userHandle = msg.from?.username ? `@${msg.from.username}` : "";

    // Save application
    const application = {
      id: "a" + Date.now(),
      jobId: state.applying,
      applicantId: String(msg.from?.id || ""),
      name: userName,
      phone: userHandle,
      note: text,
      status: "PENDING",
      createdAt: Date.now(),
    };
    APPLICATIONS.unshift(application);
    state.applying = null;

    const jobTitle = job ? esc(job.title) : "вакансию";
    const jobCompany = job ? esc(job.company) : "";

    await bot.sendMessage(chatId,
      `${E.check} *Отклик отправлен\\!*\n\n${E.briefcase} ${jobTitle} — ${jobCompany}\n${E.user} ${esc(userName)} ${esc(userHandle)}\n\n_Работодатель увидит ваш отклик\\._`,
      {
        parse_mode: "MarkdownV2",
        reply_markup: {
          inline_keyboard: [
            [{ text: `${E.search} Другие вакансии`, callback_data: "cat_all" }],
          ],
        },
      }
    );
    return;
  }

  // ── Default ────────────────────────────
  await bot.sendMessage(chatId,
    `${E.wave} Используйте команды:\n\n/jobs — Вакансии\n/post — Разместить вакансию\n/hot — Срочные\n/stats — Статистика`
  );
});

// ── Startup ──────────────────────────────────────────────────────────────────
console.log(`
╔══════════════════════════════════════════╗
║  🌊 CaspianMatch Telegram Bot           ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  Status: RUNNING (clean platform)        ║
║  Jobs: 0 (add via /post or web app)      ║
║  Mode: Polling + Express API             ║
╚══════════════════════════════════════════╝
`);
