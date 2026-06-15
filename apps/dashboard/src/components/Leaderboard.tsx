"use client";

import { useState } from "react";
import Link from "next/link";
import type { AgentStats } from "@/lib/mock-data";
import { MOCK_AGENTS } from "@/lib/mock-data";
import { VerifiedBadge } from "./VerifiedBadge";
import { RiskMeter } from "./VerdictBadge";
import { formatUsd, formatPct, cn } from "@/lib/utils";

function sortAgents(agents: AgentStats[], key: SortKey): AgentStats[] {
  return [...agents].sort((a, b) => {
    switch (key) {
      case "pnl":
        return b.pnlUsd - a.pnlUsd;
      case "drawdown":
        return a.maxDrawdownPct - b.maxDrawdownPct;
      case "violations":
        return a.violations - b.violations;
      case "risk":
        return a.avgRiskScore - b.avgRiskScore;
      case "explainability":
        return b.explainabilityScore - a.explainabilityScore;
      default:
        return 0;
    }
  });
}

type SortKey = "pnl" | "drawdown" | "violations" | "risk" | "explainability";

const columns: { key: SortKey; label: string }[] = [
  { key: "pnl", label: "PnL" },
  { key: "drawdown", label: "Drawdown" },
  { key: "violations", label: "Violations" },
  { key: "risk", label: "Avg Risk" },
  { key: "explainability", label: "Explainability" },
];

export function Leaderboard() {
  const [sortKey, setSortKey] = useState<SortKey>("pnl");
  const agents = sortAgents(MOCK_AGENTS, sortKey);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-lg font-bold">Agent Arena</h2>
        <p className="text-sm text-text-muted">
          Ranked by profit-after-violations, safety, and explainability
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-text-dim">
              <th className="px-6 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Agent</th>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-medium">
                  <button
                    onClick={() => setSortKey(col.key)}
                    className={cn(
                      "transition-colors hover:text-emerald",
                      sortKey === col.key && "text-emerald"
                    )}
                  >
                    {col.label}
                    {sortKey === col.key && " ↓"}
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 font-medium">Verified</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent, rank) => (
              <tr
                key={agent.agentId}
                className="border-b border-border/50 transition-colors hover:bg-surface-elevated"
              >
                <td className="px-6 py-4 font-mono text-text-dim">{rank + 1}</td>
                <td className="px-4 py-4">
                  <Link
                    href={`/agents/${agent.agentId}`}
                    className="group flex items-center gap-3"
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                        agent.profile === "risky"
                          ? "bg-block/20 text-block"
                          : agent.profile === "safe"
                            ? "bg-emerald/20 text-emerald"
                            : "bg-cyan/20 text-cyan"
                      }`}
                    >
                      {agent.name[0]}
                    </div>
                    <div>
                      <span className="font-medium group-hover:text-emerald">
                        {agent.name}
                      </span>
                      <p className="text-xs capitalize text-text-dim">
                        {agent.profile} profile
                      </p>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={
                      agent.pnlUsd >= 0 ? "text-emerald" : "text-block"
                    }
                  >
                    {formatUsd(agent.pnlUsd)}
                  </span>
                  <span className="ml-1 text-xs text-text-dim">
                    ({formatPct(agent.pnlPct)})
                  </span>
                </td>
                <td className="px-4 py-4 font-mono text-warn">
                  {agent.maxDrawdownPct.toFixed(1)}%
                </td>
                <td className="px-4 py-4">
                  <span
                    className={
                      agent.violations === 0
                        ? "text-emerald"
                        : agent.violations >= 3
                          ? "text-block"
                          : "text-warn"
                    }
                  >
                    {agent.violations}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <RiskMeter score={agent.avgRiskScore} />
                </td>
                <td className="px-4 py-4 font-mono">{agent.explainabilityScore}</td>
                <td className="px-4 py-4">
                  <VerifiedBadge tier={agent.verifiedTier} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
