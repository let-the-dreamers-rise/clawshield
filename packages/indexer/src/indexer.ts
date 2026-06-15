import {
  createPublicClient,
  decodeEventLog,
  http,
  type Log,
} from "viem";
import type { DatabaseSync } from "node:sqlite";
import { QueryLayer } from "./query.js";
import { DECISION_RECORDED_ABI, FEEDBACK_GIVEN_ABI, type IndexerConfig } from "./types.js";

const mantleChain = {
  id: 5003,
  name: "Mantle Sepolia",
  nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.sepolia.mantle.xyz"] } },
} as const;

const STATE_KEY_LAST_BLOCK = "last_indexed_block";

export class MantleIndexer {
  private readonly client;
  private readonly query: QueryLayer;
  private running = false;

  constructor(
    private readonly db: DatabaseSync,
    private readonly config: IndexerConfig
  ) {
    this.client = createPublicClient({
      chain: mantleChain,
      transport: http(config.mantleRpcUrl),
    });
    this.query = new QueryLayer(db);
  }

  getQueryLayer(): QueryLayer {
    return this.query;
  }

  getLastBlock(): bigint {
    const row = this.db.prepare(`SELECT value FROM indexer_state WHERE key = ?`).get(STATE_KEY_LAST_BLOCK) as
      | { value: string }
      | undefined;
    if (row) return BigInt(row.value);
    return this.config.startBlock ?? 0n;
  }

  setLastBlock(block: bigint): void {
    this.db
      .prepare(
        `INSERT INTO indexer_state (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`
      )
      .run(STATE_KEY_LAST_BLOCK, block.toString());
  }

  async indexOnce(): Promise<{ decisions: number; feedback: number }> {
    const fromBlock = this.getLastBlock() + 1n;
    const latest = await this.client.getBlockNumber();
    if (fromBlock > latest) return { decisions: 0, feedback: 0 };

    const toBlock = fromBlock + 999n > latest ? latest : fromBlock + 999n;
    let decisions = 0;
    let feedback = 0;

    const decisionLogs = await this.client.getLogs({
      address: this.config.decisionRegistryAddress,
      event: DECISION_RECORDED_ABI[0],
      fromBlock,
      toBlock,
    });

    for (const log of decisionLogs) {
      if (this.ingestDecisionLog(log)) decisions += 1;
    }

    try {
      const feedbackLogs = await this.client.getLogs({
        address: this.config.reputationAddress,
        event: FEEDBACK_GIVEN_ABI[0],
        fromBlock,
        toBlock,
      });
      for (const log of feedbackLogs) {
        if (this.ingestFeedbackLog(log)) feedback += 1;
      }
    } catch {
      // ERC-8004 feedback event shape may differ on testnet
    }

    this.setLastBlock(toBlock);
    return { decisions, feedback };
  }

  ingestDecisionLog(log: Log): boolean {
    try {
      const decoded = decodeEventLog({
        abi: DECISION_RECORDED_ABI,
        data: log.data,
        topics: log.topics,
      });
      const args = decoded.args as {
        agentId: `0x${string}`;
        decisionHash: `0x${string}`;
        actionType: number;
        riskScore: number;
        reasonCodes: readonly number[];
        verdict: number;
        execTxRef: string;
      };

      this.query.insertDecision({
        agentId: args.agentId,
        decisionHash: args.decisionHash,
        actionType: args.actionType,
        riskScore: args.riskScore,
        reasonCodes: [...args.reasonCodes],
        verdict: args.verdict,
        execTxRef: args.execTxRef,
        blockNumber: Number(log.blockNumber ?? 0),
        txHash: log.transactionHash ?? "",
        timestamp: Math.floor(Date.now() / 1000),
      });
      return true;
    } catch {
      return false;
    }
  }

  ingestFeedbackLog(log: Log): boolean {
    try {
      const decoded = decodeEventLog({
        abi: FEEDBACK_GIVEN_ABI,
        data: log.data,
        topics: log.topics,
      });
      const args = decoded.args as { agentId: bigint; score: number; tag: string };
      this.query.insertFeedback({
        agentId: `0x${args.agentId.toString(16).padStart(64, "0")}`,
        score: args.score,
        tag: args.tag,
        blockNumber: Number(log.blockNumber ?? 0),
        txHash: log.transactionHash ?? "",
        timestamp: Math.floor(Date.now() / 1000),
      });
      return true;
    } catch {
      return false;
    }
  }

  async startPolling(): Promise<void> {
    this.running = true;
    const interval = this.config.pollIntervalMs ?? 15_000;
    while (this.running) {
      try {
        const result = await this.indexOnce();
        if (result.decisions > 0 || result.feedback > 0) {
          console.log(`Indexed ${result.decisions} decisions, ${result.feedback} feedback events`);
        }
      } catch (err) {
        console.error("Indexer poll error:", err);
      }
      await new Promise((r) => setTimeout(r, interval));
    }
  }

  stop(): void {
    this.running = false;
  }
}

export function createIndexer(db: DatabaseSync, config: IndexerConfig): MantleIndexer {
  return new MantleIndexer(db, config);
}
