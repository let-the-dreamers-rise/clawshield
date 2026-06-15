import type { Verdict } from "@clawshield/core";
import { cn } from "@/lib/utils";

const verdictStyles: Record<Verdict, string> = {
  ALLOW: "bg-allow/10 text-allow border-allow/30",
  WARN: "bg-warn/10 text-warn border-warn/30",
  BLOCK: "bg-block/10 text-block border-block/30",
};

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-0.5 font-mono text-xs font-semibold uppercase tracking-wider",
        verdictStyles[verdict]
      )}
    >
      {verdict}
    </span>
  );
}

export function RiskMeter({ score }: { score: number }) {
  const color =
    score >= 70 ? "bg-block" : score >= 45 ? "bg-warn" : "bg-emerald";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-elevated">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className="font-mono text-xs text-text-muted">{score}</span>
    </div>
  );
}
