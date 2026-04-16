import React, { useEffect, useRef, useState } from "react";
import { sendChat } from "../api/client.js";
import MessageBubble from "./MessageBubble.jsx";

function Spinner() {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-300">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-slate-200" />
      Thinking…
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
    <div className="grid gap-4">
      <div className="rounded-2xl bg-panel/60 ring-1 ring-slate-800">
        <div className="max-h-[68vh] space-y-3 overflow-y-auto p-4">
          {messages.map((m) => (
            <MessageBubble key={m.id} role={m.role} text={m.text} meta={m.meta} />
          ))}
          {loading ? (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-panel px-4 py-3 ring-1 ring-slate-700">
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

      <div className="flex items-end gap-3 rounded-2xl bg-panel/60 p-3 ring-1 ring-slate-800">
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
          className="min-h-[52px] flex-1 resize-none rounded-xl bg-slate-900/40 px-4 py-3 text-sm text-slate-100 ring-1 ring-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
        <button
          onClick={onSend}
          disabled={loading || !input.trim()}
          className="h-[52px] rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </div>

      <div className="text-xs text-slate-400">
        Session ID: <span className="font-mono">{sessionId}</span>
      </div>
    </div>
  );
}

