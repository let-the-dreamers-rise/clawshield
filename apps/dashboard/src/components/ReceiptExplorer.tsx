"use client";

import { useMemo, useState } from "react";
import type { DecisionRecord } from "@/lib/types";
import { REASON_LABELS } from "@/lib/types";
import { MOCK_DECISIONS } from "@/lib/mock-data";
import { mantlescanTx } from "@/lib/contracts";
import { VerdictBadge } from "./VerdictBadge";
import { RiskBreakdownPanel } from "./RiskBreakdownPanel";
import { ByrealIntegrationPanel } from "./ByrealIntegrationPanel";
import { truncateHash } from "@/lib/utils";

export function ReceiptExplorer() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<DecisionRecord | null>(null);

  const results = useMemo(() => {
    if (!query.trim()) return MOCK_DECISIONS;
    const q = query.toLowerCase();
    return MOCK_DECISIONS.filter(
      (d) =>
        d.decisionHash.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.agentId.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <div className="rounded-xl border border-border bg-surface p-4">
          <label className="mb-2 block text-xs uppercase tracking-wider text-text-dim">
            Search by decision hash
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="0x8f3a2b1c… or agent ID"
            className="w-full rounded-lg border border-border bg-surface-elevated px-4 py-3 font-mono text-sm outline-none focus:border-emerald"
          />
        </div>

        <div className="mt-4 space-y-2">
          {results.map((decision) => (
            <button
              key={decision.id}
              onClick={() => setSelected(decision)}
              className={`w-full rounded-lg border p-3 text-left transition-all ${
                selected?.id === decision.id
                  ? "border-emerald/50 bg-emerald/5"
                  : "border-border bg-surface hover:bg-surface-elevated"
              }`}
            >
              <div className="flex items-center justify-between">
                <VerdictBadge verdict={decision.verdict} />
                <span className="font-mono text-xs text-text-dim">
                  risk {decision.riskScore}
                </span>
              </div>
              <p className="mt-2 truncate font-mono text-xs text-text-muted">
                {decision.decisionHash}
              </p>
            </button>
          ))}
          {results.length === 0 && (
            <p className="py-8 text-center text-sm text-text-dim">
              No receipts match your search
            </p>
          )}
        </div>
      </div>

      <div className="lg:col-span-3">
        {selected ? (
          <ReceiptDetail decision={selected} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border text-text-dim">
            Select a receipt to view full payload
          </div>
        )}
      </div>
    </div>
  );
}

function ReceiptDetail({ decision }: { decision: DecisionRecord }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold">Decision Receipt</h3>
            <p className="mt-1 font-mono text-xs text-text-muted break-all">
              {decision.decisionHash}
            </p>
          </div>
          <VerdictBadge verdict={decision.verdict} />
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <Detail label="Agent" value={decision.agentId} mono />
          <Detail label="Action" value={decision.actionType} />
          <Detail label="Risk Score" value={String(decision.riskScore)} />
          <Detail
            label="Timestamp"
            value={new Date(decision.timestamp).toLocaleString()}
          />
          {decision.execTxRef && (
            <Detail label="Exec Tx Ref" value={truncateHash(decision.execTxRef, 12)} mono />
          )}
        </dl>

        {decision.reasonCodes.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs uppercase text-text-dim">Reason Codes</p>
            <div className="flex flex-wrap gap-2">
              {decision.reasonCodes.map((code) => (
                <span
                  key={code}
                  className="rounded bg-block/10 px-2 py-1 text-xs text-block"
                >
                  {code}: {REASON_LABELS[code]}
                </span>
              ))}
            </div>
          </div>
        )}

        {decision.onChain && decision.txHash && (
          <a
            href={mantlescanTx(decision.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald/10 px-4 py-2 text-sm font-medium text-emerald hover:bg-emerald/20"
          >
            View on Mantlescan ↗
          </a>
        )}
      </div>

      {decision.riskBreakdown && (
        <RiskBreakdownPanel
          breakdown={decision.riskBreakdown}
          totalScore={decision.riskScore}
        />
      )}

      <ByrealIntegrationPanel decision={decision} />

      <pre className="overflow-x-auto rounded-xl border border-border bg-background p-4 font-mono text-xs text-text-muted">
        {JSON.stringify(decision, null, 2)}
      </pre>
    </div>
  );
}

function Detail({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-text-dim">{label}</dt>
      <dd className={`mt-0.5 ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
