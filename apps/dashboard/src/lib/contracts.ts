import type { Address } from "viem";

// Strip surrounding quotes, escaped/real CR-LF and whitespace that can sneak in
// via `vercel env pull` (values sometimes come back as `0x...\r\n`).
function clean(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const out = value
    .replace(/\\r|\\n/g, "")
    .replace(/^["']|["']$/g, "")
    .trim();
  return out || undefined;
}

function asAddress(value: string | undefined, fallback: string): Address {
  const v = clean(value);
  return (v ?? fallback) as Address;
}

// IMPORTANT: reference each `process.env.NEXT_PUBLIC_*` statically so Next.js
// inlines the value into the client bundle. Dynamic access (process.env[key])
// is NOT replaced for the browser and would resolve to `undefined`, which is
// what previously forced the live feed onto mock data.
export const MANTLE_RPC =
  clean(process.env.NEXT_PUBLIC_MANTLE_RPC_URL) ?? "https://rpc.sepolia.mantle.xyz";

// Deployed Mantle Sepolia addresses (contracts/deployments/mantle-sepolia.json)
// used as fallbacks so the feed reads real on-chain data even if an env var is
// missing or malformed on a given deployment.
export const DECISION_REGISTRY = asAddress(
  process.env.NEXT_PUBLIC_DECISION_REGISTRY_ADDRESS,
  "0x30F0bAB7ed9064f07c1aa7B3BFBC6d8ea25fA316"
);

export const REPUTATION_READER = asAddress(
  process.env.NEXT_PUBLIC_REPUTATION_READER_ADDRESS,
  "0xed719fFc59226afBd301FbA2e2b1e905e85CC078"
);

export const VERIFIED_CONTRACT = asAddress(
  process.env.NEXT_PUBLIC_VERIFIED_ADDRESS,
  "0xb6b47abD16725Cf5DC89A9c29FB0D8181Cee605f"
);

export const POLICY_REGISTRY = asAddress(
  process.env.NEXT_PUBLIC_POLICY_REGISTRY_ADDRESS,
  "0x530cA907c2E6Be6A9411A887c001c3a4DE7668c6"
);

export const MANTLESCAN_URL =
  clean(process.env.NEXT_PUBLIC_MANTLESCAN_URL) ?? "https://sepolia.mantlescan.xyz";

// First block containing ClawShield activity on Mantle Sepolia. The contract was
// deployed (and seeded) on 2026-06-15; earliest DecisionRecorded event is at
// block 39,981,513. Querying from just before that guarantees the seeded txs are
// always found regardless of how far the chain head has advanced.
export const DECISION_REGISTRY_DEPLOY_BLOCK = BigInt(39_980_000);

export const LANDING_URL =
  process.env.NEXT_PUBLIC_LANDING_URL ?? "http://localhost:3001";

export const GITHUB_URL =
  process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/let-the-dreamers-rise/clawshield";

export const CHAIN_ID = 5003;

export const decisionRegistryAbi = [
  {
    type: "event",
    name: "DecisionRecorded",
    inputs: [
      { name: "agentId", type: "bytes32", indexed: true },
      { name: "decisionHash", type: "bytes32", indexed: true },
      { name: "actionType", type: "uint8", indexed: false },
      { name: "riskScore", type: "uint8", indexed: false },
      { name: "reasonCodes", type: "uint8[]", indexed: false },
      { name: "verdict", type: "uint8", indexed: false },
      { name: "execTxRef", type: "string", indexed: false },
    ],
  },
  {
    type: "function",
    name: "getAgentStats",
    stateMutability: "view",
    inputs: [{ name: "agentId", type: "bytes32" }],
    outputs: [
      { name: "totalActions", type: "uint256" },
      { name: "blocks", type: "uint256" },
      { name: "avgRisk", type: "uint256" },
      { name: "violations", type: "uint256" },
    ],
  },
] as const;

export const reputationReaderAbi = [
  {
    type: "function",
    name: "getClawShieldScore",
    stateMutability: "view",
    inputs: [{ name: "agentId", type: "bytes32" }],
    outputs: [
      { name: "riskScore", type: "uint256" },
      { name: "violationCount", type: "uint256" },
      { name: "verifiedTier", type: "uint8" },
      { name: "decisionCount", type: "uint256" },
      { name: "erc8004Score", type: "uint256" },
    ],
  },
] as const;

export const verifiedAbi = [
  {
    type: "function",
    name: "isVerified",
    stateMutability: "view",
    inputs: [{ name: "agentId", type: "bytes32" }],
    outputs: [
      { name: "verified", type: "bool" },
      { name: "tier", type: "uint8" },
      { name: "expiry", type: "uint256" },
    ],
  },
] as const;

export function agentIdToBytes32(agentId: string): `0x${string}` {
  const hex = Buffer.from(agentId.padEnd(32, "\0")).toString("hex");
  return `0x${hex.slice(0, 64)}` as `0x${string}`;
}

export function mantlescanTx(txHash: string): string {
  return `${MANTLESCAN_URL}/tx/${txHash}`;
}

export function mantlescanAddress(address: string): string {
  return `${MANTLESCAN_URL}/address/${address}`;
}

export function isContractsConfigured(): boolean {
  return Boolean(DECISION_REGISTRY && REPUTATION_READER);
}
