/**
 * Example: useDecisionFeed — live decision stream from the indexer-backed API
 */
import { useDecisionFeed } from "@clawshield/react";

export function DecisionFeedExample() {
  const { decisions, loading, error } = useDecisionFeed({
    baseUrl: process.env.CLAWSHIELD_API_URL ?? "http://localhost:8787",
    limit: 20,
    pollIntervalMs: 10_000,
  });

  if (loading && decisions.length === 0) return <p>Loading feed…</p>;
  if (error) return <p role="alert">{error}</p>;

  return (
    <ul>
      {decisions.map((d) => (
        <li key={d.id}>
          <strong>{d.agentId}</strong> — {d.verdict} (risk {d.riskScore})
        </li>
      ))}
    </ul>
  );
}
