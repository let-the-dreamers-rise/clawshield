#!/usr/bin/env node
/**
 * Generate proof bundle for hackathon judges — tx hashes, contracts, agent stats.
 * Usage: node scripts/generate-proof-bundle.mjs [--out proof-bundle.json]
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outArg = process.argv.indexOf("--out");
const outPath = outArg >= 0 ? process.argv[outArg + 1] : join(root, "proof-bundle.json");

const MANTLESCAN_BASE = "https://sepolia.mantlescan.xyz";

function loadJson(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

const deployments = loadJson(join(root, "contracts/deployments/mantle-sepolia.json"));
const demoCapture = loadJson(join(root, "demo-capture.json"));

const contracts = deployments?.contracts ?? {};
const mantleTxHashes = [];
const solanaExecRefs = [];

if (demoCapture?.steps) {
  for (const step of demoCapture.steps) {
    if (step.mantleTxHash) mantleTxHashes.push(step.mantleTxHash);
    if (step.execTxRef) solanaExecRefs.push(step.execTxRef);
  }
}

const bundle = {
  generatedAt: new Date().toISOString(),
  project: "ClawShield",
  track: "Agentic Economy (Byreal)",
  mantleSepolia: {
    chainId: deployments?.chainId ?? 5003,
    explorer: MANTLESCAN_BASE,
    contracts: {
      decisionRegistry: {
        address: contracts.ClawShieldDecisionRegistry ?? "DEPLOY_AND_FILL",
        mantlescan: contracts.ClawShieldDecisionRegistry
          ? `${MANTLESCAN_BASE}/address/${contracts.ClawShieldDecisionRegistry}`
          : `${MANTLESCAN_BASE}/address/0x_DECISION_REGISTRY`,
      },
      verified: {
        address: contracts.ClawShieldVerified ?? "DEPLOY_AND_FILL",
        mantlescan: contracts.ClawShieldVerified
          ? `${MANTLESCAN_BASE}/address/${contracts.ClawShieldVerified}`
          : `${MANTLESCAN_BASE}/address/0x_VERIFIED`,
      },
      reputationReader: {
        address: contracts.ClawShieldReputationReader ?? "DEPLOY_AND_FILL",
        mantlescan: contracts.ClawShieldReputationReader
          ? `${MANTLESCAN_BASE}/address/${contracts.ClawShieldReputationReader}`
          : `${MANTLESCAN_BASE}/address/0x_REPUTATION_READER`,
      },
    },
    erc8004: deployments?.erc8004 ?? {
      IdentityRegistry: "0x8004A818BFB912233c491871b3d84c89A494BD9e",
      ReputationRegistry: "0x8004B663056A597Dffe9eCcC1965A193B7388713",
    },
    sampleReceiptTxs: mantleTxHashes.map((hash) => ({
      hash,
      mantlescan: `${MANTLESCAN_BASE}/tx/${hash}`,
    })),
  },
  solanaByreal: {
    executionRefs: solanaExecRefs,
    note: "Solana swap/LP signatures from Byreal CLI execute (see demo-capture.json)",
  },
  agentStats: {
    demoAgentId: demoCapture?.agentId ?? "risky-agent",
    autonomySteps: demoCapture?.steps?.length ?? 0,
    blocks: demoCapture?.steps?.filter((s) => s.guard?.verdict === "BLOCK").length ?? 0,
    allows: demoCapture?.steps?.filter((s) => s.guard?.verdict === "ALLOW").length ?? 0,
    byrealSkillsUsed: [
      "pools.analyze",
      "swap.preview",
      "swap.execute",
      "positions.open.preview",
      "positions.open.execute",
      "clawshield.guard",
    ],
  },
  verifyCommands: {
    demo: "pnpm demo",
    preflight: "pnpm preflight",
    proofBundle: "node scripts/generate-proof-bundle.mjs",
  },
};

writeFileSync(outPath, JSON.stringify(bundle, null, 2));
console.log(`🛡️ Proof bundle written to ${outPath}`);
console.log(JSON.stringify(bundle, null, 2));
