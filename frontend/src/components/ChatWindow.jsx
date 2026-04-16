import React, { useEffect, useRef, useState } from "react";
import { sendChat } from "../api/client.js";
import MessageBubble from "./MessageBubble.jsx";

function Spinner() {
  return (
    <div className="flex gap-1.5 items-center px-4 py-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export default function ChatWindow({ sessionId }) {
  const [messages, setMessages] = useState(() => [
    {
      id: "welcome",
      role: "bot",
      text:
        "Hi! Send me a customer query and I’ll classify it, analyze sentiment, and respond with an empathetic next step.",
      meta: { category: "General Inquiry", sentiment: { label: "NEUTRAL", score: 0.8 } }
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function onSend() {
    const text = input.trim();
    if (!text || loading) return;
    setError("");
    setInput("");
    setLoading(true);

    const userMsg = { id: crypto.randomUUID(), role: "user", text };
    setMessages((m) => [...m, userMsg]);

    try {
      const data = await sendChat({ message: text, session_id: sessionId });
      setWarning(data.warning || "");
      const botMsg = {
        id: crypto.randomUUID(),
        role: "bot",
        text: data.response,
        meta: {
          category: data.category,
          sentiment: data.sentiment,
          timestamp: data.timestamp
        }
      };
      setMessages((m) => [...m, botMsg]);
    } catch (e) {
      const detail =
        e?.response?.data?.detail ||
        e?.message ||
        "Something went wrong calling the API.";
      setWarning("");
      setError(detail);
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "bot",
          text:
            "Sorry—something went wrong on my side. Please try again in a moment.",
          meta: { category: "General Inquiry", sentiment: { label: "NEUTRAL", score: 0.75 } }
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="relative rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.07] overflow-hidden shadow-2xl shadow-black/20">
        <div 
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            backgroundImage: `linear-gradient(rgba(56,189,248,0.03) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(56,189,248,0.03) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
        <div className="h-[75vh] space-y-4 overflow-y-auto p-6 scroll-smooth relative z-10">
          {messages.map((m) => (
            <MessageBubble key={m.id} role={m.role} text={m.text} meta={m.meta} />
          ))}
          {loading ? (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-tl-sm bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
                <Spinner />
              </div>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>
      </div>

      {error ? (
        <div className="rounded-xl bg-rose-600/10 px-4 py-3 text-sm text-rose-200 ring-1 ring-rose-500/30">
          {error}
        </div>
      ) : null}

      {warning ? (
        <div className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-100 ring-1 ring-amber-400/30">
          {warning}
        </div>
      ) : null}

      <div className="flex items-center gap-3 bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-3 shadow-[0_-1px_0_rgba(255,255,255,0.05)] sticky bottom-4 z-20">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Type a customer query… (Enter to send, Shift+Enter for newline)"
          className="min-h-[52px] flex-1 resize-none bg-transparent px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
        <button
          onClick={onSend}
          disabled={loading || !input.trim()}
          className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white transition-all hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="text-xl">→</span>
        </button>
      </div>

      <div className="text-xs text-slate-400">
        Session ID: <span className="font-mono">{sessionId}</span>
      </div>
    </div>
  );
}

