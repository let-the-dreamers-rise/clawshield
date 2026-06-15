"use client";

import { PageTransition } from "@/components/shared/PageTransition";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const decisionsOverTime = [
  { date: "Jun 1", allow: 12, warn: 3, block: 5 },
  { date: "Jun 3", allow: 18, warn: 2, block: 4 },
  { date: "Jun 5", allow: 15, warn: 5, block: 8 },
  { date: "Jun 7", allow: 22, warn: 1, block: 3 },
  { date: "Jun 9", allow: 19, warn: 4, block: 6 },
  { date: "Jun 11", allow: 25, warn: 2, block: 2 },
  { date: "Jun 13", allow: 28, warn: 3, block: 4 },
  { date: "Jun 15", allow: 31, warn: 1, block: 3 },
];

const riskDistribution = [
  { range: "0-20", count: 45, color: "#10b981" },
  { range: "21-40", count: 32, color: "#06b6d4" },
  { range: "41-60", count: 18, color: "#f59e0b" },
  { range: "61-80", count: 12, color: "#f97316" },
  { range: "81-100", count: 5, color: "#ef4444" },
];

const violationTrends = [
  { week: "W1", slippage: 2, overexposed: 1, liquidity: 0, other: 1 },
  { week: "W2", slippage: 1, overexposed: 3, liquidity: 2, other: 0 },
  { week: "W3", slippage: 0, overexposed: 1, liquidity: 1, other: 2 },
  { week: "W4", slippage: 1, overexposed: 0, liquidity: 0, other: 1 },
  { week: "W5", slippage: 0, overexposed: 1, liquidity: 1, other: 0 },
  { week: "W6", slippage: 0, overexposed: 0, liquidity: 0, other: 1 },
];

const chartTooltipStyle = {
  backgroundColor: "#12121a",
  border: "1px solid #1e1e2e",
  borderRadius: "8px",
  fontSize: "12px",
};

export default function AnalyticsPage() {
  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gradient">Analytics</span>
          </h1>
          <p className="mt-2 text-text-muted">
            Decision trends, risk distribution, and violation patterns
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Decisions", value: "247" },
            { label: "Block Rate", value: "12.1%" },
            { label: "Avg Risk Score", value: "34.2" },
            { label: "Active Agents", value: "3" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs text-text-dim">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-text">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold">Decisions Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={decisionsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Area type="monotone" dataKey="allow" stackId="1" stroke="#10b981" fill="#10b98130" />
              <Area type="monotone" dataKey="warn" stackId="1" stroke="#f59e0b" fill="#f59e0b30" />
              <Area type="monotone" dataKey="block" stackId="1" stroke="#ef4444" fill="#ef444430" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 flex gap-4 text-xs text-text-dim">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald" /> Allow</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warn" /> Warn</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-block" /> Block</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-lg font-semibold">Risk Score Distribution</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={riskDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis dataKey="range" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {riskDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-lg font-semibold">Violation Trends</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={violationTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Line type="monotone" dataKey="slippage" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="overexposed" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="liquidity" stroke="#06b6d4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="other" stroke="#94a3b8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
