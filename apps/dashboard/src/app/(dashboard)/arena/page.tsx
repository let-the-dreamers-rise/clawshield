import { Leaderboard } from "@/components/Leaderboard";
import { ComposableQueryWidget } from "@/components/ComposableQueryWidget";
import { PageTransition } from "@/components/shared/PageTransition";

export default function ArenaPage() {
  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Agent <span className="text-gradient">Arena</span>
          </h1>
          <p className="mt-2 text-text-muted">
            Multi-agent leaderboard — profit after violations, not raw PnL
          </p>
        </div>
        <Leaderboard />
        <ComposableQueryWidget />
      </div>
    </PageTransition>
  );
}
