import { DASHBOARD_URL, GITHUB_URL, MANTLESCAN_URL } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-lg font-bold text-gradient">ClawShield</p>
            <p className="mt-2 text-sm text-text-muted">
              The ISO standard for agents that touch money.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-dim">Links</p>
            <ul className="mt-3 space-y-2 text-sm text-text-muted">
              <li><a href={DASHBOARD_URL} className="hover:text-emerald">Dashboard Demo</a></li>
              <li><a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-emerald">GitHub</a></li>
              <li><a href={MANTLESCAN_URL} target="_blank" rel="noopener noreferrer" className="hover:text-emerald">Mantlescan</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-dim">Built for</p>
            <p className="mt-3 text-sm text-text-muted">
              Mantle AI Hackathon · Agentic Economy Track
            </p>
            <p className="mt-1 text-xs text-text-dim">#MantleAIHackathon</p>
          </div>
        </div>
        <p className="mt-8 border-t border-border pt-8 text-center text-xs text-text-dim">
          © {new Date().getFullYear()} ClawShield. Open source.
        </p>
      </div>
    </footer>
  );
}
