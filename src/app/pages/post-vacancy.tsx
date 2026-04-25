import { useNavigate } from "react-router";
import { SmartPaste } from "../components/smart-paste";
import { useJobs } from "../lib/store";
import { C } from "../lib/design";

export function PostVacancy() {
  const { addJob } = useJobs();
  const nav = useNavigate();

  return (
    <div>
      <div className="font-mono text-[11px] uppercase" style={{ color: C.tide500, letterSpacing: "0.14em", fontWeight: 500 }}>
        Новая вакансия
      </div>
      <h1 className="font-display mt-2 mb-3" style={{ fontSize: "clamp(36px,5vw,56px)", fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1.02, color: C.abyss }}>
        Вставь. Разбери. <span style={{ color: C.tide500 }}>Опубликуй.</span>
      </h1>
      <p className="text-[14px] max-w-xl" style={{ color: C.depth, fontWeight: 400, lineHeight: 1.55 }}>
        Smart Parser читает объявление из WhatsApp и заполняет форму. Тебе остаётся один клик.
      </p>

      <div className="mt-8">
        <SmartPaste
          onPublish={(j) => {
            addJob(j).catch(() => {});
            setTimeout(() => nav("/app/employer/vacancies"), 1500);
          }}
        />
      </div>
    </div>
  );
}
