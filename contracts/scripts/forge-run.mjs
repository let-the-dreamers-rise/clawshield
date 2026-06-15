import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";

const forgeBin =
  process.env.FOUNDRY_BIN ??
  join(homedir(), ".foundry", "bin", process.platform === "win32" ? "forge.exe" : "forge");

const result = spawnSync(forgeBin, process.argv.slice(2), {
  stdio: "inherit",
  shell: false,
});

process.exit(result.status ?? 1);
