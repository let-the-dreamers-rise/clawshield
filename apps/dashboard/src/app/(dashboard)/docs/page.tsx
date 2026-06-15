"use client";

import { useState } from "react";
import { PageTransition } from "@/components/shared/PageTransition";
import { cn } from "@/lib/utils";
import { GITHUB_URL } from "@/lib/config";

const TABS = ["guard", "hooks", "api"] as const;
type Tab = (typeof TABS)[number];

const INSTALL_SNIPPET = `# Clone the monorepo (packages are not on npm yet)
git clone ${GITHUB_URL}.git
cd clawshield
pnpm install
pnpm build

# Packages are pnpm workspace modules; npm publish coming post-hackathon.
# In this repo, import via workspace names, e.g. "@clawshield/sdk".

# OpenClaw skill — install from repo path (skill.manifest.json)
npx skills add ./packages/openclaw-skill`;

const CODE_EXAMPLES: Record<Tab, { title: string; lang: string; code: string }[]> = {
  guard: [
    {
      title: "ClawShield class — guard + execute pipeline",
      lang: "typescript",
      code: `import { ClawShield } from "@clawshield/sdk";
import { DEFAULT_POLICY } from "@clawshield/core";

const shield = new ClawShield({
  agentId: "my-agent",
  policy: DEFAULT_POLICY,
  portfolioUsd: 10_000,
  demoMode: true, // replays demo-capture.json without live keys
});

const action = {
  type: "swap" as const,
  tokenIn: "USDC",
  tokenOut: "SOL",
  amountUsd: 50,
  slippageBps: 50,
};

const result = await shield.guard(action);

if (result.verdict === "BLOCK") {
  console.log("Blocked:", result.reasonCodes);
} else {
  const exec = await shield.executeIfAllowed(result);
  console.log("Tx:", exec.execTxRef, "Receipt:", exec.mantleTxHash);
}`,
    },
    {
      title: "Standalone guard() — policy evaluation only",
      lang: "typescript",
      code: `import { guard } from "@clawshield/sdk";
import type { PolicyConfig, ProposedAction } from "@clawshield/core";

const policy: PolicyConfig = {
  allowlist: ["USDC", "SOL", "USDT", "mSOL", "JUP"],
  blocklist: ["SCAM", "RUG"],
  maxSlippageBps: 100,
  maxExposurePct: 25,
  maxDailySpendUsd: 500,
  minLiquidityUsd: 50_000,
  warnRiskThreshold: 50,
  blockRiskThreshold: 70,
};

const action: ProposedAction = {
  type: "swap",
  tokenIn: "USDC",
  tokenOut: "SOL",
  amountUsd: 500,
  slippageBps: 50,
};

const result = await guard(action, policy, {
  portfolioUsd: 10_000,
  poolLiquidityUsd: 50_000,
});`,
    },
    {
      title: "Express middleware",
      lang: "typescript",
      code: `import express from "express";
import { clawshieldExpressMiddleware } from "@clawshield/sdk/middleware";
import { DEFAULT_POLICY } from "@clawshield/core";

const app = express();
app.use(express.json());

app.post(
  "/trade",
  clawshieldExpressMiddleware({
    policy: DEFAULT_POLICY,
    portfolioUsd: 10_000,
    onBlock: (result) => console.warn("Blocked:", result.reasonCodes),
  }),
  (req, res) => res.json({ status: "executed", action: req.body.action })
);`,
    },
  ],
  hooks: [
    {
      title: "useGuard — React hook",
      lang: "tsx",
      code: `import { useGuard } from "@clawshield/react";

function SwapButton() {
  const { guard, result, loading } = useGuard({
    baseUrl: "http://localhost:3000", // dashboard /api/guard
    policy: {
      allowlist: ["USDC", "SOL"],
      blocklist: ["SCAM", "RUG"],
      maxSlippageBps: 100,
      maxExposurePct: 25,
      maxDailySpendUsd: 500,
      minLiquidityUsd: 50_000,
      warnRiskThreshold: 50,
      blockRiskThreshold: 70,
    },
  });

  const handleSwap = async () => {
    const res = await guard({
      type: "swap",
      tokenIn: "USDC",
      tokenOut: "SOL",
      amountUsd: 200,
      slippageBps: 30,
    });
    if (res.verdict === "ALLOW") {
      // proceed with execution
    }
  };

  return (
    <button onClick={handleSwap} disabled={loading}>
      {result?.verdict ?? "Guard Swap"}
    </button>
  );
}`,
    },
    {
      title: "useAgentScore — reputation hook",
      lang: "tsx",
      code: `import { useAgentScore } from "@clawshield/react";
import { ClawShieldVerifiedBadge } from "@clawshield/ui";

function AgentCard({ agentId }: { agentId: string }) {
  const { score, loading } = useAgentScore({
    agentId,
    baseUrl: "http://localhost:3000",
    pollInterval: 30_000,
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <ClawShieldVerifiedBadge tier={score?.verifiedTier ?? "none"} />
      <p>Risk: {score?.riskScore}/100</p>
      <p>Violations: {score?.violationCount}</p>
    </div>
  );
}`,
    },
  ],
  api: [
    {
      title: "POST /api/guard",
      lang: "bash",
      code: `curl -X POST http://localhost:3000/api/guard \\
  -H "Content-Type: application/json" \\
  -d '{
    "action": {
      "type": "swap",
      "tokenIn": "USDC",
      "tokenOut": "SOL",
      "amountUsd": 1000,
      "slippageBps": 50
    }
  }'`,
    },
    {
      title: "GET /api/agents/:id/score",
      lang: "bash",
      code: `curl http://localhost:3000/api/agents/agent-safe-002/score

# Response:
{
  "agentId": "agent-safe-002",
  "riskScore": 22,
  "violationCount": 0,
  "verifiedTier": "gold",
  "decisionCount": 63,
  "erc8004Score": 91
}`,
    },
    {
      title: "On-chain: getClawShieldScore",
      lang: "solidity",
      code: `// ClawShieldReputationReader on Mantle Sepolia
function getClawShieldScore(bytes32 agentId) external view returns (
  uint256 riskScore,
  uint256 violationCount,
  uint8 verifiedTier,
  uint256 decisionCount,
  uint256 erc8004Score
);`,
    },
  ],
};

export default function DocsPage() {
  const [tab, setTab] = useState<Tab>("guard");
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            SDK <span className="text-gradient">Documentation</span>
          </h1>
          <p className="mt-2 text-text-muted">
            Integrate ClawShield guard, React hooks, and reputation API
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors",
                tab === t ? "bg-emerald/10 text-emerald" : "bg-surface text-text-muted hover:text-text"
              )}
            >
              {t === "guard" ? "Guard SDK" : t === "hooks" ? "React Hooks" : "API Reference"}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {CODE_EXAMPLES[tab].map((example, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <span className="text-sm font-medium text-text">{example.title}</span>
                <button
                  onClick={() => copy(example.code, `${tab}-${i}`)}
                  className="text-xs text-text-dim hover:text-emerald"
                >
                  {copied === `${tab}-${i}` ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-sm text-text-muted">
                <code>{example.code}</code>
              </pre>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-emerald/20 bg-emerald/5 p-6">
          <h3 className="font-semibold text-emerald">Install from monorepo</h3>
          <p className="mt-2 text-sm text-text-dim">
            Packages are pnpm workspace modules — not published to npm yet (publish planned post-hackathon).
            Clone the repo and use workspace imports like <code className="text-emerald">@clawshield/sdk</code>.
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-sm text-text-muted">{INSTALL_SNIPPET}</pre>
          <button
            onClick={() => copy(INSTALL_SNIPPET, "install")}
            className="mt-3 text-xs text-text-dim hover:text-emerald"
          >
            {copied === "install" ? "Copied!" : "Copy install commands"}
          </button>
        </div>
      </div>
    </PageTransition>
  );
}
