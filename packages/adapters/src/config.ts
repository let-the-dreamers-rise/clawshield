export const MANTLE_CHAIN_ID = 5003;

export const ERC8004_IDENTITY =
  "0x8004A818BFB912233c491871b3d84c89A494BD9e" as const;

export const ERC8004_REPUTATION =
  "0x8004B663056A597Dffe9eCcC1965A193B7388713" as const;

export function getContractAddresses() {
  return {
    decisionRegistry: process.env.DECISION_REGISTRY_ADDRESS as `0x${string}` | undefined,
    reputationReader: process.env.REPUTATION_READER_ADDRESS as `0x${string}` | undefined,
    verified: process.env.VERIFIED_ADDRESS as `0x${string}` | undefined,
    erc8004Identity: ERC8004_IDENTITY,
    erc8004Reputation: ERC8004_REPUTATION,
  };
}

export function agentIdToBytes32(agentId: string): `0x${string}` {
  const hex = Buffer.from(agentId.padEnd(32, "\0")).toString("hex");
  return `0x${hex.slice(0, 64)}` as `0x${string}`;
}

export function reasonCodeToUint8(code: string): number {
  const map: Record<string, number> = {
    SLIPPAGE_EXCEEDED: 0,
    THIN_LIQUIDITY: 1,
    OVEREXPOSED: 2,
    TOKEN_NOT_ALLOWLISTED: 3,
    TOKEN_BLOCKED: 3,
    DAILY_CAP_EXCEEDED: 4,
    POOL_RISK_HIGH: 5,
    PRICE_IMPACT_HIGH: 6,
    POLICY_VIOLATION: 7,
  };
  return map[code] ?? 99;
}

export function verdictToUint8(verdict: string): number {
  return verdict === "ALLOW" ? 0 : verdict === "WARN" ? 1 : 2;
}

export function actionTypeToUint8(type: string): number {
  const map: Record<string, number> = {
    swap: 0,
    lp_open: 1,
    lp_close: 2,
    transfer: 3,
  };
  return map[type] ?? 0;
}

export function tierToUint8(tier: string): number {
  const map: Record<string, number> = {
    none: 0,
    verified: 1,
    gold: 2,
    enterprise: 3,
  };
  return map[tier] ?? 1;
}
