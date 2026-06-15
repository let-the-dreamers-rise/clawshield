import { NextResponse } from "next/server";
import { evaluatePolicy } from "@clawshield/core/browser";
import type { PolicyConfig, ProposedAction } from "@clawshield/core";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action as ProposedAction;
    const policy = body.policy as PolicyConfig | undefined;

    if (!action?.type || action.amountUsd == null || !action.tokenIn || !action.tokenOut) {
      return NextResponse.json({ error: "Invalid action payload" }, { status: 400 });
    }

    const result = evaluatePolicy(action, policy);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Guard evaluation failed" },
      { status: 500 }
    );
  }
}
