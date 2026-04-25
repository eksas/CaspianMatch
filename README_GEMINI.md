# 🚀 Gemini API Integration - Quick Start

## TL;DR

1. **Get API key:** https://aistudio.google.com/apikey → Create API Key
2. **Add to Supabase:**
   - Dashboard → Edge Functions → Environment Variables
   - Name: `GEMINI_API_KEY`
   - Value: Your API key
3. **Test:** Open Pearl AI (Жемчуг) and send a message

## Where is the API Key?

**❌ NOT in frontend `.env` files**  
**❌ NOT in Supabase `env` table**  
**✅ In Supabase Edge Function Environment Variables**

## How It Works

```
Frontend → Backend (Supabase Edge Function) → Gemini API
                    ↑
              GEMINI_API_KEY
           (environment variable)
```

The API key is **server-side only** for security.

## Setup (2 minutes)

### Step 1: Get API Key

1. Visit https://aistudio.google.com/apikey
2. Sign in with Google
3. Click **"Create API Key"**
4. Copy the key (starts with `AIzaSy...`)

### Step 2: Set Environment Variable

**Option A: Supabase Dashboard**

1. Go to https://supabase.com/dashboard
2. Select project: `bsnkiuwiylmwyefgrmdz`
3. Navigate to: **Edge Functions** → **Settings** → **Environment Variables**
4. Add variable:
   - Name: `GEMINI_API_KEY`
   - Value: `AIzaSy...your_key`
5. Save

**Option B: CLI**

```bash
supabase secrets set GEMINI_API_KEY=AIzaSy...your_key
```

### Step 3: Test

1. Open the app
2. Click **Жемчуг** (Pearl AI)
3. Send "Привет"
4. You should get a response!

## What Works

✅ **Pearl AI Chat** — Real-time streaming responses  
✅ **Voice Recording** — Speech-to-text + profile parsing  
✅ **Search Intent** — AI-powered query understanding  
✅ **Job Matching** — Personalized job scoring  
✅ **Interview Questions** — AI-generated screening  

## Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| "GEMINI_API_KEY not configured" | Env var not set | Add `GEMINI_API_KEY` in Supabase |
| "Gemini 401" | Invalid key | Check key on aistudio.google.com |
| "Gemini 429" | Rate limit | Wait 1 min (free tier: 15 req/min) |

## Endpoints

Backend endpoints using Gemini (in `/supabase/functions/server/index.tsx`):

- `/pearl/message` — AI chat
- `/parse-voice` — Voice → Profile
- `/parse-query` — Search intent
- `/match-jobs` — Job matching
- `/shadow-interview/*` — Interview Q&A
- `/boost-tips` — Improvement suggestions

## Model

**gemini-3.1-flash-lite-preview**
- Free tier: 15 req/min, 1,500/day
- Supports audio input
- 2x cheaper, 1.5x faster than regular Flash
- Perfect for MVP 🚀

## Files

- **[BACKEND_GEMINI_SETUP.md](./BACKEND_GEMINI_SETUP.md)** — Detailed backend setup
- **`/src/app/lib/gemini.ts`** — Frontend API wrapper
- **`/supabase/functions/server/index.tsx`** — Backend Gemini integration

## Frontend Code

```typescript
import { streamChat, transcribeAndParse } from "../lib/gemini";

// Chat with streaming
await streamChat(messages, (chunk) => {
  console.log(chunk); // Real-time text chunks
});

// Voice → Profile
const parsed = await transcribeAndParse(audioBase64, "audio/webm");
// Returns: { microdistrict, interests, skills, bio }
```

## Security

✅ API key on backend only  
✅ No frontend exposure  
✅ Centralized rate limiting  
✅ All requests authenticated via Supabase  

---

**For detailed setup:** See [BACKEND_GEMINI_SETUP.md](./BACKEND_GEMINI_SETUP.md)

**Quick fix:** Just add `GEMINI_API_KEY` to Supabase Edge Function environment variables! 🎉
