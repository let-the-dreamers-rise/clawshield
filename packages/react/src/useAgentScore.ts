"use client";

import { useCallback, useEffect, useState } from "react";
import { createApi, type AgentScore, type ClawShieldApiConfig } from "./api.js";

export interface UseAgentScoreOptions extends ClawShieldApiConfig {
  agentId: string;
  pollInterval?: number;
}

export interface UseAgentScoreReturn {
  score: AgentScore | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAgentScore(options: UseAgentScoreOptions): UseAgentScoreReturn {
  const { agentId, pollInterval, ...apiConfig } = options;
  const [score, setScore] = useState<AgentScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = createApi(apiConfig);

  const refresh = useCallback(async () => {
    if (!agentId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAgentScore(agentId);
      setScore(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch agent score");
    } finally {
      setLoading(false);
    }
  }, [api, agentId]);

  useEffect(() => {
    refresh();
    if (!pollInterval) return;
    const id = setInterval(refresh, pollInterval);
    return () => clearInterval(id);
  }, [refresh, pollInterval]);

  return { score, loading, error, refresh };
}
