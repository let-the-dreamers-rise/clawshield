"use client";

import { useCallback, useState } from "react";
import type { GuardResult, PolicyConfig, ProposedAction } from "@clawshield/core";
import { createApi, type ClawShieldApiConfig } from "./api.js";

export interface UseGuardOptions extends ClawShieldApiConfig {
  policy?: PolicyConfig;
}

export interface UseGuardReturn {
  guard: (action: ProposedAction) => Promise<GuardResult>;
  result: GuardResult | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export function useGuard(options: UseGuardOptions = {}): UseGuardReturn {
  const { policy, ...apiConfig } = options;
  const [result, setResult] = useState<GuardResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = createApi(apiConfig);

  const guard = useCallback(
    async (action: ProposedAction) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.guard(action, policy);
        setResult(res);
        return res;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Guard evaluation failed";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [api, policy]
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { guard, result, loading, error, reset };
}
