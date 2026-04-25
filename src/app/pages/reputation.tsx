import { Shield, CheckCircle2, Circle } from "lucide-react";
import { C } from "../lib/design";
import { useAuth } from "../lib/auth";

const CHECKLIST = [
  { id: "id", label: "Подтверждён номер телефона", done: true },
  { id: "dist", label: "Указан район проживания", done: true },
  { id: "vouch", label: "2 рекомендации от соседей / друзей", done: true },
  { id: "video", label: "30-секундное видео-представление", done: false },
  { id: "cert", label: "Сертификат от наставника CaspianMatch", done: false },
];

export function Reputation() {
  const { user } = useAuth();
  const score = 72;
  const doneCount = CHECKLIST.filter((c) => c.done).length;

  return (
    <div>
      <header className="pb-6 border-b" style={{ borderColor: C.abyss }}>
        <div className="flex items-baseline justify-between pb-2">
          <span className="font-mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.abyss, fontWeight: 800 }}>
            ФУНКЦИЯ 04 · РЕПУТАЦИЯ
          </span>
          <span className="font-mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: C.tide500, fontWeight: 700 }}>
            {user?.name?.split(" ")[0] ?? "ТЫ"} · ЛЕДЖЕР
          </span>
        </div>
        <h1 className="mt-6" style={{ fontSize: "clamp(44px,7vw,92px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.9, color: C.abyss }}>
          Локальный<br />
          <span style={{ fontStyle: "italic", color: C.coral }}>авторитет.</span>
        </h1>
      </header>

      <div className="mt-10 grid md:grid-cols-[1fr_1.2fr] gap-10">
        <div className="p-8 text-white" style={{ background: C.abyss }}>
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-4 h-4" style={{ color: C.coral }} />
            <span className="font-mono" style={{ fontSize: 11, letterSpacing: "0.18em", fontWeight: 800 }}>
              РЕПУТАЦИЯ
            </span>
          </div>
          <div className="font-mono tabular-nums" style={{ fontSize: 120, fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.9, color: C.coral, fontStyle: "italic" }}>
            {score}
          </div>
          <div className="mt-3 text-[13px] opacity-75" style={{ fontWeight: 500 }}>
            из 100 · выше 68% соискателей Актау
          </div>
          <div className="mt-6 h-[3px] w-full" style={{ background: "rgba(255,255,255,0.15)" }}>
            <div style={{ width: `${score}%`, height: "100%", background: C.coral }} />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
            <Stat k="3" label="ПОРУЧИЛИСЬ" />
            <Stat k="12" label="ОТКЛИКОВ" />
            <Stat k="2" label="ИНТЕРВЬЮ" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between pb-2 border-b mb-4" style={{ borderColor: C.abyss }}>
            <span className="font-mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.abyss, fontWeight: 800 }}>
              ЧТО УЛУЧШИТЬ
            </span>
            <span className="font-mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: C.tide500, fontWeight: 700 }}>
              {doneCount} / {CHECKLIST.length}
            </span>
          </div>
          <ul>
            {CHECKLIST.map((c) => (
              <li key={c.id} className="py-3 border-b flex items-center gap-3" style={{ borderColor: C.tide100 }}>
                {c.done ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: C.coral }} />
                ) : (
                  <Circle className="w-4 h-4 shrink-0" style={{ color: C.tide500 }} />
                )}
                <span style={{ fontSize: 14, color: c.done ? C.tide500 : C.abyss, fontWeight: c.done ? 500 : 700, textDecoration: c.done ? "line-through" : "none", letterSpacing: "-0.005em" }}>
                  {c.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Stat({ k, label }: { k: string; label: string }) {
  return (
    <div>
      <div className="font-mono tabular-nums" style={{ fontSize: 26, fontWeight: 900, color: "white", letterSpacing: "-0.03em", lineHeight: 1 }}>
        {k}
      </div>
      <div className="mt-1 font-mono" style={{ fontSize: 10, letterSpacing: "0.18em", opacity: 0.65, fontWeight: 700 }}>
        {label}
      </div>
    </div>
  );
}
