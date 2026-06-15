export function SdkSection() {
  return (
    <section className="border-t border-border py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">
              One line to <span className="text-gradient">add safety</span>
            </h2>
            <p className="mt-4 text-text-muted">
              Wrap any OpenClaw or Byreal agent with the ClawShield SDK. Policy config,
              guard pipeline, receipt writing — all typed and composable.
            </p>
            <p className="mt-4 text-sm text-text-dim">
              Clone repo + <code className="text-cyan">pnpm install</code>; OpenClaw skill:{" "}
              <code className="text-cyan">npx skills add ./packages/openclaw-skill</code>
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-background">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-block/60" />
              <div className="h-3 w-3 rounded-full bg-warn/60" />
              <div className="h-3 w-3 rounded-full bg-emerald/60" />
              <span className="ml-2 text-xs text-text-dim">agent.ts</span>
            </div>
            <pre className="overflow-x-auto p-6 font-mono text-sm leading-relaxed">
              <code>
                <span className="text-text-dim">{"// Add ClawShield to any agent action\n"}</span>
                <span className="text-cyan">import</span>
                <span className="text-text">{" { ClawShield } "}</span>
                <span className="text-cyan">from</span>
                <span className="text-emerald">{' "@clawshield/sdk"'}</span>
                <span className="text-text-dim">;</span>
                {"\n\n"}
                <span className="text-cyan">const</span>
                <span className="text-text">{" shield = new ClawShield({ agentId, policy });"}{"\n"}</span>
                <span className="text-cyan">const</span>
                <span className="text-text">{" result = "}</span>
                <span className="text-cyan">await</span>
                <span className="text-text">{" shield.guard(action);"}{"\n"}</span>
                <span className="text-cyan">if</span>
                <span className="text-text">{" (result.verdict === "}</span>
                <span className="text-emerald">&apos;BLOCK&apos;</span>
                <span className="text-text">{") replan(result.reasonCodes);"}{"\n"}</span>
                <span className="text-cyan">else</span>
                <span className="text-text">{" "}</span>
                <span className="text-cyan">await</span>
                <span className="text-text">{" shield.executeIfAllowed(result);"}{"\n"}</span>
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
