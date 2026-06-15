"use client";

import { useState } from "react";
import Link from "next/link";
import { PageTransition } from "@/components/shared/PageTransition";
import { ClawShieldVerifiedBadge, RiskScoreGauge } from "@clawshield/ui";
import { MOCK_AGENTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const METRICS = [
  { key: "pnlPct" as const, label: "PnL %", format: (v: number) => `${v >= 0 ? "+" : ""}${v}%`, higherBetter: true },
  { key: "maxDrawdownPct" as const, label: "Max Drawdown", format: (v: number) => `${v}%`, higherBetter: false },
  { key: "violations" as const, label: "Violations", format: (v: number) => String(v), higherBetter: false },
  { key: "avgRiskScore" as const, label: "Avg Risk", format: (v: number) => `${v}/100`, higherBetter: false },
  { key: "explainabilityScore" as const, label: "Explainability", format: (v: number) => `${v}%`, higherBetter: true },
  { key: "totalActions" as const, label: "Total Actions", format: (v: number) => String(v), higherBetter: true },
  { key: "blocks" as const, label: "Blocks", format: (v: number) => String(v), higherBetter: false },
  { key: "erc8004Score" as const, label: "ERC-8004 Score", format: (v: number) => String(v), higherBetter: true },
];

function bestValue(a: number, b: number, higherBetter: boolean): "a" | "b" | "tie" {
  if (a === b) return "tie";
  if (higherBetter) return a > b ? "a" : "b";
  return a < b ? "a" : "b";
}

export default function ComparePage() {
  const [leftId, setLeftId] = useState(MOCK_AGENTS[0].agentId);
  const [rightId, setRightId] = useState(MOCK_AGENTS[1].agentId);

  const left = MOCK_AGENTS.find((a) => a.agentId === leftId)!;
  const right = MOCK_AGENTS.find((a) => a.agentId === rightId)!;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Compare <span className="text-gradient">Agents</span>
          </h1>
          <p className="mt-2 text-text-muted">
            Side-by-side comparison of agent performance and safety metrics
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <select
            value={leftId}
            onChange={(e) => setLeftId(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          >
            {MOCK_AGENTS.map((a) => (
              <option key={a.agentId} value={a.agentId}>{a.name}</option>
            ))}
          </select>
          <select
            value={rightId}
            onChange={(e) => setRightId(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          >
            {MOCK_AGENTS.map((a) => (
              <option key={a.agentId} value={a.agentId}>{a.name}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {[left, right].map((agent) => (
            <div key={agent.agentId} className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Link href={`/agents/${agent.agentId}`} className="text-xl font-bold hover:text-emerald">
                    {agent.name}
                  </Link>
                  <p className="text-sm text-text-dim capitalize">{agent.profile} profile</p>
                </div>
                <ClawShieldVerifiedBadge tier={agent.verifiedTier} />
              </div>
              <div className="mt-4 flex justify-center">
                <RiskScoreGauge score={agent.avgRiskScore} size={100} />
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-elevated">
              <tr>
                <th className="px-4 py-3 text-left text-text-dim">Metric</th>
                <th className="px-4 py-3 text-center">{left.name}</th>
                <th className="px-4 py-3 text-center">{right.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {METRICS.map((m) => {
                const lv = left[m.key];
                const rv = right[m.key];
                const winner = bestValue(lv, rv, m.higherBetter);
                return (
                  <tr key={m.key}>
                    <td className="px-4 py-3 text-text-muted">{m.label}</td>
                    <td className={cn("px-4 py-3 text-center font-mono", winner === "a" && "text-emerald font-semibold")}>
                      {m.format(lv)}
                    </td>
                    <td className={cn("px-4 py-3 text-center font-mono", winner === "b" && "text-emerald font-semibold")}>
                      {m.format(rv)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  );
}
