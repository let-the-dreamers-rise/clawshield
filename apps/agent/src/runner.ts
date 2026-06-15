import { ClawShield, type ProposedAction } from "@clawshield/sdk";
import { createLogger } from "./logger.js";
import { AutonomyLog } from "./autonomy.js";
import { withRetry, cliCircuit } from "./resilience.js";
import type { ByrealSkillInvocation } from "./byreal-showcase.js";

export type AgentProfile = "risky" | "safe" | "balanced";

const PROFILES: Record<AgentProfile, { name: string; riskMultiplier: number }> = {
  risky: { name: "RiskHawk", riskMultiplier: 3 },
  safe: { name: "SafeGuard", riskMultiplier: 0.3 },
  balanced: { name: "BalancedBot", riskMultiplier: 1 },
};

const POOL_ALTERNATES = ["usdc-sol-main", "sol-usdc-deep", "usdc-sol-alt"];

async function callLLM(prompt: string): Promise<string> {
  const log = createLogger("llm");
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    log.debug("Using heuristic LLM fallback");
    return prompt.includes("whole") || prompt.includes("all") || prompt.includes("riskiest")
      ? '{"tokenIn":"USDC","tokenOut":"MEME","amountUsd":9500,"slippageBps":500}'
      : '{"tokenIn":"USDC","tokenOut":"SOL","amountUsd":25,"slippageBps":50}';
  }

  return withRetry(
    () =>
      fetch(`${process.env.LLM_BASE_URL ?? "https://api.openai.com/v1"}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: process.env.LLM_MODEL ?? "gpt-4o-mini",
          messages: [
            { role: "system", content: 'Respond JSON: {"tokenIn","tokenOut","amountUsd","slippageBps"}' },
            { role: "user", content: prompt },
          ],
        }),
      }).then(async (res) => {
        const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        return data.choices?.[0]?.message?.content ?? "{}";
      }),
    { maxAttempts: 3 }
  );
}

function parseAction(response: string, profile: AgentProfile): ProposedAction {
  const mult = PROFILES[profile].riskMultiplier;
  try {
    const json = JSON.parse(response.replace(/```json|```/g, "").trim());
    return {
      type: "swap",
      tokenIn: json.tokenIn ?? "USDC",
      tokenOut: json.tokenOut ?? (profile === "risky" ? "MEME" : "SOL"),
      amountUsd: (json.amountUsd ?? 50) * mult,
      slippageBps: json.slippageBps ?? 100,
    };
  } catch {
    return {
      type: "swap",
      tokenIn: "USDC",
      tokenOut: profile === "risky" ? "MEME" : "SOL",
      amountUsd: profile === "risky" ? 9500 : 25,
      slippageBps: profile === "risky" ? 500 : 50,
    };
  }
}

function riskyLpAction(): ProposedAction {
  return {
    type: "lp_open",
    tokenIn: "USDC",
    tokenOut: "MEME",
    amountUsd: 500,
    slippageBps: 100,
    poolAddress: "thin-pool-meme-usdc",
  };
}

function safeLpAction(pool = "usdc-sol-main"): ProposedAction {
  return {
    type: "lp_open",
    tokenIn: "USDC",
    tokenOut: "SOL",
    amountUsd: 50,
    slippageBps: 50,
    poolAddress: pool,
  };
}

function safeSwapAction(amountUsd = 25): ProposedAction {
  return {
    type: "swap",
    tokenIn: "USDC",
    tokenOut: "SOL",
    amountUsd,
    slippageBps: 50,
  };
}

async function previewSwapOrFail(
  shield: ClawShield,
  action: ProposedAction,
  autonomy: AutonomyLog,
  poolIndex: number
): Promise<{ ok: boolean; action: ProposedAction }> {
  const byreal = shield.getByrealAdapter();
  try {
    const preview = await cliCircuit.exec(() => byreal.swapPreview(action));
    autonomy.record({
      phase: "preview",
      reasoning: `Byreal swap preview succeeded for ${action.tokenIn}→${action.tokenOut} ($${action.amountUsd})`,
      action: `${action.type} $${action.amountUsd}`,
      byrealSkills: ["pools.analyze", "swap.preview"],
    });
    return { ok: preview.priceImpactPct < 30, action };
  } catch (err) {
    const altPool = POOL_ALTERNATES[poolIndex % POOL_ALTERNATES.length];
    autonomy.record({
      phase: "recover",
      reasoning: `Preview failed (${err instanceof Error ? err.message : "unknown"}); circuit breaker routing to alternate pool ${altPool}`,
      byrealSkills: ["swap.preview", "pools.analyze"],
    });
    if (poolIndex >= POOL_ALTERNATES.length - 1) {
      return { ok: false, action };
    }
    const altAction = { ...action, poolAddress: altPool };
    return previewSwapOrFail(shield, altAction, autonomy, poolIndex + 1);
  }
}

export interface AgentRunResult {
  swapExec?: Awaited<ReturnType<ClawShield["executeIfAllowed"]>>;
  lpExec?: Awaited<ReturnType<ClawShield["executeIfAllowed"]>>;
  autonomySteps: ReturnType<AutonomyLog["getSteps"]>;
  byrealInvocations?: ByrealSkillInvocation[];
}

/**
 * Multi-step autonomous loop for judges:
 * propose risky → BLOCK → replan → BLOCK LP → replan safe → execute
 */
export async function runAgent(
  shield: ClawShield,
  profile: AgentProfile,
  prompt: string,
  agentNum: number = 1,
  byrealInvocations?: ByrealSkillInvocation[]
): Promise<AgentRunResult> {
  const agentId = `agent-${agentNum}`;
  const log = createLogger(agentId);
  const autonomy = new AutonomyLog();
  const name = PROFILES[profile].name;
  log.info("Agent run started", { profile, prompt });

  console.log(`\n🤖 ${name} (${profile}) — autonomous guard loop\n`);

  // Step 1: LLM proposes risky action
  const llmResponse = await callLLM(prompt);
  let action = parseAction(llmResponse, profile);
  autonomy.record({
    phase: "propose",
    reasoning: `User prompt interpreted: "${prompt.slice(0, 60)}…" — proposing ${action.tokenOut} exposure`,
    action: `${action.type} $${action.amountUsd} ${action.tokenIn}→${action.tokenOut}`,
    byrealSkills: byrealInvocations?.map((i) => i.skill),
  });

  // Step 2: Guard risky proposal
  let result = await shield.guard(action);
  autonomy.record({
    phase: "guard",
    reasoning: result.verdict === "BLOCK"
      ? "ClawShield blocked risky proposal — reading reason codes for replan"
      : "Proposal passed guard (unexpected for risky demo)",
    action: `${action.type} $${action.amountUsd}`,
    verdict: result.verdict,
    riskScore: result.riskScore,
    reasonCodes: result.reasonCodes,
    byrealSkills: ["swap.preview", "pools.analyze"],
  });

  // Step 3: Replan after block
  if (result.verdict === "BLOCK") {
    action = safeSwapAction(profile === "risky" ? 25 : 15);
    autonomy.record({
      phase: "replan",
      reasoning: "Autonomous replan: reduce exposure, switch to allowlisted SOL pair",
      action: `${action.type} $${action.amountUsd} ${action.tokenIn}→${action.tokenOut}`,
    });

    const previewResult = await previewSwapOrFail(shield, action, autonomy, 0);
    action = previewResult.action;

    result = await shield.guard(action);
    autonomy.record({
      phase: "guard",
      reasoning: previewResult.ok
        ? "Safe swap passed preview + policy guard"
        : "Safe swap blocked after preview recovery attempts",
      verdict: result.verdict,
      riskScore: result.riskScore,
      reasonCodes: result.reasonCodes,
      byrealSkills: ["swap.preview", "pools.analyze"],
    });
  }

  let swapExec: Awaited<ReturnType<ClawShield["executeIfAllowed"]>> | undefined;
  if (result.verdict !== "BLOCK") {
    autonomy.record({
      phase: "execute",
      reasoning: "Executing allowed swap via Byreal CLI swap execute",
      action: `${action.type} $${action.amountUsd}`,
      verdict: "ALLOW",
      byrealSkills: ["swap.execute"],
    });
    swapExec = await shield.executeIfAllowed(result);
    console.log(`✅ Swap executed: ${swapExec.execTxRef}`);
    console.log(`📝 Mantle receipt: ${swapExec.mantleTxHash}`);
  } else {
    const mantleTx = await shield.writeReceipt(result, "");
    console.log(`📝 Block receipt: ${mantleTx}`);
  }

  // Step 4–6: LP guard loop (swap + LP demonstrates full Byreal surface)
  let lpExec: Awaited<ReturnType<ClawShield["executeIfAllowed"]>> | undefined;
  if (profile === "risky") {
    console.log("\n--- LP Guard (Byreal positions.open) ---");
    let lpAction = riskyLpAction();
    autonomy.record({
      phase: "propose",
      reasoning: "Agent attempts LP into thin MEME pool for yield",
      action: `lp_open $${lpAction.amountUsd} pool=${lpAction.poolAddress}`,
      byrealSkills: ["positions.open.preview", "pools.analyze"],
    });

    let lpResult = await shield.guard(lpAction);
    autonomy.record({
      phase: "guard",
      reasoning: "LP blocked — thin liquidity + blocklisted token",
      verdict: lpResult.verdict,
      riskScore: lpResult.riskScore,
      reasonCodes: lpResult.reasonCodes,
      byrealSkills: ["positions.open.preview", "pools.analyze"],
    });

    if (lpResult.verdict === "BLOCK") {
      lpAction = safeLpAction();
      autonomy.record({
        phase: "replan",
        reasoning: "Replan LP to deep USDC/SOL pool with reduced size",
        action: `lp_open $${lpAction.amountUsd} pool=${lpAction.poolAddress}`,
      });

      lpResult = await shield.guard(lpAction);
      autonomy.record({
        phase: "guard",
        reasoning: "Safe LP passed guard",
        verdict: lpResult.verdict,
        riskScore: lpResult.riskScore,
        byrealSkills: ["positions.open.preview", "pools.analyze"],
      });

      if (lpResult.verdict !== "BLOCK") {
        autonomy.record({
          phase: "execute",
          reasoning: "Executing LP via Byreal positions open execute",
          verdict: "ALLOW",
          byrealSkills: ["positions.open.execute"],
        });
        lpExec = await shield.executeIfAllowed(lpResult);
        console.log(`✅ LP executed: ${lpExec.execTxRef}`);
      }
    }
  }

  autonomy.summary();
  return {
    swapExec,
    lpExec,
    autonomySteps: autonomy.getSteps(),
    byrealInvocations,
  };
}

export { PROFILES };
