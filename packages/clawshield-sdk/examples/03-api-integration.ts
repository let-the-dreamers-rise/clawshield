/**
 * Example 3: Remote API guard via ClawShield REST API
 */
const API_URL = process.env.CLAWSHIELD_API_URL ?? "http://localhost:8787";

async function guardViaApi() {
  const res = await fetch(`${API_URL}/v1/guard`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agentId: "api-example",
      action: {
        type: "payment",
        tokenIn: "USDC",
        tokenOut: "MERCHANT",
        amountUsd: 250,
        slippageBps: 0,
      },
      portfolioUsd: 5000,
    }),
  });

  const result = await res.json();
  console.log("API guard result:", result.verdict, result.riskScore);
  if (result.explanation?.replanHints?.length) {
    console.log("Replan hints:", result.explanation.replanHints);
  }
}

guardViaApi().catch(console.error);
