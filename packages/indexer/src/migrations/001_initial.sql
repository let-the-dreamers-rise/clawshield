-- 001_initial.sql
CREATE TABLE IF NOT EXISTS decisions (
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

CREATE INDEX IF NOT EXISTS idx_decisions_agent ON decisions(agent_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_decisions_verdict ON decisions(verdict);

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  tag TEXT NOT NULL DEFAULT '',
  block_number INTEGER NOT NULL,
  tx_hash TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  indexed_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_feedback_agent ON feedback(agent_id, timestamp DESC);

CREATE TABLE IF NOT EXISTS indexer_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS policies (
  agent_id TEXT PRIMARY KEY,
  policy_json TEXT NOT NULL,
  policy_hash TEXT NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
