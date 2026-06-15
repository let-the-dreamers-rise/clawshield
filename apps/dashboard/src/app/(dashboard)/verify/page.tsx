"use client";

import { useState } from "react";
import { PageTransition } from "@/components/shared/PageTransition";
import { useToast } from "@/components/shared/Toast";
import { ClawShieldVerifiedBadge } from "@clawshield/ui";
import { cn } from "@/lib/utils";

const CRITERIA = [
  { id: "erc8004", label: "ERC-8004 agent identity registered on Mantle", required: true },
  { id: "guard", label: "All money-touching actions routed through guard()", required: true },
  { id: "receipts", label: "Decision receipts on Mantle for 30+ consecutive days", required: true },
  { id: "violations", label: "Zero CRITICAL policy violations", required: true },
  { id: "risk", label: "Average risk score < 40 across all decisions", required: true },
  { id: "actions", label: "At least 10 guarded actions recorded", required: true },
];

const MOCK_PROGRESS: Record<string, boolean> = {
  erc8004: true,
  guard: true,
  receipts: true,
  violations: false,
  risk: true,
  actions: true,
};

export default function VerifyPage() {
  const { toast } = useToast();
  const [agentId, setAgentId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const completed = CRITERIA.filter((c) => MOCK_PROGRESS[c.id]).length;
  const progress = Math.round((completed / CRITERIA.length) * 100);
  const eligible = completed === CRITERIA.length;

  const handleApply = async () => {
    if (!agentId.trim()) {
      toast("Enter your agent ID", "warning");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    if (eligible) {
      toast("Verification application submitted!", "success");
    } else {
      toast("Not all criteria met yet. Keep building your track record.", "warning");
    }
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            ClawShield <span className="text-gradient">Verified</span>
          </h1>
          <p className="mt-2 text-text-muted">
            Apply for the ISO-style verification badge — soulbound on Mantle
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-border bg-surface p-6">
              <h2 className="text-lg font-semibold">Verification Criteria</h2>
              <ul className="mt-4 space-y-3">
                {CRITERIA.map((c) => {
                  const met = MOCK_PROGRESS[c.id];
                  return (
                    <li key={c.id} className="flex items-start gap-3">
                      <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs", met ? "bg-emerald/20 text-emerald" : "bg-surface-elevated text-text-dim")}>
                        {met ? "✓" : "○"}
                      </span>
                      <span className={cn("text-sm", met ? "text-text" : "text-text-muted")}>{c.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6">
              <h2 className="text-lg font-semibold">Apply for Verification</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-sm text-text-muted">Agent ID</label>
                  <input
                    type="text"
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    placeholder="agent-your-id-001"
                    className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm"
                  />
                </div>
                <button
                  onClick={handleApply}
                  disabled={submitting}
                  className="rounded-lg bg-emerald px-6 py-2.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-surface p-6 text-center">
              <div className="relative mx-auto h-32 w-32">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-border" />
                  <circle
                    cx="50" cy="50" r="42" fill="none" stroke="#10b981" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (progress / 100) * 264}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-emerald">{progress}%</span>
                  <span className="text-xs text-text-dim">Complete</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-text-muted">
                {completed} of {CRITERIA.length} criteria met
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6">
              <h3 className="text-sm font-semibold text-text-muted">Badge Tiers</h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <ClawShieldVerifiedBadge tier="verified" />
                  <span className="text-xs text-text-dim">30+ days</span>
                </div>
                <div className="flex items-center justify-between">
                  <ClawShieldVerifiedBadge tier="gold" />
                  <span className="text-xs text-text-dim">90+ days</span>
                </div>
                <div className="flex items-center justify-between">
                  <ClawShieldVerifiedBadge tier="enterprise" />
                  <span className="text-xs text-text-dim">Audit passed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
