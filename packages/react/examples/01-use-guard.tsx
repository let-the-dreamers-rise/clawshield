/**
 * Example: useGuard hook — evaluate a proposed action against policy via REST API
 * (falls back to client-side @clawshield/core when API is unavailable)
 */
import { useState } from "react";
import { useGuard } from "@clawshield/react";

export function GuardExample() {
  const { guard, result, loading, error } = useGuard({
    baseUrl: process.env.CLAWSHIELD_API_URL ?? "http://localhost:8787",
  });
  const [amount, setAmount] = useState("100");

  async function onSubmit() {
    await guard({
      type: "swap",
      tokenIn: "USDC",
      tokenOut: "SOL",
      amountUsd: Number(amount),
      slippageBps: 50,
    });
  }

  return (
    <div>
      <input value={amount} onChange={(e) => setAmount(e.target.value)} />
      <button onClick={onSubmit} disabled={loading}>
        {loading ? "Checking…" : "Run guard"}
      </button>
      {error && <p role="alert">{error}</p>}
      {result && (
        <pre>{JSON.stringify({ verdict: result.verdict, riskScore: result.riskScore }, null, 2)}</pre>
      )}
    </div>
  );
}
