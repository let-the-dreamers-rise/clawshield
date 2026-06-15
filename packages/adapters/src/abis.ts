export const decisionRegistryAbi = [
  {
    type: "function",
    name: "recordDecision",
    stateMutability: "nonpayable",
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
  {
    type: "function",
    name: "mintVerified",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentId", type: "bytes32" },
      { name: "tier", type: "uint8" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "renew",
    stateMutability: "nonpayable",
    inputs: [{ name: "agentId", type: "bytes32" }],
    outputs: [],
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

export const erc8004ReputationAbi = [
  {
    type: "function",
    name: "giveFeedback",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "value", type: "int128" },
      { name: "valueDecimals", type: "uint8" },
      { name: "tag1", type: "string" },
      { name: "tag2", type: "string" },
      { name: "endpoint", type: "string" },
      { name: "feedbackURI", type: "string" },
      { name: "feedbackHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getSummary",
    stateMutability: "view",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "clientAddresses", type: "address[]" },
      { name: "tag1", type: "string" },
      { name: "tag2", type: "string" },
    ],
    outputs: [
      { name: "count", type: "uint256" },
      { name: "summaryValue", type: "int256" },
      { name: "summaryValueDecimals", type: "uint8" },
    ],
  },
] as const;
