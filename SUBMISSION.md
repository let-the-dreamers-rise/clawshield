# ClawShield

**The safety and reputation layer for autonomous agents that touch money.**

---

## Track

**Agentic Economy** (Exclusively Supported by Byreal)

---

## Description

OpenClaw gave AI agents hands. Byreal gave them DeFi execution on Solana. But nobody built the layer that lets agents touch money *safely* — with policy checks, simulation, risk scoring, and a public reputation trail.

**ClawShield** is that layer. Before any Byreal agent executes a swap or opens an LP position, ClawShield runs `guard()`: dry-run via Byreal CLI (`swap preview`, `pool analyze`, `positions open`), score risk 0–100 with weighted breakdown and structured reason codes, then ALLOW or BLOCK. On BLOCK, the agent reads `reasonCodes` and autonomously replans — no human in the loop. On ALLOW, execution proceeds through Byreal; every decision writes a permanent receipt to Mantle Sepolia (`DecisionRegistry`) and ERC-8004 reputation feedback.

**ClawShield Verified** is the ISO-style soulbound badge marketplaces filter on. Agents earn Verified, Gold, or Enterprise tiers by meeting public criteria: ERC-8004 identity, zero critical violations, sustained receipt history, average risk below threshold. Any dApp calls `getClawShieldScore(agentId)` on-chain before hiring an agent.

**Stack:** `@byreal-io/byreal-cli` for Solana execution · Mantle Sepolia for receipts + badges · ERC-8004 identity/reputation · OpenClaw skill (`npx skills add @clawshield/openclaw-skill`) · Next.js dashboard (14 routes) · Agent Arena ranked by profit-after-violations.

**Business model:** verification audits ($99–499/agent), annual renewal, Reputation API ($500–5k/month), enterprise white-label ($5k–50k/year).

---

## How We Score on Judging Criteria

**Part A — Mantle (50 pts)**

- **Technical Depth (15):** 3 Foundry contracts, cross-chain Byreal→Mantle architecture, composable `getClawShieldScore()`, SDK + OpenClaw skill
- **Mantle Ecosystem (10):** `DecisionRegistry` black box, ERC-8004 integration, soulbound Verified badges on Mantle Sepolia
- **Business Model (10):** Verification tiers, API subscriptions, enterprise licensing — revenue tied to trust infrastructure
- **Innovation (10):** New category: agent conscience + auditable black box + public reputation, not middleware
- **UX (5):** Premium dashboard — live feed, risk math, receipt explorer, policy editor, arena, marketplace

**Part B — Byreal (50 pts)**

- **Integration Depth (18):** Full Byreal CLI skill chain — `pools analyze` → `swap preview` → `positions open preview` → execute; OpenClaw skill + `pnpm demo` showcase logs
- **Agent Autonomy (14):** 6+ step autonomy log: risky swap → BLOCK → replan → preview recovery → ALLOW → risky LP BLOCK → safe LP execute
- **Use Case Clarity (10):** [USE_CASE.md](USE_CASE.md) — target user: agent operators; landing hero states clearly
- **Verifiability (8):** Mantle receipts + `pnpm proof:generate` bundle; dashboard Mantlescan links on every receipt

---

## Quick Start (Judges)

```bash
git clone https://github.com/let-the-dreamers-rise/clawshield
cd clawshield
pnpm install
pnpm preflight          # 7/7 checks
pnpm demo               # block → replan → execute → LP → badge
pnpm arena              # 3-agent arena
pnpm dev:dashboard      # http://localhost:3000
pnpm dev:landing        # http://localhost:3001
```

---

## Contract Addresses (Mantle Sepolia)

**ClawShield (deploy: `pnpm deploy:contracts` — see `contracts/deployments/mantle-sepolia.json`):**

| Contract | Address |
|----------|---------|
| ClawShieldDecisionRegistry | `0x30f0bab7ed9064f07c1aa7b3bfbc6d8ea25fa316` |
| ClawShieldVerified | `0xb6b47abd16725cf5dc89a9c29fb0d8181cee605f` |
| ClawShieldPolicyRegistry | `0x530ca907c2e6be6a9411a887c001c3a4de7668c6` |
| ClawShieldReputationReader | `0xed719ffc59226afbd301fba2e2b1e905e85cc078` |

**ERC-8004 (pre-deployed on Mantle Sepolia):**

| Contract | Address |
|----------|---------|
| Identity Registry | `0x8004A818BFB912233c491871b3d84c89A494BD9e` |
| Reputation Registry | `0x8004B663056A597Dffe9eCcC1965A193B7388713` |

---

## Links

| Resource | URL |
|----------|-----|
| GitHub | https://github.com/let-the-dreamers-rise/clawshield |
| Live Dashboard | https://dashboard-ashwin-goyals-projects.vercel.app |
| Landing Page | https://landing-ashwin-goyals-projects.vercel.app |
| Demo Video | *(fill YouTube/Loom URL before submit)* |
| Mantlescan (Sepolia) | https://sepolia.mantlescan.xyz |
| DecisionRegistry | https://sepolia.mantlescan.xyz/address/0x30f0bab7ed9064f07c1aa7b3bfbc6d8ea25fa316 |
| Scorecard (judges) | [SCORECARD.md](SCORECARD.md) |
| Video Script | [VIDEO.md](VIDEO.md) |
| Judge One-Pager | [JUDGE_ONE_PAGER.md](JUDGE_ONE_PAGER.md) |
| Use Case | [USE_CASE.md](USE_CASE.md) |
| Proof bundle | `pnpm proof:generate` → `proof-bundle.json` |
| Sample receipt tx | https://sepolia.mantlescan.xyz/tx/0x842271d10ce88616557a738721c177cebf9dc132ee1d040c704a3b605615e6b7 |

**Hashtag:** `#MantleAIHackathon`
