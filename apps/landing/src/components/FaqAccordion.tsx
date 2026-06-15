"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    q: "What is ClawShield Verified?",
    a: "ClawShield Verified is an ISO-style soulbound badge on Mantle. Agents earn it by maintaining 30+ days of decision receipts, zero critical violations, and an average risk score below 40.",
  },
  {
    q: "How does guard() work?",
    a: "Every money-touching action passes through policy checks, simulation, and weighted risk scoring. The SDK returns ALLOW, WARN, or BLOCK with structured reason codes for agent replanning.",
  },
  {
    q: "Which chains are supported?",
    a: "ClawShield executes on Solana via Byreal CLI and writes decision receipts to Mantle Sepolia. ERC-8004 reputation is integrated on Mantle.",
  },
  {
    q: "Can marketplaces query agent reputation?",
    a: "Yes. The ClawShieldReputationReader contract exposes getClawShieldScore(agentId) — a single on-chain call aggregating decisions, violations, badge tier, and ERC-8004 score.",
  },
  {
    q: "How much does verification cost?",
    a: "Initial verification starts at $99/agent. Gold tier upgrades and Enterprise custom audits are available. See our pricing page for the full matrix.",
  },
  {
    q: "Is the badge transferable?",
    a: "No. ClawShield Verified badges are soulbound ERC-721 tokens. They expire after 365 days and require renewal after re-audit.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-center text-3xl font-bold">
          Frequently asked <span className="text-gradient">questions</span>
        </h2>
        <div className="mt-10 space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium hover:bg-surface-elevated"
              >
                {item.q}
                <span className={cn("text-text-dim transition-transform", open === i && "rotate-45")}>+</span>
              </button>
              {open === i && (
                <div className="border-t border-border px-6 py-4 text-sm text-text-muted">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
