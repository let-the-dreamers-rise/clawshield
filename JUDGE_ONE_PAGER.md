# ClawShield — Judge One-Pager

**Track:** Agentic Economy (Byreal) · **Mantle Turing Test Hackathon 2026**

---

## Problem (10 seconds)

OpenClaw gave AI agents the ability to act. Byreal gave them DeFi execution on Solana. **Nobody built the trust layer** — policy enforcement, risk scoring, auditable decisions, and public reputation — that lets users or marketplaces safely hire an agent to manage real money.

---

## Solution (20 seconds)

**ClawShield** wraps any Byreal/OpenClaw agent with `guard()` before every money-touching action:

```
User prompt → Agent proposes → ClawShield.guard() → Policy + Byreal simulate + Risk score
                                      ↓ BLOCK → Agent reads reasonCodes → replans autonomously
                                      ↓ ALLOW → Byreal execute (Solana)
                                      ↓ ALWAYS → Mantle receipt + ERC-8004 feedback
```

**ClawShield Verified** = soulbound badge (Verified / Gold / Enterprise) that marketplaces filter on. Composable query: `getClawShieldScore(agentId)`.

---

## Byreal Integration Depth

Not a surface API wrapper — full `@byreal-io/byreal-cli` integration:

| Byreal CLI Command | ClawShield Use |
|--------------------|----------------|
| `swap preview` | Dry-run price impact, slippage, liquidity before guard |
| `swap execute` | Solana execution on ALLOW |
| `pool analyze` | LP risk scoring (thin pool detection) |
| `positions open preview` | LP position simulation |
| `positions open execute` | LP execution on ALLOW |

**OpenClaw skill:** `npx skills add @clawshield/openclaw-skill` — chains guard → Byreal → Mantle receipt in one install.

**Demo:** `pnpm demo` — swap block/replan/execute + LP block/replan/execute in one run.

---

## Agent Autonomy (what to watch for)

1. RiskHawk proposes **$9,500 USDC → MEME** (95% wallet exposure)
2. ClawShield **BLOCK** — risk 88/100, reason codes: `OVEREXPOSED`, `TOKEN_NOT_ALLOWLISTED`, `THIN_LIQUIDITY`
3. Agent **autonomously replans** to **$25 USDC → SOL** (liquid pair, 0.25% exposure)
4. ClawShield **ALLOW** — risk 12/100 → Byreal executes → Mantle receipt written

No human approval step. Structured `reasonCodes` drive replanning.

---

## On-Chain Proof (click these)

| What | Mantlescan Link |
|------|-----------------|
| DecisionRegistry (black box) | https://sepolia.mantlescan.xyz/address/0x5fbdb2315678afecb367f032d93f642f64180aa3 |
| ClawShieldVerified (badges) | https://sepolia.mantlescan.xyz/address/0xe7f1725e7734ce288f8367e1bb143e90bb3f0512 |
| ReputationReader (scores) | https://sepolia.mantlescan.xyz/address/0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0 |
| ERC-8004 Identity | https://sepolia.mantlescan.xyz/address/0x8004A818BFB912233c491871b3d84c89A494BD9e |
| ERC-8004 Reputation | https://sepolia.mantlescan.xyz/address/0x8004B663056A597Dffe9eCcC1965A193B7388713 |

Dashboard live feed → any decision row → **View on Mantlescan** → decode `DecisionRecorded` event.

---

## Business Model

| Revenue Stream | Price |
|----------------|-------|
| Verification audit + soulbound badge | $99–499 / agent |
| Annual badge renewal | $99–299 / agent |
| Reputation API (`getClawShieldScore`) | $500–5k / month |
| Enterprise white-label | $5k–50k / year |

**Buyer:** agent marketplaces, DeFi protocols, enterprises deploying autonomous treasury agents. **Wedge:** free SDK guard; monetize verification + API at scale.

---

## Try It in 60 Seconds

```bash
pnpm install && pnpm preflight && pnpm demo
```

- **Dashboard:** *(Vercel URL)* — live feed, risk math, arena, `/verify` badge criteria
- **GitHub:** https://github.com/clawshield/clawshield
- **Video:** *(link)* — 3:30 walkthrough hitting all 9 criteria ([script](VIDEO.md))
- **Scorecard:** [SCORECARD.md](SCORECARD.md) — criterion-by-criterion proof map

**One-liner:** ClawShield Verified is the ISO standard for agents that touch money.
