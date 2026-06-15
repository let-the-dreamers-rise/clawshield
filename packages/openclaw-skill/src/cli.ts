#!/usr/bin/env node
import { ClawShield } from "@clawshield/sdk";
import type { ProposedAction } from "@clawshield/core";

const args = process.argv.slice(2);
const demo = args.includes("--demo");

async function main() {
  const shield = new ClawShield({
    agentId: args[0] ?? "agent-1",
    demoMode: demo,
    policy: {
      allowlist: ["USDC", "SOL", "USDT", "MNT"],
      blocklist: ["SCAM", "RUG", "MEME"],
      maxSlippageBps: 100,
      maxExposurePct: 25,
      maxDailySpendUsd: 5000,
      minLiquidityUsd: 10000,
      warnRiskThreshold: 50,
      blockRiskThreshold: 70,
    },
  });

  if (demo) shield.loadDemoCapture();

  const action: ProposedAction = {
    type: "swap",
    tokenIn: args[1] ?? "USDC",
    tokenOut: args[2] ?? "SOL",
    amountUsd: Number(args[3] ?? 50),
    slippageBps: 50,
  };

  const result = await shield.guard(action);
  console.log(JSON.stringify(result, null, 2));

  if (result.verdict !== "BLOCK") {
    const exec = await shield.executeIfAllowed(result);
    console.log(JSON.stringify(exec, null, 2));
  } else {
    await shield.writeReceipt(result, "");
  }
}

main().catch(console.error);
