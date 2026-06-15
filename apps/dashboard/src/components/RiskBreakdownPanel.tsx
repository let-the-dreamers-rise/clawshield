import type { RiskBreakdown } from "@clawshield/core";

interface RiskBreakdownPanelProps {
  breakdown: RiskBreakdown;
  totalScore?: number;
  title?: string;
}

function WeightBar({
  label,
  value,
  weight,
  color,
}: {
  label: string;
  value: number;
  weight: number;
  color: string;
}) {
  const weighted = Math.round(value * weight);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-muted">{label}</span>
        <span className="font-mono text-text-dim">
          {Math.round(value)} × {(weight * 100).toFixed(0)}% ={" "}
          <span className="text-text">{weighted}</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-elevated">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function RiskBreakdownPanel({
  breakdown,
  totalScore,
  title = "Risk Math Breakdown",
}: RiskBreakdownPanelProps) {
  const { weights } = breakdown;
  const total =
    totalScore ??
    Math.round(
      breakdown.priceImpactScore * weights.priceImpact +
        breakdown.slippageScore * weights.slippage +
        breakdown.liquidityScore * weights.liquidity +
        breakdown.exposureScore * weights.exposure +
        breakdown.poolRiskScore * weights.poolRisk
    );

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-dim">Total Score</span>
          <span
            className={`font-mono text-2xl font-bold ${
              total >= 70
                ? "text-block"
                : total >= 45
                  ? "text-warn"
                  : "text-emerald"
            }`}
          >
            {total}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <WeightBar
          label="Price Impact"
          value={breakdown.priceImpactScore}
          weight={weights.priceImpact}
          color="bg-cyan"
        />
        <WeightBar
          label="Slippage"
          value={breakdown.slippageScore}
          weight={weights.slippage}
          color="bg-emerald"
        />
        <WeightBar
          label="Liquidity Depth"
          value={breakdown.liquidityScore}
          weight={weights.liquidity}
          color="bg-amber-500"
        />
        <WeightBar
          label="Portfolio Exposure"
          value={breakdown.exposureScore}
          weight={weights.exposure}
          color="bg-purple-500"
        />
        <WeightBar
          label="Pool Risk"
          value={breakdown.poolRiskScore}
          weight={weights.poolRisk}
          color="bg-rose-500"
        />
      </div>

      <div className="mt-6 rounded-lg bg-surface-elevated p-3 font-mono text-xs text-text-dim">
        score = priceImpact×0.35 + slippage×0.25 + liquidity×0.25 + exposure×0.15 + poolRisk×0.10
      </div>
    </div>
  );
}
