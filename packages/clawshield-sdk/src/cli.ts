#!/usr/bin/env node
import { DEFAULT_POLICY } from "@clawshield/core";
import { ClawShield } from "./index.js";

async function main() {
  const demo = process.argv.includes("--demo");
  const agentId = process.env.AGENT_ID ?? "cli-agent";

  const shield = new ClawShield({
    agentId,
    policy: DEFAULT_POLICY,
    demoMode: demo,
  });

  if (demo) {
    shield.loadDemoCapture();
    console.log("ClawShield demo replay loaded");
  }

  const action = {
    type: "swap" as const,
    tokenIn: "SOL",
    tokenOut: demo ? "MEME" : "USDC",
    amountUsd: demo ? 8000 : 500,
    slippageBps: demo ? 200 : 50,
  };

  const result = await shield.guard(action);
  console.log(JSON.stringify({ verdict: result.verdict, riskScore: result.riskScore, reasonCodes: result.reasonCodes }, null, 2));

  if (result.verdict !== "BLOCK") {
    const exec = await shield.executeIfAllowed(result);
    console.log(JSON.stringify(exec, null, 2));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
