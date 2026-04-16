import React, { useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import ChatWindow from "./components/ChatWindow.jsx";
import AnalyticsDashboard from "./components/AnalyticsDashboard.jsx";

export default function App() {
  const sessionId = useMemo(() => uuidv4(), []);
  const [view, setView] = useState("chat"); // chat | dashboard

  return (
    <div className="min-h-full bg-bg">
      <div className="mx-auto flex max-w-6xl flex-col px-4 py-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              AI Customer Query Analyzer
            </h1>
            <p className="text-sm text-slate-300">
              Classify • Sentiment • Empathetic response • Analytics
            </p>
          </div>

          <button
            className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 ring-1 ring-slate-700 hover:bg-slate-700"
            onClick={() => setView((v) => (v === "chat" ? "dashboard" : "chat"))}
          >
            {view === "chat" ? "View Dashboard" : "Back to Chat"}
          </button>
        </header>

        <main className="mt-6">
          <AnimatePresence mode="wait">
            {view === "chat" ? (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <ChatWindow sessionId={sessionId} />
              </motion.div>
            ) : (
              <motion.div
                key="dash"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <AnalyticsDashboard />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

