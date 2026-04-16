import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { fetchAnalytics } from "../api/client.js";
import SentimentBadge from "./SentimentBadge.jsx";

const SENTIMENT_COLORS = {
  POSITIVE: "#10b981",
  NEGATIVE: "#f43f5e",
  NEUTRAL: "#94a3b8"
};

function StatCard({ label, value, sub, icon }) {
  return (
    <div className="rounded-2xl p-5 border-t-[2px] border-t-cyan-500/40 bg-white/[0.03] backdrop-blur-[20px] shadow-lg shadow-black/10 transition-all hover:bg-white/[0.04]">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#64748b] font-medium">
        <span>{icon}</span> {label}
      </div>
      <div className="mt-3 text-3xl font-bold font-display text-cyan-400">{value}</div>
      {sub ? <div className="mt-1 text-sm text-slate-400">{sub}</div> : null}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const d = await fetchAnalytics();
      setData(d);
    } catch (e) {
      setError(
        e?.response?.data?.detail ||
          e?.message ||
          "Failed to load analytics."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const sentimentPie = useMemo(() => {
    const dist = data?.sentiment_distribution || {};
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [data]);

  const categoryBars = useMemo(() => {
    const dist = data?.category_distribution || {};
    return Object.entries(dist)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const mostCommonCategory = useMemo(() => {
    if (!categoryBars.length) return "—";
    return categoryBars[0].name;
  }, [categoryBars]);

  const avgSentiment = useMemo(() => {
    const dist = data?.sentiment_distribution;
    if (!dist) return "—";
    const total = Object.values(dist).reduce((a, b) => a + b, 0);
    if (!total) return "—";
    const score =
      ((dist.POSITIVE || 0) * 1 + (dist.NEUTRAL || 0) * 0 + (dist.NEGATIVE || 0) * -1) /
      total;
    if (score > 0.25) return "Mostly Positive";
    if (score < -0.25) return "Mostly Negative";
    return "Mixed / Neutral";
  }, [data]);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white">Analytics</h2>
          <p className="text-sm text-slate-400 mt-1">
            Live stats from your local SQLite query logs.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-full border border-cyan-500/30 px-5 py-2 text-sm font-medium text-cyan-400 transition-all hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(56,189,248,0.2)] disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
             <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          ) : (
             <span className="text-lg leading-none">↻</span>
          )}
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-xl bg-rose-600/10 px-4 py-3 text-sm text-rose-200 ring-1 ring-rose-500/30">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total Queries"
          icon="📊"
          value={loading ? "…" : data?.total_queries ?? 0}
        />
        <StatCard label="Most Common Category" icon="🏷️" value={loading ? "…" : mostCommonCategory} />
        <StatCard label="Avg Sentiment" icon="💬" value={loading ? "…" : avgSentiment} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl p-5 border-t-[2px] border-t-cyan-500/40 bg-white/[0.03] backdrop-blur-[20px] shadow-lg shadow-black/10 hover:bg-white/[0.04] transition-colors">
          <div className="mb-3 text-sm font-semibold text-slate-300 tracking-wide uppercase">
            Sentiment Distribution
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentPie}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  stroke="none"
                >
                  {sentimentPie.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={SENTIMENT_COLORS[entry.name] || "#64748b"}
                    />
                  ))}
                </Pie>
                <text x="50%" y="50%" textAnchor="middle" fill="#e2e8f0" fontSize="28" fontWeight="700" className="font-display">
                  {data?.total_queries || 0}
                </text>
                <text x="50%" y="58%" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="500">
                  queries
                </text>
                <Tooltip
                  contentStyle={{
                    background: "rgba(11,18,32,0.8)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 16,
                    color: "#e2e8f0"
                  }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl p-5 border-t-[2px] border-t-cyan-500/40 bg-white/[0.03] backdrop-blur-[20px] shadow-lg shadow-black/10 hover:bg-white/[0.04] transition-colors">
          <div className="mb-3 text-sm font-semibold text-slate-300 tracking-wide uppercase">
            Category Distribution
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBars} margin={{ left: -10, right: 8, bottom: 20 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{
                    background: "rgba(11,18,32,0.8)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 16,
                    color: "#e2e8f0"
                  }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
                <Bar dataKey="value" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-5 border-t-[2px] border-t-cyan-500/40 bg-white/[0.03] backdrop-blur-[20px] shadow-lg shadow-black/10">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
            Recent Queries (last 10)
          </div>
          <div className="text-xs text-slate-400">
            {loading ? "Loading…" : "Updated on refresh"}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/[0.05]">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#111827] text-xs uppercase tracking-widest text-[#64748b]">
              <tr>
                <th className="py-3 px-4 font-medium">Time</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Sentiment</th>
                <th className="py-3 px-4 font-medium">User</th>
                <th className="py-3 px-4 font-medium">Bot</th>
              </tr>
            </thead>
            <tbody className="text-[#e2e8f0] divide-y divide-white/[0.05]">
              {(data?.recent_queries || []).map((r) => (
                <tr key={r.id} className="even:bg-white/[0.01] hover:bg-cyan-500/[0.04] transition-colors">
                  <td className="py-3 px-4 text-xs text-slate-400">
                    {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center rounded-r-full rounded-l-md bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium tracking-wide text-indigo-300 border border-white/[0.05] border-l-[2px] border-l-indigo-500 backdrop-blur-sm">
                      {r.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <SentimentBadge sentiment={r.sentiment} />
                  </td>
                  <td className="py-3 px-4 max-w-[200px] truncate" title={r.user_message}>
                    {r.user_message}
                  </td>
                  <td className="py-3 px-4 max-w-[200px] truncate" title={r.bot_response}>
                    {r.bot_response}
                  </td>
                </tr>
              ))}

              {!loading && !(data?.recent_queries || []).length ? (
                <tr>
                  <td className="py-8 text-center text-slate-500" colSpan={5}>
                    No data yet. Send some queries in Chat first.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

