import React from "react";

function pct(score) {
  if (typeof score !== "number") return "";
  return `${Math.round(score * 100)}%`;
}

export default function SentimentBadge({ sentiment }) {
  const label = sentiment?.label || "NEUTRAL";
  const score = sentiment?.score ?? 0;

  const map = {
    POSITIVE: { bg: "bg-emerald-600/20", ring: "ring-emerald-500/30", text: "text-emerald-200", icon: "😊", name: "Positive" },
    NEGATIVE: { bg: "bg-rose-600/20", ring: "ring-rose-500/30", text: "text-rose-200", icon: "😞", name: "Negative" },
    NEUTRAL: { bg: "bg-slate-600/20", ring: "ring-slate-500/30", text: "text-slate-200", icon: "😐", name: "Neutral" }
  };
  const s = map[label] ?? map.NEUTRAL;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${s.bg} ${s.ring} ${s.text}`}
      title={`${label} (${pct(score)})`}
    >
      <span aria-hidden="true">{s.icon}</span>
      <span>{s.name}</span>
      <span className="opacity-80">{pct(score)}</span>
    </span>
  );
}

