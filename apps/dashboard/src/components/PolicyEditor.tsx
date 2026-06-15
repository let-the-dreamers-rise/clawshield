"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_POLICY,
  evaluatePolicy,
  type ActionType,
  type PolicyConfig,
} from "@clawshield/core/browser";
import { REASON_LABELS } from "@/lib/types";
import { RiskBreakdownPanel } from "./RiskBreakdownPanel";
import { VerdictBadge } from "./VerdictBadge";

interface PreviewScenario {
  label: string;
  type: ActionType;
  tokenIn: string;
  tokenOut: string;
  amountUsd: number;
  slippageBps: number;
  poolLiquidityUsd: number;
  priceImpactPct: number;
  poolRiskScore: number;
}

const PRESETS: PreviewScenario[] = [
  {
    label: "Risky full-balance swap",
    type: "swap",
    tokenIn: "SOL",
    tokenOut: "MEME",
    amountUsd: 8500,
    slippageBps: 250,
    poolLiquidityUsd: 12000,
    priceImpactPct: 42,
    poolRiskScore: 75,
  },
  {
    label: "Safe USDC swap",
    type: "swap",
    tokenIn: "SOL",
    tokenOut: "USDC",
    amountUsd: 500,
    slippageBps: 50,
    poolLiquidityUsd: 2500000,
    priceImpactPct: 0.5,
    poolRiskScore: 5,
  },
  {
    label: "Thin pool LP",
    type: "lp_open",
    tokenIn: "SOL",
    tokenOut: "USDC",
    amountUsd: 3000,
    slippageBps: 100,
    poolLiquidityUsd: 8000,
    priceImpactPct: 15,
    poolRiskScore: 55,
  },
];

export function PolicyEditor() {
  const [policy, setPolicy] = useState<PolicyConfig>({ ...DEFAULT_POLICY });
  const [allowlistInput, setAllowlistInput] = useState(DEFAULT_POLICY.allowlist.join(", "));
  const [preview, setPreview] = useState(PRESETS[0]);

  const result = useMemo(() => {
    const portfolioUsd = 10000;
    return evaluatePolicy(
      {
        type: preview.type,
        tokenIn: preview.tokenIn,
        tokenOut: preview.tokenOut,
        amountUsd: preview.amountUsd,
        slippageBps: preview.slippageBps,
      },
      policy,
      {
        portfolioUsd,
        poolLiquidityUsd: preview.poolLiquidityUsd,
        priceImpactPct: preview.priceImpactPct,
        poolRiskScore: preview.poolRiskScore,
        dailySpendUsd: 2000,
      }
    );
  }, [policy, preview]);

  function updatePolicy(partial: Partial<PolicyConfig>) {
    setPolicy((prev) => ({ ...prev, ...partial }));
  }

  function syncAllowlist(value: string) {
    setAllowlistInput(value);
    updatePolicy({
      allowlist: value.split(",").map((s) => s.trim()).filter(Boolean),
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-surface p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Policy Configuration
          </h3>

          <div className="space-y-4">
            <Field label="Token Allowlist (comma-separated)">
              <input
                value={allowlistInput}
                onChange={(e) => syncAllowlist(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 font-mono text-sm outline-none focus:border-emerald"
              />
            </Field>

            <Field label={`Max Slippage: ${policy.maxSlippageBps} bps`}>
              <input
                type="range"
                min={10}
                max={500}
                value={policy.maxSlippageBps}
                onChange={(e) =>
                  updatePolicy({ maxSlippageBps: Number(e.target.value) })
                }
                className="w-full accent-emerald"
              />
            </Field>

            <Field label={`Max Exposure: ${policy.maxExposurePct}%`}>
              <input
                type="range"
                min={5}
                max={100}
                value={policy.maxExposurePct}
                onChange={(e) =>
                  updatePolicy({ maxExposurePct: Number(e.target.value) })
                }
                className="w-full accent-emerald"
              />
            </Field>

            <Field label={`Max Daily Spend: $${policy.maxDailySpendUsd}`}>
              <input
                type="range"
                min={100}
                max={50000}
                step={100}
                value={policy.maxDailySpendUsd}
                onChange={(e) =>
                  updatePolicy({ maxDailySpendUsd: Number(e.target.value) })
                }
                className="w-full accent-emerald"
              />
            </Field>

            <Field label={`Min Liquidity: $${policy.minLiquidityUsd.toLocaleString()}`}>
              <input
                type="range"
                min={1000}
                max={100000}
                step={1000}
                value={policy.minLiquidityUsd}
                onChange={(e) =>
                  updatePolicy({ minLiquidityUsd: Number(e.target.value) })
                }
                className="w-full accent-emerald"
              />
            </Field>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Live Preview Scenario
          </h3>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setPreview(p)}
                className={`rounded-lg border px-3 py-2 text-xs transition-all ${
                  preview.label === p.label
                    ? "border-emerald bg-emerald/10 text-emerald"
                    : "border-border text-text-muted hover:border-border-glow"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
              Would This Block?
            </h3>
            <VerdictBadge verdict={result.verdict} />
          </div>

          {result.reasonCodes.length > 0 ? (
            <ul className="space-y-2">
              {result.reasonCodes.map((code) => (
                <li
                  key={code}
                  className="flex items-center gap-2 rounded-lg bg-block/5 px-3 py-2 text-sm text-block"
                >
                  <span className="text-block">✕</span>
                  {REASON_LABELS[code] ?? code}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-emerald">
              ✓ Action passes all policy checks
            </p>
          )}
        </div>

        <RiskBreakdownPanel
          breakdown={result.breakdown}
          totalScore={result.riskScore}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs text-text-muted">{label}</label>
      {children}
    </div>
  );
}
