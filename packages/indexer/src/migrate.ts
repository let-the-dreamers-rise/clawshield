import { resolve } from "node:path";
import { openDatabase, runMigrations } from "./db.js";

const dbPath = process.env.INDEXER_DB_PATH ?? resolve(process.cwd(), "data", "clawshield.db");
const db = openDatabase(dbPath);
runMigrations(db);
console.log(`Migrations applied to ${dbPath}`);
db.close();
