# 🔧 Backend Gemini API Setup

## How It Works

The **Gemini API key is configured on the backend** (Supabase Edge Function), not in the frontend.

This is more secure and allows centralized API key management.

## Where is the API Key?

The key is stored as a **Deno environment variable** in your Supabase Edge Function.

### Environment Variable Name:
```
GEMINI_API_KEY
```

## How to Set the API Key

### Option 1: Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your project: `bsnkiuwiylmwyefgrmdz`
3. Navigate to: **Edge Functions** → **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** Your Gemini API key (starts with `AIzaSy...`)
5. Click **Save**

### Option 2: Supabase CLI

```bash
supabase secrets set GEMINI_API_KEY=AIzaSy...your_key_here
```

## Get a Gemini API Key

1. Visit https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click **"Create API Key"** → **"Create API key in new project"**
4. Copy the key (starts with `AIzaSy...`)

## Endpoints Using Gemini

The backend already has these Gemini-powered endpoints:

| Endpoint | Purpose | Model Used |
|----------|---------|------------|
| `/pearl/message` | AI chat (Жемчуг) | gemini-3.1-flash-lite-preview |
| `/parse-voice` | Voice → Profile parsing (STT) | gemini-3.1-flash-lite-preview |
| `/parse-query` | Search intent extraction | gemini-3.1-flash-lite-preview |
| `/vacancies/parse-whatsapp` | WhatsApp vacancy parsing | gemini-3.1-flash-lite-preview |
| `/match-jobs` | AI job matching | gemini-3.1-flash-lite-preview |
| `/shadow-interview/start` | Generate interview questions | gemini-3.1-flash-lite-preview |
| `/boost-tips` | AI improvement tips | gemini-3.1-flash-lite-preview |

## Checking if It Works

### 1. Check Backend Logs

In Supabase Dashboard → Edge Functions → Logs, you should see:
- No "GEMINI_API_KEY not configured" errors
- Successful Gemini API calls

### 2. Test in App

1. Open the app
2. Click **Жемчуг** (Pearl AI) button
3. Send a message like "Привет"
4. If you get a response → ✅ Working!
5. If you get "GEMINI_API_KEY not configured on server" → ❌ Key not set

### 3. Test Voice Recording

1. Go to onboarding page
2. Try voice recording
3. If it transcribes → ✅ Working!

## Troubleshooting

### Error: "GEMINI_API_KEY not configured on server"

**Problem:** Environment variable not set on backend

**Solution:**
1. Set `GEMINI_API_KEY` in Supabase Dashboard (see above)
2. Redeploy the Edge Function (or it will auto-redeploy)
3. Try again

### Error: "Gemini 401"

**Problem:** Invalid API key

**Solution:**
1. Go to https://aistudio.google.com/apikey
2. Check if the key is valid (not deleted, not expired)
3. Create a new key if needed
4. Update `GEMINI_API_KEY` in Supabase

### Error: "Gemini 429"

**Problem:** Rate limit exceeded

**Free tier limits:**
- 15 requests per minute
- 1500 requests per day

**Solution:**
- Wait a minute
- Or upgrade to paid plan on Google AI Studio

## Model Used

**gemini-3.1-flash-lite-preview**
- 2x cheaper than regular Flash
- 1.5x faster
- Native audio input/output
- Perfect for startups 🚀

## Cost Estimate

**Free tier (plenty for MVP):**
- 15 requests/minute
- 1,500 requests/day
- 45,000 requests/month
- $0 cost

**When to upgrade:**
- When you hit rate limits
- When you need > 45k requests/month
- Paid tier starts at very low cost (~$0.50 per million tokens)

## Security

✅ **API key on backend** (not exposed to frontend)  
✅ **No CORS issues** (all requests go through your backend)  
✅ **Rate limiting** controlled by backend  
✅ **Centralized monitoring** in Supabase logs

## Next Steps (Optional)

### Add TTS (Text-to-Speech)

Currently voice output is not implemented. To add it:

1. Update backend to support `responseMimeType: "audio/pcm"`
2. Add `/pearl/speak` endpoint
3. Return audio data to frontend
4. Play using Web Audio API

See Gemini docs: https://ai.google.dev/gemini-api/docs/audio

---

**Summary:** Just set `GEMINI_API_KEY` in Supabase Edge Function environment variables and you're done! 🎉
