import type { GuardResult, PolicyConfig, ProposedAction } from "@clawshield/core";
import { evaluatePolicy } from "@clawshield/core/browser";

export interface ClawShieldApiConfig {
  baseUrl?: string;
  rpcUrl?: string;
  reputationReader?: string;
}

export interface AgentScore {
  agentId: string;
  riskScore: number;
  violationCount: number;
  verifiedTier: "none" | "verified" | "gold" | "enterprise";
  decisionCount: number;
  erc8004Score: number;
}

const DEFAULT_BASE = typeof window !== "undefined"
  ? window.location.origin
  : "http://localhost:3000";

export class ClawShieldApi {
  constructor(private config: ClawShieldApiConfig = {}) {}

  get baseUrl() {
    return this.config.baseUrl ?? DEFAULT_BASE;
  }

  async guard(action: ProposedAction, policy?: PolicyConfig): Promise<GuardResult> {
    const apiUrl = this.config.baseUrl ?? (typeof process !== "undefined" ? process.env.CLAWSHIELD_API_URL : undefined);
    const target = apiUrl ?? `${this.baseUrl}/api/guard`;
    try {
      const res = await fetch(target.includes("/v1/") ? target : `${apiUrl ?? "http://localhost:8787"}/v1/guard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, policy }),
      });
      if (res.ok) return res.json();
    } catch {
      // fall through to client-side evaluation
    }
    return evaluatePolicy(action, policy);
  }

  async getAgentScore(agentId: string): Promise<AgentScore> {
    const apiUrl = this.config.baseUrl ?? "http://localhost:8787";
    try {
      const res = await fetch(`${apiUrl}/v1/agents/${encodeURIComponent(agentId)}/score`);
      if (res.ok) {
        const data = await res.json();
        return {
          agentId: data.agentId,
          riskScore: data.riskScore,
          violationCount: data.violationCount,
          verifiedTier: data.verifiedTier,
          decisionCount: data.decisionCount,
          erc8004Score: data.erc8004Score,
        };
      }
    } catch {
      // fall through to mock
    }
    return mockAgentScore(agentId);
  }
}

function mockAgentScore(agentId: string): AgentScore {
  const scores: Record<string, AgentScore> = {
    "agent-risky-001": { agentId, riskScore: 58, violationCount: 4, verifiedTier: "verified", decisionCount: 47, erc8004Score: 74 },
    "agent-safe-002": { agentId, riskScore: 22, violationCount: 0, verifiedTier: "gold", decisionCount: 63, erc8004Score: 91 },
    "agent-balanced-003": { agentId, riskScore: 35, violationCount: 1, verifiedTier: "verified", decisionCount: 55, erc8004Score: 82 },
  };
  return scores[agentId] ?? {
    agentId,
    riskScore: 50,
    violationCount: 0,
    verifiedTier: "none",
    decisionCount: 0,
    erc8004Score: 0,
  };
}

export function createApi(config?: ClawShieldApiConfig) {
  return new ClawShieldApi(config);
}
