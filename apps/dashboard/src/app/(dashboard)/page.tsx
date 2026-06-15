"use client";

import { useState } from "react";
import type { DecisionRecord } from "@/lib/types";
import { LiveFeed } from "@/components/LiveFeed";
import { RiskBreakdownPanel } from "@/components/RiskBreakdownPanel";
import { ComposableQueryWidget } from "@/components/ComposableQueryWidget";
import { Leaderboard } from "@/components/Leaderboard";
import { ByrealIntegrationPanel } from "@/components/ByrealIntegrationPanel";
import { PageTransition } from "@/components/shared/PageTransition";
import { MOCK_DECISIONS } from "@/lib/mock-data";

export default function HomePage() {
  const [selected, setSelected] = useState<DecisionRecord | null>(MOCK_DECISIONS[0]);

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Live <span className="text-gradient">Decision Feed</span>
          </h1>
          <p className="mt-2 text-text-muted">
            Real-time DecisionRecorded events from Mantle Sepolia — every allow and block
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <LiveFeed onSelect={setSelected} selectedId={selected?.id} />
          </div>
          <div className="space-y-6 lg:col-span-2">
            {selected?.riskBreakdown ? (
              <RiskBreakdownPanel breakdown={selected.riskBreakdown} totalScore={selected.riskScore} />
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-text-dim">
                Select a decision to view risk math
              </div>
            )}
            <ComposableQueryWidget />
            <ByrealIntegrationPanel decision={selected} />
          </div>
        </div>

        <Leaderboard />
      </div>
    </PageTransition>
  );
}
