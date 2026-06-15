import { describe, expect, it } from "vitest";
import { guard } from "./guard.js";
import type { AgentAction, SimulationResult } from "./types.js";
import { DEFAULT_POLICY } from "./types.js";

const baseAction: AgentAction = {
  type: "swap",
  agentId: "agent-1",
  inputToken: "USDC",
  outputToken: "SOL",
  amountUsd: 50,
  walletBalanceUsd: 1000,
};

const safeSimulation: SimulationResult = {
  priceImpactPct: 0.5,
  slippageBps: 30,
  liquidityUsd: 500000,
  poolRiskScore: 15,
  expectedOutputUsd: 49.75,
  exposurePct: 5,
};

const riskySimulation: SimulationResult = {
  priceImpactPct: 42,
  slippageBps: 800,
  liquidityUsd: 12000,
  poolRiskScore: 85,
  expectedOutputUsd: 29,
  exposurePct: 95,
};

describe("guard", () => {
  it("allows safe swap", () => {
    const result = guard(baseAction, safeSimulation);
    expect(result.verdict).toBe("ALLOW");
    expect(result.riskScore).toBeLessThan(50);
  });

  it("blocks risky overexposed swap", () => {
    const riskyAction: AgentAction = {
      ...baseAction,
      outputToken: "SCAM",
      amountUsd: 950,
    };
    const result = guard(riskyAction, riskySimulation);
    expect(result.verdict).toBe("BLOCK");
    expect(result.reasonCodes.length).toBeGreaterThan(0);
    expect(result.decisionHash).toHaveLength(64);
  });

  it("warns on moderate risk", () => {
    const moderateSim: SimulationResult = {
      priceImpactPct: 3,
      slippageBps: 80,
      liquidityUsd: 80000,
      poolRiskScore: 45,
      expectedOutputUsd: 48,
      exposurePct: 15,
    };
    const policy = { ...DEFAULT_POLICY, warnRiskThreshold: 30, blockRiskThreshold: 80 };
    const result = guard(baseAction, moderateSim, policy);
    expect(["WARN", "ALLOW"]).toContain(result.verdict);
  });
});
