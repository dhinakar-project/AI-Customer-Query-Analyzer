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

const SENTIMENT_COLORS = {
  POSITIVE: "#10b981",
  NEGATIVE: "#f43f5e",
  NEUTRAL: "#94a3b8"
};

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl bg-panel/60 p-4 ring-1 ring-slate-800">
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-100">{value}</div>
      {sub ? <div className="mt-1 text-sm text-slate-300">{sub}</div> : null}
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
          <h2 className="text-lg font-semibold">Analytics Dashboard</h2>
          <p className="text-sm text-slate-300">
            Live stats from your local SQLite query logs.
          </p>
        </div>
        <button
          onClick={load}
          className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 ring-1 ring-slate-700 hover:bg-slate-700 disabled:opacity-50"
          disabled={loading}
        >
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
          value={loading ? "…" : data?.total_queries ?? 0}
        />
        <StatCard label="Most Common Category" value={loading ? "…" : mostCommonCategory} />
        <StatCard label="Avg Sentiment" value={loading ? "…" : avgSentiment} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-panel/60 p-4 ring-1 ring-slate-800">
          <div className="mb-3 text-sm font-semibold text-slate-200">
            Sentiment Distribution
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentPie}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {sentimentPie.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={SENTIMENT_COLORS[entry.name] || "#64748b"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#0b1220",
                    border: "1px solid #334155",
                    borderRadius: 12
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-panel/60 p-4 ring-1 ring-slate-800">
          <div className="mb-3 text-sm font-semibold text-slate-200">
            Category Distribution
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBars} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2a44" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#cbd5e1", fontSize: 11 }}
                  interval={0}
                  angle={-20}
                  height={60}
                />
                <YAxis tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#0b1220",
                    border: "1px solid #334155",
                    borderRadius: 12
                  }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-panel/60 p-4 ring-1 ring-slate-800">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-200">
            Recent Queries (last 10)
          </div>
          <div className="text-xs text-slate-400">
            {loading ? "Loading…" : "Updated on refresh"}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Sentiment</th>
                <th className="py-2 pr-4">User</th>
                <th className="py-2 pr-4">Bot</th>
              </tr>
            </thead>
            <tbody className="text-slate-200">
              {(data?.recent_queries || []).map((r) => (
                <tr key={r.id} className="border-t border-slate-800/60">
                  <td className="py-3 pr-4 text-xs text-slate-400">
                    {new Date(r.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 pr-4">{r.category}</td>
                  <td className="py-3 pr-4">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium ring-1"
                      style={{
                        background: `${SENTIMENT_COLORS[r.sentiment?.label] || "#64748b"}22`,
                        color: `${SENTIMENT_COLORS[r.sentiment?.label] || "#cbd5e1"}`,
                        borderColor: `${SENTIMENT_COLORS[r.sentiment?.label] || "#64748b"}55`
                      }}
                    >
                      {r.sentiment?.label} ({Math.round((r.sentiment?.score ?? 0) * 100)}%)
                    </span>
                  </td>
                  <td className="py-3 pr-4 max-w-[360px] truncate" title={r.user_message}>
                    {r.user_message}
                  </td>
                  <td className="py-3 pr-4 max-w-[360px] truncate" title={r.bot_response}>
                    {r.bot_response}
                  </td>
                </tr>
              ))}

              {!loading && !(data?.recent_queries || []).length ? (
                <tr>
                  <td className="py-6 text-slate-400" colSpan={5}>
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

