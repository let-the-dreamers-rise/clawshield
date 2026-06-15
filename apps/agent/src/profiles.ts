import type { PolicyConfig, ProposedAction } from "@clawshield/core";
import { DEFAULT_POLICY } from "@clawshield/core";

export type AgentProfile = "risky" | "safe" | "balanced";

export interface AgentConfig {
  id: string;
  name: string;
  profile: AgentProfile;
  policy: PolicyConfig;
  portfolioUsd: number;
  walletAddress: string;
}

export const AGENT_PROFILES: Record<AgentProfile, Omit<AgentConfig, "id">> = {
  risky: {
    name: "Risky Agent",
    profile: "risky",
    policy: {
      ...DEFAULT_POLICY,
      maxExposurePct: 80,
      maxSlippageBps: 300,
      minLiquidityUsd: 5000,
    },
    portfolioUsd: 10000,
    walletAddress: "RiskyAgent1111111111111111111111111111111",
  },
  safe: {
    name: "Safe Agent",
    profile: "safe",
    policy: {
      ...DEFAULT_POLICY,
      maxExposurePct: 10,
      maxSlippageBps: 50,
      minLiquidityUsd: 50000,
    },
    portfolioUsd: 10000,
    walletAddress: "SafeAgent11111111111111111111111111111111",
  },
  balanced: {
    name: "Balanced Agent",
    profile: "balanced",
    policy: DEFAULT_POLICY,
    portfolioUsd: 10000,
    walletAddress: "BalancedAgent11111111111111111111111111111",
  },
};

export function getInitialProposal(
  profile: AgentProfile,
  beat: "swap" | "lp"
): ProposedAction {
  if (beat === "lp") {
    return profile === "risky"
      ? {
          type: "lp_open",
          tokenIn: "SOL",
          tokenOut: "USDC",
          amountUsd: 6000,
          slippageBps: 100,
          poolAddress: "thin-pool-sol-usdc",
        }
      : {
          type: "lp_open",
          tokenIn: "SOL",
          tokenOut: "USDC",
          amountUsd: 800,
          slippageBps: 30,
          poolAddress: "deep-pool-sol-usdc",
        };
  }

  if (profile === "risky") {
    return {
      type: "swap",
      tokenIn: "SOL",
      tokenOut: "MEME",
      amountUsd: 8000,
      slippageBps: 200,
    };
  }

  if (profile === "safe") {
    return {
      type: "swap",
      tokenIn: "SOL",
      tokenOut: "USDC",
      amountUsd: 300,
      slippageBps: 30,
    };
  }

  return {
    type: "swap",
    tokenIn: "SOL",
    tokenOut: "USDC",
    amountUsd: 1500,
    slippageBps: 80,
  };
}

export function replanAction(
  profile: AgentProfile,
  blocked: ProposedAction,
  reasonCodes: string[]
): ProposedAction {
  console.log(`  [replan] Blocked: ${reasonCodes.join(", ")}`);

  if (blocked.type === "lp_open") {
    return {
      type: "lp_open",
      tokenIn: blocked.tokenIn,
      tokenOut: blocked.tokenOut,
      amountUsd: Math.round(blocked.amountUsd * 0.15),
      slippageBps: 30,
      poolAddress: "deep-pool-sol-usdc",
    };
  }

  const safer: ProposedAction = {
    type: "swap",
    tokenIn: blocked.tokenIn,
    tokenOut: "USDC",
    amountUsd: Math.round(blocked.amountUsd * (profile === "risky" ? 0.12 : 0.5)),
    slippageBps: 50,
  };

  if (reasonCodes.includes("TOKEN_NOT_ALLOWLISTED")) {
    safer.tokenOut = "USDC";
  }

  return safer;
}
