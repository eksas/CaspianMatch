CASPIAN
The hyper-local employment OS for the Caspian rim

A super-prompt / architectural specification — paste into Cursor, Gemini 2.5 Pro, or any frontier coding model to scaffold the full MVP.


0. Project brief
Name: Caspian
Domain suggestion: caspian.jobs / caspian.work / caspian.kz
Audience: Aktau youth 16–25 (seekers) and local SMB owners (employers — cafes, doner points, construction crews, retail, logistics).
Positioning: "Google's calm. The Caspian's depth." A search-first, voice-friendly, hyper-local hiring product that feels like a search engine and works like a concierge.
North-star metric: Time from "I need a job" to "I have a contact" — target under 90 seconds.
Why this wins

Informal economy formalized — Aktau hiring happens in WhatsApp groups. We pipe those into structured data.
Hyper-local by microdistrict — No other product understands "14 МКР vs 32 МКР" as a ranking signal.
Voice-first for Gen Z — A 10-second voice intro beats a CV they'll never write.
Bilingual native — Russian primary, Kazakh secondary, English optional — all first-class.


1. Visual language — "Deep Calm"
The interface should feel like standing on a quiet beach at dawn. Mostly foam-white. The sea is present but never loud. Motion is ambient, slow, and respects water physics.
1.1 Palette
TokenHexUsage--foam#FBFDFFApp background--shell#FFFFFFSurfaces, cards--tide-50#F0F7FCHover states--tide-100#D6E4F0Borders, dividers--tide-300#8FB8D9Secondary strokes--tide-500#3A8FCCLinks, focus rings--tide-700#1B5A8FPrimary actions--depth#0F3057Primary text, dark accents--abyss#0A1F3DHeadlines--coral#FF6B5BRare — urgent badges, hot jobs--kelp#0D5D5ASuccess, verified employer--sand#E8DCC8Only in illustrations
Gradient use: exactly two places — the hero water horizon, and the <Pearl /> chat glow. Nowhere else.
1.2 Typography

Primary: Inter Tight (fallback: Inter, system-ui)
Display (hero logo / empty states): Fraunces — serif, warm, gives the "sea cottage" feeling the hero needs
Mono: JetBrains Mono (for the [⌘K] hint, microdistrict codes)

Scale:

Display: 56px / 64px, Fraunces 400, tracking −0.03em
H1: 32px / 40px, Inter Tight 600, tracking −0.02em
H2: 22px / 30px, Inter Tight 500
Body: 15px / 24px, Inter Tight 400
Small: 13px / 20px, Inter Tight 400
Micro: 11px / 16px, uppercase, tracking 0.08em — used only for microdistrict codes like "14 МКР"

1.3 Motion — water physics
Every animation uses one of these three curves:
css--ease-tide:   cubic-bezier(0.33, 1, 0.68, 1);   /* wave receding — default */
--ease-swell:  cubic-bezier(0.65, 0, 0.35, 1);   /* rising, symmetric */
--ease-splash: cubic-bezier(0.16, 1, 0.3, 1);    /* arrival, overshoot */
Timing tokens: --t-drop: 120ms, --t-wave: 240ms, --t-tide: 480ms, --t-horizon: 900ms.
Signature motions:

Ripple click — any button or card click emits a radial SVG ripple from the pointer (900ms, --ease-tide, opacity 0.3 → 0). Framer Motion or vanilla CSS with a pseudo-element.
Tide entrance — list items rise 16px from below with 50ms stagger. Lists feel like water reaching the shore.
Horizon reveal — route transitions: current page slides up 4% + fades; next page rises from 8% below with blur 8px → 0.
Breath — the logo (a minimal droplet/wave mark) pulses scale 1.00 → 1.015 over 4s, infinite. Everything else is still.
Liquid cursor — on the hero only, a 420px-wide gaussian blur follows the cursor at 70% lerp, tinted --tide-500 at 8% opacity. Disabled on touch.

Forbidden: bounce easing, slide-in-from-left routers, page spinners. We use a 1px horizontal wave line at the top (like YouTube's progress bar, but in --tide-500).
1.4 Glassmorphism — used once
The floating command bar, and only the command bar, uses backdrop-filter: blur(16px) saturate(140%) + background: rgba(255, 255, 255, 0.72) + border: 1px solid rgba(255, 255, 255, 0.9) + box-shadow: 0 1px 2px rgba(15, 48, 87, 0.04), 0 12px 40px -12px rgba(15, 48, 87, 0.12). Everywhere else: flat surfaces.

2. The hero — "The Surface"
A full-viewport landing page. Google's layout, Caspian's atmosphere.
2.1 Composition (top to bottom)

Top bar (sticky, glass): logo left, language toggle (RU / KZ / EN) center-right, "Enter / Log in" right. 64px tall.
Water layer — position: absolute; inset: 0; z-index: 0. See §2.3.
Centered content — vertically at 42% of viewport:

Wordmark Caspian in Fraunces 72px, --abyss
Tagline underneath, 16px: "Работа рядом. На глубине одного запроса." (RU) / "A job nearby. One query deep." (EN)
The Command Bar (see §4.1) — 640px wide, 56px tall
Four suggestion chips below: "Бариста в 14 МКР", "Подработка на выходные", "Строительство, до 40 000₸", "Удалённо, любой район"


Ambient ticker (§4.9 Current) — bottom-left, small, opacity 0.6, shows "Опубликовано 3 минуты назад · Помощник повара · 32 МКР"
Below the fold — a single section: "Как это работает в 3 погружения" (three-step explainer with Surface → Match → Anchor), then footer.

2.2 Principles

One action per screen. The only primary thing the user can do is search. Login, language, suggestions are all secondary (lower contrast, smaller).
No hero illustration. The water is the illustration.
No testimonials above the fold. The product is the demo.

2.3 The water
A single <canvas> rendering a WebGL fragment shader. If WebGL unsupported → fall back to a 3-layer SVG wave parallax.
Shader spec (GLSL, fragment):

Base: two summed sine waves, low frequency (0.4 Hz and 0.7 Hz), amplitude 0.02
Color: mix(vec3(0.98, 0.99, 1.0), vec3(0.73, 0.87, 0.94), wave) — foam → tide-100
On cursor: add a radial gaussian displacement (300px radius, 0.015 amplitude, decaying over 2.4s after cursor stops)
On search submit: trigger a full-viewport expanding ripple from bar center (1.2s, --ease-splash)
30fps cap. Pause when tab hidden. Disable on prefers-reduced-motion.

Ship as a standalone React hook: useWaterCanvas({ intensity, paused }).

3. Database schema (Prisma / PostgreSQL + PostGIS)
prisma// Enable PostGIS for Anchors
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

enum Role { SEEKER EMPLOYER }
enum Depth { SURFACE SHALLOW MID DEEP }  // one-off / part-time / mid-term / full-time
enum AppStatus { PENDING VIEWED APPROVED REJECTED WITHDRAWN CONTACTED }
enum Language { RU KZ EN }

model User {
  id              String        @id @default(uuid())
  role            Role          @default(SEEKER)
  telegramId      String?       @unique
  phone           String?       @unique
  name            String
  bio             String?                     // AI-enhanced
  preferredLang   Language      @default(RU)
  skills          String[]
  voiceIntroUrl   String?                     // see §4.10
  voiceIntroText  String?                     // Whisper transcription
  applications    Application[]
  tides           Tide[]
  anchors         Anchor[]
  vouchesGiven    Vouch[]       @relation("vouchFrom")
  vouchesGot      Vouch[]       @relation("vouchTo")
  employerCompany Company?
  createdAt       DateTime      @default(now())
}

model Company {
  id                String    @id @default(uuid())
  ownerId           String    @unique
  owner             User      @relation(fields: [ownerId], references: [id])
  name              String
  category          String
  verifiedAt        DateTime?
  lighthouseScore   Float     @default(50)    // 0-100, see §4.6
  avgResponseMins   Int?
  vacancies         Vacancy[]
}

model Vacancy {
  id              String        @id @default(uuid())
  companyId       String
  company         Company       @relation(fields: [companyId], references: [id])
  title           String
  description     String
  salaryMin       Int?
  salaryMax       Int?
  salaryCurrency  String        @default("KZT")
  microdistrict   Int
  geo             Unsupported("geography(Point, 4326)")?
  category        String
  depth           Depth         @default(MID)
  requiredSkills  String[]
  requiredTides   Json?                        // [{day:1, slots:["morning","evening"]}]
  groupSize       Int           @default(1)    // for Flotilla, §4.11
  isAIParsed      Boolean       @default(false)
  sourceSnippet   String?                      // original WhatsApp text
  embedding       Unsupported("vector(768)")?  // pgvector, Gemini embeddings
  expiresAt       DateTime?
  createdAt       DateTime      @default(now())
  applications    Application[]
}

model Application {
  id          String     @id @default(uuid())
  seekerId    String
  vacancyId   String
  seeker      User       @relation(fields: [seekerId], references: [id])
  vacancy     Vacancy    @relation(fields: [vacancyId], references: [id])
  status      AppStatus  @default(PENDING)
  matchScore  Float                              // cached 0-100
  message     String?
  flotillaId  String?                            // group apps share an id
  createdAt   DateTime   @default(now())
  viewedAt    DateTime?
  respondedAt DateTime?
}

model Tide {          // seeker availability: weekly grid
  id       String @id @default(uuid())
  userId   String
  user     User   @relation(fields: [userId], references: [id])
  day      Int                                 // 0=Mon .. 6=Sun
  slot     String                              // "morning" | "midday" | "evening" | "night"
}

model Anchor {        // home, study, gym — user's key geopoints
  id       String @id @default(uuid())
  userId   String
  user     User   @relation(fields: [userId], references: [id])
  label    String                              // "дом" | "учёба" | ...
  geo      Unsupported("geography(Point, 4326)")
  radiusM  Int    @default(1500)
}

model Vouch {         // §4.5 — social proof
  id       String @id @default(uuid())
  fromId   String
  toId     String
  from     User   @relation("vouchFrom", fields: [fromId], references: [id])
  to       User   @relation("vouchTo",   fields: [toId],   references: [id])
  note     String?
  createdAt DateTime @default(now())
  @@unique([fromId, toId])
}

model SalaryReport {  // §4.12 — Sea Level
  id           String   @id @default(uuid())
  role         String                          // "Бариста", normalized
  microdistrict Int
  salary       Int
  currency     String   @default("KZT")
  tipPerShift  Int?
  hoursPerWeek Int?
  anonymous    Boolean  @default(true)
  createdAt    DateTime @default(now())
}

4. Functional modules
Twelve modules. The first three are table-stakes. The rest are what makes Caspian Caspian.
4.1 Magic Search (CommandBar)
UX:

Global Cmd/Ctrl + K opens an overlay version with blurred backdrop
On the hero, it's the centerpiece; on sub-pages it's pinned top with width: 100%; max-width: 640px
Left icon: an animated droplet (2-frame SVG morph on focus)
Right: [⌘K] pill and a language-aware microphone icon (see §4.1.1)

Behavior:

Debounced 140ms → POST /api/parse-query
Gemini 2.5 Flash prompt:

Extract structured intent from a job search query in Russian, Kazakh, or English.
Return JSON only, no prose. Null unknown fields.
{
  "role": string | null,
  "microdistricts": number[],   // Aktau microdistricts
  "minSalary": number | null,
  "depth": "SURFACE" | "SHALLOW" | "MID" | "DEEP" | null,
  "schedule": string | null,
  "language": "RU" | "KZ" | "EN"
}
Query: "{{query}}"

UI updates the results list as the user types, not on submit — Google Instant style
On submit: trigger the water ripple + smooth scroll to results

Critical detail: results mount with tide-entrance stagger (50ms × index, max 10 items visible pre-scroll).
4.1.1 Voice input — "Whisper + Pearl"

Tap mic → inline recording (no modal). The mic icon morphs into a waveform.
Audio streams to /api/voice-query → Whisper large-v3 (or OpenAI Whisper API) → same parse pipeline.
Supports RU and KZ natively.

4.2 Smart Parser — "WhatsApp → Vacancy"
The headline feature. Employers paste messy chat-group ads; Caspian structures them.
Input surface: /employer/new, a single <textarea> with placeholder:

"Вставь объявление из WhatsApp. Мы разберём сами."

Parser prompt:
You extract a structured job posting from an informal Kazakh/Russian chat message.
Return JSON. Use null for missing fields. Keep original phrasing in 'sourceSnippet'.

Schema:
{
  "title": string,
  "description": string,     // cleaned, 1-3 sentences
  "salaryMin": number | null,
  "salaryMax": number | null,
  "salaryCurrency": "KZT",
  "microdistrict": number | null,
  "category": "food" | "retail" | "construction" | "logistics" | "childcare" | "beauty" | "other",
  "depth": "SURFACE" | "SHALLOW" | "MID" | "DEEP",
  "requiredSkills": string[],
  "phone": string | null,
  "confidence": number       // 0-1
}

Input:
"""
{{rawText}}
"""
UX: after parse, the form pre-fills with subtle tide-entrance. Fields the AI is <0.7 confident on get a 1px --coral left-border hint. One click: "Publish". Total employer time: under 20 seconds.
4.3 Matching Engine
Weighted score, cached on Application creation and recomputed nightly for passive feed rankings.
tsmatchScore =
    0.35 * anchorProximity          // see §4.4, transit-time aware
  + 0.25 * skillEmbeddingCosine     // pgvector, Gemini text-embedding-004
  + 0.15 * tideOverlap              // see §4.7
  + 0.10 * depthAlignment           // seeker wants SHALLOW, job is SHALLOW → 1
  + 0.10 * salaryAlignment          // gradient penalty under minSalary
  + 0.05 * lighthouseSignal         // employer's lighthouse / 100
Display: a pill next to each job — 3 tiers only (users don't need percentages):

Высокая (score ≥ 80) — --kelp text on --tide-50
Средняя (60–79) — --depth text on --foam
Низкая (<60) — hidden behind a "Показать ещё" accordion

4.4 Anchors — geopoints + transit
Ditch "microdistrict match" as a binary. A seeker drops anchors: home, school, maybe gym. Jobs are ranked by the sum of transit cost to every anchor, weighted by how often that anchor matters.

Map UI: Mapbox GL JS with a custom light style using Caspian palette. Ocean in --tide-50.
Anchor markers: small droplet SVG, labeled.
Radius selector: a halo around each anchor, draggable, 500m–5km.
Transit times: Mapbox Directions API, walking + transit profiles. Cache per (anchor → microdistrict_centroid) for 7 days.

Seeker can toggle which anchors matter for a given search ("just for work, not study today").
4.5 Swell — social vouching

"3 друга рекомендуют этого кандидата"


Any seeker can request a vouch from a friend via a shareable link (/vouch/{userId}).
Friend enters their name, phone (verified via Telegram or SMS), and a 200-char note.
Employer's application view shows vouch count prominently, with expandable notes.
Quality guardrail: one device can only vouch for 3 different people per week. Detects vouch rings via phone number graph analysis (flag if N users vouch only for each other).

4.6 Lighthouse — employer reputation
Simple, transparent, public. A 0–100 score for each employer, visible on every vacancy card.
Components (live-computed):

Response rate (replied to applications within 48h) — 50%
Response speed (median respondedAt - createdAt) — 20%
Contact follow-through (seekers mark "I got contacted" post-approval) — 20%
Vacancy quality (title+description length, salary provided) — 10%

UI: a tiny lighthouse icon next to company name. Tap → modal showing breakdown. Scores under 40 get a coral "Отвечает медленно" hint on their vacancies. This changes behavior.
4.7 Tide — availability grid
Instead of typing "I can work evenings", seekers tap a 7×4 grid (days × slots). Employers fill the same grid for what they need. We compute overlap.

Grid cell: 40×40px, --tide-50 default, --tide-500 selected
Selected cells fill with a subtle horizontal wave animation on first entry
Mobile: horizontally scrollable, snap to day columns
Overlap visualization on the job detail page: employer's grid underneath, seeker's on top with 60% opacity. Matching cells glow --kelp.

4.8 Pearl — AI career companion
A chat drawer accessible from anywhere (right-side, 420px wide on desktop, full-sheet on mobile). Powered by Gemini 2.5 Flash with conversation memory via a PearlThread table.
Pearl can:

Help a seeker write their bio from 3 guided questions (RU/KZ)
Rehearse a phone interview — Pearl role-plays the employer
Translate Kazakh job postings to Russian and vice-versa
Explain a vacancy: "What does кальянщик actually do?"
Compare two job offers side by side

System prompt excerpt (RU-primary):
Ты — Жемчуг (Pearl), AI-наставник на платформе Caspian.
Аудитория: молодёжь Актау 16–25 лет, часто ищут первую работу.
Говори просто, тепло, но без снисходительности. Избегай корпоративного жаргона.
Переключайся на казахский, если пользователь пишет на казахском.
Никогда не придумывай вакансии — используй только результаты инструмента searchVacancies.
Tools Pearl has access to (function calling):

searchVacancies(query)
getUserProfile()
suggestBioDraft(answers)
mockInterview(vacancyId)
getSalaryStats(role, district)

4.9 Current — ambient live feed
A tasteful ticker. Not annoying. Sits in the bottom-left, 300px wide, opacity 0.55 at rest → 0.95 on hover. Shows the most recent 3 vacancies posted in the user's top anchor radius, rotating every 8 seconds with a gentle vertical slide.
Implementation: Server-Sent Events (/api/current/stream), Upstash Redis pub/sub for fanout. Pause when document.hidden.
4.10 Cormorant — voice-first applications

"Зачем писать резюме, когда можно сказать?"

Seekers record a 10-second voice intro once. It's attached to every application.

Record button: press-and-hold, visible 10-second countdown ring (the ring is a liquid fill, not a stroke)
On release → upload to S3/Cloudflare R2 → Whisper transcription for employer fallback
Employer's application list: tap to play inline, waveform scrubbable
Silent rejection: if intro is <3s or fails VAD (voice activity detection), prompt re-record

The audio plays on hover of the applicant card for 1.5s preview — a delightful micro-moment employers will notice.
4.11 Flotilla — group applications
A cafe needs 3 baristas this weekend. Posting groupSize: 3 unlocks Flotilla.

Seeker sees a "Применить флотилией" button alongside "Применить"
Tap → modal: search friends already on Caspian (by phone) or invite via SMS/Telegram
Once 3 seekers confirm, application is submitted as a group with a shared flotillaId
Employer reviews the flotilla as a unit — approve all or none
Perfect for events, seasonal work, construction crews

4.12 Sea Level — salary transparency
After any application resolves (approved + contacted, or declined), Pearl asks:

"Сколько тебе предложили? Данные анонимны и помогают другим."

We aggregate by (role, microdistrict) and show a small histogram on the vacancy detail page:

"По данным 47 жителей: медиана 180 000₸ для бариста в 14 МКР. Вакансия выше рынка ↑"

Requires at least 5 reports to show. Ruthlessly anonymous — no FK back to the user, just a nullable User.lastSalaryReportHash to dedupe.

5. Telegram integration
Kazakhstan uses Telegram as primary messenger. This is not optional.
Bot name: @CaspianKzBot
Flows:

Employer notification — new application:

   🪷 Новый отклик — Бариста (14 МКР)
   Айгерим К. · Совпадение «Высокая»
   2 рекомендации друзей · Lighthouse 72
   ▶️ Аудио-визитка (0:09)

   [👤 Профиль] [✅ Одобрить и получить контакт] [👎 Пропустить]

Seeker notification — approved:

   🌊 Вас одобрили!
   "Coffee Point 14" хочет связаться.
   Телефон: +7 702 ...
   Совет от Pearl: позвоните сегодня до 18:00 — у работодателя Lighthouse выше среднего.

WhatsApp forward bridge — employer forwards a job ad to the bot → bot runs Smart Parser → DMs back a pre-filled draft link: "Ваша вакансия почти готова — 1 клик до публикации."

Inline mode support: @CaspianKzBot повар 32 мкр returns top 5 vacancies as shareable cards.

6. Component inventory (React + Tailwind + Framer Motion)
Layout

<WaterLayer intensity={0..1} /> — the hero canvas, see §2.3
<TideNav /> — top sticky glass nav
<CurrentTicker /> — §4.9

Primary

<CommandBar variant="hero" | "pinned" />
<VoiceButton onTranscript={fn} lang="RU"|"KZ" />
<JobCard vacancy={v} match={m} />
<VacancyDetail />
<MatchPill tier="high"|"mid"|"low" />
<LighthouseBadge score={n} onClick={openModal} />

Forms

<SmartPasteParser /> — §4.2
<TideGrid mode="edit"|"readonly" value={...} overlay={...} />
<AnchorMap anchors={...} onChange={fn} />
<DepthSlider value="SURFACE"..."DEEP" />
<VoiceIntroRecorder maxSec={10} />

Social

<VouchRequest shareUrl={url} />
<VouchList vouches={...} />
<FlotillaModal vacancy={v} />

AI

<PearlDrawer open={b} thread={t} />
<SalaryStats role={} district={} />

Motion primitives

<Ripple trigger={ref} /> — radial ripple at click
<TideIn delay={n}>{children}</TideIn> — 16px-up-fade with stagger support
<Horizon /> — route transition wrapper


7. Animation specifications
Concrete values — don't improvise.
7.1 Tide-in (list item entrance)
tsinitial: { opacity: 0, y: 16, filter: 'blur(4px)' }
animate: { opacity: 1, y: 0,  filter: 'blur(0px)' }
transition: { duration: 0.42, delay: i * 0.05, ease: [0.33, 1, 0.68, 1] }
7.2 Ripple on click
ts// SVG circle, r: 0 -> 1.8x container diagonal, stroke-opacity: 0.35 -> 0
duration: 900, ease: [0.33, 1, 0.68, 1]
7.3 Search submit → results

Command bar scales 1 → 0.98 → 1 (200ms)
Water ripple from bar center (1200ms, non-blocking)
Results mount with tide-in stagger
Scroll-to-results starts at 300ms in, 500ms smooth ease

7.4 Pearl drawer

Slide from right, 420px, 380ms --ease-splash
Backdrop blur 0 → 6px, opacity 0 → 0.2
First message bubble types in with 24ms/char (feels conversational, not slow)

7.5 Reduced motion
Respect prefers-reduced-motion: reduce — disable water canvas, replace ripples with 120ms opacity pulses, skip tide-in staggers.

8. Copy (RU primary — ship with these)
Hero tagline: "Работа рядом. На глубине одного запроса."
Search placeholder: "Найди работу или подработку..."
Empty results: "Пока тихо. Попробуй другой запрос — или загляни завтра, волна меняется."
Employer paste CTA: "Вставь объявление из WhatsApp — мы разберём"
Voice intro prompt: "Расскажи о себе за 10 секунд — естественно, как другу"
Vouch request: "Попроси друга поручиться — это увеличивает шанс отклика в 2.3 раза"
Loading states: "Собираем данные..." / "Ныряем глубже..." / "Подбираем течение..."
Error (offline): "Связь потеряна. Мы вернёмся, когда волна снова дойдёт."
Salary transparency tooltip: "Данные собраны анонимно от других соискателей"
Kazakh variants: generate via Pearl at build time, review with a native speaker before demo.

9. API surface (Next.js App Router, route handlers)
POST   /api/parse-query                → §4.1
POST   /api/vacancies/parse-whatsapp   → §4.2
GET    /api/vacancies?q=&district=     → filtered list
POST   /api/vacancies                  → create (employer)
GET    /api/vacancies/:id              → detail + salary stats
POST   /api/applications               → create
POST   /api/applications/flotilla      → group create
PATCH  /api/applications/:id/status    → employer action
GET    /api/current/stream             → SSE §4.9
POST   /api/voice-query                → Whisper
POST   /api/voice-intro                → 10s audio upload
POST   /api/vouches                    → add vouch
POST   /api/pearl/message              → chat + tools
POST   /api/salary-reports             → anonymous submit
POST   /api/webhooks/telegram          → bot
All write endpoints are rate-limited via Upstash (sliding window). Phone auth via Telegram Login Widget + SMS fallback (Kaspi Mobile? / Twilio).

10. Tech stack

Frontend: Next.js 15 (App Router, Server Components, Server Actions), Tailwind CSS 4, Framer Motion 11, Mapbox GL JS 3
Backend: Next.js route handlers + a thin trpc layer for typed client calls
DB: Supabase Postgres with PostGIS + pgvector
AI: Gemini 2.5 Flash (parsing, Pearl), Gemini text-embedding-004 (vectors), OpenAI Whisper via Groq for low latency
Auth: Telegram Login Widget + SMS OTP fallback
Realtime: Upstash Redis pub/sub → SSE
Storage: Cloudflare R2 (voice intros)
Deployment: Vercel (frontend + edge functions), Fly.io or Railway (a small Node worker for Telegram bot + cron for Lighthouse recompute)


11. Unique features checklist — what makes this not a generic job board

✅ WhatsApp paste parser (Smart Parser) — formalizes the informal economy
✅ 10-second voice intros — CV replacement for Gen Z
✅ Tide availability grid — visual scheduling, not free-text
✅ Anchor-based ranking — transit-time aware, not just district match
✅ Flotilla group apply — one of a kind
✅ Lighthouse employer score — public, changes behavior
✅ Swell vouches — social proof at the application level
✅ Pearl AI companion — bio writer + mock interviewer + translator
✅ Sea Level salary transparency — crowdsourced, anonymous, district-level
✅ Current live ticker — ambient FOMO without being gross
✅ Voice search in RU/KZ — removes the typing barrier entirely
✅ Telegram-native — meets the audience where they already are


12. Hackathon demo script (90 seconds)

[0:00] Open Caspian — water breathes. "Google, but for Aktau jobs."
[0:05] Hit the mic. Say: "Бариста в 14 микрорайоне, вечера."
[0:12] Results appear with tide-in. Top match shows Lighthouse 88 + 2 vouches. Click a job — audio intro previews on hover (mention this).
[0:25] Switch to employer mode. Paste a raw WhatsApp job ad (show it's messy). Smart Parser fills the form. One click — published.
[0:45] Back to seeker. Show Anchors on the map. Show Tide grid with employer overlap glowing kelp-green.
[1:00] Open Pearl. Ask: "Подготовь меня к звонку этому работодателю на казахском." Pearl responds with 3 practice questions in Kazakh.
[1:20] Trigger Flotilla: apply with two friends. Show Telegram notification arriving on projector phone.
[1:30] Close on the hero with the tagline. Judges remember the water, the WhatsApp parse, and Pearl.


13. Seed data — build these in
Ten realistic Aktau vacancies across microdistricts 3, 8, 11, 14, 22, 29, 32. Mix of:

Coffee Point barista, 14 МКР, 180 000₸, SHALLOW
Доставщик доставки DIDI, 22 МКР, % от заказов, SURFACE
Помощник повара (шаурма), 3 МКР, 150 000₸, MID
Строители, 11 МКР, 8 000₸/день, SURFACE, groupSize: 4 (Flotilla demo)
Продавец-консультант салона связи, 32 МКР, 140 000 + %, MID
Няня на выходные, 8 МКР, 2 000₸/час, SHALLOW
Администратор beauty-салона, 29 МКР, 200 000₸, DEEP
Кассир супермаркета «Небо», 14 МКР, 160 000₸, MID
Промоутер «Мангистау Молл», 22 МКР, 3 000₸/смена, SURFACE
Мойщик машин, 11 МКР, % от мойки, SURFACE

Seed 5 employer accounts with varying Lighthouse scores (35, 52, 68, 81, 94) to demo the spectrum.

14. What to build first (6-hour MVP order)

Hour 1 — Next.js + Tailwind + Prisma + Supabase schema + seed data
Hour 2 — Hero + water canvas + Command Bar (text only, no voice yet) + parse-query route
Hour 3 — Vacancy list + JobCard + MatchPill + /vacancies/:id detail
Hour 4 — Smart Parser flow (WhatsApp paste → published vacancy)
Hour 5 — Pearl drawer (Gemini chat, no tools yet) + Telegram bot notification on application
Hour 6 — Voice intro recorder + Flotilla flow + polish animations + seed demo data

Skip for MVP: Anchors map (hard-code microdistrict distance table), Tide grid (text fallback), Sea Level (show mocked histogram from seeded data).

15. Success signals for the judges
Print these on a card. Hand to a judge at the end.

Parse accuracy on 20 real WhatsApp job ads: target ≥85% field accuracy
Time-to-apply from landing → application submitted: median under 90s
Employer time-to-publish via Smart Parser: median under 25s
Voice intro adoption: target ≥40% of seeker profiles in demo
RU + KZ coverage: every user-facing string bilingual at ship
Lighthouse viability: score visible on every vacancy, not just a metric in the DB