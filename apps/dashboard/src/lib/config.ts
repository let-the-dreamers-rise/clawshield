export const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://https://github.com/let-the-dreamers-rise/clawshield";
export const LANDING_URL = process.env.NEXT_PUBLIC_LANDING_URL ?? "http://localhost:3001";

export const CONTRACTS = {
  decisionRegistry: process.env.NEXT_PUBLIC_DECISION_REGISTRY ?? "",
  verified: process.env.NEXT_PUBLIC_VERIFIED ?? "",
  reputationReader: process.env.NEXT_PUBLIC_REPUTATION_READER ?? "",
  erc8004Identity: process.env.NEXT_PUBLIC_ERC8004_IDENTITY ?? "0x8004A818BFB912233c491871b3d84c89A494BD9e",
  erc8004Reputation: process.env.NEXT_PUBLIC_ERC8004_REPUTATION ?? "0x8004B663056A597Dffe9eCcC1965A193B7388713",
  rpcUrl: process.env.NEXT_PUBLIC_MANTLE_RPC_URL ?? "https://rpc.sepolia.mantle.xyz",
  explorer: "https://sepolia.mantlescan.xyz",
};

export const DEMO_AGENTS = [
  { id: "agent-1", name: "RiskHawk", profile: "risky", pnl: 12.4, drawdown: 8.2, violations: 3, avgRisk: 72, explainability: 85, verified: true, tier: 1 },
  { id: "agent-2", name: "SafeGuard", profile: "safe", pnl: 4.1, drawdown: 0.5, violations: 0, avgRisk: 18, explainability: 95, verified: true, tier: 1 },
  { id: "agent-3", name: "BalancedBot", profile: "balanced", pnl: 7.8, drawdown: 2.1, violations: 1, avgRisk: 35, explainability: 90, verified: false, tier: 0 },
];

export const DEMO_DECISIONS = [
  { agentId: "agent-1", decisionHash: "a3f8c2...", actionType: "swap", riskScore: 89, reasonCodes: "OVEREXPOSED,PRICE_IMPACT_HIGH,THIN_LIQUIDITY", verdict: "BLOCK", execTxRef: "", timestamp: Date.now() - 120000 },
  { agentId: "agent-1", decisionHash: "b7e1d4...", actionType: "swap", riskScore: 22, reasonCodes: "", verdict: "ALLOW", execTxRef: "5xK9mN2pQr...", timestamp: Date.now() - 60000 },
  { agentId: "agent-2", decisionHash: "c9f2a1...", actionType: "swap", riskScore: 15, reasonCodes: "", verdict: "ALLOW", execTxRef: "3yH8kL1nOp...", timestamp: Date.now() - 30000 },
  { agentId: "agent-3", decisionHash: "d4b8e7...", actionType: "lp_open", riskScore: 55, reasonCodes: "POOL_RISK_HIGH", verdict: "WARN", execTxRef: "7zM3pQ5rSt...", timestamp: Date.now() - 10000 },
];
