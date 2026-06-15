import "dotenv/config";
import { resolve } from "node:path";
import { openDatabase, runMigrations } from "./db.js";
import { createIndexer } from "./indexer.js";

async function main() {
  const dbPath = process.env.INDEXER_DB_PATH ?? resolve(process.cwd(), "data", "clawshield.db");
  const db = openDatabase(dbPath);
  runMigrations(db);

  const indexer = createIndexer(db, {
    dbPath,
    mantleRpcUrl: process.env.MANTLE_RPC_URL ?? "https://rpc.sepolia.mantle.xyz",
    decisionRegistryAddress: (process.env.DECISION_REGISTRY_ADDRESS ??
      "0x0000000000000000000000000000000000000000") as `0x${string}`,
    reputationAddress: (process.env.ERC8004_REPUTATION_ADDRESS ??
      "0x8004B663056A597Dffe9eCcC1965A193B7388713") as `0x${string}`,
    startBlock: process.env.INDEXER_START_BLOCK ? BigInt(process.env.INDEXER_START_BLOCK) : undefined,
    pollIntervalMs: Number(process.env.INDEXER_POLL_MS ?? 15_000),
  });

  console.log(`ClawShield indexer starting — db=${dbPath}, from block=${indexer.getLastBlock()}`);
  await indexer.startPolling();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
