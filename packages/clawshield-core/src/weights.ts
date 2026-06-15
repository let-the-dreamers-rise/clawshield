import type { RiskBreakdown, RiskWeights } from "./types.js";
export const DEFAULT_RISK_WEIGHTS: RiskWeights = {
  priceImpact: 0.35,
  slippage: 0.25,
  liquidity: 0.25,
  exposure: 0.15,
  poolRisk: 0.1,
};

export function normalizeWeights(weights: Partial<RiskWeights>): RiskWeights {
  const merged: RiskWeights = { ...DEFAULT_RISK_WEIGHTS, ...weights };
  const sum =
    merged.priceImpact + merged.slippage + merged.liquidity + merged.exposure + merged.poolRisk;
  if (sum <= 0 || Math.abs(sum - 1) < 0.001) return merged;
  return {
    priceImpact: merged.priceImpact / sum,
    slippage: merged.slippage / sum,
    liquidity: merged.liquidity / sum,
    exposure: merged.exposure / sum,
    poolRisk: merged.poolRisk / sum,
  };
}

export function applyWeightsToBreakdown(breakdown: RiskBreakdown, weights: RiskWeights): number {
  return Math.round(
    breakdown.priceImpactScore * weights.priceImpact +
      breakdown.slippageScore * weights.slippage +
      breakdown.liquidityScore * weights.liquidity +
      breakdown.exposureScore * weights.exposure +
      breakdown.poolRiskScore * weights.poolRisk
  );
}
