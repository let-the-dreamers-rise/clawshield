import Link from "next/link";
import type { AgentStats } from "@/lib/mock-data";
import { MOCK_REPUTATION } from "@/lib/mock-data";
import { mantlescanAddress, mantlescanTx } from "@/lib/contracts";
import { VerifiedBadge } from "./VerifiedBadge";
import { ComposableQueryWidget } from "./ComposableQueryWidget";
import { RiskMeter } from "./VerdictBadge";
import { formatUsd, formatPct, timeAgo } from "@/lib/utils";

const eventIcons: Record<string, string> = {
  decision: "📋",
  feedback: "⭐",
  badge_mint: "🛡️",
  badge_renewal: "🔄",
  violation: "⚠️",
};

export function AgentProfile({ agent }: { agent: AgentStats }) {
  const timeline = MOCK_REPUTATION[agent.agentId] ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold ${
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
            <h1 className="text-2xl font-bold">{agent.name}</h1>
            <p className="text-sm capitalize text-text-muted">
              {agent.profile} agent · {agent.agentId}
            </p>
            <div className="mt-2">
              <VerifiedBadge tier={agent.verifiedTier} size="lg" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <a
            href={mantlescanAddress(agent.walletAddress)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:border-emerald hover:text-emerald"
          >
            Mantlescan ↗
          </a>
          <Link
            href="/arena"
            className="rounded-lg bg-emerald px-4 py-2 text-sm font-semibold text-background"
          >
            Arena Rank
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="PnL" value={formatUsd(agent.pnlUsd)} sub={formatPct(agent.pnlPct)} positive={agent.pnlUsd >= 0} />
        <StatCard label="Max Drawdown" value={`${agent.maxDrawdownPct}%`} warn />
        <StatCard label="Violations" value={String(agent.violations)} warn={agent.violations > 0} />
        <StatCard label="ERC-8004 Score" value={String(agent.erc8004Score)} />
        <StatCard label="Total Actions" value={String(agent.totalActions)} />
        <StatCard label="Blocks" value={String(agent.blocks)} />
        <StatCard label="Avg Risk" value={<RiskMeter score={agent.avgRiskScore} />} />
        <StatCard label="Explainability" value={String(agent.explainabilityScore)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Reputation Timeline
          </h2>
          <div className="relative space-y-0">
            {timeline.map((event, i) => (
              <div key={event.id} className="relative flex gap-4 pb-6">
                {i < timeline.length - 1 && (
                  <div className="absolute left-[15px] top-8 h-full w-px bg-border" />
                )}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-sm">
                  {eventIcons[event.type] ?? "•"}
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-sm">{event.description}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-text-dim">
                    <span>{timeAgo(event.timestamp)}</span>
                    {event.score !== undefined && (
                      <span className="font-mono">score {event.score}</span>
                    )}
                    {event.txHash && (
                      <a
                        href={mantlescanTx(event.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald hover:underline"
                      >
                        tx ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ComposableQueryWidget defaultAgentId={agent.agentId} />
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
          Violation History
        </h2>
        {timeline.filter((e) => e.type === "violation").length === 0 ? (
          <p className="text-sm text-emerald">No critical violations recorded</p>
        ) : (
          <ul className="space-y-3">
            {timeline
              .filter((e) => e.type === "violation")
              .map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between rounded-lg bg-block/5 px-4 py-3"
                >
                  <span className="text-sm text-block">{event.description}</span>
                  <span className="text-xs text-text-dim">{timeAgo(event.timestamp)}</span>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  positive,
  warn,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  positive?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-wider text-text-dim">{label}</p>
      <p
        className={`mt-1 text-xl font-bold ${
          warn ? "text-warn" : positive === true ? "text-emerald" : positive === false ? "text-block" : ""
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-text-dim">{sub}</p>}
    </div>
  );
}
