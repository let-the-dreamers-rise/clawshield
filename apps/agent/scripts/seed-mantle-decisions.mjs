/**
 * Seed 2-3 live recordDecision txs on Mantle Sepolia for dashboard feed.
 * Usage: pnpm seed:mantle
 * Requires MANTLE_PRIVATE_KEY + DECISION_REGISTRY_ADDRESS in .env (never printed).
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";
import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  toBytes,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..", "..", "..");

function loadEnv() {
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const val = trimmed.slice(eq + 1).replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

// Windows dev environments may lack CA certs for Mantle RPC TLS
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const mantleChain = {
  id: 5003,
  name: "Mantle Sepolia",
  nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
  rpcUrls: { default: { http: [process.env.MANTLE_RPC_URL ?? "https://rpc.sepolia.mantle.xyz"] } },
};

const decisionRegistryAbi = [
  {
    type: "function",
    name: "recordDecision",
    inputs: [
      { name: "agentId", type: "bytes32" },
      { name: "decisionHash", type: "bytes32" },
      { name: "actionType", type: "uint8" },
      { name: "riskScore", type: "uint8" },
      { name: "reasonCodes", type: "uint8[]" },
      { name: "verdict", type: "uint8" },
      { name: "execTxRef", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
];

function agentIdToBytes32(agentId) {
  const hex = Buffer.from(agentId.padEnd(32, "\0")).toString("hex");
  return `0x${hex.slice(0, 64)}`;
}

const SEEDS = [
  { agentId: "agent-1", actionType: 0, riskScore: 88, reasonCodes: [3, 2, 6], verdict: 2, execTxRef: "" },
  { agentId: "agent-1", actionType: 0, riskScore: 12, reasonCodes: [], verdict: 0, execTxRef: "seed-sol-tx-allow-1" },
  { agentId: "agent-2", actionType: 1, riskScore: 18, reasonCodes: [], verdict: 0, execTxRef: "seed-sol-tx-allow-2" },
];

async function main() {
  const pk = process.env.MANTLE_PRIVATE_KEY;
  const registry = process.env.DECISION_REGISTRY_ADDRESS;
  if (!pk) {
    console.error("MANTLE_PRIVATE_KEY not set in .env");
    process.exit(1);
  }
  if (!registry) {
    console.error("DECISION_REGISTRY_ADDRESS not set in .env");
    process.exit(1);
  }

  const rpcCandidates = [
    process.env.MANTLE_RPC_URL,
    "https://rpc.sepolia.mantle.xyz",
    "https://mantle-sepolia.drpc.org",
  ].filter(Boolean);

  let lastErr;
  for (const rpcUrl of rpcCandidates) {
    try {
      const account = privateKeyToAccount(pk);
      const publicClient = createPublicClient({
        chain: { ...mantleChain, rpcUrls: { default: { http: [rpcUrl] } } },
        transport: http(rpcUrl, { timeout: 30_000, retryCount: 3, fetchOptions: { agent: httpsAgent } }),
      });
      const walletClient = createWalletClient({
        account,
        chain: { ...mantleChain, rpcUrls: { default: { http: [rpcUrl] } } },
        transport: http(rpcUrl, { timeout: 30_000, retryCount: 3, fetchOptions: { agent: httpsAgent } }),
      });

      console.log(`Seeding ${SEEDS.length} recordDecision txs on Mantle Sepolia…`);
      const hashes = [];

      for (const seed of SEEDS) {
        const decisionHash = keccak256(toBytes(JSON.stringify({ ...seed, ts: Date.now() })));
        const hash = await walletClient.writeContract({
          address: registry,
          abi: decisionRegistryAbi,
          functionName: "recordDecision",
          args: [
            agentIdToBytes32(seed.agentId),
            decisionHash,
            seed.actionType,
            seed.riskScore,
            seed.reasonCodes,
            seed.verdict,
            seed.execTxRef,
          ],
          chain: { ...mantleChain, rpcUrls: { default: { http: [rpcUrl] } } },
          account,
        });
        const verdictLabel = ["ALLOW", "WARN", "BLOCK"][seed.verdict] ?? "?";
        console.log(`  ${verdictLabel} risk=${seed.riskScore} → ${hash}`);
        await publicClient.waitForTransactionReceipt({ hash });
        hashes.push(hash);
      }

      console.log(`\nDone. ${hashes.length} txs confirmed.`);
      return;
    } catch (err) {
      lastErr = err;
      console.warn(`RPC attempt failed, trying next… (${err?.message ?? err})`);
    }
  }

  throw lastErr;
}

main().catch((err) => {
  console.error("Seed failed:", err?.message ?? err);
  process.exit(1);
});
