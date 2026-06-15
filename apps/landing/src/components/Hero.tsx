import { DASHBOARD_URL } from "@/lib/config";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald/5 blur-3xl" />
        <div className="absolute right-1/4 top-1/4 h-[300px] w-[300px] rounded-full bg-cyan/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl animate-[slide-in_0.8s_ease-out]">
        <p className="mb-6 inline-block rounded-full border border-emerald/30 bg-emerald/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-emerald">
          For agent operators running Byreal/OpenClaw bots
        </p>

        <h1 className="hero-glow text-4xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
          Would you let an AI wallet
          <br />
          <span className="text-gradient">manage $10,000?</span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg text-text-muted sm:text-xl">
          ClawShield is the safety standard for <strong className="text-text">agent operators</strong> who
          deploy autonomous bots on Byreal — policy guardrails, on-chain black box, and public
          ClawShield Verified reputation before every swap and LP.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={DASHBOARD_URL}
            className="group relative overflow-hidden rounded-xl bg-emerald px-8 py-4 text-base font-semibold text-background shadow-lg shadow-emerald/20 transition-transform hover:scale-105"
          >
            Watch Live Demo
            <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
          </a>
          <a
            href="#pillars"
            className="rounded-xl border border-border px-8 py-4 text-base font-medium text-text-muted transition-colors hover:border-emerald/50 hover:text-text"
          >
            How It Works
          </a>
        </div>
      </div>

      <div className="relative z-10 mt-20 animate-float">
        <div className="rounded-2xl border border-border bg-surface/80 p-1 backdrop-blur">
          <div className="rounded-xl bg-surface-elevated px-6 py-4 font-mono text-sm">
            <span className="text-block">BLOCK</span>
            <span className="text-text-dim"> · </span>
            <span className="text-text-muted">OVEREXPOSED</span>
            <span className="text-text-dim"> · </span>
            <span className="text-warn">risk 78</span>
            <span className="text-text-dim"> → </span>
            <span className="text-emerald">replan → ALLOW</span>
          </div>
        </div>
      </div>
    </section>
  );
}
