"use client";

import { useEffect, useState } from "react";
import type { DashboardClawShieldScore } from "@/lib/types";
import { fetchClawShieldScore } from "@/lib/mantle-client";
import { MOCK_AGENTS } from "@/lib/mock-data";
import { isContractsConfigured } from "@/lib/contracts";
import { VerifiedBadge } from "./VerifiedBadge";

export function ComposableQueryWidget({
  defaultAgentId,
}: {
  defaultAgentId?: string;
}) {
  const [agentId, setAgentId] = useState(
    defaultAgentId ?? MOCK_AGENTS[0].agentId
  );
  const [score, setScore] = useState<DashboardClawShieldScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState<number | null>(null);

  async function query() {
    setLoading(true);
    const result = await fetchClawShieldScore(agentId);
    setScore(result);
    setLastQuery(Date.now());
    setLoading(false);
  }

  useEffect(() => {
    query();
  }, [agentId]);

  const live = isContractsConfigured();

  return (
    <div className="rounded-xl border border-gradient bg-surface p-6 glow-cyan">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan">
            Composable Query Demo
          </h3>
          <p className="mt-1 text-xs text-text-muted">
            Any marketplace can call getClawShieldScore(agentId) on Mantle
          </p>
        </div>
        <span className="rounded bg-cyan/10 px-2 py-1 font-mono text-[10px] text-cyan">
          {live ? "ON-CHAIN" : "MOCK"}
        </span>
      </div>

      <div className="mb-4 rounded-lg bg-background p-3 font-mono text-xs text-emerald">
        <span className="text-text-dim">→ </span>
        reputationReader.getClawShieldScore(
        <span className="text-cyan">&quot;{agentId}&quot;</span>)
      </div>

      <div className="mb-4 flex gap-2">
        <select
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text outline-none focus:border-emerald"
        >
          {MOCK_AGENTS.map((a) => (
            <option key={a.agentId} value={a.agentId}>
              {a.name}
            </option>
          ))}
        </select>
        <button
          onClick={query}
          disabled={loading}
          className="rounded-lg bg-emerald px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "…" : "Query"}
        </button>
      </div>

      {score && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Risk Score" value={score.riskScore} warn={score.riskScore >= 45} />
          <Stat label="Violations" value={score.violationCount} warn={score.violationCount > 0} />
          <Stat label="Decisions" value={score.decisionCount} />
          <Stat label="ERC-8004" value={score.erc8004Score} />
          <div className="col-span-2 sm:col-span-1">
            <p className="text-[10px] uppercase tracking-wider text-text-dim">Verified Tier</p>
            <div className="mt-1">
              <VerifiedBadge tier={score.verifiedTier} size="md" />
            </div>
          </div>
        </div>
      )}

      {lastQuery && (
        <p className="mt-3 text-[10px] text-text-dim">
          Last queried {new Date(lastQuery).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  warn,
}: {
  label: string;
  value: number;
  warn?: boolean;
}) {
  return (
    <div className="rounded-lg bg-surface-elevated p-3">
      <p className="text-[10px] uppercase tracking-wider text-text-dim">{label}</p>
      <p
        className={`mt-1 font-mono text-xl font-bold ${
          warn ? "text-warn" : "text-text"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
