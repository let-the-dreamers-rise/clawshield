import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { QueryLayer } from "./query.js";

describe("QueryLayer", () => {
  let db: DatabaseSync;
  let query: QueryLayer;

  before(() => {
    db = new DatabaseSync(":memory:");
    db.exec(`
      CREATE TABLE decisions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_id TEXT NOT NULL,
        decision_hash TEXT NOT NULL UNIQUE,
        action_type INTEGER NOT NULL,
        risk_score INTEGER NOT NULL,
        reason_codes TEXT NOT NULL DEFAULT '[]',
        verdict INTEGER NOT NULL,
        exec_tx_ref TEXT NOT NULL DEFAULT '',
        block_number INTEGER NOT NULL,
        tx_hash TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        indexed_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
      CREATE TABLE policies (
        agent_id TEXT PRIMARY KEY,
        policy_json TEXT NOT NULL,
        policy_hash TEXT NOT NULL,
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);
    query = new QueryLayer(db);
  });

  after(() => {
    db.close();
  });

  it("inserts and retrieves decisions", () => {
    query.insertDecision({
      agentId: "test-agent",
      decisionHash: "0xabc123",
      actionType: 0,
      riskScore: 42,
      reasonCodes: [2],
      verdict: 2,
      execTxRef: "",
      blockNumber: 100,
      txHash: "0xtx",
      timestamp: 1_700_000_000,
    });

    const history = query.getAgentHistory({ agentId: "test-agent" });
    assert.equal(history.length, 1);
    assert.equal(history[0]!.riskScore, 42);
  });

  it("computes agent stats", () => {
    const stats = query.getAgentStats("test-agent");
    assert.equal(stats.totalActions, 1);
    assert.equal(stats.blocks, 1);
  });

  it("stores and retrieves policy", () => {
    query.upsertPolicy("test-agent", '{"maxSlippageBps":50}', "0xhash");
    const policy = query.getPolicy("test-agent");
    assert.equal(policy?.policyHash, "0xhash");
  });
});
