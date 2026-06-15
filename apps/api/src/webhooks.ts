import { createHash } from "node:crypto";
import type { PolicyConfig } from "@clawshield/core";
import { DEFAULT_POLICY } from "@clawshield/core";

export interface WebhookConfig {
  url: string;
  secret?: string;
  enabled: boolean;
}

export async function dispatchBlockWebhook(
  config: WebhookConfig,
  payload: Record<string, unknown>
): Promise<void> {
  if (!config.enabled || !config.url) return;

  const body = JSON.stringify({
    event: "decision.blocked",
    timestamp: new Date().toISOString(),
    ...payload,
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "ClawShield-Webhook/1.0",
  };

  if (config.secret) {
    const sig = createHash("sha256").update(`${config.secret}${body}`).digest("hex");
    headers["X-ClawShield-Signature"] = sig;
  }

  try {
    const res = await fetch(config.url, { method: "POST", headers, body });
    if (!res.ok) {
      console.warn(`Webhook delivery failed: ${res.status} ${await res.text()}`);
    }
  } catch (err) {
    console.warn("Webhook delivery error:", err);
  }
}

export function mergePolicy(partial?: Partial<PolicyConfig>): PolicyConfig {
  return { ...DEFAULT_POLICY, ...partial };
}

export function policyHash(policy: PolicyConfig): string {
  return createHash("sha256").update(JSON.stringify(policy)).digest("hex");
}
