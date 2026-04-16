import React, { useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import ChatWindow from "./components/ChatWindow.jsx";
import AnalyticsDashboard from "./components/AnalyticsDashboard.jsx";

export default function App() {
  const sessionId = useMemo(() => uuidv4(), []);
  const [view, setView] = useState("chat"); // chat | dashboard

  return (
    <div 
      className="min-h-screen text-[#e2e8f0]"
      style={{
        background: `radial-gradient(ellipse at 20% 50%, rgba(56,189,248,0.06) 0%, transparent 50%),
                     radial-gradient(ellipse at 80% 20%, rgba(129,140,248,0.06) 0%, transparent 50%),
                     #050810`
      }}
    >
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/[0.03] border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 text-xl font-display">✦</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white font-display">QueryAI</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-slate-400 font-medium tracking-wide">● Live</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/[0.05]">
            <button
              onClick={() => setView("chat")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                view === "chat"
                  ? "bg-white/[0.08] text-cyan-400 ring-1 ring-cyan-500/30 glow-cyan"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setView("dashboard")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                view === "dashboard"
                  ? "bg-white/[0.08] text-cyan-400 ring-1 ring-cyan-500/30 glow-cyan"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Analytics
            </button>
          </div>
        </div>
        <div className="h-[1px] w-full bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-violet-500/0 opacity-50"></div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <AnimatePresence mode="wait">
          {view === "chat" ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
            >
              <ChatWindow sessionId={sessionId} />
            </motion.div>
          ) : (
            <motion.div
              key="dash"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
            >
              <AnalyticsDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

