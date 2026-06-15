/**
 * Example 4: Custom risk weights per agent profile
 */
import { evaluatePolicy } from "@clawshield/core";
import { DEFAULT_POLICY } from "@clawshield/core";

const conservativePolicy = {
  ...DEFAULT_POLICY,
  riskWeights: {
    priceImpact: 0.4,
    slippage: 0.3,
    liquidity: 0.2,
    exposure: 0.05,
    poolRisk: 0.05,
  },
  blockRiskThreshold: 60,
};

const aggressivePolicy = {
  ...DEFAULT_POLICY,
  riskWeights: {
    priceImpact: 0.2,
    slippage: 0.15,
    liquidity: 0.15,
    exposure: 0.35,
    poolRisk: 0.15,
  },
  maxExposurePct: 50,
};

for (const [name, policy] of [
  ["conservative", conservativePolicy],
  ["aggressive", aggressivePolicy],
] as const) {
  const result = evaluatePolicy(
    { type: "swap", tokenIn: "USDC", tokenOut: "MEME", amountUsd: 2000, slippageBps: 200 },
    policy,
    { portfolioUsd: 10_000, poolLiquidityUsd: 30_000 }
  );
  console.log(`${name}: ${result.verdict} (${result.riskScore}) — ${result.explanation?.severity}`);
}
