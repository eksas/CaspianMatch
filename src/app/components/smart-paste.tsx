import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Loader2, Send, AlertCircle, Check } from "lucide-react";
import { apiFetch } from "../lib/supabase";
import { C, EASE } from "../lib/design";
import { parseWhatsAppAd } from "../lib/mock-data";
import type { Job } from "../lib/store";

type Parsed = {
  title: string; description: string;
  salaryMin: number | null; salaryMax: number | null; salaryCurrency: string;
  microdistrict: number | null; category: string;
  depth: "SURFACE" | "SHALLOW" | "MID" | "DEEP";
  requiredSkills: string[]; phone: string | null;
  confidence: number; sourceSnippet: string;
};

const PLACEHOLDER = `Вставь объявление из WhatsApp. Мы разберём сами.

Например:
"Срочно нужен бариста в Coffee Point, 14 МКР. Утренние смены. 180000тг + чаевые. Звоните +77012345678"`;

export function SmartPaste({ onPublish }: { onPublish: (j: Job) => void }) {
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const parse = async () => {
    setErr(null); setLoading(true);
    try {
      const { parsed } = await apiFetch<{ parsed: Parsed }>("/vacancies/parse-whatsapp", {
        method: "POST",
        body: JSON.stringify({ rawText: raw }),
      });
      setParsed(parsed);
    } catch {
      // Fallback: use local parser
      try {
        const localParsed = parseWhatsAppAd(raw);
        setParsed(localParsed);
      } catch (e: any) {
        setErr(e.message || "Ошибка разбора");
      }
    } finally {
      setLoading(false);
    }
  };

  const publish = async () => {
    if (!parsed) return;
    const salary = parsed.salaryMin && parsed.salaryMax
      ? `${parsed.salaryMin.toLocaleString("ru-RU")}–${parsed.salaryMax.toLocaleString("ru-RU")} ₸`
      : parsed.salaryMin
        ? `${parsed.salaryMin.toLocaleString("ru-RU")} ₸`
        : "Договорная";
    const job: Job = {
      id: crypto.randomUUID(),
      title: parsed.title,
      company: "Моя компания",
      salary,
      microdistrict: parsed.microdistrict ?? 14,
      category: parsed.category,
      isAIParsed: true,
      description: parsed.description,
      requirements: parsed.requiredSkills,
      match: 82,
      createdAt: Date.now(),
    };
    try {
      await apiFetch("/jobs", { method: "POST", body: JSON.stringify(job) });
    } catch {
      // Already handled by local store
    }
    onPublish(job);
    setPublished(true);
  };

  return (
    <div className="grid lg:grid-cols-[1.1fr_1fr] gap-5">
      {/* Paste panel */}
      <div className="rounded-2xl bg-white border p-5" style={{ borderColor: C.tide100 }}>
        <div className="flex items-center gap-2 mb-3 font-mono text-[10px] uppercase" style={{ color: C.tide500, letterSpacing: "0.14em", fontWeight: 500 }}>
          <Sparkles className="w-3 h-3" /> Smart Parser · Gemini 2.5 Flash
        </div>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={12}
          className="w-full resize-none rounded-xl border px-4 py-3 text-[14px] outline-none focus:ring-4 transition"
          style={{
            borderColor: C.tide100, color: C.abyss,
            background: C.foam,
            fontFamily: "var(--font-sans)",
            fontWeight: 400,
          }}
        />
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-[11px] font-mono" style={{ color: C.tide700, letterSpacing: "0.08em" }}>
            {raw.length} ЗНАКОВ
          </span>
          <button
            onClick={parse}
            disabled={loading || raw.trim().length < 10}
            className="h-10 px-4 rounded-full text-white inline-flex items-center gap-2 disabled:opacity-40"
            style={{ background: C.tide700, fontSize: 13, fontWeight: 600 }}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {loading ? "Разбираем…" : "Разобрать"}
          </button>
        </div>
        {err && (
          <div className="mt-3 flex items-center gap-2 text-[12px]" style={{ color: C.coral, fontWeight: 500 }}>
            <AlertCircle className="w-3.5 h-3.5" /> {err}
          </div>
        )}
      </div>

      {/* Result panel */}
      <div className="rounded-2xl bg-white border p-5 min-h-[380px]" style={{ borderColor: C.tide100 }}>
        <div className="flex items-center gap-2 mb-4 font-mono text-[10px] uppercase" style={{ color: C.tide500, letterSpacing: "0.14em", fontWeight: 500 }}>
          Draft · готово к публикации
        </div>
        <AnimatePresence mode="wait">
          {!parsed && !published && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-[300px] text-center px-6"
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: C.tide50, color: C.tide500 }}>
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-[13.5px]" style={{ color: C.depth, fontWeight: 400 }}>
                Вставь текст слева — Gemini извлечёт должность, зарплату, район и навыки.
              </p>
              <p className="text-[11px] font-mono mt-3" style={{ color: C.tide500, letterSpacing: "0.1em" }}>
                ~ 20 СЕКУНД ДО ПУБЛИКАЦИИ
              </p>
            </motion.div>
          )}
          {published && (
            <motion.div key="ok" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-[300px] text-center"
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: C.tide50, color: C.kelp }}>
                <Check className="w-7 h-7" />
              </div>
              <h3 className="font-display text-[22px]" style={{ color: C.abyss, fontWeight: 500 }}>Опубликовано.</h3>
              <p className="mt-2 text-[13px]" style={{ color: C.depth }}>Соискатели уже видят твою вакансию.</p>
            </motion.div>
          )}
          {parsed && !published && (
            <motion.div key="parsed"
              initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.5, ease: EASE.tide }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1">
                  <div className="font-display text-[26px] leading-tight" style={{ color: C.abyss, fontWeight: 500, letterSpacing: "-0.01em" }}>
                    {parsed.title || "—"}
                  </div>
                </div>
                <span className="font-mono text-[10px] px-2 h-6 inline-flex items-center rounded-full" style={{ background: C.tide50, color: C.tide700 }}>
                  {Math.round(parsed.confidence * 100)}% CONF
                </span>
              </div>

              <Row label="Описание" value={parsed.description} flagged={parsed.confidence < 0.7} />
              <Row label="Район" value={parsed.microdistrict ? `${parsed.microdistrict} МКР` : "—"} flagged={!parsed.microdistrict} />
              <Row label="Зарплата" value={
                parsed.salaryMin || parsed.salaryMax
                  ? `${parsed.salaryMin?.toLocaleString("ru-RU") ?? "?"}${parsed.salaryMax ? "–" + parsed.salaryMax.toLocaleString("ru-RU") : ""} ${parsed.salaryCurrency}`
                  : "Договорная"
              } flagged={!parsed.salaryMin && !parsed.salaryMax} />
              <Row label="Категория" value={parsed.category} />
              <Row label="Режим" value={parsed.depth} />
              {parsed.requiredSkills?.length > 0 && (
                <div className="py-3 border-b" style={{ borderColor: C.tide100 }}>
                  <div className="font-mono text-[9px] uppercase mb-2" style={{ color: C.tide500, letterSpacing: "0.14em" }}>Навыки</div>
                  <div className="flex flex-wrap gap-1.5">
                    {parsed.requiredSkills.map((s) => (
                      <span key={s} className="px-2 h-6 rounded-full text-[11px] inline-flex items-center" style={{ background: C.tide50, color: C.depth, fontWeight: 500 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={publish}
                className="mt-6 w-full h-11 rounded-full text-white inline-flex items-center justify-center gap-2"
                style={{ background: C.abyss, fontSize: 13, fontWeight: 600 }}
              >
                <Send className="w-3.5 h-3.5" />
                Опубликовать
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Row({ label, value, flagged }: { label: string; value: string; flagged?: boolean }) {
  return (
    <div className="py-3 border-b flex gap-4" style={{ borderColor: "#F0F7FC", borderLeft: flagged ? `2px solid ${C.coral}` : "none", paddingLeft: flagged ? 10 : 0 }}>
      <div className="w-24 shrink-0 font-mono text-[9px] uppercase" style={{ color: C.tide500, letterSpacing: "0.14em", fontWeight: 500, paddingTop: 2 }}>{label}</div>
      <div className="flex-1 text-[13px]" style={{ color: C.depth, fontWeight: 500 }}>{value}</div>
    </div>
  );
}
