import type { ActionType, ReasonCode, RiskBreakdown, Verdict } from "./types.js";
import { getSeverity, maxSeverity } from "./severity.js";

const REASON_MESSAGES: Record<ReasonCode, string> = {
  SLIPPAGE_EXCEEDED:
    "Expected slippage exceeds your configured maximum — the trade may fill at a significantly worse price than quoted.",
  THIN_LIQUIDITY:
    "Pool liquidity is below the minimum threshold — large orders may move the market or fail to execute.",
  OVEREXPOSED:
    "This action would allocate more of your portfolio than the exposure limit allows.",
  TOKEN_NOT_ALLOWLISTED:
    "One or more tokens in this action are not on your allowlist.",
  TOKEN_BLOCKED:
    "One or more tokens in this action are explicitly blocked by policy.",
  DAILY_CAP_EXCEEDED:
    "This action would exceed your daily spending cap for guarded operations.",
  POOL_RISK_HIGH:
    "The target pool has elevated risk indicators (concentration, volatility, or audit flags).",
  PRICE_IMPACT_HIGH:
    "Estimated price impact is high — executing now could materially move the market against you.",
  POLICY_VIOLATION: "A general policy constraint was violated.",
};

const ACTION_LABELS: Record<ActionType, string> = {
  swap: "token swap",
  lp_open: "liquidity position open",
  lp_close: "liquidity position close",
  transfer: "token transfer",
  payment: "payment",
};

export interface ExplainResult {
  summary: string;
  reasons: Array<{ code: ReasonCode; severity: string; message: string }>;
  severity: string;
  replanHints: string[];
}

export function explainReason(code: ReasonCode): string {
  return REASON_MESSAGES[code] ?? `Policy violation: ${code}`;
}

export function explainVerdict(
  verdict: Verdict,
  reasonCodes: ReasonCode[],
  riskScore: number,
  actionType: ActionType = "swap"
): ExplainResult {
  const actionLabel = ACTION_LABELS[actionType];
  const severity = maxSeverity(reasonCodes);
  const reasons = reasonCodes.map((code) => ({
    code,
    severity: getSeverity(code),
    message: explainReason(code),
  }));

  let summary: string;
  if (verdict === "BLOCK") {
    summary = `Blocked ${actionLabel}: risk score ${riskScore}/100 with ${reasonCodes.length} violation(s) (${severity} severity).`;
  } else if (verdict === "WARN") {
    summary = `Warning on ${actionLabel}: risk score ${riskScore}/100 — proceed only if you accept elevated risk.`;
  } else {
    summary = `Allowed ${actionLabel}: risk score ${riskScore}/100 — within policy limits.`;
  }

  const replanHints = buildReplanHints(reasonCodes, actionType);

  return { summary, reasons, severity, replanHints };
}

function buildReplanHints(codes: ReasonCode[], actionType: ActionType): string[] {
  const hints: string[] = [];
  if (codes.includes("OVEREXPOSED")) hints.push("Reduce trade size to stay under max exposure %.");
  if (codes.includes("SLIPPAGE_EXCEEDED")) hints.push("Lower slippage tolerance or split into smaller chunks.");
  if (codes.includes("THIN_LIQUIDITY") || codes.includes("PRICE_IMPACT_HIGH"))
    hints.push("Choose a deeper liquidity pool or a more liquid token pair.");
  if (codes.includes("TOKEN_NOT_ALLOWLISTED") || codes.includes("TOKEN_BLOCKED"))
    hints.push("Use tokens from your policy allowlist only.");
  if (codes.includes("DAILY_CAP_EXCEEDED")) hints.push("Wait until daily cap resets or request a cap increase.");
  if (codes.includes("POOL_RISK_HIGH") && actionType.startsWith("lp"))
    hints.push("Select a pool with higher TVL and verified audit status.");
  if (hints.length === 0 && codes.length > 0) hints.push("Review policy settings and retry with conservative parameters.");
  return hints;
}

export function explainBreakdown(breakdown: RiskBreakdown): string[] {
  const lines: string[] = [];
  const { weights } = breakdown;
  lines.push(
    `Price impact contributed ${Math.round(breakdown.priceImpactScore * weights.priceImpact)} pts (weight ${weights.priceImpact * 100}%).`
  );
  lines.push(
    `Slippage contributed ${Math.round(breakdown.slippageScore * weights.slippage)} pts (weight ${weights.slippage * 100}%).`
  );
  lines.push(
    `Liquidity contributed ${Math.round(breakdown.liquidityScore * weights.liquidity)} pts (weight ${weights.liquidity * 100}%).`
  );
  lines.push(
    `Exposure contributed ${Math.round(breakdown.exposureScore * weights.exposure)} pts (weight ${weights.exposure * 100}%).`
  );
  lines.push(`Pool risk score: ${breakdown.poolRiskScore}/100.`);
  return lines;
}
