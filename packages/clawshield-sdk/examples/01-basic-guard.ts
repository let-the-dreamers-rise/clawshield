/**
 * Example 1: Basic guard + execute pipeline
 */
import { ClawShield } from "@clawshield/sdk";
import { DEFAULT_POLICY } from "@clawshield/core";

async function main() {
  const shield = new ClawShield({
    agentId: "example-agent",
    policy: DEFAULT_POLICY,
    portfolioUsd: 10_000,
    demoMode: true,
  });

  const action = {
    type: "swap" as const,
    tokenIn: "USDC",
    tokenOut: "SOL",
    amountUsd: 50,
    slippageBps: 50,
  };

  const result = await shield.guard(action);
  console.log(`Verdict: ${result.verdict} | Risk: ${result.riskScore}`);
  console.log(`Explanation: ${result.message}`);

  if (result.verdict !== "BLOCK") {
    const exec = await shield.executeIfAllowed(result);
    console.log(`Executed: ${exec.execTxRef}`);
  }
}

main().catch(console.error);
