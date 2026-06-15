"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageTransition } from "@/components/shared/PageTransition";
import { ClawShieldVerifiedBadge, RiskScoreGauge } from "@clawshield/ui";
import { MOCK_AGENTS } from "@/lib/mock-data";
import type { VerifiedTier } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function MarketplacePage() {
  const [tierFilter, setTierFilter] = useState<VerifiedTier | "all">("all");
  const [maxRisk, setMaxRisk] = useState(100);
  const [maxViolations, setMaxViolations] = useState(10);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return MOCK_AGENTS.filter((a) => {
      if (tierFilter !== "all" && a.verifiedTier !== tierFilter) return false;
      if (a.avgRiskScore > maxRisk) return false;
      if (a.violations > maxViolations) return false;
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tierFilter, maxRisk, maxViolations, search]);

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Agent <span className="text-gradient">Marketplace</span>
          </h1>
          <p className="mt-2 text-text-muted">
            Browse verified agents — filter by tier, risk score, and violation history
          </p>
        </div>

        <div className="grid gap-4 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-xs text-text-dim">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Agent name..."
              className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-text-dim">Tier</label>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as VerifiedTier | "all")}
              className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm"
            >
              <option value="all">All tiers</option>
              <option value="verified">Verified</option>
              <option value="gold">Gold</option>
              <option value="enterprise">Enterprise</option>
              <option value="none">Unverified</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-text-dim">Max risk score: {maxRisk}</label>
            <input
              type="range"
              min={0}
              max={100}
              value={maxRisk}
              onChange={(e) => setMaxRisk(Number(e.target.value))}
              className="mt-2 w-full accent-emerald"
            />
          </div>
          <div>
            <label className="text-xs text-text-dim">Max violations: {maxViolations}</label>
            <input
              type="range"
              min={0}
              max={10}
              value={maxViolations}
              onChange={(e) => setMaxViolations(Number(e.target.value))}
              className="mt-2 w-full accent-emerald"
            />
          </div>
        </div>

        <p className="text-sm text-text-dim">{filtered.length} agents match your filters</p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((agent) => (
            <Link
              key={agent.agentId}
              href={`/agents/${agent.agentId}`}
              className="group rounded-xl border border-border bg-surface p-6 transition-all hover:border-emerald/30 hover:bg-surface-elevated"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-text group-hover:text-emerald">{agent.name}</h3>
                  <p className="text-xs text-text-dim capitalize">{agent.profile} profile</p>
                </div>
                <ClawShieldVerifiedBadge tier={agent.verifiedTier} size="sm" />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="relative">
                  <RiskScoreGauge score={agent.avgRiskScore} size={80} />
                </div>
                <div className="space-y-1 text-right text-sm">
                  <p className={cn(agent.pnlPct >= 0 ? "text-emerald" : "text-block")}>
                    {agent.pnlPct >= 0 ? "+" : ""}{agent.pnlPct}% PnL
                  </p>
                  <p className="text-text-dim">{agent.violations} violations</p>
                  <p className="text-text-dim">{agent.totalActions} actions</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
