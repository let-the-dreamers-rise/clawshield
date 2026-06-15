"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ClawShieldApiConfig } from "./api.js";

export interface DecisionFeedItem {
  id: number;
  agentId: string;
  decisionHash: string;
  actionType: number;
  riskScore: number;
  reasonCodes: number[];
  verdict: number;
  execTxRef: string;
  timestamp: number;
}

export interface UseDecisionFeedOptions extends ClawShieldApiConfig {
  /** Poll interval in ms (default 5000) */
  pollIntervalMs?: number;
  /** Max items to keep in feed */
  limit?: number;
  /** Auto-start polling on mount */
  autoStart?: boolean;
}

export interface UseDecisionFeedReturn {
  decisions: DecisionFeedItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  start: () => void;
  stop: () => void;
}

export function useDecisionFeed(options: UseDecisionFeedOptions = {}): UseDecisionFeedReturn {
  const { pollIntervalMs = 5000, limit = 50, autoStart = true, baseUrl } = options;
  const apiBase = baseUrl ?? (typeof window !== "undefined" ? "http://localhost:8787" : "http://localhost:8787");

  const [decisions, setDecisions] = useState<DecisionFeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeRef = useRef(autoStart);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/v1/feed?limit=${limit}`);
      if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`);
      const data = (await res.json()) as { decisions: DecisionFeedItem[] };
      setDecisions(data.decisions ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Feed error");
    } finally {
      setLoading(false);
    }
  }, [apiBase, limit]);

  const start = useCallback(() => {
    activeRef.current = true;
    if (pollingRef.current) return;
    void refresh();
    pollingRef.current = setInterval(() => void refresh(), pollIntervalMs);
  }, [refresh, pollIntervalMs]);

  const stop = useCallback(() => {
    activeRef.current = false;
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (autoStart) start();
    return stop;
  }, [autoStart, start, stop]);

  return { decisions, loading, error, refresh, start, stop };
}
