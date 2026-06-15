import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function openDatabase(dbPath: string): DatabaseSync {
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");
  return db;
}

function resolveMigrationsDir(): string {
  const candidates = [
    join(__dirname, "migrations"),
    join(__dirname, "..", "src", "migrations"),
    join(process.cwd(), "packages", "indexer", "src", "migrations"),
  ];
  for (const dir of candidates) {
    try {
      if (readdirSync(dir).some((f) => f.endsWith(".sql"))) return dir;
    } catch {
      // try next
    }
  }
  throw new Error("Migrations directory not found");
}

export function runMigrations(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  const applied = new Set(
    db.prepare("SELECT name FROM _migrations").all().map((r) => (r as { name: string }).name)
  );

  const migrationsDir = resolveMigrationsDir();
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = readFileSync(join(migrationsDir, file), "utf-8");
    db.exec(sql);
    db.prepare("INSERT INTO _migrations (name) VALUES (?)").run(file);
  }
}

export function getPostgresSchema(): string {
  return `
CREATE TABLE IF NOT EXISTS decisions (
  id BIGSERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL,
  decision_hash TEXT NOT NULL UNIQUE,
  action_type SMALLINT NOT NULL,
  risk_score SMALLINT NOT NULL,
  reason_codes JSONB NOT NULL DEFAULT '[]',
  verdict SMALLINT NOT NULL,
  exec_tx_ref TEXT NOT NULL DEFAULT '',
  block_number BIGINT NOT NULL,
  tx_hash TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  indexed_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);
CREATE INDEX IF NOT EXISTS idx_decisions_agent ON decisions(agent_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_decisions_verdict ON decisions(verdict);

CREATE TABLE IF NOT EXISTS feedback (
  id BIGSERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL,
  score SMALLINT NOT NULL,
  tag TEXT NOT NULL DEFAULT '',
  block_number BIGINT NOT NULL,
  tx_hash TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  indexed_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);
CREATE INDEX IF NOT EXISTS idx_feedback_agent ON feedback(agent_id, timestamp DESC);

CREATE TABLE IF NOT EXISTS indexer_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;
}
