import type { ReasonCode, ViolationSeverity } from "./types.js";
export const REASON_SEVERITY: Record<ReasonCode, ViolationSeverity> = {
  SLIPPAGE_EXCEEDED: "CRITICAL",
  THIN_LIQUIDITY: "MEDIUM",
  OVEREXPOSED: "CRITICAL",
  TOKEN_NOT_ALLOWLISTED: "CRITICAL",
  TOKEN_BLOCKED: "CRITICAL",
  DAILY_CAP_EXCEEDED: "CRITICAL",
  POOL_RISK_HIGH: "MEDIUM",
  PRICE_IMPACT_HIGH: "MEDIUM",
  POLICY_VIOLATION: "LOW",
};

export function getSeverity(code: ReasonCode): ViolationSeverity {
  return REASON_SEVERITY[code] ?? "LOW";
}

export function maxSeverity(codes: ReasonCode[]): ViolationSeverity {
  if (codes.length === 0) return "LOW";
  const order: ViolationSeverity[] = ["LOW", "MEDIUM", "CRITICAL"];
  let max = 0;
  for (const code of codes) {
    const idx = order.indexOf(getSeverity(code));
    if (idx > max) max = idx;
  }
  return order[max]!;
}

export function countBySeverity(codes: ReasonCode[]): Record<ViolationSeverity, number> {
  const counts: Record<ViolationSeverity, number> = { LOW: 0, MEDIUM: 0, CRITICAL: 0 };
  for (const code of codes) {
    counts[getSeverity(code)] += 1;
  }
  return counts;
}
