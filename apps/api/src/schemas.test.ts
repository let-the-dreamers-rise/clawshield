import { describe, expect, it } from "vitest";
import { guardRequestSchema, policyUpdateSchema } from "./schemas.js";

describe("API schemas", () => {
  it("validates guard request", () => {
    const result = guardRequestSchema.safeParse({
      action: { type: "swap", tokenIn: "USDC", tokenOut: "SOL", amountUsd: 100, slippageBps: 50 },
      agentId: "agent-1",
    });
    expect(result.success).toBe(true);
  });

  it("validates payment action type", () => {
    const result = guardRequestSchema.safeParse({
      action: { type: "payment", tokenIn: "USDC", tokenOut: "MERCHANT", amountUsd: 50, slippageBps: 0 },
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid guard request", () => {
    const result = guardRequestSchema.safeParse({ action: { type: "swap", amountUsd: -1 } });
    expect(result.success).toBe(false);
  });

  it("validates policy update", () => {
    const result = policyUpdateSchema.safeParse({
      allowlist: ["USDC", "SOL"],
      blocklist: [],
      maxSlippageBps: 100,
      maxExposurePct: 25,
      maxDailySpendUsd: 500,
      minLiquidityUsd: 50000,
    });
    expect(result.success).toBe(true);
  });
});
