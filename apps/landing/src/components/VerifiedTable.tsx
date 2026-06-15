const tiers = [
  {
    name: "Verified",
    color: "text-emerald border-emerald/30",
    criteria: [
      "30+ days of decision receipts",
      "Zero CRITICAL violations",
      "Average risk score < 40",
      "ERC-8004 identity registered",
      "10+ guarded actions recorded",
    ],
    audience: "Users, marketplaces",
  },
  {
    name: "Gold",
    color: "text-amber-400 border-amber-500/30",
    criteria: [
      "90+ days of clean history",
      "Zero violations of any kind",
      "Average risk score < 25",
      "50+ guarded actions recorded",
      "Continuous policy compliance",
    ],
    audience: "Enterprise treasuries",
  },
  {
    name: "Enterprise",
    color: "text-cyan border-cyan/30",
    criteria: [
      "Custom policy audit passed",
      "SLA attestation on file",
      "Compliance export enabled",
      "Dedicated oracle review",
      "White-label badge support",
    ],
    audience: "B2B buyers",
  },
];

export function VerifiedTable() {
  return (
    <section id="verified" className="border-t border-border bg-surface/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            ClawShield <span className="text-gradient">Verified</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-text-muted">
            Soulbound badges with public, non-negotiable criteria. Expires after 365 days — renewal requires re-audit.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-elevated text-left text-xs uppercase tracking-wider text-text-dim">
                <th className="px-6 py-4">Tier</th>
                <th className="px-6 py-4">Criteria</th>
                <th className="px-6 py-4">Who filters</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => (
                <tr key={tier.name} className="border-b border-border/50">
                  <td className="px-6 py-6 align-top">
                    <span className={`inline-flex rounded-full border px-3 py-1 font-semibold ${tier.color}`}>
                      {tier.name}
                    </span>
                  </td>
                  <td className="px-6 py-6 align-top">
                    <ul className="space-y-2 text-text-muted">
                      {tier.criteria.map((c) => (
                        <li key={c} className="flex items-start gap-2">
                          <span className="mt-0.5 text-emerald">✓</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-6 align-top text-text-muted">
                    {tier.audience}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
