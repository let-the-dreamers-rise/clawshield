export interface IndexedDecision {
  id: number;
  agentId: string;
  decisionHash: string;
  actionType: number;
  riskScore: number;
  reasonCodes: number[];
  verdict: number;
  execTxRef: string;
  blockNumber: number;
  txHash: string;
  timestamp: number;
  indexedAt: number;
}

export interface IndexedFeedback {
  id: number;
  agentId: string;
  score: number;
  tag: string;
  blockNumber: number;
  txHash: string;
  timestamp: number;
}

export interface AgentHistoryQuery {
  agentId: string;
  offset?: number;
  limit?: number;
  verdict?: number;
}

export interface AgentStatsRow {
  agentId: string;
  totalActions: number;
  blocks: number;
  allows: number;
  warnings: number;
  avgRiskScore: number;
  criticalViolations: number;
  lastDecisionAt: number | null;
}

export interface IndexerConfig {
  dbPath: string;
  mantleRpcUrl: string;
  decisionRegistryAddress: `0x${string}`;
  reputationAddress: `0x${string}`;
  startBlock?: bigint;
  pollIntervalMs?: number;
}

export const DECISION_RECORDED_ABI = [
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
] as const;

export const FEEDBACK_GIVEN_ABI = [
  {
    type: "event",
    name: "FeedbackGiven",
    inputs: [
      { name: "agentId", type: "uint256", indexed: true },
      { name: "score", type: "uint8", indexed: false },
      { name: "tag", type: "string", indexed: false },
    ],
  },
] as const;
