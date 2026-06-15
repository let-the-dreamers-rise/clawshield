import { resolve } from "node:path";
import { openDatabase, runMigrations } from "./db.js";
import { QueryLayer } from "./query.js";

const dbPath = process.env.INDEXER_DB_PATH ?? resolve(process.cwd(), "data", "clawshield.db");
const db = openDatabase(dbPath);
runMigrations(db);
const query = new QueryLayer(db);

const agents = ["agent-1", "agent-2", "agent-3"];
const now = Math.floor(Date.now() / 1000);

for (let a = 0; a < agents.length; a++) {
  const agentId = agents[a]!;
  for (let i = 0; i < 12; i++) {
    const verdict = i % 4 === 0 ? 2 : i % 3 === 0 ? 1 : 0;
    const risk = verdict === 2 ? 75 + (i % 20) : verdict === 1 ? 45 + (i % 15) : 15 + (i % 20);
    query.insertDecision({
      agentId,
      decisionHash: `0x${(a * 100 + i).toString(16).padStart(64, "0")}`,
      actionType: i % 5,
      riskScore: risk,
      reasonCodes: verdict === 2 ? [2, 0] : [],
      verdict,
      execTxRef: verdict !== 2 ? `sol-tx-seed-${a}-${i}` : "",
      blockNumber: 1_000_000 + a * 100 + i,
      txHash: `0xseed${a}${i}${"0".repeat(56)}`,
      timestamp: now - i * 3600,
    });
  }

  query.insertFeedback({
    agentId,
    score: 80 - a * 5,
    tag: verdictTag(a),
    blockNumber: 1_000_100 + a,
    txHash: `0xfb${a}${"0".repeat(60)}`,
    timestamp: now - 100,
  });

  query.upsertPolicy(
    agentId,
    JSON.stringify({
      allowlist: ["USDC", "SOL", "USDT"],
      maxSlippageBps: 100,
      maxExposurePct: 25 - a * 5,
    }),
    `0xpolicy${a}${"0".repeat(58)}`
  );
}

console.log(`Seeded ${query.getDecisionCount()} decisions for ${agents.length} agents`);
db.close();

function verdictTag(agentIdx: number): string {
  return ["allow", "warn", "block"][agentIdx % 3] ?? "allow";
}
