import type { PolicyConfig, ProposedAction } from "@clawshield/core";
import { ClawShield } from "@clawshield/sdk";

export interface SkillWrapOptions {
  agentId: string;
  policy?: PolicyConfig;
  demoMode?: boolean;
}

export function createClawShieldSkill(options: SkillWrapOptions) {
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

  return {
    async preAction(action: ProposedAction) {
      const result = await shield.guard(action);
      return result;
    },
    async postAction(result: Awaited<ReturnType<typeof shield.guard>>, execTxRef?: string) {
      await shield.writeReceipt(result, execTxRef ?? "");
    },
    shield,
  };
}

export { ClawShield };
export {
  runSwapGuardChain,
  runLpGuardChain,
  PERPS_CHAIN_STUB,
  type ChainStep,
  type SkillChainResult,
} from "./byreal-chain.js";
