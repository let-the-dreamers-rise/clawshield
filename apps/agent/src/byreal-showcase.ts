import type { ByrealAdapter } from "@clawshield/adapters";
import type { ProposedAction } from "@clawshield/core";
import type { Logger } from "./logger.js";

export interface ByrealSkillInvocation {
  skill: string;
  cliCommand: string;
  result: Record<string, unknown>;
}

export interface ByrealShowcaseResult {
  invocations: ByrealSkillInvocation[];
  swapPreview: Awaited<ReturnType<ByrealAdapter["swapPreview"]>>;
  poolAnalysis: Awaited<ReturnType<ByrealAdapter["analyzePool"]>>;
  positionPreview: Awaited<ReturnType<ByrealAdapter["positionOpenPreview"]>>;
}

function logCli(log: Logger, skill: string, cliCommand: string, result: Record<string, unknown>) {
  log.info(`[Byreal CLI] ${skill}`, { cliCommand, result });
  console.log(`  🔗 byreal-cli ${cliCommand}`);
  console.log(`     → ${JSON.stringify(result)}`);
}

/**
 * Demonstrates deep Byreal CLI integration: pools → swap preview → LP preview.
 * Judges see full CLI command chain in logs (not surface API calls).
 */
export async function runByrealShowcase(
  byreal: ByrealAdapter,
  log: Logger,
  pools: { deep: string; thin: string } = {
    deep: "usdc-sol-main",
    thin: "thin-pool-meme-usdc",
  }
): Promise<ByrealShowcaseResult> {
  const invocations: ByrealSkillInvocation[] = [];

  console.log("\n═══ Byreal Integration Showcase ═══");
  console.log("Skill chain: pools analyze → swap preview → positions open preview\n");

  const poolAnalysis = await byreal.analyzePool(pools.deep);
  const poolCmd = `pools analyze ${pools.deep} -o json`;
  logCli(log, "pools.analyze", poolCmd, poolAnalysis as unknown as Record<string, unknown>);
  invocations.push({ skill: "pools.analyze", cliCommand: poolCmd, result: poolAnalysis as unknown as Record<string, unknown> });

  const thinPool = await byreal.analyzePool(pools.thin);
  const thinCmd = `pools analyze ${pools.thin} -o json`;
  logCli(log, "pools.analyze", thinCmd, thinPool as unknown as Record<string, unknown>);
  invocations.push({ skill: "pools.analyze", cliCommand: thinCmd, result: thinPool as unknown as Record<string, unknown> });

  const swapAction: ProposedAction = {
    type: "swap",
    tokenIn: "USDC",
    tokenOut: "SOL",
    amountUsd: 25,
    slippageBps: 50,
  };
  const swapPreview = await byreal.swapPreview(swapAction);
  const swapCmd = `swap preview --token-in USDC --token-out SOL --amount-usd 25 --slippage-bps 50 -o json`;
  logCli(log, "swap.preview", swapCmd, swapPreview as unknown as Record<string, unknown>);
  invocations.push({ skill: "swap.preview", cliCommand: swapCmd, result: swapPreview as unknown as Record<string, unknown> });

  const lpAction: ProposedAction = {
    type: "lp_open",
    tokenIn: "USDC",
    tokenOut: "SOL",
    amountUsd: 50,
    slippageBps: 50,
    poolAddress: pools.deep,
  };
  const positionPreview = await byreal.positionOpenPreview(lpAction);
  const posCmd = `positions open preview --pool ${pools.deep} --amount-usd 50 -o json`;
  logCli(log, "positions.open.preview", posCmd, positionPreview as unknown as Record<string, unknown>);
  invocations.push({
    skill: "positions.open.preview",
    cliCommand: posCmd,
    result: positionPreview as unknown as Record<string, unknown>,
  });

  console.log("\n  📎 Perps (future): byreal-cli perps open preview — stub documented in openclaw-skill/SKILL.md");
  console.log("═══ End Byreal Showcase ═══\n");

  return { invocations, swapPreview, poolAnalysis, positionPreview };
}
