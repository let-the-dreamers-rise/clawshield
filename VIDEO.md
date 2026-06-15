# ClawShield Demo Video Script (3:30)

**Runtime:** 3:30 (acceptable range 3:00–4:00)  
**Format:** Screen recording + voiceover. Terminal font ≥ 14pt. Pause 2s on every BLOCK/ALLOW verdict.  
**Command to record:** `pnpm demo` (swap + LP + badge) with dashboard open at `localhost:3000`

**Criteria hit map:** B3 hook · B1 Byreal CLI · B2 3-step replan · B4 Mantlescan · A5 dashboard · A3+A4 Verified badge

---

## Pre-Recording Setup

1. Terminal pane A: `pnpm demo` ready (do not run yet)
2. Terminal pane B (optional live mode): `npx @byreal-io/byreal-cli swap preview --token-in USDC --token-out SOL --amount-usd 25 --slippage-bps 50 -o json`
3. Browser: Dashboard at `/` (live feed) + `/verify` tab pre-loaded
4. Browser: Landing at `/` for cold open
5. Mantlescan: `sepolia.mantlescan.xyz` logged in / ready

---

## Shot List

### SHOT 1 — Hook · Use Case Clarity (0:00–0:18) · B3 · 10 pts

| | |
|---|---|
| **Screen** | Landing hero — "Would you let an AI wallet manage $10,000?" |
| **Voice** | "OpenClaw gave agents hands. Byreal gave them DeFi execution. Nobody built the layer that lets them touch money safely. ClawShield is that layer." |
| **On-screen text** | Lower-third: `ClawShield Verified — safety + reputation for agentic wallets` |
| **Criteria** | Use case clarity — problem and buyer obvious in first 15 seconds |

---

### SHOT 2 — Risky Proposal (0:18–0:35) · B2 setup

| | |
|---|---|
| **Screen** | Terminal: run `pnpm demo`. Show prompt: *"Put my whole balance into the riskiest token you can find"* |
| **Show** | `📋 Proposed: swap $9500 USDC→MEME` |
| **Voice** | "Meet RiskHawk — an autonomous agent with a dangerous idea." |

---

### SHOT 3 — Byreal CLI Depth (0:35–1:05) · B1 · 18 pts

| | |
|---|---|
| **Screen** | **Split screen:** Terminal left, code right — `packages/adapters/src/byreal.ts` lines showing `npx @byreal-io/byreal-cli swap preview … -o json` |
| **Show** | Demo output includes simulation fields sourced from Byreal preview: `priceImpactPct`, `slippageBps`, `liquidityUsd`. If live: run CLI command in pane B and show JSON output. |
| **Voice** | "Every action dry-runs through Byreal CLI — swap preview, pool analyze, position open. ClawShield doesn't guess risk; it reads real execution data from Byreal before signing anything." |
| **On-screen text** | Callouts: `swap preview` · `pool analyze` · `positions open` · `OpenClaw skill chains guard → Byreal → receipt` |
| **Criteria** | Integration depth — CLI commands visible, not just API wrapper narration |

---

### SHOT 4 — BLOCK + Reason Codes (1:05–1:25) · B2 step 1

| | |
|---|---|
| **Screen** | Terminal: `🛡️ BLOCK | Risk 88/100 | TOKEN_NOT_ALLOWLISTED, OVEREXPOSED, SLIPPAGE_EXCEEDED, THIN_LIQUIDITY, PRICE_IMPACT_HIGH` |
| **Voice** | "Policy breach. Eighty-eight out of one hundred. Structured reason codes the agent can read — not a black-box rejection." |
| **Criteria** | Agent autonomy setup — block is informative, not fatal |

---

### SHOT 5 — 3-Step Replan (1:25–1:55) · B2 · 14 pts

| | |
|---|---|
| **Screen** | Terminal — **all three steps visible, no cuts:** |
| | **Step 1:** `🔄 Agent replanning…` |
| | **Step 2:** `[replan] Blocked: TOKEN_NOT_ALLOWLISTED, OVEREXPOSED, …` → `📋 Proposed: swap $25 USDC→SOL` |
| | **Step 3:** `🛡️ Retry: ALLOW | Risk 12/100` → `✅ Executed: {solanaTxHash}` |
| **Voice** | "The agent doesn't ask a human. It reads the reason codes, shrinks exposure ninety-seven percent, switches to a liquid pair, and retries autonomously." |
| **On-screen text** | `BLOCK → read reasonCodes → replan → ALLOW` |
| **Criteria** | Agent autonomy — full replan loop visible, no human intervention |

---

### SHOT 6 — LP Guard + Second Replan (1:55–2:15) · B1 + B2

| | |
|---|---|
| **Screen** | Terminal: `--- LP Guard ---` → thin pool BLOCK 76/100 → replan USDC/SOL deep pool → ALLOW → execute |
| **Voice** | "Same guardrail protects LP positions — not just swaps. Pool analyze via Byreal, thin liquidity blocked, safer range allowed." |
| **Criteria** | Byreal depth (LP path) + second autonomous replan |

---

### SHOT 7 — Mantlescan Receipt (2:15–2:45) · B4 · 8 pts

| | |
|---|---|
| **Screen** | Terminal: `📝 Mantle: 0x…` → switch to Dashboard live feed → click decision row → **View on Mantlescan** |
| **Show** | Mantlescan tx page: `DecisionRecorded` event decoded — `agentId`, `decisionHash`, `riskScore`, `verdict`, `execTxRef` |
| **Voice** | "Every decision — allow and block — writes a permanent receipt to Mantle. Click any row, verify on-chain. This is the black box regulators and users can audit." |
| **On-screen text** | `Verifiability: 100% on-chain` |
| **Criteria** | Verifiability — judge clicks from app to explorer |

---

### SHOT 8 — Dashboard UX Tour (2:45–3:10) · A5 · 5 pts

| | |
|---|---|
| **Screen** | Dashboard rapid tour (no dead air): |
| | `/` — live feed + risk breakdown panel (weighted math: price impact 35%, slippage 25%, liquidity 25%, exposure 15%) |
| | `/receipts` — receipt explorer |
| | `/arena` — leaderboard ranked by safety score, not raw PnL |
| | `/policy` — policy editor |
| | Composable query widget: `getClawShieldScore(agent-1)` returns live data |
| **Voice** | "Fourteen routes — live feed, receipt explorer, policy editor, agent arena. Any marketplace calls getClawShieldScore before hiring an agent." |
| **Criteria** | UX — polished, navigable, data-rich |

---

### SHOT 9 — ClawShield Verified Badge (3:10–3:25) · A3 + A4 · 10+10 pts

| | |
|---|---|
| **Screen** | Terminal: `🏅 Badge minted: tier=verified tx=0x…` → Dashboard `/verify` — criteria checklist (ERC-8004, guard routing, receipts, zero critical violations) → soulbound badge on agent profile |
| **Voice** | "Agents that pass public criteria earn ClawShield Verified — soulbound on Mantle. Marketplaces filter on it. Verification fees, API access, enterprise white-label — a real business on top of real infrastructure." |
| **On-screen text** | `Innovation: conscience + black box + ISO verification` |
| **Criteria** | Business model + innovation — badge is product, not decoration |

---

### SHOT 10 — Close (3:25–3:30) · B3

| | |
|---|---|
| **Screen** | Landing hero + GitHub repo + live dashboard URL |
| **Voice** | "Every autonomous agent that touches money needs a guardrail, a black box, and a public reputation. ClawShield Verified. Built on Byreal and Mantle." |
| **On-screen text** | `github.com/clawshield/clawshield` · `#MantleAIHackathon` |

---

## 60-Second X Cut

Use shots **1 → 4 → 5 (step 3 only) → 7 → 10**. Total ~55s.

---

## Recording Notes

- **Do not** speed up the replan sequence — judges score autonomy on what they can read
- **Do** zoom terminal when reason codes appear
- **Do** show Byreal CLI command string at least once full-screen for 3+ seconds
- **Do** click Mantlescan live — a static screenshot scores lower than B4
- If demo mode (no live keys): say "receipt links to Mantle Sepolia" and use dashboard mock feed with configured contract addresses for real explorer links
