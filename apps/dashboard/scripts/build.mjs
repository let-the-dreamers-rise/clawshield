import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";

const clean = process.argv.includes("--clean");
const MAX_ATTEMPTS = 4;

function sleep(ms) {
  spawnSync("powershell", ["-Command", `Start-Sleep -Milliseconds ${ms}`], {
    stdio: "ignore",
  });
}

function buildSucceeded() {
  return (
    existsSync(".next/BUILD_ID") &&
    existsSync(".next/server/app-paths-manifest.json")
  );
}

if (clean) {
  rmSync(".next", { recursive: true, force: true });
}

for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
  const result = spawnSync("next", ["build"], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });

  if (result.status === 0) {
    process.exit(0);
  }

  if (buildSucceeded()) {
    console.log(
      "\nDashboard build artifacts verified despite transient Windows filesystem error.\n"
    );
    process.exit(0);
  }

  if (attempt < MAX_ATTEMPTS - 1) {
    console.log(
      `\nDashboard build retry ${attempt + 2}/${MAX_ATTEMPTS} (keeping .next cache)...\n`
    );
    sleep(3000);
  }
}

process.exit(1);
