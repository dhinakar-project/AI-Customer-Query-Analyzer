import React, { useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import ChatWindow from "./components/ChatWindow.jsx";
import AnalyticsDashboard from "./components/AnalyticsDashboard.jsx";
import VoiceAgent from "./components/VoiceAgent.jsx";

export default function App() {
  const sessionId = useMemo(() => uuidv4(), []);
  const [view, setView] = useState("chat");

  return (
    <div
      className="min-h-screen text-[#e2e8f0]"
      style={{
        background: `
          radial-gradient(ellipse at 15% 40%, rgba(99,102,241,0.08) 0%, transparent 45%),
          radial-gradient(ellipse at 85% 15%, rgba(34,211,238,0.07) 0%, transparent 45%),
          radial-gradient(ellipse at 50% 90%, rgba(99,102,241,0.05) 0%, transparent 50%),
          #030712
        `,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{
        height: 2,
        background: "linear-gradient(90deg, transparent, #6366f1, #22d3ee, #6366f1, transparent)",
        backgroundSize: "200% 100%",
        animation: "shimmer 3s linear infinite",
      }} />

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 4px; }
      `}</style>

      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(20px)",
        background: "rgba(3,7,18,0.8)",
        borderBottom: "1px solid rgba(99,102,241,0.15)",
      }}>
        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #22d3ee)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              boxShadow: "0 0 20px rgba(99,102,241,0.4)",
            }}>
              *
            </div>
            <div>
              <div style={{
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                background: "linear-gradient(135deg, #e2e8f0 0%, #22d3ee 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                QueryAI
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
                <span style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 6px #10b981",
                  animation: "float 2s ease-in-out infinite",
                }} />
                <span style={{ fontSize: 11, color: "rgba(148,163,184,0.7)", fontWeight: 500, letterSpacing: "0.04em" }}>
                  LIVE
                </span>
              </div>
            </div>
          </div>

          <div style={{
            display: "flex",
            gap: 4,
            padding: 4,
            background: "rgba(255,255,255,0.03)",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            {[
              { id: "chat", label: "Chat", icon: "💬" },
              { id: "dashboard", label: "Analytics", icon: "📊" },
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 10,
                  border: "none",
                  background: view === id
                    ? "rgba(99,102,241,0.2)"
                    : "transparent",
                  color: view === id ? "#818cf8" : "rgba(148,163,184,0.7)",
                  fontWeight: view === id ? 600 : 400,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  outline: view === id ? "1px solid rgba(99,102,241,0.3)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <span style={{ fontSize: 14 }}>{icon}</span> {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <AnimatePresence mode="wait">
          {view === "chat" ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <VoiceAgent />

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 28,
              }}>
                <div style={{ flex: 1, height: 1, background: "rgba(99,102,241,0.15)" }} />
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "rgba(148,163,184,0.5)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}>
                  or type below
                </span>
                <div style={{ flex: 1, height: 1, background: "rgba(34,211,238,0.15)" }} />
              </div>

              <ChatWindow sessionId={sessionId} />
            </motion.div>
          ) : (
            <motion.div
              key="dash"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <AnalyticsDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
