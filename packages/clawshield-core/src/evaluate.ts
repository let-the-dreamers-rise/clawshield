import { guard as runGuard } from "./guard.js";
import { checkPolicy } from "./policy.js";
import { computeRiskScore, determineVerdict } from "./risk.js";
import type {
  AgentAction,
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

export function evaluatePolicy(
  action: ProposedAction,
  policy: PolicyConfig = DEFAULT_POLICY,
  options: EvaluateOptions = {}
): GuardResult {
  const portfolioUsd = options.portfolioUsd ?? 10000;
  const agentAction = proposedToAgent(action, "agent-1", portfolioUsd);

  const exposurePct = (action.amountUsd / portfolioUsd) * 100;
  const priceImpact = options.priceImpactPct ?? (action.tokenOut === "MEME" || action.amountUsd > 3000 ? 42 : 3);
  const poolRisk = options.poolRiskScore ?? (action.poolAddress?.includes("thin") ? 85 : 20);

  const simulation: SimulationResult = {
    priceImpactPct: priceImpact,
    slippageBps: action.slippageBps,
    liquidityUsd: options.poolLiquidityUsd ?? 100000,
    poolRiskScore: poolRisk,
    expectedOutputUsd: action.amountUsd * (1 - priceImpact / 100),
    exposurePct,
  };

  return runGuard(agentAction, simulation, policy, options.dailySpendUsd ?? 0);
}

export { checkPolicy };
