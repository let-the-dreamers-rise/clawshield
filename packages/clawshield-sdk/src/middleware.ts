import type { PolicyConfig, ProposedAction } from "@clawshield/core";
import { evaluatePolicy, DEFAULT_POLICY } from "@clawshield/core";

export interface GuardMiddlewareOptions {
  policy?: PolicyConfig;
  portfolioUsd?: number;
  onBlock?: (result: ReturnType<typeof evaluatePolicy>) => void;
  apiUrl?: string;
}

export interface GuardedRequest {
  body?: {
    action?: ProposedAction;
    clawshieldAction?: ProposedAction;
  };
}

export interface GuardedResponse {
  status(code: number): GuardedResponse;
  json(body: unknown): void;
}

/**
 * Express-compatible middleware — blocks requests when guard returns BLOCK.
 */
export function clawshieldExpressMiddleware(options: GuardMiddlewareOptions = {}) {
  const policy = options.policy ?? DEFAULT_POLICY;

  return async (
    req: GuardedRequest,
    res: GuardedResponse,
    next: (err?: unknown) => void
  ) => {
    const action = req.body?.action ?? req.body?.clawshieldAction;
    if (!action) return next();

    try {
      let result;
      if (options.apiUrl) {
        const remote = await fetch(`${options.apiUrl}/v1/guard`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, policy, portfolioUsd: options.portfolioUsd }),
        });
        if (!remote.ok) {
          return res.status(502).json({ error: "ClawShield API unavailable" });
        }
        result = await remote.json();
      } else {
        result = evaluatePolicy(action, policy, { portfolioUsd: options.portfolioUsd ?? 10_000 });
      }

      if (result.verdict === "BLOCK") {
        options.onBlock?.(result);
        return res.status(403).json({
          error: "ClawShield BLOCK",
          verdict: result.verdict,
          riskScore: result.riskScore,
          reasonCodes: result.reasonCodes,
          message: result.message,
          explanation: result.explanation,
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Fastify preHandler hook factory.
 */
export function clawshieldFastifyHook(options: GuardMiddlewareOptions = {}) {
  const middleware = clawshieldExpressMiddleware(options);
  return async (request: { body?: GuardedRequest["body"] }, reply: GuardedResponse) => {
    return new Promise<void>((resolve, reject) => {
      middleware(
        { body: request.body },
        reply,
        (err) => (err ? reject(err) : resolve())
      );
    });
  };
}

export type { PolicyConfig, ProposedAction };
