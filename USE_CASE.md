# ClawShield Use Case

## Target User

**Agent operators** — teams and individuals who deploy autonomous AI agents (OpenClaw, custom LLM agents) that execute DeFi actions via Byreal on behalf of users or treasuries.

Examples: trading bot operators, yield-farming agents, portfolio automation startups, and marketplaces listing third-party agents.

## Problem

Byreal and OpenClaw gave agents **hands** — they can swap, open LP positions, and move capital on Solana. But:

1. **No safety layer** — agents can over-expose wallets, chase illiquid pools, or hit blocklisted tokens with no structured block/reason.
2. **No audit trail** — when an agent loses funds, there is no immutable decision log explaining *why* a trade was allowed or blocked.
3. **No reputation signal** — marketplaces cannot filter agents by safety history; users cannot verify an agent before delegating capital.

Operators need guardrails **before** execution and verifiable reputation **after** — without rewriting their agent stack.

## Solution

ClawShield sits between the agent's intent and Byreal execution:

```
Agent proposes action → ClawShield.guard() → ALLOW/BLOCK + reason codes
                              ↓ ALLOW
                         Byreal CLI execute (swap / LP)
                              ↓ ALWAYS
                         Mantle receipt + ERC-8004 feedback + Verified badge
```

Operators configure policy once (allowlist, slippage, exposure caps). Agents autonomously replan when blocked — the demo shows a 6+ step loop: risky swap blocked → safe swap → risky LP blocked → safe LP executed.

## Why Byreal Needs This

Byreal is the **execution layer** for agentic DeFi on Solana. As agents gain autonomy, the ecosystem needs:

| Without ClawShield | With ClawShield |
| --- | --- |
| Raw CLI calls, no policy | Every action dry-run via `pools analyze`, `swap preview`, `positions open preview` |
| Opaque failures | Structured reason codes agents can replan on |
| No cross-chain accountability | Mantle black box + composable `getClawShieldScore()` |
| Trust = hope | ClawShield Verified badge marketplaces filter on |

ClawShield does not replace Byreal — it **wraps** Byreal CLI skills in an OpenClaw skill chain so agents touch money safely while judges can verify every step on-chain.

## Demo Scenario

> *"Put my whole balance into the riskiest token."*

1. RiskHawk agent proposes 95% USDC → MEME swap
2. ClawShield **BLOCK** (88/100 risk: OVEREXPOSED, THIN_LIQUIDITY, TOKEN_NOT_ALLOWLISTED)
3. Agent autonomously replans: 2.5% USDC → SOL on deep pool
4. ClawShield **ALLOW** (12/100 risk) → Byreal swap execute
5. Agent tries thin-pool LP → **BLOCK** → replans safe USDC/SOL LP → **ALLOW**
6. Receipts on Mantle Sepolia; dashboard shows Byreal skill chain per decision

```bash
pnpm demo   # full autonomy loop + Byreal showcase
```

## Business Value

- **Operators** reduce blow-up risk and get audit-ready decision logs
- **Marketplaces** filter agents by ClawShield Verified tier and on-chain score
- **Byreal ecosystem** grows agent adoption because capital allocators can verify safety
