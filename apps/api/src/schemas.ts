import { z } from "zod";

export const guardRequestSchema = z.object({
  action: z.object({
    type: z.enum(["swap", "lp_open", "lp_close", "transfer", "payment"]),
    tokenIn: z.string().min(1),
    tokenOut: z.string().min(1),
    amountUsd: z.number().positive(),
    slippageBps: z.number().int().min(0).max(10_000).default(50),
    poolAddress: z.string().optional(),
  }),
  agentId: z.string().min(1).default("agent-1"),
  policy: z
    .object({
      allowlist: z.array(z.string()).optional(),
      blocklist: z.array(z.string()).optional(),
      maxSlippageBps: z.number().optional(),
      maxExposurePct: z.number().optional(),
      maxDailySpendUsd: z.number().optional(),
      minLiquidityUsd: z.number().optional(),
      warnRiskThreshold: z.number().optional(),
      blockRiskThreshold: z.number().optional(),
      riskWeights: z
        .object({
          priceImpact: z.number().optional(),
          slippage: z.number().optional(),
          liquidity: z.number().optional(),
          exposure: z.number().optional(),
          poolRisk: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
  portfolioUsd: z.number().positive().optional(),
  poolLiquidityUsd: z.number().optional(),
  dailySpendUsd: z.number().min(0).optional(),
});

export const policyUpdateSchema = z.object({
  allowlist: z.array(z.string()),
  blocklist: z.array(z.string()).default([]),
  maxSlippageBps: z.number().int().min(0).max(10_000),
  maxExposurePct: z.number().min(0).max(100),
  maxDailySpendUsd: z.number().positive(),
  minLiquidityUsd: z.number().min(0),
  warnRiskThreshold: z.number().min(0).max(100).default(50),
  blockRiskThreshold: z.number().min(0).max(100).default(70),
  riskWeights: z
    .object({
      priceImpact: z.number(),
      slippage: z.number(),
      liquidity: z.number(),
      exposure: z.number(),
      poolRisk: z.number(),
    })
    .optional(),
});

export const historyQuerySchema = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  verdict: z.coerce.number().int().min(0).max(2).optional(),
});

export const verifyRequestSchema = z.object({
  force: z.boolean().default(false),
});

export type GuardRequest = z.infer<typeof guardRequestSchema>;
export type PolicyUpdate = z.infer<typeof policyUpdateSchema>;
