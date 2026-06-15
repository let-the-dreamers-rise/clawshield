/**
 * Example: useAgentScore — fetch composable reputation for an agent
 */
import { useEffect } from "react";
import { useAgentScore } from "@clawshield/react";

export function AgentScoreExample({ agentId }: { agentId: string }) {
  const { score, loading, error, refresh } = useAgentScore({
    agentId,
    baseUrl: process.env.CLAWSHIELD_API_URL ?? "http://localhost:8787",
  });

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (loading) return <p>Loading score…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!score) return null;

  return (
    <dl>
      <dt>Risk score</dt>
      <dd>{score.riskScore}/100</dd>
      <dt>Violations</dt>
      <dd>{score.violationCount}</dd>
      <dt>Tier</dt>
      <dd>{score.verifiedTier}</dd>
      <dt>Decisions</dt>
      <dd>{score.decisionCount}</dd>
    </dl>
  );
}
