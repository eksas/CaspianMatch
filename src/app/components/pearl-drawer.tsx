import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { streamChat } from "../lib/gemini";

type Msg = { role: "user" | "model"; text: string };

const SUGGESTIONS = [
  "Помоги написать био",
  "Как пройти первое собеседование?",
  "Переведи объявление с казахского",
  "Сравни две вакансии",
];

const INTRO: Msg = {
  role: "model",
  text: "Привет, я Жемчуг — ваш AI-наставник. Помогу с био, подготовлю к звонку работодателю или отвечу на вопросы о работе в Актау.",
};

export function PearlDrawer({ open, onClose, initialMessage }: { open: boolean; onClose: () => void; initialMessage?: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setMessages([{
        role: "model",
        text: initialMessage || "Привет, я Жемчуг — ваш AI-наставник. Помогу с био, подготовлю к звонку работодателю или отвечу на вопросы о работе в Актау.",
      }]);
    }
  }, [open, initialMessage]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const next: Msg[] = [...messages, { role: "user", text: trimmed }];
    setMessages(next);
    setInput("");
    setBusy(true);

    const streamingMsg: Msg = { role: "model", text: "" };
    setMessages((p) => [...p, streamingMsg]);

    try {
      const history = next.filter((m) => m !== INTRO);

      await streamChat(history, (chunk) => {
        streamingMsg.text += chunk;
        setMessages((p) => [...p.slice(0, -1), { ...streamingMsg }]);
      });
    } catch (e) {
      console.log(`Pearl send failed: ${e}`);
      setMessages((p) => [
        ...p.slice(0, -1),
        { role: "model", text: `Ошибка: ${e instanceof Error ? e.message : e}` }
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: 440 }} animate={{ x: 0 }} exit={{ x: 440 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-white z-50 flex flex-col border-l border-[#E5E7EB] shadow-2xl"
          >
            <div className="h-16 px-5 flex items-center gap-3 border-b border-[#E5E7EB]">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                style={{ background: "linear-gradient(135deg,#1B5A8F,#3A8FCC)" }}>
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-[14px] text-slate-900" style={{ fontWeight: 700 }}>Жемчуг</div>
                <div className="text-[11px] text-slate-500" style={{ fontWeight: 600 }}>AI-наставник CaspianMatch</div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed " +
                      (m.role === "user"
                        ? "bg-[#1B5A8F] text-white rounded-br-sm"
                        : "bg-slate-100 text-slate-900 rounded-bl-sm")
                    }
                    style={{ fontWeight: 500, whiteSpace: "pre-wrap" }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-slate-500 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span className="text-[12px]" style={{ fontWeight: 600 }}>думаю…</span>
                  </div>
                </div>
              )}
              {messages.length <= 1 && !busy && (
                <div className="pt-2 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => send(s)}
                      className="text-[12px] px-3 py-1.5 rounded-full border border-[#E5E7EB] hover:bg-slate-50 text-slate-700"
                      style={{ fontWeight: 600 }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="p-4 border-t border-[#E5E7EB] flex items-end gap-2"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
                }}
                rows={1}
                placeholder="Спросите у Жемчуга…"
                className="flex-1 resize-none rounded-xl border border-[#E5E7EB] px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1B5A8F]/30"
                style={{ fontWeight: 500 }}
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="w-10 h-10 shrink-0 rounded-xl bg-[#1B5A8F] text-white flex items-center justify-center disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
