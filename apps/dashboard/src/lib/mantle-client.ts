import { createPublicClient, http, parseAbiItem, type Log } from "viem";
import type { DecisionRecord, DashboardClawShieldScore } from "@/lib/types";
import {
  CHAIN_ID,
  DECISION_REGISTRY,
  DECISION_REGISTRY_DEPLOY_BLOCK,
  MANTLE_RPC,
} from "./contracts";
import {
  MOCK_DECISIONS,
  actionTypeFromUint,
  tierFromUint,
  verdictFromUint,
} from "./mock-data";
import { reasonCodesFromUint } from "./types";

const mantleChain = {
  id: CHAIN_ID,
  name: "Mantle Sepolia",
  nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
  rpcUrls: { default: { http: [MANTLE_RPC] } },
} as const;

export function createMantleClient() {
  return createPublicClient({
    chain: mantleChain,
    transport: http(MANTLE_RPC),
  });
}

const DECISION_EVENT = parseAbiItem(
  "event DecisionRecorded(bytes32 indexed agentId, bytes32 indexed decisionHash, uint8 actionType, uint8 riskScore, uint8[] reasonCodes, uint8 verdict, string execTxRef)"
);

// Mantle's public RPC rejects getLogs ranges larger than 10,000 blocks, so we
// page backwards from the chain head in chunks. We stop once we reach the deploy
// block (or a hard cap) so the seeded transactions are always discovered even as
// the chain head moves far past them.
const CHUNK_SIZE = BigInt(9000);
const ONE = BigInt(1);
const ZERO = BigInt(0);
const MAX_CHUNKS = 60;

type DecisionLog = Log<bigint, number, false, typeof DECISION_EVENT, true>;

async function getDecisionLogs(fromBlock?: bigint): Promise<DecisionLog[]> {
  const client = createMantleClient();
  const latest = await client.getBlockNumber();
  const floor = fromBlock ?? DECISION_REGISTRY_DEPLOY_BLOCK;

  const collected: DecisionLog[] = [];
  let toBlock = latest;
  let chunks = 0;

  while (toBlock >= floor && chunks < MAX_CHUNKS) {
    const candidate = toBlock - (CHUNK_SIZE - ONE);
    const chunkFrom = candidate > floor ? candidate : floor;

    const logs = (await client.getLogs({
      address: DECISION_REGISTRY,
      event: DECISION_EVENT,
      fromBlock: chunkFrom,
      toBlock,
    })) as DecisionLog[];

    collected.push(...logs);
    chunks += 1;

    if (chunkFrom <= floor) break;
    toBlock = chunkFrom - ONE;
  }

  return collected;
}

export async function fetchDecisionEvents(
  fromBlock?: bigint
): Promise<DecisionRecord[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.CLAWSHIELD_API_URL;
  if (apiUrl) {
    try {
      const res = await fetch(`${apiUrl}/v1/feed?limit=50`, { next: { revalidate: 10 } });
      if (res.ok) {
        const data = (await res.json()) as { decisions: Array<Record<string, unknown>> };
        if (data.decisions?.length) {
          return data.decisions.map((d, i) => ({
            id: String(d.id ?? `idx-${i}`),
            agentId: String(d.agentId ?? d.agent_id ?? "unknown"),
            decisionHash: String(d.decisionHash ?? d.decision_hash ?? ""),
            actionType: actionTypeFromUint(Number(d.actionType ?? d.action_type ?? 0)),
            riskScore: Number(d.riskScore ?? d.risk_score ?? 0),
            reasonCodes: reasonCodesFromUint(
              (d.reasonCodes ?? d.reason_codes) as number[] | string[] | undefined
            ),
            verdict: verdictFromUint(Number(d.verdict ?? 0)),
            execTxRef: String(d.execTxRef ?? d.exec_tx_ref ?? ""),
            timestamp: Number(d.timestamp ?? Date.now()) * 1000,
            blockNumber: BigInt(Number(d.blockNumber ?? d.block_number ?? 0)),
            txHash: (d.txHash ?? d.tx_hash) as `0x${string}` | undefined,
            onChain: Boolean(d.txHash ?? d.tx_hash),
          }));
        }
      }
    } catch {
      // fall through to on-chain / mock
    }
  }

  if (!DECISION_REGISTRY) {
    return MOCK_DECISIONS;
  }

  try {
    const logs = await getDecisionLogs(fromBlock);

    if (logs.length === 0) return MOCK_DECISIONS;

    return logs
      // newest first
      .sort((a, b) => Number((b.blockNumber ?? ZERO) - (a.blockNumber ?? ZERO)))
      .map((log) => {
        const args = log.args;

        const agentBytes = Buffer.from(args.agentId!.slice(2), "hex");
        const agentIdStr =
          agentBytes.toString("utf8").replace(/\0/g, "") || args.agentId!;

        return {
          id: `${log.transactionHash}-${log.logIndex}`,
          agentId: agentIdStr,
          decisionHash: args.decisionHash!,
          actionType: actionTypeFromUint(Number(args.actionType)),
          riskScore: Number(args.riskScore),
          reasonCodes: reasonCodesFromUint(
            (args.reasonCodes as readonly number[] | undefined)?.map(Number)
          ),
          verdict: verdictFromUint(Number(args.verdict)),
          execTxRef: args.execTxRef ?? "",
          timestamp: Date.now(),
          blockNumber: log.blockNumber ?? undefined,
          txHash: log.transactionHash ?? undefined,
          onChain: true,
        } satisfies DecisionRecord;
      });
  } catch {
    return MOCK_DECISIONS;
  }
}

export async function fetchClawShieldScore(
  agentId: string
): Promise<DashboardClawShieldScore | null> {
  const { REPUTATION_READER, reputationReaderAbi, agentIdToBytes32 } =
    await import("./contracts");

  if (!REPUTATION_READER) {
    const agent = (await import("./mock-data")).getAgentById(agentId);
    if (!agent) return null;
    return {
      riskScore: agent.avgRiskScore,
      violationCount: agent.violations,
      verifiedTier: agent.verifiedTier,
      decisionCount: agent.totalActions,
      erc8004Score: agent.erc8004Score,
    };
  }

  try {
    const client = createMantleClient();
    const result = await client.readContract({
      address: REPUTATION_READER,
      abi: reputationReaderAbi,
      functionName: "getClawShieldScore",
      args: [agentIdToBytes32(agentId)],
    });

    return {
      riskScore: Number(result[0]),
      violationCount: Number(result[1]),
      verifiedTier: tierFromUint(Number(result[2])),
      decisionCount: Number(result[3]),
      erc8004Score: Number(result[4]),
    };
  } catch {
    const agent = (await import("./mock-data")).getAgentById(agentId);
    if (!agent) return null;
    return {
      riskScore: agent.avgRiskScore,
      violationCount: agent.violations,
      verifiedTier: agent.verifiedTier,
      decisionCount: agent.totalActions,
      erc8004Score: agent.erc8004Score,
    };
  }
}
