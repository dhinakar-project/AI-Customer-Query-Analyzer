import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function RobotMascot({ isActive, isSpeaking, volumeLevel, isHovered }) {
  const eyeScale = isSpeaking ? 1 + volumeLevel * 0.3 : 1;

  const bodyVariants = {
    idle: { y: [0, -6, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
    walking: { y: [0, -10, 0], transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" } },
    active: { y: [0, -8, 0], transition: { duration: 1, repeat: Infinity, ease: "easeInOut" } },
  };

  const leftArmVariants = {
    idle: { rotate: [0, 8, 0], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
    walking: { rotate: [-30, 30, -30], transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" } },
    active: { rotate: [-20, 20, -20], transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" } },
  };

  const rightArmVariants = {
    idle: { rotate: [0, -8, 0], transition: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 } },
    walking: { rotate: [30, -30, 30], transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" } },
    active: { rotate: [20, -20, 20], transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 } },
  };

  const leftLegVariants = {
    idle: { rotate: 0 },
    walking: { rotate: [-25, 25, -25], transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" } },
    active: { rotate: [-15, 15, -15], transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" } },
  };

  const rightLegVariants = {
    idle: { rotate: 0 },
    walking: { rotate: [25, -25, 25], transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" } },
    active: { rotate: [15, -15, 15], transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.1 } },
  };

  const state = isActive ? "active" : isHovered ? "walking" : "idle";
  const primaryColor = isActive ? "#22d3ee" : "#6366f1";
  const glowColor = isActive ? "rgba(34,211,238,0.5)" : "rgba(99,102,241,0.4)";

  return (
    <div style={{ width: 120, height: 180, position: "relative", cursor: "pointer" }}>
      {isActive && (
        <motion.div
          style={{
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            width: 80,
            height: 20,
            borderRadius: "50%",
            background: glowColor,
            filter: "blur(12px)",
          }}
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      <motion.svg
        viewBox="0 0 120 180"
        width="120"
        height="180"
        variants={bodyVariants}
        animate={state}
        style={{ overflow: "visible" }}
      >
        <defs>
          <filter id="robot-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <radialGradient id="bodyGrad" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
          <radialGradient id="headGrad" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
        </defs>

        <g transform="translate(60, 38)">
          <line x1="0" y1="-22" x2="0" y2="-14" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" />
          <motion.circle
            cx="0" cy="-26"
            r="5"
            fill={primaryColor}
            animate={{ scale: isSpeaking ? [1, 1.5, 1] : [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: isSpeaking ? 0.3 : 1.5, repeat: Infinity }}
            filter="url(#robot-glow)"
          />

          <rect x="-28" y="-14" width="56" height="42" rx="10" fill="url(#headGrad)" stroke={primaryColor} strokeWidth="1.5" />
          <rect x="-22" y="-8" width="44" height="26" rx="6" fill="#0f172a" stroke={primaryColor} strokeWidth="1" opacity="0.8" />

          <motion.circle
            cx="-9" cy="4"
            r="7"
            fill={primaryColor}
            animate={{ scaleY: eyeScale }}
            style={{ transformOrigin: "-9px 4px" }}
          />
          <motion.circle
            cx="9" cy="4"
            r="7"
            fill={primaryColor}
            animate={{ scaleY: eyeScale }}
            style={{ transformOrigin: "9px 4px" }}
          />
          <circle cx="-7" cy="2" r="2.5" fill="white" opacity="0.6" />
          <circle cx="11" cy="2" r="2.5" fill="white" opacity="0.6" />

          <motion.rect
            x="-14" y="15" width="28" height="4" rx="2"
            fill={primaryColor}
            animate={{
              scaleX: isSpeaking ? [1, 0.6, 1.2, 0.8, 1] : 1,
              scaleY: isSpeaking ? [1, 1.5, 0.5, 1.2, 1] : 1,
            }}
            style={{ transformOrigin: "0px 17px" }}
            transition={{ duration: 0.4, repeat: isSpeaking ? Infinity : 0 }}
          />

          <rect x="-33" y="-2" width="7" height="14" rx="3" fill="#1e293b" stroke={primaryColor} strokeWidth="1" />
          <rect x="26" y="-2" width="7" height="14" rx="3" fill="#1e293b" stroke={primaryColor} strokeWidth="1" />
        </g>

        <rect x="50" y="70" width="20" height="8" rx="3" fill="#1e293b" stroke={primaryColor} strokeWidth="1" />
        <rect x="28" y="78" width="64" height="52" rx="12" fill="url(#bodyGrad)" stroke={primaryColor} strokeWidth="1.5" />
        <rect x="38" y="86" width="44" height="32" rx="6" fill="#0f172a" stroke={primaryColor} strokeWidth="1" opacity="0.8" />

        <motion.circle cx="52" cy="98" r="5" fill={primaryColor}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
        />
        <motion.circle cx="60" cy="98" r="5" fill={isActive ? "#f59e0b" : "#6366f1"}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.33 }}
        />
        <motion.circle cx="68" cy="98" r="5" fill="#10b981"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.66 }}
        />

        {isSpeaking && (
          <motion.rect
            x="42" y="108" width={Math.max(4, volumeLevel * 36)} height="6" rx="3"
            fill={primaryColor}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
        )}

        <motion.g
          style={{ transformOrigin: "35px 88px" }}
          variants={leftArmVariants}
          animate={state}
        >
          <rect x="14" y="80" width="16" height="40" rx="8" fill="#1e293b" stroke={primaryColor} strokeWidth="1.2" />
          <circle cx="22" cy="123" r="8" fill="#1e293b" stroke={primaryColor} strokeWidth="1.2" />
        </motion.g>

        <motion.g
          style={{ transformOrigin: "85px 88px" }}
          variants={rightArmVariants}
          animate={state}
        >
          <rect x="90" y="80" width="16" height="40" rx="8" fill="#1e293b" stroke={primaryColor} strokeWidth="1.2" />
          <circle cx="98" cy="123" r="8" fill="#1e293b" stroke={primaryColor} strokeWidth="1.2" />
        </motion.g>

        <motion.g
          style={{ transformOrigin: "47px 130px" }}
          variants={leftLegVariants}
          animate={state}
        >
          <rect x="37" y="128" width="20" height="38" rx="8" fill="#1e293b" stroke={primaryColor} strokeWidth="1.2" />
          <rect x="33" y="160" width="26" height="10" rx="5" fill="#1e293b" stroke={primaryColor} strokeWidth="1.2" />
        </motion.g>

        <motion.g
          style={{ transformOrigin: "73px 130px" }}
          variants={rightLegVariants}
          animate={state}
        >
          <rect x="63" y="128" width="20" height="38" rx="8" fill="#1e293b" stroke={primaryColor} strokeWidth="1.2" />
          <rect x="61" y="160" width="26" height="10" rx="5" fill="#1e293b" stroke={primaryColor} strokeWidth="1.2" />
        </motion.g>
      </motion.svg>
    </div>
  );
}
