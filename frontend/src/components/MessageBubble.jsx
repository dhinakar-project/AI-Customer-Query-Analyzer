import React from "react";
import { motion } from "framer-motion";
import SentimentBadge from "./SentimentBadge.jsx";
import CategoryTag from "./CategoryTag.jsx";

export default function MessageBubble({ role, text, meta }) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={[
          "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ring-1",
          isUser
            ? "bg-indigo-600/30 text-indigo-50 ring-indigo-500/30"
            : "bg-panel text-slate-100 ring-slate-700"
        ].join(" ")}
      >
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{text}</div>

        {!isUser && meta ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <CategoryTag category={meta.category} />
            <SentimentBadge sentiment={meta.sentiment} />
            {meta.timestamp ? (
              <span className="text-xs text-slate-400">
                {new Date(meta.timestamp).toLocaleString()}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

