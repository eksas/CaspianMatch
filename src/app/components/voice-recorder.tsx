import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Mic, Square, Sparkles, AlertCircle, Upload } from "lucide-react";
import { transcribeAndParse } from "../lib/gemini";
import { C } from "../lib/design";

type Parsed = {
  microdistrict: number | null;
  interests: string[];
  skills: string[];
  bio: string;
};

export function VoiceRecorder({ onParsed }: { onParsed: (p: Parsed) => void }) {
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const start = async () => {
    setErr(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setErr("Браузер не даёт доступ к микрофону в этом окне. Используй загрузку файла ниже.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        setSeconds(0);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await send(blob);
      };
      recRef.current = rec;
      rec.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (e: any) {
      const name = e?.name ?? "Error";
      const msg = e?.message ?? String(e);
      setErr(`Микрофон недоступен (${name}): ${msg}. Загрузи аудио-файл ниже.`);
      console.log(`voice start failed: ${name} ${msg}`);
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr(null);
    await send(f);
    e.target.value = "";
  };

  const stop = () => {
    recRef.current?.stop();
    setRecording(false);
  };

  const send = async (blob: Blob) => {
    setBusy(true);
    try {
      const base64 = await blobToBase64(blob);
      const mimeType = blob.type || "audio/webm";
      const parsed = await transcribeAndParse(base64, "audio/webm");

      if (parsed) {
        onParsed(prsed);
      } else {
        setErr("AI не смог извлечь данные. Попробуй ещё раз — говори чётче.");
      }
    } catch (e: any) {
      setErr(e?.message ?? "Ошибка. Попробуй ещё раз.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: C.tide100, background: `linear-gradient(135deg, ${C.tide50}, #FBFDFF)` }}>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-3.5 h-3.5" style={{ color: C.tide700 }} />
        <span className="text-[10.5px] font-mono" style={{ color: C.tide700, letterSpacing: "0.14em", fontWeight: 700 }}>
          ГОЛОСОМ · 30 СЕКУНД
        </span>
      </div>
      <div className="text-[13px] mb-3" style={{ color: C.depth, fontWeight: 500, lineHeight: 1.5 }}>
        Расскажи коротко: район, чем занимался, что умеешь. AI заполнит анкету сам.
      </div>

      {!recording && !busy && (
        <div className="flex items-center gap-2 flex-wrap">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={start}
            className="inline-flex items-center gap-2 h-11 px-4 rounded-full text-white text-[13px]"
            style={{ background: C.tide700, fontWeight: 700 }}
          >
            <Mic className="w-3.5 h-3.5" /> Надиктовать
          </motion.button>
          <label
            className="inline-flex items-center gap-2 h-11 px-4 rounded-full border bg-white text-[13px] cursor-pointer"
            style={{ borderColor: C.tide100, color: C.depth, fontWeight: 600 }}
          >
            <Upload className="w-3.5 h-3.5" /> Загрузить аудио
            <input type="file" accept="audio/*" className="hidden" onChange={onFile} />
          </label>
        </div>
      )}

      {recording && (
        <div className="flex items-center gap-3">
          <motion.button
            onClick={stop}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-12 h-12 rounded-full text-white flex items-center justify-center"
            style={{ background: C.coral }}
          >
            <Square className="w-4 h-4" fill="white" />
          </motion.button>
          <div className="flex-1">
            <div className="text-[13px]" style={{ color: C.abyss, fontWeight: 700 }}>Запись… {seconds}с</div>
            <div className="text-[11px]" style={{ color: C.tide500, fontWeight: 500 }}>Нажми стоп, когда закончишь.</div>
          </div>
        </div>
      )}

      {busy && (
        <div className="flex items-center gap-2 text-[13px]" style={{ color: C.tide700, fontWeight: 600 }}>
          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> AI разбирает запись…
        </div>
      )}

      {err && (
        <div className="mt-3 flex items-start gap-2 text-[12px]" style={{ color: C.coral, fontWeight: 600 }}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {err}
        </div>
      )}
    </div>
  );
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onloadend = () => {
      const s = String(r.result ?? "");
      const i = s.indexOf(",");
      resolve(i >= 0 ? s.slice(i + 1) : s);
    };
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}
