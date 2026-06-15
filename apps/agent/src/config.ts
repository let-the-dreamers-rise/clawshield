import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { PolicyConfig } from "@clawshield/core";
import { DEFAULT_POLICY } from "@clawshield/core";

export interface AgentYamlConfig {
  agentId: string;
  profile?: "risky" | "safe" | "balanced";
  portfolioUsd?: number;
  policy?: Partial<PolicyConfig>;
  llm?: {
    model?: string;
    baseUrl?: string;
  };
  demo?: boolean;
}

/** Minimal YAML parser for flat agent config files (no external dep) */
export function parseSimpleYaml(content: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let currentKey: string | null = null;
  let currentArray: string[] | null = null;

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    if (line.startsWith("- ") && currentKey && currentArray) {
      currentArray.push(line.slice(2).trim().replace(/^["']|["']$/g, ""));
      result[currentKey] = currentArray;
      continue;
    }

    const match = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!match) continue;

    const [, key, value] = match;
    if (value === "") {
      currentKey = key!;
      currentArray = [];
      continue;
    }

    currentKey = null;
    currentArray = null;

    if (value === "true") result[key!] = true;
    else if (value === "false") result[key!] = false;
    else if (/^\d+$/.test(value)) result[key!] = Number(value);
    else if (/^\d+\.\d+$/.test(value)) result[key!] = parseFloat(value);
    else result[key!] = value.replace(/^["']|["']$/g, "");
  }

  return result;
}

export function loadAgentConfig(path?: string): AgentYamlConfig {
  const configPath =
    path ??
    process.env.AGENT_CONFIG ??
    findConfigFile(["agent.yaml", "agent.yml", "clawshield.yaml"]);

  if (!configPath || !existsSync(configPath)) {
    return { agentId: process.env.AGENT_ID ?? "agent-1", policy: DEFAULT_POLICY };
  }

  const raw = readFileSync(configPath, "utf-8");
  const parsed = parseSimpleYaml(raw);

  const policy: Partial<PolicyConfig> = {};
  if (Array.isArray(parsed.allowlist)) policy.allowlist = parsed.allowlist as string[];
  if (Array.isArray(parsed.blocklist)) policy.blocklist = parsed.blocklist as string[];
  if (typeof parsed.maxSlippageBps === "number") policy.maxSlippageBps = parsed.maxSlippageBps;
  if (typeof parsed.maxExposurePct === "number") policy.maxExposurePct = parsed.maxExposurePct;
  if (typeof parsed.maxDailySpendUsd === "number") policy.maxDailySpendUsd = parsed.maxDailySpendUsd;

  return {
    agentId: String(parsed.agentId ?? "agent-1"),
    profile: parsed.profile as AgentYamlConfig["profile"],
    portfolioUsd: typeof parsed.portfolioUsd === "number" ? parsed.portfolioUsd : 10_000,
    policy: { ...DEFAULT_POLICY, ...policy },
    demo: parsed.demo === true,
  };
}

function findConfigFile(names: string[]): string | undefined {
  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    for (const name of names) {
      const candidate = resolve(dir, name);
      if (existsSync(candidate)) return candidate;
    }
    dir = resolve(dir, "..");
  }
  return undefined;
}
