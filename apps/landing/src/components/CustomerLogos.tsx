const LOGOS = [
  { name: "Byreal", initials: "BR" },
  { name: "Mantle", initials: "MT" },
  { name: "OpenClaw", initials: "OC" },
  { name: "ERC-8004", initials: "E8" },
  { name: "Caladan", initials: "CL" },
  { name: "Hashed", initials: "HS" },
];

export function CustomerLogos() {
  return (
    <section className="border-y border-border/50 bg-surface/30 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-8 text-center text-sm text-text-dim">
          Trusted by builders in the agentic economy
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {LOGOS.map((logo) => (
            <div
              key={logo.name}
              className="flex items-center gap-2 text-text-dim opacity-60 transition-opacity hover:opacity-100"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-xs font-bold">
                {logo.initials}
              </div>
              <span className="text-sm font-medium">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
