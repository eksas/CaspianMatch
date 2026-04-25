import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();
app.use("*", logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

const PREFIX = "/make-server-7196478c";
const GEMINI_API_KEY = "AIzaSyCZvTQfWmtdrHw3hpzPRBbBeOsSYQJiUBo";
const GEMINI_MODEL = "gemini-3.1-flash-lite-preview";
const GEMINI_URL = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;

/* LOGGING */
type LogLevel = "info" | "warn" | "error";
type LogEntry = { id: string; ts: number; level: LogLevel; scope: string; message: string; meta?: unknown };
const LOG_BUFFER_KEY = "caspian:logs:buffer";
const LOG_MAX = 200;

async function logEvent(level: LogLevel, scope: string, message: string, meta?: unknown) {
  const entry: LogEntry = { id: crypto.randomUUID(), ts: Date.now(), level, scope, message, meta };
  console.log(`[${level.toUpperCase()}] ${scope}: ${message}${meta ? " " + JSON.stringify(meta) : ""}`);
  try {
    const buf = ((await kv.get(LOG_BUFFER_KEY)) as LogEntry[] | null) ?? [];
    await kv.set(LOG_BUFFER_KEY, [entry, ...buf].slice(0, LOG_MAX));
  } catch (e) {
    console.log(`Log persist failed: ${e}`);
  }
}

/* PASSWORD HASHING (PBKDF2-SHA256) */
const enc = new TextEncoder();
function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function hashPassword(password: string, salt: string): Promise<string> {
  const keyMat = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: enc.encode(salt), iterations: 100_000, hash: "SHA-256" },
    keyMat, 256,
  );
  return toHex(bits);
}
function makeToken(): string {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("");
}

/* AUTH via KV — no Supabase Auth dependency */
type SessionRec = { userId: string; expiresAt: number };
type UserRec = { id: string; email: string; passwordHash: string; salt: string; createdAt: number };

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

async function getUserByEmail(email: string): Promise<UserRec | null> {
  return (await kv.get(`useremail:${email.toLowerCase()}`)) as UserRec | null;
}

async function requireUser(req: Request) {
  const token = req.headers.get("Authorization")?.split(" ")[1];
  if (!token) {
    console.log("[requireUser] No Authorization header");
    return null;
  }
  // Reject bare anon JWT (not a session token)
  if (token.startsWith("eyJ")) {
    console.log("[requireUser] Received anon JWT instead of session token — unauthorized");
    return null;
  }
  let session: SessionRec | null = null;
  try {
    session = (await kv.get(`session:${token}`)) as SessionRec | null;
  } catch (e) {
    console.log(`[requireUser] KV read failed for session: ${e}`);
    return null;
  }
  if (!session) {
    console.log(`[requireUser] Session not found for token ${token.slice(0, 8)}…`);
    return null;
  }
  if (session.expiresAt < Date.now()) {
    console.log(`[requireUser] Session expired at ${new Date(session.expiresAt).toISOString()}`);
    return null;
  }
  let profile: { email: string } | null = null;
  try {
    profile = (await kv.get(`profile:${session.userId}`)) as { email: string } | null;
  } catch (e) {
    console.log(`[requireUser] KV read failed for profile: ${e}`);
    return null;
  }
  if (!profile) {
    console.log(`[requireUser] Profile missing for userId ${session.userId}`);
    return null;
  }
  return { id: session.userId, email: profile.email };
}

/* SEED */
const SEED_JOBS = [
  { id: "j1", title: "Бариста", company: "Coffee Point", salary: "180 000 ₸", microdistrict: 14, category: "waiter", isAIParsed: true, description: "Утренние смены на набережной. Приветствуем латте-арт.", requirements: ["Смена 2/2", "Базовый английский"], match: 94 },
  { id: "j2", title: "Доставщик", company: "DIDI Food", salary: "% от заказов", microdistrict: 22, category: "courier", isAIParsed: false, description: "Своя машина или скутер. Гибкий график, еженедельные выплаты.", requirements: ["Свой транспорт"], match: 82 },
  { id: "j3", title: "Помощник повара", company: "Шаурма №1", salary: "150 000 ₸", microdistrict: 3, category: "cook", isAIParsed: true, description: "Работа в команде, обучение на месте.", requirements: ["Санкнижка"], match: 88 },
  { id: "j4", title: "Строитель", company: "АктауСтрой", salary: "8 000 ₸/день", microdistrict: 11, category: "retail", isAIParsed: false, description: "Бригада 4 человека, подай заявку флотилией.", requirements: ["Физподготовка"], match: 71 },
  { id: "j5", title: "Продавец-консультант", company: "Beeline", salary: "140 000 + %", microdistrict: 15, category: "cashier", isAIParsed: false, description: "Салон связи, обучение продукту.", requirements: ["Коммуникабельность"], match: 65 },
  { id: "j6", title: "Няня", company: "Частная семья", salary: "2 000 ₸/час", microdistrict: 7, category: "cook", isAIParsed: false, description: "Выходные, двое детей 4 и 6 лет.", requirements: ["Опыт с детьми"], match: 78 },
  { id: "j7", title: "Администратор", company: "Aktau Beauty", salary: "200 000 ₸", microdistrict: 14, category: "retail", isAIParsed: true, description: "Салон красоты, запись клиентов, касса.", requirements: ["1С приветствуется"], match: 84 },
  { id: "j8", title: "Кассир", company: "Небо Супермаркет", salary: "160 000 ₸", microdistrict: 14, category: "cashier", isAIParsed: false, description: "5/2, полное обучение.", requirements: ["Внимательность"], match: 73 },
];

const SEED_SALARIES: Array<{ role: string; microdistrict: number; samples: number[] }> = [
  { role: "бариста",              microdistrict: 14, samples: [160000, 170000, 175000, 180000, 180000, 185000, 190000, 200000] },
  { role: "доставщик",            microdistrict: 22, samples: [120000, 140000, 150000, 160000, 170000, 180000, 190000] },
  { role: "помощник повара",      microdistrict: 3,  samples: [130000, 140000, 145000, 150000, 155000, 160000] },
  { role: "администратор",        microdistrict: 14, samples: [180000, 190000, 200000, 210000, 220000, 230000] },
  { role: "кассир",               microdistrict: 14, samples: [140000, 150000, 155000, 160000, 165000, 170000] },
  { role: "продавец-консультант", microdistrict: 15, samples: [120000, 130000, 135000, 140000, 150000, 160000] },
];

async function seedIfEmpty() {
  const flag = await kv.get("caspian:seeded:v4");
  if (flag) return;
  const now = Date.now();
  for (let i = 0; i < SEED_JOBS.length; i++) {
    const j = SEED_JOBS[i];
    const urgent = i === 0 || i === 2;
    await kv.set(`job:${j.id}`, { ...j, createdAt: now - i * 3600_000, ownerId: `seed-employer-${i % 3}`, urgent });
  }
  for (const row of SEED_SALARIES) {
    for (let i = 0; i < row.samples.length; i++) {
      const id = crypto.randomUUID();
      await kv.set(`salary:${id}`, {
        id, role: row.role, microdistrict: row.microdistrict, salary: row.samples[i],
        tipPerShift: null, hoursPerWeek: null, createdAt: now - i * 86400000,
      });
    }
  }
  await kv.set("caspian:seeded:v4", true);
}
seedIfEmpty().catch((e) => console.log(`Seed error: ${e}`));

app.get(`${PREFIX}/health`, async (c) => {
  try {
    // Test KV read/write to confirm DB connectivity
    const testKey = "caspian:health-ping";
    await kv.set(testKey, { ts: Date.now() });
    const val = await kv.get(testKey);
    return c.json({ status: "ok", kv: !!val, ts: Date.now() });
  } catch (e) {
    console.log(`Health KV test failed: ${e}`);
    return c.json({ status: "degraded", kv: false, error: String(e) }, 503);
  }
});

/* LOGS */
app.get(`${PREFIX}/logs`, async (c) => {
  const buf = ((await kv.get(LOG_BUFFER_KEY)) as LogEntry[] | null) ?? [];
  return c.json({ logs: buf });
});
app.post(`${PREFIX}/logs/clear`, async (c) => {
  await kv.set(LOG_BUFFER_KEY, []);
  return c.json({ ok: true });
});
app.post(`${PREFIX}/logs`, async (c) => {
  try {
    const { level, scope, message, meta } = await c.req.json();
    await logEvent((level as LogLevel) ?? "info", scope ?? "client", String(message ?? ""), meta);
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: String(e) }, 500);
  }
});

/* AUTH ROUTES */
app.post(`${PREFIX}/auth/signup`, async (c) => {
  try {
    const { email, password, name, role, company, microdistrict, skills, bio, interests } = await c.req.json();
    if (!email || !password || !name || !role) {
      await logEvent("warn", "auth/signup", "Missing fields", { hasEmail: !!email, hasPw: !!password, hasName: !!name, hasRole: !!role });
      return c.json({ error: "Missing required fields (email, password, name, role)" }, 400);
    }
    if (password.length < 6) return c.json({ error: "Password must be at least 6 characters" }, 400);
    const normEmail = String(email).toLowerCase().trim();
    const existing = await getUserByEmail(normEmail);
    if (existing) {
      await logEvent("warn", "auth/signup", `Email already registered: ${normEmail}`);
      return c.json({ error: "This email is already registered" }, 409);
    }
    const id = crypto.randomUUID();
    const salt = makeToken().slice(0, 16);
    const passwordHash = await hashPassword(password, salt);
    const userRec: UserRec = { id, email: normEmail, passwordHash, salt, createdAt: Date.now() };
    await kv.set(`useremail:${normEmail}`, userRec);

    const profile = {
      id, email: normEmail, name, role,
      company: company ?? null, microdistrict: microdistrict ?? null,
      skills: Array.isArray(skills) ? skills : [],
      interests: Array.isArray(interests) ? interests : [],
      bio: typeof bio === "string" ? bio : "",
      avatarHue: Math.floor(Math.random() * 360),
      createdAt: Date.now(),
    };
    await kv.set(`profile:${id}`, profile);

    const token = makeToken();
    await kv.set(`session:${token}`, { userId: id, expiresAt: Date.now() + SESSION_TTL_MS } as SessionRec);
    await logEvent("info", "auth/signup", `Signed up ${normEmail}`, { id, role });
    return c.json({ token, profile });
  } catch (e) {
    await logEvent("error", "auth/signup", `Unhandled: ${e}`);
    return c.json({ error: String(e) }, 500);
  }
});

app.post(`${PREFIX}/auth/signin`, async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) return c.json({ error: "Email and password required" }, 400);
    const normEmail = String(email).toLowerCase().trim();
    const user = await getUserByEmail(normEmail);
    if (!user) {
      await logEvent("warn", "auth/signin", `No such user: ${normEmail}`);
      return c.json({ error: "Invalid email or password" }, 401);
    }
    const hash = await hashPassword(password, user.salt);
    if (hash !== user.passwordHash) {
      await logEvent("warn", "auth/signin", `Bad password for ${normEmail}`);
      return c.json({ error: "Invalid email or password" }, 401);
    }
    const profile = await kv.get(`profile:${user.id}`);
    if (!profile) return c.json({ error: "Profile missing" }, 500);
    const token = makeToken();
    await kv.set(`session:${token}`, { userId: user.id, expiresAt: Date.now() + SESSION_TTL_MS } as SessionRec);
    await logEvent("info", "auth/signin", `Signed in ${normEmail}`);
    return c.json({ token, profile });
  } catch (e) {
    await logEvent("error", "auth/signin", `Unhandled: ${e}`);
    return c.json({ error: String(e) }, 500);
  }
});

app.post(`${PREFIX}/auth/signout`, async (c) => {
  const token = c.req.raw.headers.get("Authorization")?.split(" ")[1];
  if (token) await kv.del(`session:${token}`);
  return c.json({ ok: true });
});

app.get(`${PREFIX}/me`, async (c) => {
  const user = await requireUser(c.req.raw);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const profile = await kv.get(`profile:${user.id}`);
  if (!profile) return c.json({ error: "Profile not found" }, 404);
  return c.json({ profile });
});

app.put(`${PREFIX}/me`, async (c) => {
  const user = await requireUser(c.req.raw);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  try {
    const patch = await c.req.json();
    const current = await kv.get(`profile:${user.id}`);
    const next = { ...(current ?? {}), ...patch, id: user.id };
    await kv.set(`profile:${user.id}`, next);
    return c.json({ profile: next });
  } catch (e) {
    await logEvent("error", "me/put", `${user.id}: ${e}`);
    return c.json({ error: String(e) }, 500);
  }
});

/* JOBS */
app.get(`${PREFIX}/jobs`, async (c) => {
  try {
    const jobs = await kv.getByPrefix("job:");
    jobs.sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return c.json({ jobs });
  } catch (e) {
    await logEvent("error", "jobs/list", String(e));
    return c.json({ error: String(e) }, 500);
  }
});

app.post(`${PREFIX}/jobs`, async (c) => {
  const user = await requireUser(c.req.raw);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  try {
    const body = await c.req.json();
    const id = body.id ?? crypto.randomUUID();
    const job = {
      id, title: body.title, company: body.company,
      salary: body.salary ?? "Договорная",
      microdistrict: body.microdistrict,
      category: body.category,
      isAIParsed: !!body.isAIParsed,
      description: body.description ?? "",
      requirements: body.requirements ?? [],
      match: body.match ?? 80,
      urgent: !!body.urgent,
      createdAt: body.createdAt ?? Date.now(),
      ownerId: user.id,
    };
    await kv.set(`job:${id}`, job);
    return c.json({ job });
  } catch (e) {
    await logEvent("error", "jobs/create", `${user.id}: ${e}`);
    return c.json({ error: String(e) }, 500);
  }
});

/* APPLICATIONS */
app.get(`${PREFIX}/applications`, async (c) => {
  const user = await requireUser(c.req.raw);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  try {
    const profile = await kv.get(`profile:${user.id}`);
    const all = await kv.getByPrefix("application:");
    const mine = profile?.role === "EMPLOYER"
      ? all
      : all.filter((a: any) => a.applicantId === user.id);
    mine.sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return c.json({ applications: mine });
  } catch (e) {
    await logEvent("error", "applications/list", `${user.id}: ${e}`);
    return c.json({ error: String(e) }, 500);
  }
});

app.post(`${PREFIX}/applications`, async (c) => {
  const user = await requireUser(c.req.raw);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  try {
    const body = await c.req.json();
    const id = body.id ?? crypto.randomUUID();
    const application = {
      id, jobId: body.jobId, applicantId: user.id,
      name: body.name, phone: body.phone, note: body.note ?? "",
      status: "PENDING", createdAt: body.createdAt ?? Date.now(),
    };
    await kv.set(`application:${id}`, application);
    return c.json({ application });
  } catch (e) {
    await logEvent("error", "applications/create", `${user.id}: ${e}`);
    return c.json({ error: String(e) }, 500);
  }
});

app.post(`${PREFIX}/applications/:id/approve`, async (c) => {
  const user = await requireUser(c.req.raw);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  try {
    const id = c.req.param("id");
    const existing = await kv.get(`application:${id}`);
    if (!existing) return c.json({ error: "Application not found" }, 404);
    const next = { ...existing, status: "APPROVED" };
    await kv.set(`application:${id}`, next);
    return c.json({ application: next });
  } catch (e) {
    await logEvent("error", "applications/approve", String(e));
    return c.json({ error: String(e) }, 500);
  }
});

/* SAVED */
app.get(`${PREFIX}/saved`, async (c) => {
  const user = await requireUser(c.req.raw);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const saved = (await kv.get(`saved:${user.id}`)) ?? [];
  return c.json({ saved });
});

app.post(`${PREFIX}/saved/toggle`, async (c) => {
  const user = await requireUser(c.req.raw);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  try {
    const { jobId } = await c.req.json();
    const current: string[] = (await kv.get(`saved:${user.id}`)) ?? [];
    const next = current.includes(jobId) ? current.filter((x) => x !== jobId) : [...current, jobId];
    await kv.set(`saved:${user.id}`, next);
    return c.json({ saved: next });
  } catch (e) {
    await logEvent("error", "saved/toggle", `${user.id}: ${e}`);
    return c.json({ error: String(e) }, 500);
  }
});

/* PARSE-QUERY — Magic Search intent extraction */
async function callGemini(prompt: string, systemInstruction: string): Promise<string> {
  const apiKey = GEMINI_API_KEY;
  const res = await fetch(GEMINI_URL(apiKey), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { temperature: 0.2, maxOutputTokens: 800, responseMimeType: "application/json" },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
}

app.post(`${PREFIX}/parse-query`, async (c) => {
  try {
    const { query } = await c.req.json();
    if (!query) return c.json({ error: "query required" }, 400);
    const system = `Extract structured intent from a job search query in Russian, Kazakh, or English.
Return JSON only, no prose. Null unknown fields.
Shape:
{"role": string|null, "microdistricts": number[], "minSalary": number|null, "depth": "SURFACE"|"SHALLOW"|"MID"|"DEEP"|null, "schedule": string|null, "language": "RU"|"KZ"|"EN"}`;
    const text = await callGemini(`Query: "${query}"`, system);
    try {
      const parsed = JSON.parse(text);
      return c.json({ intent: parsed });
    } catch {
      await logEvent("warn", "parse-query", `Non-JSON from Gemini: ${text.slice(0, 200)}`);
      return c.json({ intent: null, raw: text });
    }
  } catch (e) {
    await logEvent("error", "parse-query", String(e));
    return c.json({ error: String(e) }, 500);
  }
});

app.post(`${PREFIX}/vacancies/parse-whatsapp`, async (c) => {
  const user = await requireUser(c.req.raw);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  try {
    const { rawText } = await c.req.json();
    if (!rawText) return c.json({ error: "rawText required" }, 400);
    const system = `You extract a structured job posting from an informal Kazakh/Russian chat message.
Return JSON. Use null for missing fields. Keep original phrasing in 'sourceSnippet'.
Shape:
{"title": string, "description": string, "salaryMin": number|null, "salaryMax": number|null, "salaryCurrency": "KZT", "microdistrict": number|null, "category": "food"|"retail"|"construction"|"logistics"|"childcare"|"beauty"|"other", "depth": "SURFACE"|"SHALLOW"|"MID"|"DEEP", "requiredSkills": string[], "phone": string|null, "confidence": number, "sourceSnippet": string}`;
    const text = await callGemini(`Input:\n"""\n${rawText}\n"""`, system);
    try {
      const parsed = JSON.parse(text);
      return c.json({ parsed });
    } catch {
      await logEvent("warn", "parse-whatsapp", `Non-JSON: ${text.slice(0, 200)}`);
      return c.json({ error: "Could not parse", raw: text }, 500);
    }
  } catch (e) {
    await logEvent("error", "parse-whatsapp", String(e));
    return c.json({ error: String(e) }, 500);
  }
});

/* PEARL */
app.post(`${PREFIX}/pearl/message`, async (c) => {
  try {
    const { messages } = await c.req.json();
    const apiKey = GEMINI_API_KEY;

    const systemInstruction = `Ты — Жемчуг (Pearl), AI-наставник на платформе Caspian.
Аудитория: молодёжь Актау 16–25 лет, часто ищут первую работу.
Говори просто, тепло, но без снисходительности. Избегай корпоративного жаргона.
Переключайся на казахский, если пользователь пишет на казахском; на английский — если пишет на английском.
Помогай: написать био из 3 вопросов, отрепетировать звонок работодателю, перевести объявление с казахского, объяснить, что делает работник определённой профессии, сравнить две вакансии.
Не придумывай конкретные вакансии — говори только про общие принципы.
Отвечай коротко — 2-4 предложения, если пользователь не просит подробнее.`;

    const contents = (messages as Array<{ role: "user" | "model"; text: string }>).map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    const res = await fetch(GEMINI_URL(apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
      }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      await logEvent("error", "pearl", `Gemini ${res.status}: ${errBody.slice(0, 300)}`);
      return c.json({ error: `Gemini returned ${res.status}` }, 500);
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return c.json({ text });
  } catch (e) {
    await logEvent("error", "pearl", String(e));
    return c.json({ error: String(e) }, 500);
  }
});

/* MATCH-JOBS — personalized AI scoring of jobs against seeker profile */
app.post(`${PREFIX}/match-jobs`, async (c) => {
  const user = await requireUser(c.req.raw);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  try {
    const profile: any = await kv.get(`profile:${user.id}`);
    if (!profile) return c.json({ error: "Profile missing" }, 404);
    const jobs = await kv.getByPrefix("job:");

    const lite = jobs.map((j: any) => ({
      id: j.id, title: j.title, company: j.company, category: j.category,
      microdistrict: j.microdistrict, salary: j.salary,
      description: j.description, requirements: j.requirements ?? [],
    }));
    const seeker = {
      bio: profile.bio ?? "",
      skills: profile.skills ?? [],
      microdistrict: profile.microdistrict ?? null,
      interests: profile.interests ?? [],
    };

    const system = `Ты — AI-матчер вакансий Caspian. На основе анкеты соискателя оцени каждую вакансию от 0 до 100.
Учитывай: совпадение навыков, близость района (±3 МКР — сильный плюс), интересы, био, реалистичность.
Верни JSON без прозы: {"scores":[{"id":string,"score":number,"reason":string(<=60 симв. по-русски)}]}`;
    const prompt = `Соискатель: ${JSON.stringify(seeker)}\nВакансии: ${JSON.stringify(lite)}`;
    const text = await callGemini(prompt, system);
    try {
      const parsed = JSON.parse(text);
      return c.json({ scores: parsed.scores ?? [] });
    } catch {
      await logEvent("warn", "match-jobs", `Non-JSON from Gemini: ${text.slice(0, 200)}`);
      return c.json({ scores: [] });
    }
  } catch (e) {
    await logEvent("error", "match-jobs", String(e));
    return c.json({ error: String(e) }, 500);
  }
});

/* ==================== TRIO: LIGHTHOUSE · SWELL · SEA LEVEL ==================== */

/* LIGHTHOUSE — employer reputation (0-100) */
async function computeLighthouse(ownerId: string) {
  const jobs = (await kv.getByPrefix("job:")).filter((j: any) => j.ownerId === ownerId);
  const jobIds = new Set(jobs.map((j: any) => j.id));
  const apps = (await kv.getByPrefix("application:")).filter((a: any) => jobIds.has(a.jobId));

  if (apps.length === 0) {
    return { score: 50, breakdown: { responseRate: 50, responseSpeed: 50, followThrough: 50, quality: 50 }, applications: 0, jobs: jobs.length };
  }

  const resolved = apps.filter((a: any) => a.status === "APPROVED");
  const respondedWithin48h = resolved.filter((a: any) => {
    const r = a.respondedAt ?? a.updatedAt ?? (a.status === "APPROVED" ? (a.createdAt + 3600000) : null);
    return r && (r - a.createdAt) <= 48 * 3600 * 1000;
  });

  const responseRate = (respondedWithin48h.length / apps.length) * 100;

  const times = resolved
    .map((a: any) => (a.respondedAt ?? a.createdAt + 3600000) - a.createdAt)
    .sort((x: number, y: number) => x - y);
  const medianMs = times.length ? times[Math.floor(times.length / 2)] : 24 * 3600 * 1000;
  const medianHrs = medianMs / 3600000;
  const responseSpeed = Math.max(0, Math.min(100, 100 - medianHrs * 2));

  const followThrough = Math.min(100, (resolved.length / Math.max(1, apps.length)) * 100 + 20);

  const qScores = jobs.map((j: any) => {
    let q = 0;
    if (j.title?.length > 4) q += 25;
    if (j.description?.length > 40) q += 25;
    if (j.salary && j.salary !== "Договорная") q += 30;
    if ((j.requirements ?? []).length > 0) q += 20;
    return q;
  });
  const quality = qScores.length ? qScores.reduce((a: number, b: number) => a + b, 0) / qScores.length : 50;

  const score = Math.round(responseRate * 0.5 + responseSpeed * 0.2 + followThrough * 0.2 + quality * 0.1);
  return {
    score,
    breakdown: {
      responseRate: Math.round(responseRate),
      responseSpeed: Math.round(responseSpeed),
      followThrough: Math.round(followThrough),
      quality: Math.round(quality),
    },
    applications: apps.length,
    jobs: jobs.length,
  };
}

app.get(`${PREFIX}/lighthouse/:ownerId`, async (c) => {
  try {
    const ownerId = c.req.param("ownerId");
    const data = await computeLighthouse(ownerId);
    return c.json(data);
  } catch (e) {
    await logEvent("error", "lighthouse", String(e));
    return c.json({ error: String(e) }, 500);
  }
});

app.get(`${PREFIX}/lighthouse-by-job/:jobId`, async (c) => {
  try {
    const jobId = c.req.param("jobId");
    const job: any = await kv.get(`job:${jobId}`);
    if (!job) return c.json({ error: "Job not found" }, 404);
    const data = await computeLighthouse(job.ownerId ?? "");
    return c.json({ ...data, companyName: job.company });
  } catch (e) {
    return c.json({ error: String(e) }, 500);
  }
});

/* SWELL — vouches */
app.post(`${PREFIX}/vouches`, async (c) => {
  try {
    const { toUserId, fromName, fromPhone, note } = await c.req.json();
    if (!toUserId || !fromName || !fromPhone) return c.json({ error: "Missing fields" }, 400);
    const all = await kv.getByPrefix("vouch:");

    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const fromThisPhone = all.filter((v: any) => v.fromPhone === fromPhone && v.createdAt > weekAgo);
    if (fromThisPhone.length >= 3) return c.json({ error: "Лимит: 3 рекомендации в неделю с одного телефона." }, 429);
    const dup = all.find((v: any) => v.toUserId === toUserId && v.fromPhone === fromPhone);
    if (dup) return c.json({ error: "Ты уже поручился за этого человека." }, 409);

    const id = crypto.randomUUID();
    const vouch = {
      id, toUserId,
      fromName: String(fromName).trim().slice(0, 60),
      fromPhone: String(fromPhone).trim().slice(0, 40),
      note: note ? String(note).slice(0, 240) : "",
      createdAt: Date.now(),
    };
    await kv.set(`vouch:${id}`, vouch);
    return c.json({ vouch });
  } catch (e) {
    await logEvent("error", "vouches/create", String(e));
    return c.json({ error: String(e) }, 500);
  }
});

app.get(`${PREFIX}/vouches/:userId`, async (c) => {
  try {
    const userId = c.req.param("userId");
    const all = await kv.getByPrefix("vouch:");
    const list = all.filter((v: any) => v.toUserId === userId).sort((a: any, b: any) => b.createdAt - a.createdAt);
    const profile: any = await kv.get(`profile:${userId}`);
    return c.json({
      vouches: list.map((v: any) => ({ ...v, fromPhone: maskPhone(v.fromPhone) })),
      userName: profile?.name ?? null,
    });
  } catch (e) {
    return c.json({ error: String(e) }, 500);
  }
});

function maskPhone(p: string) {
  if (!p || p.length < 4) return "•••";
  return p.slice(0, 3) + "•".repeat(Math.max(2, p.length - 6)) + p.slice(-3);
}

/* SEA LEVEL — anonymous salary reports */
app.post(`${PREFIX}/salary-reports`, async (c) => {
  try {
    const { role, microdistrict, salary, tipPerShift, hoursPerWeek } = await c.req.json();
    if (!role || typeof microdistrict !== "number" || typeof salary !== "number") {
      return c.json({ error: "role, microdistrict, salary required" }, 400);
    }
    const id = crypto.randomUUID();
    const rec = {
      id,
      role: String(role).trim().toLowerCase().slice(0, 40),
      microdistrict,
      salary,
      tipPerShift: tipPerShift ?? null,
      hoursPerWeek: hoursPerWeek ?? null,
      createdAt: Date.now(),
    };
    await kv.set(`salary:${id}`, rec);
    return c.json({ ok: true });
  } catch (e) {
    await logEvent("error", "salary-reports/create", String(e));
    return c.json({ error: String(e) }, 500);
  }
});

app.get(`${PREFIX}/salary-stats`, async (c) => {
  try {
    const role = (c.req.query("role") ?? "").toLowerCase().trim();
    const md = c.req.query("microdistrict");
    const microdistrict = md ? parseInt(md) : null;
    const all = await kv.getByPrefix("salary:");
    const matches = all.filter((r: any) =>
      (!role || r.role === role) &&
      (microdistrict === null || r.microdistrict === microdistrict)
    );

    if (matches.length < 5) {
      return c.json({ count: matches.length, insufficient: true });
    }
    const salaries = matches.map((r: any) => r.salary).sort((a: number, b: number) => a - b);
    const median = salaries[Math.floor(salaries.length / 2)];
    const p25 = salaries[Math.floor(salaries.length * 0.25)];
    const p75 = salaries[Math.floor(salaries.length * 0.75)];
    const min = salaries[0];
    const max = salaries[salaries.length - 1];

    const buckets = 6;
    const step = (max - min) / buckets || 1;
    const distribution = Array.from({ length: buckets }, (_, i) => {
      const lo = min + i * step;
      const hi = i === buckets - 1 ? max + 1 : lo + step;
      return { lo: Math.round(lo), hi: Math.round(hi), n: salaries.filter((s: number) => s >= lo && s < hi).length };
    });

    return c.json({ count: matches.length, median, p25, p75, min, max, distribution });
  } catch (e) {
    await logEvent("error", "salary-stats", String(e));
    return c.json({ error: String(e) }, 500);
  }
});

/* VOICE ONBOARDING — Gemini multimodal audio parsing */
app.post(`${PREFIX}/parse-voice`, async (c) => {
  try {
    const { audioBase64, mimeType } = await c.req.json();
    if (!audioBase64) return c.json({ error: "audioBase64 required" }, 400);
    const apiKey = GEMINI_API_KEY;

    const system = `Ты извлекаешь анкету из голосового сообщения на русском или казахском.
Верни JSON без прозы. Неизвестные поля — null или пустой массив.
Shape:
{"microdistrict": number|null, "interests": string[], "skills": string[], "bio": string}
interests — общие направления (кафе, доставка, кухня, торговля, стройка, няня, красота, или свободная форма).
skills — конкретные умения (латте-арт, водительские права, казахский и т.д.).
bio — 1-2 предложения от первого лица, краткое саммари на русском.`;

    const res = await fetch(GEMINI_URL(apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { text: "Разбери это голосовое сообщение в структурированную анкету." },
            { inline_data: { mime_type: mimeType ?? "audio/webm", data: audioBase64 } },
          ],
        }],
        systemInstruction: { parts: [{ text: system }] },
        generationConfig: { temperature: 0.2, maxOutputTokens: 600, responseMimeType: "application/json" },
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      await logEvent("error", "parse-voice", `Gemini ${res.status}: ${body.slice(0, 300)}`);
      return c.json({ error: `Gemini ${res.status}` }, 500);
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    try {
      return c.json({ parsed: JSON.parse(text) });
    } catch {
      return c.json({ parsed: null, raw: text });
    }
  } catch (e) {
    await logEvent("error", "parse-voice", String(e));
    return c.json({ error: String(e) }, 500);
  }
});

/* SHADOW INTERVIEWER — 3 questions per job, then summarize */
app.post(`${PREFIX}/shadow-interview/start`, async (c) => {
  const user = await requireUser(c.req.raw);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  try {
    const { jobId } = await c.req.json();
    const job: any = await kv.get(`job:${jobId}`);
    if (!job) return c.json({ error: "Job not found" }, 404);
    const system = `Ты — AI-рекрутер Caspian. Работодатель просит задать 3 коротких вопроса кандидату перед откликом.
Вопросы — на русском, практичные, проверяют надёжность и навыки под конкретную роль. Не задавай банальности.
Верни JSON: {"questions": string[]}`;
    const text = await callGemini(
      `Вакансия: ${job.title} в "${job.company}", ${job.microdistrict} МКР. Описание: ${job.description}. Требования: ${(job.requirements ?? []).join(", ")}.`,
      system,
    );
    try {
      const parsed = JSON.parse(text);
      return c.json({ questions: (parsed.questions ?? []).slice(0, 3) });
    } catch {
      return c.json({ questions: [] });
    }
  } catch (e) {
    await logEvent("error", "shadow-interview/start", String(e));
    return c.json({ error: String(e) }, 500);
  }
});

app.post(`${PREFIX}/shadow-interview/summarize`, async (c) => {
  const user = await requireUser(c.req.raw);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  try {
    const { jobId, qa } = await c.req.json();
    const job: any = await kv.get(`job:${jobId}`);
    if (!job) return c.json({ error: "Job not found" }, 404);
    const system = `Ты — AI-рекрутер. На основе 3 ответов кандидата составь краткое саммари для работодателя (до 3 предложений, по-русски) и оцени fit 0-100.
Верни JSON: {"summary": string, "fit": number, "flags": string[]}`;
    const text = await callGemini(
      `Вакансия: ${job.title}. Ответы: ${JSON.stringify(qa)}`,
      system,
    );
    try {
      return c.json(JSON.parse(text));
    } catch {
      return c.json({ summary: "", fit: 0, flags: [] });
    }
  } catch (e) {
    await logEvent("error", "shadow-interview/summarize", String(e));
    return c.json({ error: String(e) }, 500);
  }
});

/* AI MENTOR — boost tips */
app.post(`${PREFIX}/boost-tips`, async (c) => {
  const user = await requireUser(c.req.raw);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  try {
    const { jobId } = await c.req.json();
    const profile: any = await kv.get(`profile:${user.id}`);
    const job: any = await kv.get(`job:${jobId}`);
    if (!job || !profile) return c.json({ error: "Missing data" }, 404);
    const system = `Ты — AI-наставник Жемчуг. Дай 3 конкретных совета, как соискателю повысить шансы на конкретную вакансию.
Каждый совет — 1 предложение на русском, практичное. Никакой воды.
Верни JSON: {"tips": [{"title": string, "detail": string, "boost": number}]}
boost — прирост шансов в процентах (5-40).`;
    const text = await callGemini(
      `Соискатель: ${JSON.stringify({ bio: profile.bio, skills: profile.skills, microdistrict: profile.microdistrict })}\nВакансия: ${JSON.stringify({ title: job.title, company: job.company, requirements: job.requirements, description: job.description, microdistrict: job.microdistrict })}`,
      system,
    );
    try {
      const parsed = JSON.parse(text);
      return c.json({ tips: (parsed.tips ?? []).slice(0, 3) });
    } catch {
      return c.json({ tips: [] });
    }
  } catch (e) {
    await logEvent("error", "boost-tips", String(e));
    return c.json({ error: String(e) }, 500);
  }
});

Deno.serve(app.fetch);