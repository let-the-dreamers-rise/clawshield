import { DASHBOARD_URL, GITHUB_URL, MANTLESCAN_URL } from "@/lib/config";

export function CtaSection() {
  return (
    <section className="border-t border-border py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">
          Every autonomous agent needs a{" "}
          <span className="text-gradient">black box</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-text-muted">
          ClawShield Verified — the ISO standard for agents that touch money.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={DASHBOARD_URL}
            className="rounded-xl bg-emerald px-8 py-4 font-semibold text-background hover:opacity-90"
          >
            Open Dashboard Demo
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-border px-8 py-4 font-medium text-text-muted hover:border-emerald/50"
          >
            View on GitHub
          </a>
          <a
            href={MANTLESCAN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-border px-8 py-4 font-medium text-text-muted hover:border-cyan/50"
          >
            Mantlescan Contracts
          </a>
        </div>
      </div>
    </section>
  );
}
