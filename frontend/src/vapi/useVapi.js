import { useEffect, useRef, useState, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import { VAPI_CONFIG } from "./vapiConfig.js";

export function useVapi() {
  const vapiRef = useRef(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [transcript, setTranscript] = useState([]);
  const [error, setError] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const durationRef = useRef(null);

  useEffect(() => {
    if (!VAPI_CONFIG.publicKey || VAPI_CONFIG.publicKey === "YOUR_VAPI_PUBLIC_KEY_HERE") {
      return;
    }

    const vapi = new Vapi(VAPI_CONFIG.publicKey);
    vapiRef.current = vapi;

    vapi.on("call-start", () => {
      setIsConnecting(false);
      setIsConnected(true);
      setError(null);
      setCallDuration(0);
      durationRef.current = setInterval(() => {
        setCallDuration(d => d + 1);
      }, 1000);
    });

    vapi.on("call-end", () => {
      setIsConnected(false);
      setIsSpeaking(false);
      setVolumeLevel(0);
      if (durationRef.current) clearInterval(durationRef.current);
    });

    vapi.on("speech-start", () => setIsSpeaking(true));
    vapi.on("speech-end", () => setIsSpeaking(false));

    vapi.on("volume-level", (level) => setVolumeLevel(level));

    vapi.on("message", (msg) => {
      if (msg.type === "transcript" && msg.transcriptType === "final") {
        setTranscript(prev => [...prev, {
          role: msg.role,
          text: msg.transcript,
          timestamp: new Date().toISOString()
        }]);
      }
    });

    vapi.on("error", (err) => {
      console.error("Vapi error:", err);
      setError(err?.message || "Voice connection failed");
      setIsConnecting(false);
      setIsConnected(false);
    });

    return () => {
      if (durationRef.current) clearInterval(durationRef.current);
      vapi.stop();
    };
  }, []);

  const startCall = useCallback(async () => {
    if (!vapiRef.current) {
      setError("Vapi not initialized. Please add your VAPI_PUBLIC_KEY in vapiConfig.js");
      return;
    }
    try {
      setIsConnecting(true);
      setError(null);
      setTranscript([]);
      await vapiRef.current.start(VAPI_CONFIG.assistantId);
    } catch (err) {
      setError(err?.message || "Failed to start voice call");
      setIsConnecting(false);
    }
  }, []);

  const stopCall = useCallback(() => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (vapiRef.current) {
      vapiRef.current.setMuted(!isMuted);
      setIsMuted(m => !m);
    }
  }, [isMuted]);

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return {
    isConnecting,
    isConnected,
    isSpeaking,
    isMuted,
    volumeLevel,
    transcript,
    error,
    callDuration,
    formattedDuration: formatDuration(callDuration),
    startCall,
    stopCall,
    toggleMute,
    isConfigured: VAPI_CONFIG.publicKey !== "YOUR_VAPI_PUBLIC_KEY_HERE",
  };
}
