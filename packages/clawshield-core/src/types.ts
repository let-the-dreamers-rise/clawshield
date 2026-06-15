export type ActionType = "swap" | "lp_open" | "lp_close" | "transfer" | "payment";

export type ViolationSeverity = "LOW" | "MEDIUM" | "CRITICAL";

export type Verdict = "ALLOW" | "WARN" | "BLOCK";

export type ReasonCode =
  | "SLIPPAGE_EXCEEDED"
  | "THIN_LIQUIDITY"
  | "OVEREXPOSED"
  | "TOKEN_NOT_ALLOWLISTED"
  | "TOKEN_BLOCKED"
  | "DAILY_CAP_EXCEEDED"
  | "POOL_RISK_HIGH"
  | "PRICE_IMPACT_HIGH"
  | "POLICY_VIOLATION";

export interface RiskWeights {
  priceImpact: number;
  slippage: number;
  liquidity: number;
  exposure: number;
  poolRisk: number;
}

export interface PolicyConfig {
  allowlist: string[];
  blocklist: string[];
  maxSlippageBps: number;
  maxExposurePct: number;
  maxDailySpendUsd: number;
  minLiquidityUsd: number;
  warnRiskThreshold: number;
  blockRiskThreshold: number;
  /** Per-agent risk weight overrides (defaults to standard blend) */
  riskWeights?: Partial<RiskWeights>;
}

export const DEFAULT_POLICY: PolicyConfig = {
  allowlist: ["USDC", "SOL", "USDT", "mSOL", "JUP"],
  blocklist: ["SCAM", "RUG"],
  maxSlippageBps: 100,
  maxExposurePct: 25,
  maxDailySpendUsd: 500,
  minLiquidityUsd: 50000,
  warnRiskThreshold: 50,
  blockRiskThreshold: 70,
};

export interface AgentAction {
  type: ActionType;
  agentId: string;
  inputToken: string;
  outputToken: string;
  amountUsd: number;
  poolId?: string;
  walletBalanceUsd?: number;
}

export interface SimulationResult {
  priceImpactPct: number;
  slippageBps: number;
  liquidityUsd: number;
  poolRiskScore: number;
  expectedOutputUsd: number;
  exposurePct: number;
}

export interface RiskBreakdown {
  priceImpactScore: number;
  slippageScore: number;
  liquidityScore: number;
  exposureScore: number;
  poolRiskScore: number;
  weights: {
    priceImpact: number;
    slippage: number;
    liquidity: number;
    exposure: number;
    poolRisk: number;
  };
}

export interface GuardResult {
  action: AgentAction;
  verdict: Verdict;
  riskScore: number;
  reasonCodes: ReasonCode[];
  breakdown: RiskBreakdown;
  simulation: SimulationResult;
  decisionHash: string;
  timestamp: number;
  message: string;
  /** Human-readable explainability output */
  explanation?: {
    summary: string;
    severity: ViolationSeverity;
    replanHints: string[];
  };
}

export interface AgentStats {
  totalActions: number;
  blocks: number;
  allows: number;
  warnings: number;
  avgRiskScore: number;
  criticalViolations: number;
  profitUsd: number;
  drawdownPct: number;
  explainabilityScore: number;
}

export interface VerifiedStatus {
  isVerified: boolean;
  tier: "none" | "verified" | "gold" | "enterprise";
  expiry: number;
}

export interface ClawShieldScore {
  riskScore: number;
  violationCount: number;
  verifiedTier: "none" | "verified" | "gold" | "enterprise";
  decisionCount: number;
  erc8004Score: number;
}

/** SDK/adapter action shape */
export interface ProposedAction {
  type: ActionType;
  tokenIn: string;
  tokenOut: string;
  amountUsd: number;
  slippageBps: number;
  poolAddress?: string;
}

export function proposedToAgent(action: ProposedAction, agentId = "agent-1", portfolioUsd = 10000): AgentAction {
  return {
    type: action.type,
    agentId,
    inputToken: action.tokenIn,
    outputToken: action.tokenOut,
    amountUsd: action.amountUsd,
    poolId: action.poolAddress,
    walletBalanceUsd: portfolioUsd,
  };
}
