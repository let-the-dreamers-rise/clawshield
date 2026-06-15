"use client";

import { useState } from "react";
import { PageTransition } from "@/components/shared/PageTransition";
import { cn } from "@/lib/utils";

const TABS = ["guard", "hooks", "api"] as const;
type Tab = (typeof TABS)[number];

const CODE_EXAMPLES: Record<Tab, { title: string; lang: string; code: string }[]> = {
  guard: [
    {
      title: "Basic guard() usage",
      lang: "typescript",
      code: `import { guard, executeIfAllowed, writeReceipt } from "@clawshield/sdk";

const result = await guard({
  agentId: "my-agent",
  actionType: "swap",
  tokenIn: "USDC",
  tokenOut: "SOL",
  amountUsd: 500,
  slippageBps: 50,
});

if (result.verdict === "BLOCK") {
  console.log("Blocked:", result.reasonCodes);
  // Agent replans with safer parameters
} else {
  const txHash = await executeIfAllowed(result);
  const receipt = await writeReceipt(result);
}`,
    },
    {
      title: "Policy configuration",
      lang: "typescript",
      code: `import { guard } from "@clawshield/sdk";

const policy = {
  allowlist: ["USDC", "SOL", "ETH"],
  maxSlippageBps: 100,
  maxExposurePct: 25,
  maxDailySpendUsd: 5000,
  minLiquidityUsd: 50000,
};

const result = await guard(action, policy);`,
    },
  ],
  hooks: [
    {
      title: "useGuard — React hook",
      lang: "tsx",
      code: `import { useGuard } from "@clawshield/react";

function SwapButton() {
  const { guard, result, loading } = useGuard({
    policy: { maxSlippageBps: 100 },
  });

  const handleSwap = async () => {
    const res = await guard({
      agentId: "my-agent",
      actionType: "swap",
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
  const { score, loading } = useAgentScore({ agentId, pollInterval: 30000 });

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
      code: `curl -X POST https://dashboard.clawshield.xyz/api/guard \\
  -H "Content-Type: application/json" \\
  -d '{
    "action": {
      "agentId": "agent-001",
      "actionType": "swap",
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
      code: `curl https://dashboard.clawshield.xyz/api/agents/agent-safe-002/score

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
          <h3 className="font-semibold text-emerald">Quick Install</h3>
          <pre className="mt-3 font-mono text-sm text-text-muted">
            npm install @clawshield/sdk @clawshield/react @clawshield/ui
          </pre>
          <p className="mt-3 text-sm text-text-dim">
            Or add the OpenClaw skill: <code className="text-emerald">npx skills add clawshield</code>
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
