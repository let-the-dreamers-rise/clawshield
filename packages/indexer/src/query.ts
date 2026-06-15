import type { DatabaseSync } from "node:sqlite";
import type { AgentHistoryQuery, AgentStatsRow, IndexedDecision, IndexedFeedback } from "./types.js";

function parseReasonCodes(raw: string): number[] {
  try {
    return JSON.parse(raw) as number[];
  } catch {
    return [];
  }
}

export class QueryLayer {
  constructor(private readonly db: DatabaseSync) {}

  insertDecision(row: Omit<IndexedDecision, "id" | "indexedAt">): void {
    this.db
      .prepare(
        `INSERT OR IGNORE INTO decisions
         (agent_id, decision_hash, action_type, risk_score, reason_codes, verdict, exec_tx_ref, block_number, tx_hash, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        row.agentId,
        row.decisionHash,
        row.actionType,
        row.riskScore,
        JSON.stringify(row.reasonCodes),
        row.verdict,
        row.execTxRef,
        row.blockNumber,
        row.txHash,
        row.timestamp
      );
  }

  insertFeedback(row: Omit<IndexedFeedback, "id" | "indexedAt">): void {
    this.db
      .prepare(
        `INSERT INTO feedback (agent_id, score, tag, block_number, tx_hash, timestamp)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(row.agentId, row.score, row.tag, row.blockNumber, row.txHash, row.timestamp);
  }

  getAgentHistory(query: AgentHistoryQuery): IndexedDecision[] {
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;
    let sql = `SELECT * FROM decisions WHERE agent_id = ?`;
    const params: (string | number)[] = [query.agentId];
    if (query.verdict !== undefined) {
      sql += ` AND verdict = ?`;
      params.push(query.verdict);
    }
    sql += ` ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const rows = this.db.prepare(sql).all(...params) as Array<Record<string, unknown>>;
    return rows.map(mapDecisionRow);
  }

  getAgentStats(agentId: string): AgentStatsRow {
    const row = this.db
      .prepare(
        `SELECT
           agent_id,
           COUNT(*) as total_actions,
           SUM(CASE WHEN verdict = 2 THEN 1 ELSE 0 END) as blocks,
           SUM(CASE WHEN verdict = 0 THEN 1 ELSE 0 END) as allows,
           SUM(CASE WHEN verdict = 1 THEN 1 ELSE 0 END) as warnings,
           AVG(risk_score) as avg_risk_score,
           SUM(CASE WHEN reason_codes LIKE '%0%' OR reason_codes LIKE '%2%' OR reason_codes LIKE '%3%' THEN 1 ELSE 0 END) as critical_violations,
           MAX(timestamp) as last_decision_at
         FROM decisions WHERE agent_id = ?`
      )
      .get(agentId) as Record<string, unknown> | undefined;

    if (!row || row.total_actions === 0) {
      return {
        agentId,
        totalActions: 0,
        blocks: 0,
        allows: 0,
        warnings: 0,
        avgRiskScore: 0,
        criticalViolations: 0,
        lastDecisionAt: null,
      };
    }

    return {
      agentId,
      totalActions: Number(row.total_actions),
      blocks: Number(row.blocks),
      allows: Number(row.allows),
      warnings: Number(row.warnings),
      avgRiskScore: Math.round(Number(row.avg_risk_score) || 0),
      criticalViolations: Number(row.critical_violations),
      lastDecisionAt: row.last_decision_at ? Number(row.last_decision_at) : null,
    };
  }

  getRecentDecisions(limit = 50): IndexedDecision[] {
    const rows = this.db
      .prepare(`SELECT * FROM decisions ORDER BY timestamp DESC LIMIT ?`)
      .all(limit) as Array<Record<string, unknown>>;
    return rows.map(mapDecisionRow);
  }

  getDecisionCount(agentId?: string): number {
    if (agentId) {
      const row = this.db.prepare(`SELECT COUNT(*) as c FROM decisions WHERE agent_id = ?`).get(agentId) as {
        c: number;
      };
      return row.c;
    }
    const row = this.db.prepare(`SELECT COUNT(*) as c FROM decisions`).get() as { c: number };
    return row.c;
  }

  upsertPolicy(agentId: string, policyJson: string, policyHash: string): void {
    this.db
      .prepare(
        `INSERT INTO policies (agent_id, policy_json, policy_hash, updated_at)
         VALUES (?, ?, ?, unixepoch())
         ON CONFLICT(agent_id) DO UPDATE SET policy_json=excluded.policy_json, policy_hash=excluded.policy_hash, updated_at=unixepoch()`
      )
      .run(agentId, policyJson, policyHash);
  }

  getPolicy(agentId: string): { policyJson: string; policyHash: string; updatedAt: number } | null {
    const row = this.db.prepare(`SELECT * FROM policies WHERE agent_id = ?`).get(agentId) as
      | Record<string, unknown>
      | undefined;
    if (!row) return null;
    return {
      policyJson: String(row.policy_json),
      policyHash: String(row.policy_hash),
      updatedAt: Number(row.updated_at),
    };
  }
}

function mapDecisionRow(row: Record<string, unknown>): IndexedDecision {
  return {
    id: Number(row.id),
    agentId: String(row.agent_id),
    decisionHash: String(row.decision_hash),
    actionType: Number(row.action_type),
    riskScore: Number(row.risk_score),
    reasonCodes: parseReasonCodes(String(row.reason_codes)),
    verdict: Number(row.verdict),
    execTxRef: String(row.exec_tx_ref),
    blockNumber: Number(row.block_number),
    txHash: String(row.tx_hash),
    timestamp: Number(row.timestamp),
    indexedAt: Number(row.indexed_at),
  };
}
