import { checkPolicy } from "./policy.js";
import { computeRiskScore, determineVerdict } from "./risk.js";
import { hashDecision } from "./hash.js";
import { explainVerdict } from "./explain.js";
import type { AgentAction, GuardResult, PolicyConfig, SimulationResult, ViolationSeverity } from "./types.js";
import { DEFAULT_POLICY } from "./types.js";

export { hashDecision };

export function guard(
  action: AgentAction,
  simulation: SimulationResult,
  policy: PolicyConfig = DEFAULT_POLICY,
  dailySpendUsd: number = 0
): GuardResult {
  const policyReasons = checkPolicy(action, policy, dailySpendUsd);
  const { riskScore, breakdown, reasonCodes: riskReasons } = computeRiskScore(
    simulation,
    policy
  );
  const { verdict, reasonCodes } = determineVerdict(
    riskScore,
    policyReasons,
    riskReasons,
    policy
  );

  const timestamp = Date.now();
  const decisionHash = hashDecision({ action, simulation, riskScore, verdict, timestamp });

  const explanation = explainVerdict(verdict, reasonCodes, riskScore, action.type);

  return {
    action,
    verdict,
    riskScore,
    reasonCodes,
    breakdown,
    simulation,
    decisionHash,
    timestamp,
    message: explanation.summary,
    explanation: {
      summary: explanation.summary,
      severity: explanation.severity as ViolationSeverity,
      replanHints: explanation.replanHints,
    },
  };
}
