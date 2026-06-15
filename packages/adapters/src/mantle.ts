import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  toBytes,
  type Address,
  type Hash,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { ClawShieldScore, GuardResult, VerifiedStatus } from "@clawshield/core";
import {
  decisionRegistryAbi,
  erc8004ReputationAbi,
  reputationReaderAbi,
  verifiedAbi,
} from "./abis.js";
import {
  ERC8004_REPUTATION,
  MANTLE_CHAIN_ID,
  actionTypeToUint8,
  agentIdToBytes32,
  getContractAddresses,
  reasonCodeToUint8,
  tierToUint8,
  verdictToUint8,
} from "./config.js";

const mantleChain = {
  id: MANTLE_CHAIN_ID,
  name: "Mantle Sepolia",
  nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.MANTLE_RPC_URL ?? "https://rpc.sepolia.mantle.xyz"],
    },
  },
} as const;

export interface MantleAdapterConfig {
  rpcUrl?: string;
  privateKey?: Hex;
  demoMode?: boolean;
}

export class MantleAdapter {
  private readonly publicClient;
  private readonly walletClient;
  private readonly account;
  private readonly demoMode: boolean;
  private readonly addresses = getContractAddresses();

  constructor(config: MantleAdapterConfig = {}) {
    this.demoMode = config.demoMode ?? false;
    const rpcUrl =
      config.rpcUrl ?? process.env.MANTLE_RPC_URL ?? "https://rpc.sepolia.mantle.xyz";
    const pk = (config.privateKey ?? process.env.MANTLE_PRIVATE_KEY) as Hex | undefined;

    this.publicClient = createPublicClient({
      chain: mantleChain,
      transport: http(rpcUrl),
    });

    if (pk) {
      this.account = privateKeyToAccount(pk);
      this.walletClient = createWalletClient({
        account: this.account,
        chain: mantleChain,
        transport: http(rpcUrl),
      });
    } else {
      this.account = privateKeyToAccount(
        "0x0123456789012345678901234567890123456789012345678901234567890123"
      );
      this.walletClient = createWalletClient({
        account: this.account,
        chain: mantleChain,
        transport: http(rpcUrl),
      });
    }
  }

  async writeReceipt(
    agentId: string,
    result: GuardResult,
    execTxRef: string
  ): Promise<Hash> {
    if (this.demoMode || !this.addresses.decisionRegistry) {
      const hash = keccak256(toBytes(`${agentId}-${result.timestamp}-${execTxRef}`));
      console.log(`[demo] Mantle receipt: ${hash}`);
      return hash;
    }

    const decisionHash = keccak256(
      toBytes(JSON.stringify({ agentId, result, execTxRef, ts: result.timestamp }))
    );

    return this.walletClient.writeContract({
      address: this.addresses.decisionRegistry,
      abi: decisionRegistryAbi,
      functionName: "recordDecision",
      args: [
        agentIdToBytes32(agentId),
        decisionHash,
        actionTypeToUint8(result.action.type),
        Math.min(255, Math.round(result.riskScore)),
        result.reasonCodes.map(reasonCodeToUint8),
        verdictToUint8(result.verdict),
        execTxRef,
      ],
      chain: mantleChain,
      account: this.account,
    });
  }

  async giveFeedback(
    agentId: string,
    score: number,
    tag = "guard"
  ): Promise<Hash | undefined> {
    if (this.demoMode) {
      console.log(`[demo] ERC-8004 feedback: agent=${agentId} score=${score}`);
      return undefined;
    }

    const erc8004AgentId = process.env.ERC8004_AGENT_ID
      ? BigInt(process.env.ERC8004_AGENT_ID)
      : BigInt(agentIdToBytes32(agentId));
    const clamped = Math.max(0, Math.min(100, Math.round(score)));

    return this.walletClient.writeContract({
      address: ERC8004_REPUTATION,
      abi: erc8004ReputationAbi,
      functionName: "giveFeedback",
      args: [
        erc8004AgentId,
        BigInt(clamped),
        0,
        "clawshield",
        tag,
        "",
        "",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      ],
      chain: mantleChain,
      account: this.account,
    });
  }

  async getClawShieldScore(agentId: string): Promise<ClawShieldScore> {
    if (this.demoMode || !this.addresses.reputationReader) {
      return {
        riskScore: 35,
        violationCount: 1,
        verifiedTier: "verified",
        decisionCount: 12,
        erc8004Score: 72,
      };
    }

    const [riskScore, violationCount, verifiedTier, decisionCount, erc8004Score] =
      await this.publicClient.readContract({
        address: this.addresses.reputationReader,
        abi: reputationReaderAbi,
        functionName: "getClawShieldScore",
        args: [agentIdToBytes32(agentId)],
      });

    const tierMap = ["none", "verified", "gold", "enterprise"] as const;
    return {
      riskScore: Number(riskScore),
      violationCount: Number(violationCount),
      verifiedTier: tierMap[verifiedTier] ?? "none",
      decisionCount: Number(decisionCount),
      erc8004Score: Number(erc8004Score),
    };
  }

  async checkVerification(agentId: string): Promise<VerifiedStatus> {
    if (this.demoMode || !this.addresses.verified) {
      return { isVerified: true, tier: "verified", expiry: Date.now() + 86400000 * 365 };
    }

    const [isVerified, tier, expiry] = await this.publicClient.readContract({
      address: this.addresses.verified,
      abi: verifiedAbi,
      functionName: "isVerified",
      args: [agentIdToBytes32(agentId)],
    });

    const tierMap = ["none", "verified", "gold", "enterprise"] as const;
    return {
      isVerified,
      tier: tierMap[tier] ?? "none",
      expiry: Number(expiry) * 1000,
    };
  }

  async mintVerifiedBadge(
    agentId: string,
    tier: "verified" | "gold" | "enterprise" = "verified"
  ): Promise<Hash | undefined> {
    if (this.demoMode || !this.addresses.verified) {
      const hash = keccak256(toBytes(`badge-${agentId}-${tier}`));
      console.log(`[demo] Mint badge: ${agentId} tier=${tier} tx=${hash}`);
      return hash;
    }

    return this.walletClient.writeContract({
      address: this.addresses.verified,
      abi: verifiedAbi,
      functionName: "mintVerified",
      args: [agentIdToBytes32(agentId), tierToUint8(tier)],
      chain: mantleChain,
      account: this.account,
    });
  }

  async renewBadge(agentId: string): Promise<Hash | undefined> {
    if (this.demoMode || !this.addresses.verified) {
      console.log(`[demo] Renew badge: ${agentId}`);
      return undefined;
    }

    return this.walletClient.writeContract({
      address: this.addresses.verified,
      abi: verifiedAbi,
      functionName: "renew",
      args: [agentIdToBytes32(agentId)],
      chain: mantleChain,
      account: this.account,
    });
  }

  getAddresses() {
    return this.addresses;
  }
}

export type { Address };
