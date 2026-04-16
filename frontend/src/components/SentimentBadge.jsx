import React from "react";

function pct(score) {
  if (typeof score !== "number") return "";
  return `${Math.round(score * 100)}%`;
}

export default function SentimentBadge({ sentiment }) {
  const label = sentiment?.label || "NEUTRAL";
  const score = sentiment?.score ?? 0;

  const map = {
    POSITIVE: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-300", shadow: "shadow-[0_0_8px_rgba(52,211,153,0.4)]", icon: "●", name: "Positive" },
    NEGATIVE: { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-300", shadow: "shadow-[0_0_8px_rgba(244,63,94,0.4)]", icon: "●", name: "Negative" },
    NEUTRAL: { bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-300", shadow: "", icon: "●", name: "Neutral" }
  };
  const s = map[label] ?? map.NEUTRAL;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide border backdrop-blur-md ${s.bg} ${s.border} ${s.text} ${s.shadow}`}
      title={`${label} (${pct(score)})`}
    >
      <span aria-hidden="true" className="text-[8px]">{s.icon}</span>
      <span>{s.name}</span>
      <span className="opacity-70 ml-0.5">{pct(score)}</span>
    </span>
  );
}

