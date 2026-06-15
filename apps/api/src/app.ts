import Fastify from "fastify";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { resolve } from "node:path";
import { evaluatePolicy, DEFAULT_POLICY, explainVerdict } from "@clawshield/core";
import { openDatabase, runMigrations, QueryLayer } from "@clawshield/indexer";
import {
  guardRequestSchema,
  historyQuerySchema,
  policyUpdateSchema,
  verifyRequestSchema,
} from "./schemas.js";
import { dispatchBlockWebhook, mergePolicy, policyHash, type WebhookConfig } from "./webhooks.js";

const startTime = Date.now();
let requestCount = 0;
let blockCount = 0;

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
      transport:
        process.env.NODE_ENV === "development"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
    },
  });

  const dbPath = process.env.INDEXER_DB_PATH ?? resolve(process.cwd(), "data", "clawshield.db");
  const db = openDatabase(dbPath);
  runMigrations(db);
  const query = new QueryLayer(db);

  const webhook: WebhookConfig = {
    url: process.env.WEBHOOK_URL ?? "",
    secret: process.env.WEBHOOK_SECRET,
    enabled: process.env.WEBHOOK_ENABLED === "true",
  };

  await app.register(rateLimit, {
    max: Number(process.env.RATE_LIMIT_MAX ?? 100),
    timeWindow: process.env.RATE_LIMIT_WINDOW ?? "1 minute",
  });

  await app.register(swagger, {
    openapi: {
      openapi: "3.0.3",
      info: {
        title: "ClawShield API",
        description: "Guard, reputation, and policy API for autonomous money-touching agents",
        version: "1.0.0",
      },
      tags: [
        { name: "guard", description: "Policy guard checks" },
        { name: "agents", description: "Agent reputation and history" },
        { name: "policy", description: "Per-agent policy management" },
        { name: "system", description: "Health and metrics" },
      ],
    },
  });

  await app.register(swaggerUi, { routePrefix: "/docs" });

  app.addHook("onResponse", async () => {
    requestCount += 1;
  });

  // POST /v1/guard
  app.post("/v1/guard", {
    schema: {
      tags: ["guard"],
      summary: "Run guard check on a proposed action",
      body: {
        type: "object",
        required: ["action"],
        properties: {
          action: { type: "object" },
          agentId: { type: "string" },
          policy: { type: "object" },
        },
      },
    },
  }, async (req, reply) => {
    const parsed = guardRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Validation failed", details: parsed.error.flatten() });
    }

    const { action, agentId, policy, portfolioUsd, poolLiquidityUsd, dailySpendUsd } = parsed.data;
    const mergedPolicy = mergePolicy(policy);

    const result = evaluatePolicy(action, mergedPolicy, {
      portfolioUsd: portfolioUsd ?? 10_000,
      poolLiquidityUsd,
      dailySpendUsd,
    });

    if (result.verdict === "BLOCK") {
      blockCount += 1;
      void dispatchBlockWebhook(webhook, {
        agentId,
        decisionHash: result.decisionHash,
        riskScore: result.riskScore,
        reasonCodes: result.reasonCodes,
        action,
      });
    }

    return {
      agentId,
      ...result,
      explanation: explainVerdict(result.verdict, result.reasonCodes, result.riskScore, action.type),
    };
  });

  // GET /v1/agents/:id/score
  app.get<{ Params: { id: string } }>("/v1/agents/:id/score", {
    schema: { tags: ["agents"], summary: "Composable reputation score for an agent" },
  }, async (req) => {
    const stats = query.getAgentStats(req.params.id);
    const feedback = db.prepare(`SELECT AVG(score) as avg FROM feedback WHERE agent_id = ?`).get(req.params.id) as
      | { avg: number | null }
      | undefined;

    const safetyScore = Math.max(0, 100 - stats.avgRiskScore);
    const violationPenalty = stats.criticalViolations * 5;
    const composableScore = Math.max(0, Math.round(safetyScore - violationPenalty + (feedback?.avg ?? 0) * 0.2));

    return {
      agentId: req.params.id,
      composableScore,
      riskScore: stats.avgRiskScore,
      violationCount: stats.criticalViolations,
      decisionCount: stats.totalActions,
      erc8004Score: Math.round(feedback?.avg ?? 0),
      verifiedTier: composableScore >= 80 ? "verified" : composableScore >= 60 ? "none" : "none",
      blocks: stats.blocks,
      allows: stats.allows,
      warnings: stats.warnings,
    };
  });

  // GET /v1/agents/:id/history
  app.get<{ Params: { id: string }; Querystring: Record<string, string> }>(
    "/v1/agents/:id/history",
    { schema: { tags: ["agents"], summary: "Paginated decision history" } },
    async (req) => {
      const q = historyQuerySchema.parse(req.query);
      const decisions = query.getAgentHistory({
        agentId: req.params.id,
        offset: q.offset,
        limit: q.limit,
        verdict: q.verdict,
      });
      const total = query.getDecisionCount(req.params.id);
      return { agentId: req.params.id, total, offset: q.offset, limit: q.limit, decisions };
    }
  );

  // GET /v1/agents/:id/stats
  app.get<{ Params: { id: string } }>("/v1/agents/:id/stats", {
    schema: { tags: ["agents"], summary: "Aggregated agent statistics" },
  }, async (req) => {
    return query.getAgentStats(req.params.id);
  });

  // POST /v1/agents/:id/verify
  app.post<{ Params: { id: string } }>("/v1/agents/:id/verify", {
    schema: { tags: ["agents"], summary: "Trigger verification eligibility check" },
  }, async (req, reply) => {
    const body = verifyRequestSchema.safeParse(req.body ?? {});
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    const stats = query.getAgentStats(req.params.id);
    const eligible =
      stats.totalActions >= 10 &&
      stats.criticalViolations === 0 &&
      stats.avgRiskScore < 40 &&
      stats.blocks / Math.max(stats.totalActions, 1) < 0.3;

    return {
      agentId: req.params.id,
      eligible,
      tier: eligible ? "verified" : "none",
      criteria: {
        minActions: 10,
        maxCriticalViolations: 0,
        maxAvgRisk: 40,
        actual: stats,
      },
      force: body.data.force,
    };
  });

  // GET /v1/policy/:agentId
  app.get<{ Params: { agentId: string } }>("/v1/policy/:agentId", {
    schema: { tags: ["policy"], summary: "Get agent policy configuration" },
  }, async (req, reply) => {
    const stored = query.getPolicy(req.params.agentId);
    if (!stored) {
      return { agentId: req.params.agentId, policy: DEFAULT_POLICY, policyHash: policyHash(DEFAULT_POLICY), source: "default" };
    }
    return {
      agentId: req.params.agentId,
      policy: JSON.parse(stored.policyJson),
      policyHash: stored.policyHash,
      updatedAt: stored.updatedAt,
      source: "stored",
    };
  });

  // PUT /v1/policy/:agentId
  app.put<{ Params: { agentId: string } }>("/v1/policy/:agentId", {
    schema: { tags: ["policy"], summary: "Update agent policy configuration" },
  }, async (req, reply) => {
    const parsed = policyUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Validation failed", details: parsed.error.flatten() });
    }
    const hash = policyHash(parsed.data);
    query.upsertPolicy(req.params.agentId, JSON.stringify(parsed.data), hash);
    return { agentId: req.params.agentId, policy: parsed.data, policyHash: hash, updated: true };
  });

  // GET /v1/health
  app.get("/v1/health", {
    schema: { tags: ["system"], summary: "Health check" },
  }, async () => ({
    status: "ok",
    uptimeSec: Math.floor((Date.now() - startTime) / 1000),
    indexedDecisions: query.getDecisionCount(),
    db: dbPath,
  }));

  // GET /v1/metrics
  app.get("/v1/metrics", {
    schema: { tags: ["system"], summary: "Prometheus-style metrics" },
  }, async () => {
    const total = query.getDecisionCount();
    const lines = [
      `# HELP clawshield_requests_total Total API requests`,
      `# TYPE clawshield_requests_total counter`,
      `clawshield_requests_total ${requestCount}`,
      `# HELP clawshield_blocks_total Total BLOCK verdicts served`,
      `# TYPE clawshield_blocks_total counter`,
      `clawshield_blocks_total ${blockCount}`,
      `# HELP clawshield_decisions_indexed Total indexed decisions`,
      `# TYPE clawshield_decisions_indexed gauge`,
      `clawshield_decisions_indexed ${total}`,
      `# HELP clawshield_uptime_seconds Process uptime`,
      `# TYPE clawshield_uptime_seconds gauge`,
      `clawshield_uptime_seconds ${Math.floor((Date.now() - startTime) / 1000)}`,
    ];
    return lines.join("\n") + "\n";
  });

  // Feed endpoint for dashboard
  app.get("/v1/feed", {
    schema: { tags: ["agents"], summary: "Recent decisions feed" },
  }, async (req) => {
    const limit = Number((req.query as { limit?: string }).limit ?? 50);
    return { decisions: query.getRecentDecisions(limit) };
  });

  app.addHook("onClose", async () => {
    db.close();
  });

  return app;
}
