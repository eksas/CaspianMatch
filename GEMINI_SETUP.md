# Gemini AI Setup для Caspian

## ⚠️ ВАЖНО: API ключи в Supabase

API ключи Gemini **НЕ в `.env` файлах**, а в **Supabase таблице `env`**.

👉 **Смотри [`SUPABASE_ENV_SETUP.md`](./SUPABASE_ENV_SETUP.md)** для настройки

## Как это работает

1. Ключи хранятся в Supabase таблице `env` (колонки `VITE_GEMINI_API_KEY1`, `KEY2`, `KEY3`)
2. Frontend загружает ключи через endpoint `/env`
3. Автоматический фейловер между ключами при ошибках 401/429/503

## Исправление 401 ошибки

**401 Unauthorized** = Ключи не настроены в Supabase

### Быстрое решение:

1. Получи API ключи на https://aistudio.google.com/apikey
2. Зайди в Supabase Dashboard → Table Editor → `env`
3. Добавь ключи в первую строку:
   - `VITE_GEMINI_API_KEY1` = твой первый ключ
   - `VITE_GEMINI_API_KEY2` = второй ключ (опционально)
   - `VITE_GEMINI_API_KEY3` = третий ключ (опционально)
4. Обнови страницу
5. Нажми кнопку **"Проверить API"** в левом нижнем углу

## Что сделано

✅ Установлен `@google/generative-ai`  
✅ Создан сервис `/src/app/lib/gemini.ts` с rolling keys  
✅ API ключи загружаются из Supabase  
✅ Жемчуг стримит текст в реальном времени  
✅ Добавлена кнопка озвучки ответов (TTS) 🔊  
✅ Голосовая запись работает через Gemini (STT + парсинг)  
✅ Автоматический фейловер между ключами  

## Что работает

### Жемчуг (Pearl AI Chat)
- ✅ Стриминг текста в реальном времени
- ✅ Кнопка 🔊 для озвучки каждого ответа
- ✅ Rolling keys — автоматическое переключение при ошибках

### Голосовая запись (Voice Onboarding)
- ✅ Транскрипция audio → text через Gemini
- ✅ Парсинг профиля (район, скиллы, био) через JSON mode

## Модель

Используется **gemini-2.0-flash-exp**:
- Бесплатная до 2M токенов/день
- 15 запросов в минуту на ключ
- TTFT ~400ms (быстрый)
- Поддерживает audio input/output
- Работает с русским языком

## Rolling Keys Strategy

С **3 ключами** получаешь:
- **45 запросов в минуту** (вместо 15)
- **4500 запросов в день** (вместо 1500)
- Автоматический фейловер при rate limits

## Inline Tags (опционально)

Можно добавить эмоции в голос:

```typescript
const textWithEmotion = `[excited] ${response}`;
await generateSpeech(textWithEmotion);
```

Поддерживаются теги: `[excited]`, `[whispers]`, `[laughs]`, `[shouting]`

## Troubleshooting

### ❌ "Не удалось загрузить API ключи из базы данных"

→ Backend не может получить таблицу `env`  
→ Проверь Supabase RLS (Row Level Security)

### ❌ "API ключи не найдены в базе данных"

→ Таблица `env` пустая  
→ Добавь ключи через Supabase Dashboard

### ❌ Ошибка 401 при использовании

→ Ключ невалиден или истёк  
→ Проверь ключи на https://aistudio.google.com/apikey

Подробности: [`SUPABASE_ENV_SETUP.md`](./SUPABASE_ENV_SETUP.md)

Готово! 🎉
