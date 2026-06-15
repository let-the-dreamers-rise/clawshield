const streams = [
  { stream: "Verification fee (audit + badge mint)", price: "$99–499 / agent" },
  { stream: "Annual renewal", price: "$99–299 / agent" },
  { stream: "Gold tier upgrade", price: "$999+ / year" },
  { stream: "Reputation API (marketplace queries)", price: "$500–5k / month" },
  { stream: "Enterprise white-label + custom policy", price: "$5k–50k / year" },
  { stream: "Insurance / risk bond layer (Phase 2)", price: "% of covered AUM" },
];

export function BusinessModel() {
  return (
    <section id="business" className="border-t border-border bg-surface/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Business model for <span className="text-gradient">VC judges</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-text-muted">
            ClawShield Verified is infrastructure with recurring revenue — not a hackathon toy
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-elevated text-left text-xs uppercase tracking-wider text-text-dim">
                <th className="px-6 py-4">Revenue Stream</th>
                <th className="px-6 py-4">Price Range</th>
              </tr>
            </thead>
            <tbody>
              {streams.map((row) => (
                <tr key={row.stream} className="border-b border-border/50 transition-colors hover:bg-surface-elevated/50">
                  <td className="px-6 py-4 text-text-muted">{row.stream}</td>
                  <td className="px-6 py-4 font-mono text-emerald">{row.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-center text-sm text-text-dim">
          TAM: every agent marketplace, enterprise treasury, and DeFi protocol deploying autonomous agents
        </p>
      </div>
    </section>
  );
}
