import type { AgentAction, PolicyConfig, ReasonCode } from "./types";

export function checkPolicy(
  action: AgentAction,
  policy: PolicyConfig,
  dailySpendUsd: number = 0
): ReasonCode[] {
  const reasons: ReasonCode[] = [];

  if (action.type === "payment" || action.type === "transfer") {
    if (action.amountUsd > policy.maxDailySpendUsd - dailySpendUsd) {
      reasons.push("DAILY_CAP_EXCEEDED");
    }
  }

  const tokens = action.type === "payment"
    ? [action.inputToken]
    : [action.inputToken, action.outputToken];
  for (const token of tokens) {
    const upper = token.toUpperCase();
    if (policy.blocklist.some((b) => upper.includes(b.toUpperCase()))) {
      reasons.push("TOKEN_BLOCKED");
    }
    if (
      policy.allowlist.length > 0 &&
      !policy.allowlist.some((a) => upper.includes(a.toUpperCase()))
    ) {
      reasons.push("TOKEN_NOT_ALLOWLISTED");
    }
  }

  if (action.amountUsd > policy.maxDailySpendUsd - dailySpendUsd) {
    reasons.push("DAILY_CAP_EXCEEDED");
  }

  const balance = action.walletBalanceUsd ?? action.amountUsd * 4;
  const exposurePct = (action.amountUsd / balance) * 100;
  if (exposurePct > policy.maxExposurePct) {
    reasons.push("OVEREXPOSED");
  }

  return reasons;
}
