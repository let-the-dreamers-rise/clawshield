import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const broadcastDir = join(__dirname, "../broadcast/Deploy.s.sol/5003");

function findLatestRun() {
  if (!existsSync(broadcastDir)) return null;
  const latest = join(broadcastDir, "run-latest.json");
  if (existsSync(latest)) return latest;
  const runs = readdirSync(broadcastDir)
    .filter((d) => d.startsWith("run-"))
    .sort()
    .reverse();
  return runs[0] ? join(broadcastDir, runs[0], "run-latest.json") : null;
}

const runFile = findLatestRun();
if (!runFile || !existsSync(runFile)) {
  console.error("No broadcast artifact found. Run: pnpm deploy:contracts");
  process.exit(1);
}

const broadcast = JSON.parse(readFileSync(runFile, "utf-8"));
const contracts = {};

for (const tx of broadcast.transactions ?? []) {
  if (tx.contractName === "ClawShieldDecisionRegistry") {
    contracts.ClawShieldDecisionRegistry = tx.contractAddress;
  }
  if (tx.contractName === "ClawShieldVerified") {
    contracts.ClawShieldVerified = tx.contractAddress;
  }
  if (tx.contractName === "ClawShieldReputationReader") {
    contracts.ClawShieldReputationReader = tx.contractAddress;
  }
  if (tx.contractName === "ClawShieldPolicyRegistry") {
    contracts.ClawShieldPolicyRegistry = tx.contractAddress;
  }
}

const output = {
  chainId: 5003,
  network: "mantle-sepolia",
  deployedAt: new Date().toISOString(),
  deployer: broadcast.transactions?.[0]?.transaction?.from ?? null,
  contracts,
  erc8004: {
    IdentityRegistry: "0x8004A818BFB912233c491871b3d84c89A494BD9e",
    ReputationRegistry: "0x8004B663056A597Dffe9eCcC1965A193B7388713",
  },
};

const outPath = join(__dirname, "../deployments/mantle-sepolia.json");
writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log("Updated", outPath);
console.log(JSON.stringify(output, null, 2));
