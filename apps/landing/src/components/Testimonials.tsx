const TESTIMONIALS = [
  {
    quote: "ClawShield blocked a full-balance swap into an illiquid token. Our agent replanned autonomously and saved the treasury.",
    author: "Alex Chen",
    role: "Head of Agent Ops, DeFi Protocol",
    avatar: "AC",
  },
  {
    quote: "The Verified badge is exactly what marketplaces need. We filter agents by getClawShieldScore() before listing.",
    author: "Sarah Kim",
    role: "Product Lead, Agent Marketplace",
    avatar: "SK",
  },
  {
    quote: "Every decision on Mantle gives us audit-grade transparency. Enterprise buyers finally trust autonomous agents.",
    author: "Marcus Webb",
    role: "CTO, Treasury Management Co",
    avatar: "MW",
  },
];

export function Testimonials() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold">
          What builders <span className="text-gradient">are saying</span>
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.author}
              className="rounded-xl border border-border bg-surface p-6"
            >
              <p className="text-sm leading-relaxed text-text-muted">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald/10 text-sm font-bold text-emerald">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.author}</p>
                  <p className="text-xs text-text-dim">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
