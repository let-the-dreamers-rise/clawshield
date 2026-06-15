import Link from "next/link";
import { DASHBOARD_URL } from "@/lib/config";

const TIERS = [
  {
    name: "Verified",
    price: "$99",
    period: "/agent/year",
    description: "For agents entering the verified ecosystem",
    features: [
      "ClawShield Verified badge (soulbound)",
      "Decision receipt registry",
      "ERC-8004 reputation integration",
      "Public getClawShieldScore() API",
      "Dashboard agent profile",
      "30-day track record requirement",
    ],
    cta: "Apply for Verified",
    highlighted: false,
  },
  {
    name: "Gold",
    price: "$999",
    period: "/agent/year",
    description: "For enterprise treasuries and high-volume agents",
    features: [
      "Everything in Verified",
      "Gold tier badge",
      "90+ day track record",
      "Zero violation requirement",
      "Priority verification queue",
      "Compliance export (CSV/JSON)",
      "Dedicated support channel",
    ],
    cta: "Upgrade to Gold",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For B2B buyers with custom policy needs",
    features: [
      "Everything in Gold",
      "Enterprise badge + SLA attestation",
      "Custom policy audit",
      "White-label dashboard",
      "Reputation API ($500–5k/mo included)",
      "Insurance/risk bond layer (Phase 2)",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const FEATURE_MATRIX = [
  { feature: "Decision receipts on Mantle", verified: true, gold: true, enterprise: true },
  { feature: "ClawShield Verified badge", verified: true, gold: true, enterprise: true },
  { feature: "Gold tier badge", verified: false, gold: true, enterprise: true },
  { feature: "Enterprise badge + SLA", verified: false, gold: false, enterprise: true },
  { feature: "getClawShieldScore() API", verified: true, gold: true, enterprise: true },
  { feature: "Compliance export", verified: false, gold: true, enterprise: true },
  { feature: "Custom policy audit", verified: false, gold: false, enterprise: true },
  { feature: "White-label dashboard", verified: false, gold: false, enterprise: true },
  { feature: "Reputation API (monthly)", verified: false, gold: false, enterprise: true },
];

export default function PricingPage() {
  return (
    <main className="pt-24 pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold md:text-5xl">
            Simple, transparent <span className="text-gradient">pricing</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-text-muted">
            ClawShield Verified tiers scale with your agent&apos;s trust requirements
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-xl border p-8 ${
                tier.highlighted
                  ? "border-emerald/40 bg-emerald/5 shadow-lg shadow-emerald/10"
                  : "border-border bg-surface"
              }`}
            >
              {tier.highlighted && (
                <span className="mb-4 inline-block rounded-full bg-emerald/10 px-3 py-1 text-xs font-medium text-emerald">
                  Most Popular
                </span>
              )}
              <h2 className="text-2xl font-bold">{tier.name}</h2>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gradient">{tier.price}</span>
                <span className="text-sm text-text-dim">{tier.period}</span>
              </div>
              <p className="mt-3 text-sm text-text-muted">{tier.description}</p>
              <ul className="mt-6 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-text-muted">
                    <span className="mt-0.5 text-emerald">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={tier.name === "Enterprise" ? "mailto:hello@clawshield.xyz" : DASHBOARD_URL + "/verify"}
                className={`mt-8 block rounded-lg py-3 text-center text-sm font-semibold transition-opacity hover:opacity-90 ${
                  tier.highlighted
                    ? "bg-emerald text-background"
                    : "border border-border text-text hover:bg-surface-elevated"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-20">
          <h2 className="text-center text-2xl font-bold">Feature matrix</h2>
          <div className="mt-8 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface">
                <tr>
                  <th className="px-6 py-4 text-left text-text-dim">Feature</th>
                  <th className="px-6 py-4 text-center">Verified</th>
                  <th className="px-6 py-4 text-center">Gold</th>
                  <th className="px-6 py-4 text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {FEATURE_MATRIX.map((row) => (
                  <tr key={row.feature}>
                    <td className="px-6 py-3 text-text-muted">{row.feature}</td>
                    {(["verified", "gold", "enterprise"] as const).map((tier) => (
                      <td key={tier} className="px-6 py-3 text-center">
                        {row[tier] ? (
                          <span className="text-emerald">✓</span>
                        ) : (
                          <span className="text-text-dim">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
