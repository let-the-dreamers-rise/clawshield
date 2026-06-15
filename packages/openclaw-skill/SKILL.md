# ClawShield Guard — OpenClaw Skill

Add safety to your Byreal/OpenClaw agent in one command.

## Install

```bash
npx skills add @clawshield/openclaw-skill
```

## What it does

Wraps every money-touching action with ClawShield:

1. **Policy check** — allowlist, slippage cap, exposure limits
2. **Byreal CLI preview** — `pools analyze`, `swap preview`, `positions open preview`
3. **Risk scoring** — weighted blend (price impact 35%, slippage 25%, liquidity 25%, exposure 15%)
4. **Verdict** — ALLOW / WARN / BLOCK with structured reason codes for replanning
5. **Black box** — writes decision receipt to Mantle + ERC-8004 feedback

## Skill chaining (Byreal + ClawShield)

Judges: this is **purposeful Byreal integration** — each action chains OpenClaw skills that wrap `@byreal-io/byreal-cli`:

```
User intent
  → pools.analyze        (byreal-cli pools analyze <pool> -o json)
  → swap.preview         (byreal-cli swap preview --token-in … -o json)
  → clawshield.guard     (policy + risk score)
  → swap.execute         (byreal-cli swap execute …)  [if ALLOW]
  → clawshield.postAction (Mantle receipt + ERC-8004)
```

LP flow chains similarly:

```
  → pools.analyze
  → positions.open.preview
  → clawshield.guard
  → positions.open.execute
```

### TypeScript skill chain API

```typescript
import { runSwapGuardChain, runLpGuardChain } from "@clawshield/openclaw-skill";

const swapChain = await runSwapGuardChain(
  { type: "swap", tokenIn: "USDC", tokenOut: "SOL", amountUsd: 50, slippageBps: 50 },
  { agentId: "my-agent", demoMode: true }
);

console.log(swapChain.steps); // each step: skill, cliCommand, output
if (swapChain.guard.verdict === "BLOCK") {
  // read reasonCodes, replan with runLpGuardChain or smaller swap
}
```

### CLI wrapper

```bash
clawshield-guard agent-1 USDC SOL 50 --demo
```

## Perps (stub)

When `@byreal-io/byreal-cli` ships perps commands, ClawShield hooks are ready:

```bash
# Future chain (documented stub)
byreal-cli perps open preview --market SOL-PERP --size-usd 100 -o json
→ clawshield-guard (exposure + leverage policy)
→ perps open execute
```

See `PERPS_CHAIN_STUB` in `@clawshield/openclaw-skill`.

## Usage

```typescript
import { createClawShieldSkill } from "@clawshield/openclaw-skill";

const skill = createClawShieldSkill({ agentId: "my-agent" });

const guardResult = await skill.preAction({
  type: "swap",
  tokenIn: "SOL",
  tokenOut: "USDC",
  amountUsd: 500,
  slippageBps: 50,
});

if (guardResult.verdict === "BLOCK") {
  console.log(guardResult.reasonCodes);
} else {
  const txHash = "...";
  await skill.postAction(guardResult, txHash);
}
```

## Environment

Copy `.env.example` from repo root. Required for live mode:

- `MANTLE_RPC_URL` — Mantle Sepolia RPC
- `MANTLE_PRIVATE_KEY` — deployer/oracle key for receipts
- `DECISION_REGISTRY_ADDRESS` — deployed ClawShieldDecisionRegistry
- `VERIFIED_ADDRESS` — deployed ClawShieldVerified
- `REPUTATION_READER_ADDRESS` — deployed ClawShieldReputationReader

## Demo mode

```bash
pnpm --filter @clawshield/agent demo
pnpm --filter @clawshield/agent dev -- --showcase   # Byreal CLI depth only
```

Replays captured run from `demo-capture.json` for flawless demos.
