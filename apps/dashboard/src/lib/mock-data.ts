import type { RiskBreakdown } from "@clawshield/core";
import type {
  DashboardAgentStats,
  DecisionRecord,
  ReputationEvent,
  VerifiedTier,
} from "./types";

export type { DashboardAgentStats as AgentStats, DecisionRecord, ReputationEvent, VerifiedTier };
export {
  tierFromUint,
  verdictFromUint,
  actionTypeFromUint,
} from "./types";

export const MOCK_AGENTS: DashboardAgentStats[] = [
  {
    agentId: "agent-risky-001",
    name: "RiskyBot",
    profile: "risky",
    pnlUsd: 842,
    pnlPct: 8.4,
    maxDrawdownPct: 18.2,
    violations: 4,
    avgRiskScore: 58,
    explainabilityScore: 72,
    totalActions: 47,
    blocks: 12,
    verifiedTier: "verified",
    verifiedExpiry: Date.now() + 86400000 * 300,
    erc8004Score: 74,
    walletAddress: "0x7a3f8c2e1b9d4a6f0e5c8b2d1a9f3e7c4b8d2a1f",
  },
  {
    agentId: "agent-safe-002",
    name: "SafeHarbor",
    profile: "safe",
    pnlUsd: 1240,
    pnlPct: 12.4,
    maxDrawdownPct: 4.1,
    violations: 0,
    avgRiskScore: 22,
    explainabilityScore: 94,
    totalActions: 63,
    blocks: 2,
    verifiedTier: "gold",
    verifiedExpiry: Date.now() + 86400000 * 280,
    erc8004Score: 91,
    walletAddress: "0x2b9e4f1a8c7d3e6b0f4a9c2d8e1b7f5a3c6d9e2b4",
  },
  {
    agentId: "agent-balanced-003",
    name: "Equilibrium",
    profile: "balanced",
    pnlUsd: 967,
    pnlPct: 9.7,
    maxDrawdownPct: 9.8,
    violations: 1,
    avgRiskScore: 35,
    explainabilityScore: 86,
    totalActions: 55,
    blocks: 5,
    verifiedTier: "verified",
    verifiedExpiry: Date.now() + 86400000 * 310,
    erc8004Score: 82,
    walletAddress: "0x5c1d8e3f7a2b9c4d6e0f1a8b3c7d2e9f4a6b1c8d3",
  },
];

const now = Date.now();

const sampleBreakdown = (
  priceImpact: number,
  slippage: number,
  liquidity: number,
  exposure: number,
  poolRisk: number
): RiskBreakdown => ({
  priceImpactScore: priceImpact,
  slippageScore: slippage,
  liquidityScore: liquidity,
  exposureScore: exposure,
  poolRiskScore: poolRisk,
  weights: {
    priceImpact: 0.35,
    slippage: 0.25,
    liquidity: 0.25,
    exposure: 0.15,
    poolRisk: 0.1,
  },
});

export const MOCK_DECISIONS: DecisionRecord[] = [
  {
    id: "dec-001",
    agentId: "agent-risky-001",
    decisionHash: "0x8f3a2b1c9d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcd",
    actionType: "swap",
    riskScore: 78,
    reasonCodes: ["OVEREXPOSED", "THIN_LIQUIDITY"],
    verdict: "BLOCK",
    execTxRef: "",
    timestamp: now - 120000,
    txHash: "0xabc123def4567890123456789012345678901234567890123456789012345678",
    riskBreakdown: sampleBreakdown(42, 35, 68, 85, 55),
    byrealSkillsInvoked: ["pools.analyze", "swap.preview", "clawshield.guard"],
  },
  {
    id: "dec-002",
    agentId: "agent-risky-001",
    decisionHash: "0x1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f80",
    actionType: "swap",
    riskScore: 32,
    reasonCodes: [],
    verdict: "ALLOW",
    execTxRef: "5xKp9mN2vR8qW3tY7zA1bC4dE6fG8hJ0kL2mN4pQ6rS8tU",
    timestamp: now - 300000,
    txHash: "0xdef789abc0123456789012345678901234567890123456789012345678901234",
    riskBreakdown: sampleBreakdown(8, 12, 22, 18, 10),
    byrealSkillsInvoked: ["pools.analyze", "swap.preview", "clawshield.guard", "swap.execute"],
  },
  {
    id: "dec-003",
    agentId: "agent-safe-002",
    decisionHash: "0x9e8d7c6b5a4938271605f4e3d2c1b0a9f8e7d6c5b4a3928170615f4e3d2c1b0",
    actionType: "lp_open",
    riskScore: 18,
    reasonCodes: [],
    verdict: "ALLOW",
    execTxRef: "3mNp7qRs9tUv2wX4yZ6aB8cD0eF2gH4jK6mN8pQ0rS2tU4vW",
    timestamp: now - 480000,
    txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    riskBreakdown: sampleBreakdown(5, 8, 15, 12, 8),
    byrealSkillsInvoked: ["pools.analyze", "positions.open.preview", "clawshield.guard", "positions.open.execute"],
  },
  {
    id: "dec-004",
    agentId: "agent-balanced-003",
    decisionHash: "0xf0e1d2c3b4a5968778695a4b3c2d1e0f9e8d7c6b5a493827160504030201009",
    actionType: "swap",
    riskScore: 52,
    reasonCodes: ["SLIPPAGE_EXCEEDED"],
    verdict: "BLOCK",
    execTxRef: "",
    timestamp: now - 720000,
    txHash: "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
    riskBreakdown: sampleBreakdown(28, 72, 35, 40, 30),
    byrealSkillsInvoked: ["pools.analyze", "swap.preview", "clawshield.guard"],
  },
  {
    id: "dec-005",
    agentId: "agent-safe-002",
    decisionHash: "0x0a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef0a1b2c3d4e5f60",
    actionType: "swap",
    riskScore: 24,
    reasonCodes: [],
    verdict: "ALLOW",
    execTxRef: "7pQr9sTu1vWx3yZ5aB7cD9eF1gH3jK5mN7pQ9rS1tU3vW5xY",
    timestamp: now - 900000,
    txHash: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
    riskBreakdown: sampleBreakdown(10, 15, 20, 22, 12),
    byrealSkillsInvoked: ["pools.analyze", "swap.preview", "clawshield.guard", "swap.execute"],
  },
];

export const MOCK_REPUTATION: Record<string, ReputationEvent[]> = {
  "agent-risky-001": [
    {
      id: "rep-001",
      type: "badge_mint",
      timestamp: now - 86400000 * 35,
      description: "ClawShield Verified badge minted",
      txHash: "0xabc123def4567890123456789012345678901234567890123456789012345678",
    },
    {
      id: "rep-002",
      type: "violation",
      timestamp: now - 86400000 * 2,
      description: "CRITICAL: OVEREXPOSED on swap attempt",
      score: 78,
    },
    {
      id: "rep-003",
      type: "decision",
      timestamp: now - 120000,
      description: "Swap blocked — illiquid token pair",
      txHash: "0xabc123def4567890123456789012345678901234567890123456789012345678",
    },
    {
      id: "rep-004",
      type: "feedback",
      timestamp: now - 86400000 * 10,
      description: "ERC-8004 reputation feedback recorded",
      score: 74,
    },
  ],
  "agent-safe-002": [
    {
      id: "rep-005",
      type: "badge_mint",
      timestamp: now - 86400000 * 95,
      description: "Gold tier badge minted",
      txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    },
    {
      id: "rep-006",
      type: "decision",
      timestamp: now - 480000,
      description: "LP position opened — within policy",
      txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    },
    {
      id: "rep-007",
      type: "feedback",
      timestamp: now - 86400000 * 5,
      description: "ERC-8004 score updated",
      score: 91,
    },
  ],
  "agent-balanced-003": [
    {
      id: "rep-008",
      type: "badge_mint",
      timestamp: now - 86400000 * 40,
      description: "ClawShield Verified badge minted",
    },
    {
      id: "rep-009",
      type: "violation",
      timestamp: now - 86400000 * 7,
      description: "WARN: Slippage near policy cap",
      score: 48,
    },
    {
      id: "rep-010",
      type: "decision",
      timestamp: now - 720000,
      description: "Swap blocked — slippage exceeded",
    },
  ],
};

export function getAgentById(id: string): DashboardAgentStats | undefined {
  return MOCK_AGENTS.find((a) => a.agentId === id);
}
