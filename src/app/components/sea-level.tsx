import { useState } from "react";
import { motion } from "motion/react";
import { Waves, TrendingUp, TrendingDown, Check, Plus } from "lucide-react";
import { C, EASE } from "../lib/design";
import { fmtKzt, submitSalaryReport, type SalaryStats } from "../lib/trio";

export function SeaLevelPanel({
  stats, role, microdistrict, currentSalary,
}: {
  stats: SalaryStats | null;
  role: string;
  microdistrict: number;
  currentSalary?: number | null;
}) {
  const [openForm, setOpenForm] = useState(false);
  const [val, setVal] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!stats) {
    return (
      <div className="rounded-2xl border p-5" style={{ borderColor: C.tide100, background: "white" }}>
        <div className="text-[10px] font-mono mb-2" style={{ color: C.tide500, letterSpacing: "0.18em", fontWeight: 600 }}>УРОВЕНЬ МОРЯ</div>
        <div className="text-[13px]" style={{ color: C.depth, fontWeight: 500 }}>Загружаем данные…</div>
      </div>
    );
  }

  const send = async () => {
    const n = parseInt(val.replace(/\s/g, ""));
    if (!Number.isFinite(n) || n < 10000 || n > 5000000) { setErr("Введи сумму в тенге (10 000 – 5 000 000)"); return; }
    setErr(null);
    try {
      await submitSalaryReport({ role, microdistrict, salary: n });
      setSent(true);
      setTimeout(() => { setOpenForm(false); setSent(false); setVal(""); }, 1800);
    } catch (e: any) {
      setErr(e?.message ?? "Ошибка отправки");
    }
  };

  if (stats.insufficient) {
    return (
      <div className="rounded-2xl border p-5" style={{ borderColor: C.tide100, background: "white" }}>
        <div className="flex items-center gap-2 mb-3">
          <Waves className="w-3.5 h-3.5" style={{ color: C.tide500 }} />
          <span className="text-[10px] font-mono" style={{ color: C.tide500, letterSpacing: "0.18em", fontWeight: 600 }}>УРОВЕНЬ МОРЯ</span>
        </div>
        <div className="text-[14px]" style={{ color: C.abyss, fontWeight: 700, letterSpacing: "-0.01em" }}>
          Пока мало данных — {stats.count} / 5 отчётов.
        </div>
        <div className="text-[12.5px] mt-1 mb-4" style={{ color: C.depth, fontWeight: 500, lineHeight: 1.5 }}>
          Добавь свой (анонимно), чтобы увидеть медиану по «{role} · {microdistrict} МКР».
        </div>
        {renderForm()}
      </div>
    );
  }

  const above = currentSalary && stats.median ? currentSalary > stats.median : null;
  const delta = currentSalary && stats.median ? Math.round(((currentSalary - stats.median) / stats.median) * 100) : null;

  const maxN = Math.max(...(stats.distribution ?? []).map((d) => d.n), 1);

  return (
    <div className="rounded-2xl border p-5 relative overflow-hidden" style={{ borderColor: C.tide100, background: "white" }}>
      <div className="flex items-center gap-2 mb-4">
        <Waves className="w-3.5 h-3.5" style={{ color: C.tide500 }} />
        <span className="text-[10px] font-mono" style={{ color: C.tide500, letterSpacing: "0.18em", fontWeight: 600 }}>УРОВЕНЬ МОРЯ</span>
        <span className="ml-auto text-[10.5px] font-mono" style={{ color: C.tide500, letterSpacing: "0.1em", fontWeight: 500 }}>{stats.count} отчётов</span>
      </div>

      <div className="flex items-end gap-3 mb-2">
        <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.035em", color: C.abyss, lineHeight: 1 }}>
          {fmtKzt(stats.median)}
        </div>
        <div className="pb-1 text-[12px]" style={{ color: C.depth, fontWeight: 600 }}>медиана</div>
      </div>
      <div className="text-[12px] mb-4" style={{ color: C.depth, fontWeight: 500 }}>
        Диапазон {fmtKzt(stats.p25)} — {fmtKzt(stats.p75)} (25–75 перцентили)
      </div>

      {/* Histogram */}
      <div className="flex items-end gap-1 h-20 mb-4">
        {(stats.distribution ?? []).map((d, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }} animate={{ height: `${(d.n / maxN) * 100}%` }}
            transition={{ delay: 0.15 + i * 0.05, duration: 0.5, ease: EASE.splash }}
            className="flex-1 rounded-t-md relative group"
            style={{ background: `linear-gradient(180deg, ${C.tide500}, ${C.tide700})`, minHeight: d.n > 0 ? 4 : 0 }}
            title={`${fmtKzt(d.lo)}–${fmtKzt(d.hi)}: ${d.n}`}
          />
        ))}
      </div>

      {above !== null && (
        <div className="rounded-xl p-3 mb-4 flex items-center gap-2" style={{ background: above ? `${C.kelp}15` : `${C.coral}15`, color: above ? C.kelp : C.coral }}>
          {above ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="text-[12.5px]" style={{ fontWeight: 700 }}>
            Эта вакансия {above ? "выше" : "ниже"} рынка на {Math.abs(delta ?? 0)}%.
          </span>
        </div>
      )}

      {renderForm()}
    </div>
  );

  function renderForm() {
    if (sent) {
      return (
        <div className="rounded-xl p-3 flex items-center gap-2 text-[12.5px]" style={{ background: `${C.kelp}15`, color: C.kelp, fontWeight: 700 }}>
          <Check className="w-3.5 h-3.5" /> Спасибо — твой отчёт анонимен.
        </div>
      );
    }
    if (!openForm) {
      return (
        <button
          onClick={() => setOpenForm(true)}
          className="w-full h-10 rounded-full border inline-flex items-center justify-center gap-1.5 text-[12.5px] hover:border-[#8FB8D9] transition-colors"
          style={{ borderColor: C.tide100, color: C.tide700, fontWeight: 700 }}
        >
          <Plus className="w-3.5 h-3.5" /> Добавить свой отчёт (анонимно)
        </button>
      );
    }
    return (
      <div>
        <div className="flex items-center gap-2">
          <input
            value={val}
            onChange={(e) => setVal(e.target.value.replace(/[^\d\s]/g, ""))}
            placeholder="180 000"
            className="flex-1 h-10 px-3 rounded-full border bg-white text-[13px] outline-none"
            style={{ borderColor: C.tide100, fontWeight: 600, color: C.abyss }}
          />
          <button onClick={send} className="h-10 px-4 rounded-full text-white text-[12.5px]" style={{ background: C.tide700, fontWeight: 700 }}>Отправить</button>
        </div>
        {err && <div className="text-[11.5px] mt-2" style={{ color: C.coral, fontWeight: 600 }}>{err}</div>}
        <div className="text-[10.5px] mt-2" style={{ color: C.tide500, fontWeight: 500 }}>Данные анонимны, без привязки к профилю.</div>
      </div>
    );
  }
}
