# ClawShield — Final Checklist (Your 1-Hour Sprint)

Everything else is done. **Only these steps remain for you.**

---

## 1. Record Demo Video (~20 min)

### Window layout (OBS or Loom)

| Pane | Content |
|------|---------|
| **Left (60%)** | Terminal — font 14pt+, dark theme |
| **Right top** | Browser: Dashboard `https://dashboard-ashwin-goyals-projects.vercel.app` |
| **Right bottom** | Browser tab: Landing `https://landing-ashwin-goyals-projects.vercel.app/verify` |

### Exact commands (run in order)

```powershell
cd C:\Users\ASHWIN GOYAL\projects\clawshield
pnpm install
pnpm preflight
```

Open dashboard in browser, then:

```powershell
pnpm demo
```

Optional — show live Byreal CLI on screen (pause 3s on JSON output):

```powershell
npx @byreal-io/byreal-cli swap preview --token-in USDC --token-out SOL --amount-usd 25 --slippage-bps 50 -o json
```

### What to say (voiceover beats)

1. **Hook (15s):** "OpenClaw gave agents hands. Byreal gave them DeFi. ClawShield is the trust layer — policy, risk scoring, on-chain receipts."
2. **Risky proposal:** "RiskHawk wants to put the whole wallet into MEME."
3. **BLOCK:** "ClawShield blocks at 88/100 — reason codes the agent can read."
4. **Replan:** "No human — agent shrinks to $25 USDC→SOL, retries autonomously."
5. **Byreal:** "Every action dry-runs through Byreal CLI — swap preview, pool analyze, positions open."
6. **Mantlescan:** Click a decision row → **Mantlescan ↗** → show `DecisionRecorded` event.
7. **Dashboard tour:** Risk math panel, Byreal integration panel, `getClawShieldScore` widget.
8. **Close:** "ClawShield Verified — the ISO standard for agents that touch money. GitHub + live links in description."

Full shot list: [VIDEO.md](VIDEO.md)

---

## 2. DoraHacks Submit (~10 min)

1. Go to your BUIDL page on DoraHacks
2. **Track:** Agentic Economy (Byreal)
3. Paste description from [SUBMISSION.md](SUBMISSION.md) (Description section)
4. Fill fields:

| Field | Value |
|-------|-------|
| GitHub | https://github.com/let-the-dreamers-rise/clawshield |
| Demo Video | *(your YouTube/Loom URL)* |
| Live Dashboard | https://dashboard-ashwin-goyals-projects.vercel.app |
| Landing | https://landing-ashwin-goyals-projects.vercel.app |
| Hashtag | `#MantleAIHackathon` |

5. Contract addresses (Mantle Sepolia):

| Contract | Address |
|----------|---------|
| DecisionRegistry | `0x30F0bAB7ed9064f07c1aa7B3BFBC6d8ea25fA316` |
| ClawShieldVerified | `0xb6b47abD16725Cf5DC89A9c29FB0D8181Cee605f` |
| PolicyRegistry | `0x530cA907c2E6Be6A9411A887c001c3a4DE7668c6` |
| ReputationReader | `0xed719fFc59226afBd301FbA2e2b1e905e85CC078` |

6. Attach [JUDGE_ONE_PAGER.md](JUDGE_ONE_PAGER.md) link or paste one-liner from scorecard

---

## 3. X Thread — paste from DORAHACKS_PITCH.md

Replace `[VIDEO]` and `[URL]` then post as 3-tweet thread:

**Tweet 1:**
```
🛡️ ClawShield — the safety + reputation layer for AI agents that touch money

OpenClaw gave agents hands. @Byreal gave them DeFi execution.

Nobody built the layer that lets them trade safely — with policy checks, risk scoring, and on-chain proof.

Watch RiskHawk try to lose $10K (and get stopped): [VIDEO]

#MantleAIHackathon
```

**Tweet 2:**
```
Before every swap or LP position:

1️⃣ Dry-run via @byreal-io/byreal-cli (preview, pool analyze, position open)
2️⃣ Score risk 0–100 with reason codes
3️⃣ BLOCK → agent autonomously replans (no human)
4️⃣ ALLOW → execute on Solana
5️⃣ Write receipt to @MantleNetwork + ERC-8004

npx skills add ./packages/openclaw-skill
```

**Tweet 3:**
```
Every allow AND block → permanent Mantle receipt
→ click through to Mantlescan ✅

ClawShield Verified = soulbound badge marketplaces filter on
getClawShieldScore(agentId) — composable on-chain trust

📊 Dashboard: https://dashboard-ashwin-goyals-projects.vercel.app
💻 GitHub: https://github.com/let-the-dreamers-rise/clawshield
🔗 Contracts: sepolia.mantlescan.xyz

#MantleAIHackathon
```

---

**You're done when:** video uploaded, DoraHacks submitted, X thread posted.
