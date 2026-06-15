"use client";

import type { DecisionRecord } from "@/lib/types";
import { MANTLESCAN_URL } from "@/lib/contracts";

const SKILL_LABELS: Record<string, string> = {
  "pools.analyze": "Byreal pools analyze",
  "swap.preview": "Byreal swap preview",
  "swap.execute": "Byreal swap execute",
  "positions.open.preview": "Byreal LP open preview",
  "positions.open.execute": "Byreal LP open execute",
  "clawshield.guard": "ClawShield guard",
  "perps.open.preview": "Byreal perps preview (stub)",
};

export function ByrealIntegrationPanel({
  decision,
}: {
  decision: DecisionRecord | null;
}) {
  if (!decision) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-text-dim">
        Select a decision to view Byreal skill chain
      </div>
    );
  }

  const skills = decision.byrealSkillsInvoked ?? inferSkills(decision);

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Byreal Integration
        </h3>
        <span className="rounded-full bg-cyan/10 px-2 py-0.5 text-[10px] font-medium text-cyan">
          {skills.length} skills chained
        </span>
      </div>

      <p className="mt-2 text-xs text-text-dim">
        OpenClaw skills wrapping <code className="text-cyan">@byreal-io/byreal-cli</code> for this
        decision
      </p>

      <ol className="mt-4 space-y-2">
        {skills.map((skill, i) => (
          <li
            key={`${skill}-${i}`}
            className="flex items-center gap-3 rounded-lg border border-border bg-surface-elevated px-3 py-2"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald/10 text-xs font-bold text-emerald">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs text-text">{skill}</p>
              <p className="text-[10px] text-text-dim">{SKILL_LABELS[skill] ?? skill}</p>
            </div>
            {i < skills.length - 1 && (
              <span className="text-text-dim" aria-hidden>
                →
              </span>
            )}
          </li>
        ))}
      </ol>

      {decision.onChain && decision.txHash && (
        <a
          href={`${MANTLESCAN_URL}/tx/${decision.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-xs text-emerald hover:underline"
        >
          Verify receipt on Mantlescan ↗
        </a>
      )}
    </div>
  );
}

function inferSkills(decision: DecisionRecord): string[] {
  const base = ["pools.analyze", "clawshield.guard"];
  if (decision.actionType === "swap") {
    return [...base.slice(0, 1), "swap.preview", "clawshield.guard", ...(decision.verdict === "ALLOW" ? ["swap.execute"] : [])];
  }
  if (decision.actionType === "lp_open") {
    return ["pools.analyze", "positions.open.preview", "clawshield.guard", ...(decision.verdict === "ALLOW" ? ["positions.open.execute"] : [])];
  }
  return base;
}
