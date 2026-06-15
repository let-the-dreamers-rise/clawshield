"use client";

import { isContractsConfigured } from "@/lib/contracts";

export function StatusBar() {
  const live = isContractsConfigured();

  return (
    <div className="border-b border-border bg-surface/50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                live ? "bg-emerald animate-pulse-glow" : "bg-warn"
              }`}
            />
            <span className="text-text-muted">
              {live ? "Mantle Sepolia — Live" : "Mock Data Mode"}
            </span>
          </span>
          <span className="hidden text-text-dim sm:inline">|</span>
          <span className="hidden text-text-dim sm:inline">
            Chain ID 5003 · DecisionRegistry events
          </span>
        </div>
        <span className="font-mono text-text-dim">
          getClawShieldScore(agentId) → composable
        </span>
      </div>
    </div>
  );
}
