import type { Address } from "viem";

export const MANTLE_RPC =
  process.env.NEXT_PUBLIC_MANTLE_RPC_URL ?? "https://rpc.sepolia.mantle.xyz";

export const DECISION_REGISTRY =
  (process.env.NEXT_PUBLIC_DECISION_REGISTRY_ADDRESS as Address) || undefined;

export const REPUTATION_READER =
  (process.env.NEXT_PUBLIC_REPUTATION_READER_ADDRESS as Address) || undefined;

export const VERIFIED_CONTRACT =
  (process.env.NEXT_PUBLIC_VERIFIED_ADDRESS as Address) || undefined;

export const MANTLESCAN_URL =
  process.env.NEXT_PUBLIC_MANTLESCAN_URL ?? "https://sepolia.mantlescan.xyz";

export const LANDING_URL =
  process.env.NEXT_PUBLIC_LANDING_URL ?? "http://localhost:3001";

export const GITHUB_URL =
  process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/clawshield/clawshield";

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
