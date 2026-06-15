export * from "./types.js";
export { checkPolicy } from "./policy.js";
export { computeRiskScore, determineVerdict } from "./risk.js";

import { checkPolicy } from "./policy.js";
import { computeRiskScore, determineVerdict } from "./risk.js";
import type {
  GuardResult,
  PolicyConfig,
  ProposedAction,
  SimulationResult,
} from "./types.js";
import { DEFAULT_POLICY, proposedToAgent } from "./types.js";
export interface EvaluateOptions {
  poolLiquidityUsd?: number;
  portfolioUsd?: number;
  dailySpendUsd?: number;
  priceImpactPct?: number;
  poolRiskScore?: number;
}

/** Browser-safe policy preview — no node:crypto dependency */
export function evaluatePolicy(
  action: ProposedAction,
  policy: PolicyConfig = DEFAULT_POLICY,
  options: EvaluateOptions = {}
): GuardResult {
  const portfolioUsd = options.portfolioUsd ?? 10000;
  const agentAction = proposedToAgent(action, "policy-preview", portfolioUsd);

  const exposurePct = (action.amountUsd / portfolioUsd) * 100;
  const priceImpact =
    options.priceImpactPct ??
    (action.tokenOut === "MEME" || action.amountUsd > 3000 ? 42 : 3);
  const poolRisk =
    options.poolRiskScore ?? (action.poolAddress?.includes("thin") ? 85 : 20);

  const simulation: SimulationResult = {
    priceImpactPct: priceImpact,
    slippageBps: action.slippageBps,
    liquidityUsd: options.poolLiquidityUsd ?? 100000,
    poolRiskScore: poolRisk,
    expectedOutputUsd: action.amountUsd * (1 - priceImpact / 100),
    exposurePct,
  };

  const policyReasons = checkPolicy(agentAction, policy, options.dailySpendUsd ?? 0);
  const { riskScore, breakdown, reasonCodes: riskReasons } = computeRiskScore(
    simulation,
    policy
  );
  const { verdict, reasonCodes } = determineVerdict(
    riskScore,
    policyReasons,
    riskReasons,
    policy
  );

  const timestamp = Date.now();

  return {
    action: agentAction,
    verdict,
    riskScore,
    reasonCodes,
    breakdown,
    simulation,
    decisionHash: `preview-${timestamp}`,
    timestamp,
    message:
      verdict === "BLOCK"
        ? `BLOCKED: ${reasonCodes.join(", ")}`
        : verdict === "WARN"
          ? `WARNING: risk ${riskScore}/100`
          : `ALLOWED: risk ${riskScore}/100`,
  };
}
