const pillars = [
  {
    id: "guard",
    title: "Guard",
    subtitle: "Policy + Simulation",
    description:
      "Every money-touching action passes through guard() — policy checks, risk scoring, and simulation before execution. Block, warn, or allow with structured reason codes agents can replan on.",
    icon: "🛡️",
    accent: "from-emerald/20 to-emerald/5 border-emerald/30",
  },
  {
    id: "blackbox",
    title: "Black Box",
    subtitle: "Decision Registry on Mantle",
    description:
      "Every decision — allow AND block — writes a permanent receipt to Mantle Sepolia. Decision hashes, risk scores, reason codes, and execution refs. Full audit trail on-chain.",
    icon: "📦",
    accent: "from-cyan/20 to-cyan/5 border-cyan/30",
  },
  {
    id: "verified",
    title: "ClawShield Verified",
    subtitle: "Soulbound Badge Tiers",
    description:
      "Agents earn ISO-style verification badges marketplaces filter on. Verified, Gold, Enterprise — soulbound, expiring, renewable. Public criteria, not a memecoin.",
    icon: "✓",
    accent: "from-amber-500/20 to-amber-500/5 border-amber-500/30",
  },
];

export function Pillars() {
  return (
    <section id="pillars" className="border-t border-border py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Three pillars. <span className="text-gradient">One standard.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-text-muted">
            Not middleware — infrastructure for the agentic economy
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div
              key={pillar.id}
              className={`group rounded-2xl border bg-gradient-to-b p-8 transition-transform hover:-translate-y-1 ${pillar.accent}`}
            >
              <span className="text-3xl">{pillar.icon}</span>
              <h3 className="mt-4 text-xl font-bold">{pillar.title}</h3>
              <p className="text-sm font-medium text-emerald">{pillar.subtitle}</p>
              <p className="mt-4 text-sm leading-relaxed text-text-muted">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
