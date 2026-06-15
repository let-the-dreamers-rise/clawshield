#!/usr/bin/env node
/**
 * ClawShield preflight — verifies demo path end-to-end
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const checks = [];

function pass(msg) {
  checks.push({ ok: true, msg });
  console.log(`✅ ${msg}`);
}

function fail(msg) {
  checks.push({ ok: false, msg });
  console.log(`❌ ${msg}`);
}

// 1. Contracts compile
const forge = spawnSync("node", ["scripts/forge-run.mjs", "build"], {
  cwd: join(root, "contracts"),
  shell: true,
  stdio: "pipe",
});
forge.status === 0 ? pass("Contracts compile") : fail("Contracts compile");

// 2. Core tests
const coreTest = spawnSync("pnpm", ["--filter", "@clawshield/core", "test"], {
  cwd: root,
  shell: true,
  stdio: "pipe",
});
coreTest.status === 0 ? pass("Core unit tests") : fail("Core unit tests");

// 3. Demo capture exists
existsSync(join(root, "demo-capture.json"))
  ? pass("demo-capture.json present")
  : fail("demo-capture.json present");

// 4. Agent demo runs
const agentDemo = spawnSync("pnpm", ["--filter", "@clawshield/agent", "demo"], {
  cwd: root,
  shell: true,
  stdio: "pipe",
});
agentDemo.status === 0 ? pass("Agent demo (--demo risky)") : fail("Agent demo");

// 5. Deployments file
const depPath = join(root, "contracts/deployments/mantle-sepolia.json");
if (existsSync(depPath)) {
  const dep = JSON.parse(readFileSync(depPath, "utf-8"));
  const hasAddr = dep.contracts?.ClawShieldDecisionRegistry;
  hasAddr ? pass("Mantle deployment addresses recorded") : fail("Deploy contracts (addresses empty)");
} else {
  fail("deployments/mantle-sepolia.json missing");
}

// 6. Dashboard build
const dashBuild = spawnSync("pnpm", ["--filter", "@clawshield/dashboard", "build"], {
  cwd: root,
  shell: true,
  stdio: "pipe",
});
dashBuild.status === 0 ? pass("Dashboard production build") : fail("Dashboard production build");

// 7. Landing build
const landBuild = spawnSync("pnpm", ["--filter", "@clawshield/landing", "build"], {
  cwd: root,
  shell: true,
  stdio: "pipe",
});
landBuild.status === 0 ? pass("Landing production build") : fail("Landing production build");

const failed = checks.filter((c) => !c.ok);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);

if (failed.length) {
  console.log("\nFailed:");
  failed.forEach((f) => console.log(`  - ${f.msg}`));
  process.exit(1);
}

console.log("\n🛡️ Preflight complete — ready for video + BUIDL submission");
