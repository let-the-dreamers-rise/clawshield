import type {
  ActionType,
  ReasonCode,
  RiskBreakdown,
  Verdict,
} from "@clawshield/core";

export type VerifiedTier = "none" | "verified" | "gold" | "enterprise";

export interface DecisionRecord {
  id: string;
  agentId: string;
  decisionHash: string;
  actionType: ActionType;
  riskScore: number;
  reasonCodes: ReasonCode[];
  verdict: Verdict;
  execTxRef: string;
  timestamp: number;
  blockNumber?: bigint;
  txHash?: string;
  riskBreakdown?: RiskBreakdown;
  /** Byreal CLI skills invoked for this decision (skill chain) */
  byrealSkillsInvoked?: string[];
}

export interface DashboardAgentStats {
  agentId: string;
  name: string;
  profile: "risky" | "safe" | "balanced";
  pnlUsd: number;
  pnlPct: number;
  maxDrawdownPct: number;
  violations: number;
  avgRiskScore: number;
  explainabilityScore: number;
  totalActions: number;
  blocks: number;
  verifiedTier: VerifiedTier;
  verifiedExpiry?: number;
  erc8004Score: number;
  walletAddress: string;
}

export interface DashboardClawShieldScore {
  riskScore: number;
  violationCount: number;
  verifiedTier: VerifiedTier;
  decisionCount: number;
  erc8004Score: number;
}

export interface ReputationEvent {
  id: string;
  type: "decision" | "feedback" | "badge_mint" | "badge_renewal" | "violation";
  timestamp: number;
  description: string;
  txHash?: string;
  score?: number;
}

export const REASON_LABELS: Record<ReasonCode, string> = {
  SLIPPAGE_EXCEEDED: "Slippage exceeds policy cap",
  THIN_LIQUIDITY: "Pool liquidity below minimum",
  OVEREXPOSED: "Position size exceeds exposure limit",
  TOKEN_NOT_ALLOWLISTED: "Token not on allowlist",
  TOKEN_BLOCKED: "Token is blocklisted",
  DAILY_CAP_EXCEEDED: "Daily spend cap exceeded",
  POOL_RISK_HIGH: "Pool risk score too high",
  PRICE_IMPACT_HIGH: "Price impact too high",
  POLICY_VIOLATION: "General policy violation",
};

export const VERIFIED_TIER_LABELS: Record<VerifiedTier, string> = {
  none: "Unverified",
  verified: "ClawShield Verified",
  gold: "Gold",
  enterprise: "Enterprise",
};

export function tierFromUint(tier: number): VerifiedTier {
  switch (tier) {
    case 1:
      return "verified";
    case 2:
      return "gold";
    case 3:
      return "enterprise";
    default:
      return "none";
  }
}

export function verdictFromUint(v: number): Verdict {
  if (v === 0) return "ALLOW";
  if (v === 1) return "WARN";
  return "BLOCK";
}

export function actionTypeFromUint(t: number): ActionType {
  const types: ActionType[] = ["swap", "lp_open", "lp_close", "transfer"];
  return types[t] ?? "swap";
}

const REASON_CODE_BY_UINT: ReasonCode[] = [
  "SLIPPAGE_EXCEEDED",
  "THIN_LIQUIDITY",
  "OVEREXPOSED",
  "TOKEN_NOT_ALLOWLISTED",
  "DAILY_CAP_EXCEEDED",
  "POOL_RISK_HIGH",
  "PRICE_IMPACT_HIGH",
  "POLICY_VIOLATION",
];

export function reasonCodesFromUint(codes: number[] | string[] | undefined): ReasonCode[] {
  if (!codes?.length) return [];
  return codes
    .map((c) => {
      if (typeof c === "string") return c as ReasonCode;
      return REASON_CODE_BY_UINT[c];
    })
    .filter((c): c is ReasonCode => Boolean(c));
}
