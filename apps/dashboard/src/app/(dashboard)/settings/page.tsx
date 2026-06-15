"use client";

import { useEffect, useState } from "react";
import { PageTransition } from "@/components/shared/PageTransition";
import { useToast } from "@/components/shared/Toast";
import { CONTRACTS } from "@/lib/config";

const STORAGE_KEY = "clawshield-settings";

interface Settings {
  rpcUrl: string;
  decisionRegistry: string;
  verified: string;
  reputationReader: string;
  webhookUrl: string;
}

const defaults: Settings = {
  rpcUrl: CONTRACTS.rpcUrl,
  decisionRegistry: CONTRACTS.decisionRegistry,
  verified: CONTRACTS.verified,
  reputationReader: CONTRACTS.reputationReader,
  webhookUrl: "",
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>(defaults);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSettings({ ...defaults, ...JSON.parse(stored) });
      } catch {
        // ignore
      }
    }
  }, []);

  const update = (key: keyof Settings, value: string) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    toast("Settings saved", "success");
  };

  const handleTestWebhook = async () => {
    if (!settings.webhookUrl) {
      toast("Enter a webhook URL first", "warning");
      return;
    }
    toast("Webhook test sent (demo mode)", "info");
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gradient">Settings</span>
          </h1>
          <p className="mt-2 text-text-muted">
            RPC configuration, contract addresses, and webhook integrations
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold">RPC Configuration</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-text-muted">Mantle RPC URL</label>
                <input
                  type="url"
                  value={settings.rpcUrl}
                  onChange={(e) => update("rpcUrl", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold">Webhook</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-text-muted">Decision webhook URL</label>
                <input
                  type="url"
                  value={settings.webhookUrl}
                  onChange={(e) => update("webhookUrl", e.target.value)}
                  placeholder="https://your-app.com/webhooks/clawshield"
                  className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 font-mono text-sm"
                />
                <p className="mt-1 text-xs text-text-dim">Receives POST on every DecisionRecorded event</p>
              </div>
              <button
                onClick={handleTestWebhook}
                className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:bg-surface-elevated"
              >
                Test Webhook
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold">Contract Addresses</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {([
              ["Decision Registry", "decisionRegistry"],
              ["Verified Badges", "verified"],
              ["Reputation Reader", "reputationReader"],
            ] as const).map(([label, key]) => (
              <div key={key}>
                <label className="text-sm text-text-muted">{label}</label>
                <input
                  type="text"
                  value={settings[key]}
                  onChange={(e) => update(key, e.target.value)}
                  placeholder="0x..."
                  className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 font-mono text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-emerald px-6 py-2.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
          <button
            onClick={() => setSettings(defaults)}
            className="rounded-lg border border-border px-6 py-2.5 text-sm text-text-muted hover:bg-surface-elevated"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </PageTransition>
  );
}
