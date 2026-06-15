import { describe, expect, it } from "vitest";
import { explainReason, explainVerdict, explainBreakdown } from "./explain.js";
import { getSeverity, maxSeverity, countBySeverity } from "./severity.js";
import { normalizeWeights, DEFAULT_RISK_WEIGHTS } from "./weights.js";

describe("explainability engine", () => {
  it("explains BLOCK with replan hints", () => {
    const result = explainVerdict("BLOCK", ["OVEREXPOSED", "SLIPPAGE_EXCEEDED"], 85, "swap");
    expect(result.summary).toContain("Blocked");
    expect(result.severity).toBe("CRITICAL");
    expect(result.replanHints.length).toBeGreaterThan(0);
  });

  it("explains individual reason codes", () => {
    expect(explainReason("THIN_LIQUIDITY")).toContain("liquidity");
  });

  it("breaks down risk components", () => {
    const lines = explainBreakdown({
      priceImpactScore: 50,
      slippageScore: 30,
      liquidityScore: 20,
      exposureScore: 40,
      poolRiskScore: 10,
      weights: DEFAULT_RISK_WEIGHTS,
    });
    expect(lines.length).toBe(5);
  });
});

describe("severity", () => {
  it("maps reason codes to severity", () => {
    expect(getSeverity("SLIPPAGE_EXCEEDED")).toBe("CRITICAL");
    expect(getSeverity("THIN_LIQUIDITY")).toBe("MEDIUM");
  });

  it("computes max severity", () => {
    expect(maxSeverity(["THIN_LIQUIDITY", "OVEREXPOSED"])).toBe("CRITICAL");
  });

  it("counts by severity", () => {
    const counts = countBySeverity(["OVEREXPOSED", "THIN_LIQUIDITY", "POLICY_VIOLATION"]);
    expect(counts.CRITICAL).toBe(1);
    expect(counts.MEDIUM).toBe(1);
  });
});

describe("weights", () => {
  it("normalizes custom weights to sum ~1", () => {
    const w = normalizeWeights({ priceImpact: 2, slippage: 2, liquidity: 2, exposure: 2, poolRisk: 2 });
    const sum = w.priceImpact + w.slippage + w.liquidity + w.exposure + w.poolRisk;
    expect(sum).toBeCloseTo(1, 2);
  });
});
