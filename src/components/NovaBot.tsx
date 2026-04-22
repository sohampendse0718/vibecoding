import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Types ───────────────────────────────────────────────────────────────── */
type Role = "user" | "nova";
interface Msg { role: Role; text: string; id: number }

/* ── API call ────────────────────────────────────────────────────────────── */
async function askNova(message: string, history: Msg[]): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history: history.slice(-10).map((m) => ({ role: m.role === "nova" ? "model" : "user", text: m.text })),
    }),
  });
  if (!res.ok) throw new Error("Request failed");
  const data = await res.json() as { reply: string };
  return data.reply;
}

/* ── Suggested quick questions ───────────────────────────────────────────── */
const SUGGESTIONS = [
  "What's today's special?",
  "What coffees do you have?",
  "How do I place an order?",
  "Do you include tax?",
];

let msgId = 0;
const nextId = () => ++msgId;

/* ── Component ───────────────────────────────────────────────────────────── */
export default function NovaBot() {
  const [open, setOpen]       = useState(false);
  const [msgs, setMsgs]       = useState<Msg[]>([]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake]     = useState(false);
  const bottomRef             = useRef<HTMLDivElement>(null);
  const inputRef              = useRef<HTMLInputElement>(null);

  /* welcome message on first open */
  useEffect(() => {
    if (open && msgs.length === 0) {
      setMsgs([{
        role: "nova",
        text: "Hello! I'm NOVA — Nocturne's Own Virtual Assistant. ☕ Ask me anything about our menu, today's special, or how to place your order!",
        id: nextId(),
      }]);
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  /* scroll to bottom on new message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async (text = input.trim()) => {
    if (!text || loading) return;
    setInput("");

    const userMsg: Msg = { role: "user", text, id: nextId() };
    setMsgs((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const reply = await askNova(text, [...msgs, userMsg]);
      setMsgs((prev) => [...prev, { role: "nova", text: reply, id: nextId() }]);
    } catch {
      setMsgs((prev) => [...prev, {
        role: "nova",
        text: "I'm having a little trouble connecting. Please try again! ☕",
        id: nextId(),
      }]);
    }
    setLoading(false);
  };

  /* pulse the FAB when closed after a delay */
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => { setShake(true); setTimeout(() => setShake(false), 600); }, 8000);
    return () => clearTimeout(t);
  }, [open, msgs.length]);

  return (
    <>
      {/* ── Chat Panel ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="nova-panel"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="fixed bottom-24 right-5 z-[200] w-[340px] sm:w-[380px] flex flex-col"
            style={{ maxHeight: "70vh" }}
          >
            <div className="flex flex-col h-full rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10"
              style={{ background: "rgba(14,14,18,0.97)", backdropFilter: "blur(20px)" }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-gradient-to-r from-primary-container/10 to-transparent shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-container to-amber-700 flex items-center justify-center shadow-[0_0_12px_rgba(234,179,8,0.4)]">
                  <span className="material-symbols-outlined text-black text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                    smart_toy
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-sm font-bold text-primary-container leading-none">NOVA</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Nocturne's Virtual Assistant</p>
                </div>
                <div className="flex items-center gap-1.5 mr-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-mono">Online</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-white/10 transition"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
                {msgs.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "nova" && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-container to-amber-700 flex items-center justify-center shrink-0 mr-2 mt-1 shadow-sm">
                        <span className="material-symbols-outlined text-black text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary-container text-on-primary-container rounded-br-sm"
                          : "bg-surface-container text-on-surface border border-white/5 rounded-bl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start items-center gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-container to-amber-700 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-black text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                    </div>
                    <div className="bg-surface-container border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-on-surface-variant"
                          style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick suggestions — show only when few messages */}
              {msgs.length <= 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-[10px] border border-primary-container/30 text-primary-container/80 hover:border-primary-container hover:text-primary-container rounded-full px-3 py-1 transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="px-3 py-3 border-t border-white/5 flex gap-2 shrink-0">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void send()}
                  placeholder="Ask NOVA anything about our café…"
                  className="flex-1 bg-surface-container border border-white/10 rounded-xl px-3 py-2 text-sm text-on-surface outline-none focus:border-primary-container/50 transition placeholder:text-on-surface-variant/40"
                />
                <button
                  onClick={() => void send()}
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center hover:opacity-90 active:scale-95 transition disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Action Button ───────────────────────────────────────── */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        animate={shake && !open ? { rotate: [0, -12, 12, -8, 8, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="fixed bottom-5 right-5 z-[200] group"
        aria-label="Open NOVA assistant"
      >
        <div className={`relative w-14 h-14 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all duration-300 ${
          open
            ? "bg-surface-container border border-white/20"
            : "bg-gradient-to-br from-primary-container to-amber-700 shadow-[0_0_20px_rgba(234,179,8,0.35)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] hover:scale-110"
        }`}>
          <AnimatePresence mode="wait">
            {open ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
                className="material-symbols-outlined text-on-surface text-2xl"
              >close</motion.span>
            ) : (
              <motion.span
                key="chat"
                initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}
                className="material-symbols-outlined text-black text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >help</motion.span>
            )}
          </AnimatePresence>

          {/* Ping ring when closed */}
          {!open && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0f1115]" />
          )}
        </div>

        {/* Tooltip label */}
        {!open && (
          <span className="absolute right-16 bottom-3 whitespace-nowrap text-xs font-semibold text-on-surface bg-surface-container border border-white/10 px-3 py-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Ask NOVA ✨
          </span>
        )}
      </motion.button>

      {/* bounce keyframes */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}
