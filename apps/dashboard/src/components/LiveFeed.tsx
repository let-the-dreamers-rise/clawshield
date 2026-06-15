"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { DecisionRecord } from "@/lib/types";
import { REASON_LABELS } from "@/lib/types";
import { fetchDecisionEvents } from "@/lib/mantle-client";
import { MOCK_AGENTS } from "@/lib/mock-data";
import { mantlescanTx } from "@/lib/contracts";
import { VerdictBadge, RiskMeter } from "./VerdictBadge";
import { timeAgo, truncateHash } from "@/lib/utils";

export function LiveFeed({
  onSelect,
  selectedId,
}: {
  onSelect?: (decision: DecisionRecord) => void;
  selectedId?: string;
}) {
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;

    async function load() {
      const data = await fetchDecisionEvents();
      if (!mounted) return;
      setDecisions(data);
      setLoading(false);
    }

    load();
    const interval = setInterval(async () => {
      const data = await fetchDecisionEvents();
      if (!mounted) return;
      setDecisions((prev) => {
        const prevIds = new Set(prev.map((d) => d.id));
        const fresh = data.filter((d) => !prevIds.has(d.id));
        if (fresh.length > 0) {
          setNewIds(new Set(fresh.map((d) => d.id)));
          setTimeout(() => setNewIds(new Set()), 2000);
        }
        return data;
      });
    }, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-elevated" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {decisions.map((decision) => {
          const agent = MOCK_AGENTS.find((a) => a.agentId === decision.agentId);
          const isNew = newIds.has(decision.id);
          const isSelected = selectedId === decision.id;

          return (
            <motion.button
              key={decision.id}
              layout
              initial={isNew ? { opacity: 0, y: -12, scale: 0.98 } : false}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={() => onSelect?.(decision)}
              className={`w-full rounded-xl border p-4 text-left transition-all ${
                isSelected
                  ? "border-emerald/50 bg-emerald/5 glow-emerald"
                  : "border-border bg-surface hover:border-border-glow hover:bg-surface-elevated"
              } ${isNew ? "animate-slide-in ring-1 ring-emerald/30" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <VerdictBadge verdict={decision.verdict} />
                    <span className="font-mono text-xs text-text-dim uppercase">
                      {decision.actionType}
                    </span>
                    {isNew && (
                      <span className="rounded bg-emerald/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald">
                        New
                      </span>
                    )}
                  </div>
                  <p className="mt-2 font-mono text-sm text-text-muted">
                    {truncateHash(decision.decisionHash, 10)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-dim">
                    <Link
                      href={`/agents/${decision.agentId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-cyan hover:underline"
                    >
                      {agent?.name ?? decision.agentId}
                    </Link>
                    <span>{timeAgo(decision.timestamp)}</span>
                    {decision.txHash && (
                      <a
                        href={mantlescanTx(decision.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-emerald hover:underline"
                      >
                        Mantlescan ↗
                      </a>
                    )}
                  </div>
                  {decision.reasonCodes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {decision.reasonCodes.map((code) => (
                        <span
                          key={code}
                          className="rounded bg-block/10 px-2 py-0.5 text-[10px] text-block"
                        >
                          {REASON_LABELS[code]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <RiskMeter score={decision.riskScore} />
              </div>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
