import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RobotMascot from "./RobotMascot.jsx";
import { useVapi } from "../vapi/useVapi.js";

function SoundWave({ volumeLevel, isActive }) {
  const bars = 12;
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 3,
      height: 32,
    }}>
      {Array.from({ length: bars }).map((_, i) => {
        const center = bars / 2;
        const distFromCenter = Math.abs(i - center + 0.5);
        const baseHeight = Math.max(4, 20 - distFromCenter * 2.5);
        const animHeight = isActive
          ? baseHeight + volumeLevel * 16 * Math.random()
          : baseHeight * 0.4;
        return (
          <motion.div
            key={i}
            style={{
              width: 3,
              borderRadius: 2,
              background: isActive
                ? "linear-gradient(to top, #22d3ee, #6366f1)"
                : "rgba(99,102,241,0.3)",
            }}
            animate={{ height: animHeight }}
            transition={{ duration: 0.1, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

function TranscriptLine({ role, text }) {
  const isAssistant = role === "assistant";
  return (
    <motion.div
      initial={{ opacity: 0, x: isAssistant ? -10 : 10 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        display: "flex",
        justifyContent: isAssistant ? "flex-start" : "flex-end",
        marginBottom: 8,
      }}
    >
      <div style={{
        maxWidth: "85%",
        padding: "8px 14px",
        borderRadius: isAssistant ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
        background: isAssistant
          ? "rgba(34,211,238,0.08)"
          : "rgba(99,102,241,0.12)",
        border: `1px solid ${isAssistant ? "rgba(34,211,238,0.2)" : "rgba(99,102,241,0.25)"}`,
        fontSize: 13,
        lineHeight: 1.5,
        color: "#e2e8f0",
      }}>
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: isAssistant ? "#22d3ee" : "#818cf8",
          display: "block",
          marginBottom: 3,
        }}>
          {isAssistant ? "QueryAI" : "You"}
        </span>
        {text}
      </div>
    </motion.div>
  );
}

export default function VoiceAgent() {
  const [isHovered, setIsHovered] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const transcriptEndRef = useRef(null);

  const {
    isConnecting,
    isConnected,
    isSpeaking,
    isMuted,
    volumeLevel,
    transcript,
    error,
    formattedDuration,
    startCall,
    stopCall,
    toggleMute,
    isConfigured,
  } = useVapi();

  useEffect(() => {
    if (transcript.length > 0) setShowTranscript(true);
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const statusLabel = isConnecting
    ? "Connecting..."
    : isConnected
    ? isSpeaking ? "Speaking..." : "Listening..."
    : "Click robot to start voice chat";

  const statusColor = isConnected
    ? isSpeaking ? "#22d3ee" : "#10b981"
    : isConnecting ? "#f59e0b" : "#6366f1";

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(34,211,238,0.06) 100%)",
      border: "1px solid rgba(99,102,241,0.2)",
      borderRadius: 24,
      padding: "32px 24px 24px",
      marginBottom: 32,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "absolute",
        top: 16,
        right: 16,
        background: "linear-gradient(135deg, #6366f1, #22d3ee)",
        borderRadius: 20,
        padding: "4px 14px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        color: "white",
        textTransform: "uppercase",
      }}>
        Voice AI
      </div>

      <div style={{ display: "flex", gap: 32, alignItems: "flex-start", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative" }}>
            {(isConnected || isConnecting) && (
              <>
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 120 + i * 30,
                      height: 120 + i * 30,
                      borderRadius: "50%",
                      border: `1px solid rgba(34,211,238,${0.4 - i * 0.1})`,
                      pointerEvents: "none",
                    }}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                  />
                ))}
              </>
            )}

            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={isConnected ? stopCall : startCall}
              style={{ cursor: "pointer" }}
            >
              <RobotMascot
                isActive={isConnected}
                isSpeaking={isSpeaking}
                volumeLevel={volumeLevel}
                isHovered={isHovered}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <motion.div
                style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor }}
                animate={{ scale: isConnected ? [1, 1.4, 1] : 1, opacity: isConnected ? [0.7, 1, 0.7] : 1 }}
                transition={{ duration: 1, repeat: isConnected ? Infinity : 0 }}
              />
              <span style={{ fontSize: 12, color: statusColor, fontWeight: 600 }}>{statusLabel}</span>
            </div>

            {isConnected && (
              <span style={{ fontSize: 11, color: "rgba(148,163,184,0.8)", fontFamily: "monospace" }}>
                {formattedDuration}
              </span>
            )}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              background: "linear-gradient(135deg, #e2e8f0 0%, #22d3ee 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
            }}>
              Voice AI Assistant
            </h2>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(148,163,184,0.9)", lineHeight: 1.5 }}>
              Talk naturally with QueryAI. Your speech is classified, sentiment-analyzed, and responded to in real-time — all via voice.
            </p>
          </div>

          <div style={{
            background: "rgba(0,0,0,0.2)",
            borderRadius: 12,
            padding: "12px 16px",
            border: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}>
            <span style={{ fontSize: 11, color: "rgba(148,163,184,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 60 }}>
              {isSpeaking ? "AI Voice" : "Audio"}
            </span>
            <SoundWave volumeLevel={volumeLevel} isActive={isConnected} />
            {isConnected && (
              <span style={{
                fontSize: 10,
                color: isSpeaking ? "#22d3ee" : "#10b981",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}>
                {isSpeaking ? "SPEAKING" : "READY"}
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {!isConnected && !isConnecting && (
              <motion.button
                onClick={startCall}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: "10px 24px",
                  borderRadius: 12,
                  border: "none",
                  background: isConfigured
                    ? "linear-gradient(135deg, #6366f1, #22d3ee)"
                    : "rgba(99,102,241,0.3)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: isConfigured ? "pointer" : "not-allowed",
                  letterSpacing: "0.02em",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                disabled={!isConfigured}
              >
                {isConfigured ? "Start Voice Chat" : "Add Vapi Keys to Config"}
              </motion.button>
            )}

            {isConnecting && (
              <button style={{
                padding: "10px 24px",
                borderRadius: 12,
                border: "1px solid rgba(245,158,11,0.4)",
                background: "rgba(245,158,11,0.1)",
                color: "#f59e0b",
                fontWeight: 600,
                fontSize: 14,
                cursor: "wait",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{ display: "inline-block" }}
                >⟳</motion.span>
                Connecting...
              </button>
            )}

            {isConnected && (
              <>
                <motion.button
                  onClick={toggleMute}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 12,
                    border: `1px solid ${isMuted ? "rgba(244,63,94,0.4)" : "rgba(99,102,241,0.4)"}`,
                    background: isMuted ? "rgba(244,63,94,0.1)" : "rgba(99,102,241,0.1)",
                    color: isMuted ? "#f43f5e" : "#818cf8",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {isMuted ? "Unmute" : "Mute"}
                </motion.button>

                <motion.button
                  onClick={stopCall}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 12,
                    border: "1px solid rgba(244,63,94,0.4)",
                    background: "rgba(244,63,94,0.1)",
                    color: "#f87171",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  End Call
                </motion.button>

                <button
                  onClick={() => setShowTranscript(t => !t)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "transparent",
                    color: "rgba(148,163,184,0.8)",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {showTranscript ? "Hide" : "Show"} Transcript
                </button>
              </>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(244,63,94,0.1)",
                border: "1px solid rgba(244,63,94,0.3)",
                color: "#fda4af",
                fontSize: 13,
              }}
            >
              {error}
              {!isConfigured && (
                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                  Open <code>frontend/src/vapi/vapiConfig.js</code> and add your Vapi Public Key + Assistant ID from{" "}
                  <a href="https://dashboard.vapi.ai" target="_blank" rel="noopener" style={{ color: "#22d3ee" }}>
                    dashboard.vapi.ai
                  </a>
                </div>
              )}
            </motion.div>
          )}

          {!isConfigured && !error && (
            <div style={{
              padding: "12px 16px",
              borderRadius: 12,
              background: "rgba(99,102,241,0.06)",
              border: "1px solid rgba(99,102,241,0.15)",
              fontSize: 12,
              color: "rgba(148,163,184,0.9)",
              lineHeight: 1.7,
            }}>
              <strong style={{ color: "#818cf8" }}>Quick Setup:</strong>
              <ol style={{ margin: "6px 0 0", paddingLeft: 16 }}>
                <li>Go to <a href="https://dashboard.vapi.ai" target="_blank" style={{ color: "#22d3ee" }}>dashboard.vapi.ai</a> — Sign up free</li>
                <li>Create an Assistant with your system prompt</li>
                <li>Copy your Public Key + Assistant ID</li>
                <li>Paste them into <code>frontend/src/vapi/vapiConfig.js</code></li>
              </ol>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showTranscript && transcript.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              marginTop: 20,
              padding: "16px",
              background: "rgba(0,0,0,0.2)",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.06)",
              maxHeight: 220,
              overflowY: "auto",
            }}>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "rgba(148,163,184,0.6)",
                textTransform: "uppercase",
                marginBottom: 10,
              }}>
                Live Transcript
              </div>
              {transcript.map((t, i) => (
                <TranscriptLine key={i} role={t.role} text={t.text} />
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
