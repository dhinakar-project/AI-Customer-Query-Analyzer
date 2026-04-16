import React from "react";
import { motion } from "framer-motion";
import SentimentBadge from "./SentimentBadge.jsx";
import CategoryTag from "./CategoryTag.jsx";

export default function MessageBubble({ role, text, meta }) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 40 : -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-3 w-full`}
    >
      {!isUser && (
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm mt-1">
          ✦
        </div>
      )}
      
      <div
        className={`max-w-[85%] px-4 py-3 ${
          isUser
            ? "bg-gradient-to-br from-[#38bdf8]/20 to-[#818cf8]/20 border border-[#38bdf8]/30 rounded-2xl rounded-tr-sm shadow-[0_0_20px_rgba(56,189,248,0.1)] text-[#e2e8f0]"
            : "bg-white/[0.04] border border-white/[0.08] rounded-2xl rounded-tl-sm backdrop-blur-sm text-[#e2e8f0]"
        }`}
      >
        <div className="whitespace-pre-wrap text-[15px] leading-relaxed">{text}</div>

        {!isUser && meta ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <CategoryTag category={meta.category} />
            <SentimentBadge sentiment={meta.sentiment} />
            {meta.timestamp ? (
              <span className="text-xs text-slate-500 ml-auto">
                {new Date(meta.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {isUser && (
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 font-semibold text-white text-sm mt-1 shadow-[0_0_15px_rgba(129,140,248,0.3)]">
          U
        </div>
      )}
    </motion.div>
  );
}

