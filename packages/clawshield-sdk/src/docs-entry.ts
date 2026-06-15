/**
 * @packageDocumentation
 * ClawShield SDK — guard autonomous agent actions before they touch money.
 *
 * @example
 * ```ts
 * import { ClawShield } from "@clawshield/sdk";
 * import { DEFAULT_POLICY } from "@clawshield/core";
 *
 * const shield = new ClawShield({ agentId: "my-agent", policy: DEFAULT_POLICY });
 * const result = await shield.guard({ type: "swap", tokenIn: "USDC", tokenOut: "SOL", amountUsd: 100, slippageBps: 50 });
 * if (result.verdict !== "BLOCK") await shield.executeIfAllowed(result);
 * ```
 *
 * @module @clawshield/sdk
 */

export { ClawShield, guard } from "./index.js";
export { evaluatePolicy } from "@clawshield/core";
export { clawshieldExpressMiddleware, clawshieldFastifyHook } from "./middleware.js";
export type { ClawShieldConfig, ExecuteResult, DemoCapture } from "./index.js";
export type { GuardMiddlewareOptions } from "./middleware.js";
