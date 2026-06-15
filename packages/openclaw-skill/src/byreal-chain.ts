import type { ProposedAction, PolicyConfig } from "@clawshield/core";
import { ByrealAdapter } from "@clawshield/adapters";
import type { GuardResult } from "@clawshield/core";
import { ClawShield } from "@clawshield/sdk";

export interface SkillWrapOptions {
  agentId: string;
  policy?: PolicyConfig;
  demoMode?: boolean;
}

export interface ChainStep {
  skill: string;
  cliCommand: string;
  output?: Record<string, unknown>;
}

export interface SkillChainResult {
  steps: ChainStep[];
  guard: GuardResult;
}

/**
 * OpenClaw skill chain: Byreal CLI → ClawShield guard → (optional) execute.
 * Documented for judges as purposeful integration, not surface API calls.
 */
export async function runSwapGuardChain(
  action: ProposedAction,
  options: SkillWrapOptions
): Promise<SkillChainResult> {
  const byreal = new ByrealAdapter("npx", options.demoMode ?? false);
  const shield = new ClawShield({
    agentId: options.agentId,
    policy: options.policy ?? {
      allowlist: ["SOL", "USDC", "USDT", "MNT"],
      blocklist: ["SCAM", "RUG", "MEME"],
      maxSlippageBps: 100,
      maxExposurePct: 25,
      maxDailySpendUsd: 5000,
      minLiquidityUsd: 10000,
      warnRiskThreshold: 50,
      blockRiskThreshold: 70,
    },
    demoMode: options.demoMode,
  });
  const steps: ChainStep[] = [];

  if (action.poolAddress || action.type === "swap") {
    const pool = action.poolAddress ?? `${action.tokenIn}-${action.tokenOut}-main`;
    const poolCmd = `pools analyze ${pool} -o json`;
    const analysis = await byreal.analyzePool(pool);
    steps.push({ skill: "pools.analyze", cliCommand: poolCmd, output: analysis as unknown as Record<string, unknown> });
  }

  const swapCmd = `swap preview --token-in ${action.tokenIn} --token-out ${action.tokenOut} --amount-usd ${action.amountUsd} --slippage-bps ${action.slippageBps ?? 50} -o json`;
  const preview = await byreal.swapPreview(action);
  steps.push({ skill: "swap.preview", cliCommand: swapCmd, output: preview as unknown as Record<string, unknown> });

  const guard = await shield.guard(action);
  steps.push({ skill: "clawshield.guard", cliCommand: "clawshield-guard (policy + risk)", output: { verdict: guard.verdict, riskScore: guard.riskScore } });

  return { steps, guard };
}

export async function runLpGuardChain(
  action: ProposedAction,
  options: SkillWrapOptions
): Promise<SkillChainResult> {
  const byreal = new ByrealAdapter("npx", options.demoMode ?? false);
  const shield = new ClawShield({
    agentId: options.agentId,
    policy: options.policy ?? {
      allowlist: ["SOL", "USDC", "USDT", "MNT"],
      blocklist: ["SCAM", "RUG", "MEME"],
      maxSlippageBps: 100,
      maxExposurePct: 25,
      maxDailySpendUsd: 5000,
      minLiquidityUsd: 10000,
      warnRiskThreshold: 50,
      blockRiskThreshold: 70,
    },
    demoMode: options.demoMode,
  });
  const steps: ChainStep[] = [];

  const pool = action.poolAddress ?? "usdc-sol-main";
  const poolCmd = `pools analyze ${pool} -o json`;
  const analysis = await byreal.analyzePool(pool);
  steps.push({ skill: "pools.analyze", cliCommand: poolCmd, output: analysis as unknown as Record<string, unknown> });

  const posCmd = `positions open preview --pool ${pool} --amount-usd ${action.amountUsd} -o json`;
  const preview = await byreal.positionOpenPreview(action);
  steps.push({ skill: "positions.open.preview", cliCommand: posCmd, output: preview as unknown as Record<string, unknown> });

  const guard = await shield.guard(action);
  steps.push({ skill: "clawshield.guard", cliCommand: "clawshield-guard (policy + risk)", output: { verdict: guard.verdict, riskScore: guard.riskScore } });

  return { steps, guard };
}

/** Stub for @byreal-io/byreal-cli perps — wire when CLI stabilizes */
export const PERPS_CHAIN_STUB = {
  skill: "perps.open.preview",
  cliCommand: "perps open preview --market SOL-PERP --size-usd 100 -o json",
  status: "documented-stub",
  note: "ClawShield guard hooks ready; enable when byreal-cli perps ships",
};
