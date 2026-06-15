import Link from "next/link";
import { DASHBOARD_URL, GITHUB_URL } from "@/lib/config";

const ENDPOINTS = [
  { method: "POST", path: "/api/guard", desc: "Evaluate an action against policy and return verdict" },
  { method: "GET", path: "/api/agents/:id/score", desc: "Get composable ClawShield score for an agent" },
  { method: "VIEW", path: "getClawShieldScore(agentId)", desc: "On-chain reputation read via ReputationReader" },
  { method: "VIEW", path: "isVerified(agentId)", desc: "Check soulbound badge tier and expiry" },
];

export default function DevelopersPage() {
  return (
    <main className="pt-24 pb-20">
      <div className="mx-auto max-w-4xl px-6">
        <h1 className="text-4xl font-bold md:text-5xl">
          Developer <span className="text-gradient">resources</span>
        </h1>
        <p className="mt-4 text-lg text-text-muted">
          SDK, React hooks, API reference, and OpenClaw skill — integrate safety from the monorepo
        </p>

        <section className="mt-12 rounded-xl border border-border bg-surface p-6">
          <h2 className="text-xl font-semibold">Install from monorepo</h2>
          <p className="mt-2 text-sm text-text-dim">
            Packages are pnpm workspace modules — not on npm yet (publish planned post-hackathon).
            Clone the repo, install, and build; then import via workspace names like{" "}
            <code className="text-emerald">@clawshield/sdk</code>.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-background p-4 font-mono text-sm text-text-muted">
{`git clone ${GITHUB_URL}.git
cd clawshield
pnpm install
pnpm build

# OpenClaw skill (local path — skill.manifest.json in packages/openclaw-skill/)
npx skills add ./packages/openclaw-skill`}
          </pre>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Guard SDK</h2>
          <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface p-4 font-mono text-sm text-text-muted">
{`import { ClawShield } from "@clawshield/sdk";
import { DEFAULT_POLICY } from "@clawshield/core";

const shield = new ClawShield({
  agentId: "my-agent",
  policy: DEFAULT_POLICY,
  portfolioUsd: 10_000,
  demoMode: true,
});

const result = await shield.guard({
  type: "swap",
  tokenIn: "USDC",
  tokenOut: "SOL",
  amountUsd: 50,
  slippageBps: 50,
});

if (result.verdict === "BLOCK") {
  console.log(result.reasonCodes);
} else {
  const exec = await shield.executeIfAllowed(result);
  console.log(exec.execTxRef, exec.mantleTxHash);
}`}
          </pre>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">React Hooks</h2>
          <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface p-4 font-mono text-sm text-text-muted">
{`import { useGuard, useAgentScore } from "@clawshield/react";

const { guard, result, loading } = useGuard({
  baseUrl: "http://localhost:3000",
  policy: DEFAULT_POLICY,
});

await guard({
  type: "swap",
  tokenIn: "USDC",
  tokenOut: "SOL",
  amountUsd: 200,
  slippageBps: 30,
});

const { score } = useAgentScore({
  agentId: "agent-001",
  baseUrl: "http://localhost:3000",
  pollInterval: 30_000,
});`}
          </pre>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">API Reference</h2>
          <div className="mt-4 space-y-3">
            {ENDPOINTS.map((ep) => (
              <div key={ep.path} className="flex flex-wrap items-start gap-3 rounded-lg border border-border bg-surface p-4">
                <span className={`rounded px-2 py-0.5 font-mono text-xs ${
                  ep.method === "POST" ? "bg-cyan/10 text-cyan" :
                  ep.method === "GET" ? "bg-emerald/10 text-emerald" :
                  "bg-warn/10 text-warn"
                }`}>
                  {ep.method}
                </span>
                <div>
                  <code className="text-sm text-text">{ep.path}</code>
                  <p className="mt-1 text-sm text-text-dim">{ep.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-xl border border-emerald/20 bg-emerald/5 p-6">
          <h2 className="text-xl font-semibold text-emerald">OpenClaw Skill</h2>
          <p className="mt-2 text-sm text-text-muted">
            After cloning and building the repo, install the skill from{" "}
            <code className="text-emerald">packages/openclaw-skill/</code> (manifest at{" "}
            <code className="text-emerald">skill.manifest.json</code>). It intercepts money-touching
            actions, runs policy + simulation, and writes receipts to Mantle.
          </p>
          <pre className="mt-4 font-mono text-sm text-emerald">npx skills add ./packages/openclaw-skill</pre>
        </section>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link href={DASHBOARD_URL + "/docs"} className="rounded-lg bg-emerald px-6 py-3 text-sm font-semibold text-background hover:opacity-90">
            Full SDK Docs
          </Link>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-text-muted hover:bg-surface">
            GitHub
          </a>
        </div>
      </div>
    </main>
  );
}
