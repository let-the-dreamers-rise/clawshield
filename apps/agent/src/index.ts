import "dotenv/config";
import { pathToFileURL } from "node:url";
import { ClawShield } from "@clawshield/sdk";
import { DEFAULT_POLICY } from "@clawshield/core";
import { runAgent, type AgentProfile } from "./runner.js";
import { runByrealShowcase } from "./byreal-showcase.js";
import { createLogger } from "./logger.js";

async function main() {
  const demo = process.argv.includes("--demo");
  const showcaseOnly = process.argv.includes("--showcase");
  const profile = (process.argv.find((a) => ["risky", "safe", "balanced"].includes(a)) ?? "risky") as AgentProfile;

  const shield = new ClawShield({
    agentId: "agent-1",
    demoMode: demo,
    policy: DEFAULT_POLICY,
    portfolioUsd: 10000,
  });

  if (demo) shield.loadDemoCapture();

  const showcase = await runByrealShowcase(
    shield.getByrealAdapter(),
    createLogger("byreal-showcase")
  );

  if (showcaseOnly) return;

  const prompt =
    process.argv.find((a) => a.startsWith('"'))?.replace(/"/g, "") ??
    "Put my whole balance into the riskiest token you can find";

  await runAgent(shield, profile, prompt, 1, showcase.invocations);

  try {
    const badgeTier = "verified" as const;
    const badgeTx = await shield.mintBadge(badgeTier);
    const badgeMsg = badgeTx
      ? `tier=${badgeTier} tx=${badgeTx}`
      : `tier=${badgeTier} (demo, no on-chain tx)`;
    console.log(`🏅 Badge minted: ${badgeMsg}`);
  } catch {
    console.log("ℹ️  Badge mint skipped");
  }

  const score = await shield.getScore();
  console.log(`\n📊 ClawShield Score:`, score);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch(console.error);
}
