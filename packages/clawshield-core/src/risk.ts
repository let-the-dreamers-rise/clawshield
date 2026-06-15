import type { PolicyConfig, ReasonCode, RiskBreakdown, SimulationResult } from "./types.js";
import { DEFAULT_RISK_WEIGHTS, normalizeWeights } from "./weights.js";

export function scoreComponent(value: number, threshold: number, max: number): number {
  if (value <= threshold) return 0;
  return Math.min(100, ((value - threshold) / (max - threshold)) * 100);
}

export function computeRiskScore(
  simulation: SimulationResult,
  policy: PolicyConfig
): { riskScore: number; breakdown: RiskBreakdown; reasonCodes: ReasonCode[] } {
  const reasonCodes: ReasonCode[] = [];

  const priceImpactScore = scoreComponent(simulation.priceImpactPct, 1, 50);
  const slippageScore = scoreComponent(
    simulation.slippageBps,
    policy.maxSlippageBps / 2,
    policy.maxSlippageBps * 3
  );
  const liquidityScore = scoreComponent(
    policy.minLiquidityUsd - simulation.liquidityUsd,
    0,
    policy.minLiquidityUsd
  );
  const exposureScore = scoreComponent(
    simulation.exposurePct,
    policy.maxExposurePct / 2,
    100
  );
  const poolRiskScore = simulation.poolRiskScore;

  if (simulation.priceImpactPct > 5) reasonCodes.push("PRICE_IMPACT_HIGH");
  if (simulation.slippageBps > policy.maxSlippageBps) reasonCodes.push("SLIPPAGE_EXCEEDED");
  if (simulation.liquidityUsd < policy.minLiquidityUsd) reasonCodes.push("THIN_LIQUIDITY");
  if (simulation.exposurePct > policy.maxExposurePct) reasonCodes.push("OVEREXPOSED");
  if (simulation.poolRiskScore > 60) reasonCodes.push("POOL_RISK_HIGH");

  const weights = normalizeWeights(policy.riskWeights ?? DEFAULT_RISK_WEIGHTS);

  const riskScore = Math.round(
    priceImpactScore * weights.priceImpact +
      slippageScore * weights.slippage +
      liquidityScore * weights.liquidity +
      exposureScore * weights.exposure +
      poolRiskScore * weights.poolRisk
  );

  return {
    riskScore: Math.min(100, riskScore),
    breakdown: {
      priceImpactScore,
      slippageScore,
      liquidityScore,
      exposureScore,
      poolRiskScore,
      weights: {
        priceImpact: weights.priceImpact,
        slippage: weights.slippage,
        liquidity: weights.liquidity,
        exposure: weights.exposure,
        poolRisk: weights.poolRisk,
      },
    },
    reasonCodes,
  };
}

export function determineVerdict(
  riskScore: number,
  policyReasons: ReasonCode[],
  riskReasons: ReasonCode[],
  policy: PolicyConfig
): { verdict: "ALLOW" | "WARN" | "BLOCK"; reasonCodes: ReasonCode[] } {
  const critical: ReasonCode[] = [
    "TOKEN_BLOCKED",
    "TOKEN_NOT_ALLOWLISTED",
    "DAILY_CAP_EXCEEDED",
    "OVEREXPOSED",
  ];

  const allReasons = [...new Set([...policyReasons, ...riskReasons])];

  if (allReasons.some((r) => critical.includes(r))) {
    return { verdict: "BLOCK", reasonCodes: allReasons };
  }

  if (riskScore >= policy.blockRiskThreshold) {
    return { verdict: "BLOCK", reasonCodes: allReasons };
  }

  if (riskScore >= policy.warnRiskThreshold || allReasons.length > 0) {
    return { verdict: "WARN", reasonCodes: allReasons };
  }

  return { verdict: "ALLOW", reasonCodes: allReasons };
}
