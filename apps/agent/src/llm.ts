import type { ProposedAction } from "@clawshield/core";
import type { AgentProfile } from "./profiles.js";
import { getInitialProposal, replanAction } from "./profiles.js";

export interface LlmProposal {
  action: ProposedAction;
  rationale: string;
}

const HEURISTICS: Record<AgentProfile, (beat: "swap" | "lp") => LlmProposal> = {
  risky: (beat) => ({
    action: getInitialProposal("risky", beat),
    rationale:
      beat === "swap"
        ? "Maximize upside: full-balance swap into trending MEME token"
        : "Concentrate LP in thin pool for max fee yield",
  }),
  safe: (beat) => ({
    action: getInitialProposal("safe", beat),
    rationale:
      beat === "swap"
        ? "Conservative SOL→USDC rebalance within 3% exposure"
        : "Provide liquidity in deep SOL/USDC pool with tight range",
  }),
  balanced: (beat) => ({
    action: getInitialProposal("balanced", beat),
    rationale:
      beat === "swap"
        ? "Moderate SOL→USDC swap balancing yield and safety"
        : "Standard LP position in established pool",
  }),
};

export async function proposeAction(
  profile: AgentProfile,
  beat: "swap" | "lp" = "swap"
): Promise<LlmProposal> {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    return HEURISTICS[profile](beat);
  }

  try {
    const baseUrl = process.env.LLM_BASE_URL ?? "https://open.bigmodel.cn/api/paas/v4";
    const model = process.env.LLM_MODEL ?? "glm-4-flash";
    const heuristic = HEURISTICS[profile](beat);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a DeFi trading agent. Respond with JSON only: { action: { type, tokenIn, tokenOut, amountUsd, slippageBps, poolAddress? }, rationale: string }",
          },
          {
            role: "user",
            content: `Profile: ${profile}. Propose a ${beat} action.`,
          },
        ],
        temperature: profile === "risky" ? 0.9 : 0.3,
      }),
    });

    if (!response.ok) {
      return heuristic;
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return heuristic;

    const parsed = JSON.parse(content) as LlmProposal;
    return parsed.action ? parsed : heuristic;
  } catch {
    return HEURISTICS[profile](beat);
  }
}

export async function replanWithLlm(
  profile: AgentProfile,
  blocked: ProposedAction,
  reasonCodes: string[]
): Promise<LlmProposal> {
  return {
    action: replanAction(profile, blocked, reasonCodes),
    rationale: `Autonomous replan after block: reduced exposure, safer token/pool selection`,
  };
}
