import { NextResponse } from "next/server";

const MOCK_SCORES: Record<string, object> = {
  "agent-risky-001": { agentId: "agent-risky-001", riskScore: 58, violationCount: 4, verifiedTier: "verified", decisionCount: 47, erc8004Score: 74 },
  "agent-safe-002": { agentId: "agent-safe-002", riskScore: 22, violationCount: 0, verifiedTier: "gold", decisionCount: 63, erc8004Score: 91 },
  "agent-balanced-003": { agentId: "agent-balanced-003", riskScore: 35, violationCount: 1, verifiedTier: "verified", decisionCount: 55, erc8004Score: 82 },
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const score = MOCK_SCORES[id];

  if (!score) {
    return NextResponse.json({
      agentId: id,
      riskScore: 50,
      violationCount: 0,
      verifiedTier: "none",
      decisionCount: 0,
      erc8004Score: 0,
    });
  }

  return NextResponse.json(score);
}
