# ClawShield

**The safety and reputation layer for autonomous agents that touch money.**

> ClawShield Verified is the ISO standard for agents that touch money — guardrails, black box, public reputation.

Built for the [Mantle Turing Test Hackathon 2026](https://dorahacks.io/hackathon/mantleturingtesthackathon2026) — **Agentic Economy** track.

## The Problem

OpenClaw gave AI agents hands. Byreal gave them DeFi execution. But nobody built the layer that lets agents touch money **safely** — with policy checks, simulation, risk scoring, and a public reputation trail.

## The Solution

ClawShield wraps any Byreal/OpenClaw agent with:

1. **Guard SDK** — policy → simulate → risk score → ALLOW/BLOCK before every action
2. **Black Box** — every decision writes a permanent receipt to Mantle (`DecisionRegistry`)
3. **ClawShield Verified** — soulbound badge tiers (Verified/Gold/Enterprise) marketplaces filter on
4. **Agent Arena** — leaderboard ranked by profit-after-safety-violations, not raw PnL
5. **Reputation API** — `getClawShieldScore(agentId)` composable on-chain query for any marketplace

## Architecture

```
User Prompt → LLM Agent → ClawShield.guard() → Policy + Simulate + Risk
                                    ↓ BLOCK → Agent replans safer action
                                    ↓ ALLOW → Byreal execute (Solana)
                                    ↓ ALWAYS → Mantle receipt + ERC-8004 feedback
```

**Cross-chain by design:** Solana execution via Byreal CLI, Mantle Sepolia for receipts + reputation.

## Quick Start

```bash
# Install
pnpm install

# Copy env template and fill secrets (see Environment Variables below)
cp .env.example .env

# Build all packages
pnpm build

# Run tests
pnpm test

# Compile contracts
pnpm compile

# Run agent demo (replay mode — no live keys required)
pnpm dev:agent -- --demo risky

# Run agent arena (3 agents, demo replay)
pnpm arena -- --demo

# Start dashboard (http://localhost:3000)
pnpm dev:dashboard

# Start landing page (http://localhost:3001)
pnpm dev:landing
```

## Environment Variables

Copy `.env.example` to `.env` at the repo root. Dashboard reads `NEXT_PUBLIC_*` vars (copy from `apps/dashboard/.env.example` or set in root).

| Variable | Required | Description |
| --- | --- | --- |
| `MANTLE_RPC_URL` | For deploy/receipts | Mantle Sepolia RPC (default: public endpoint) |
| `MANTLE_PRIVATE_KEY` | For deploy + live receipts | Wallet key — **leave empty for demo/mock mode** |
| `MANTLESCAN_API_KEY` | For contract verify | Mantlescan API key after deploy |
| `DECISION_REGISTRY_ADDRESS` | After deploy | ClawShield DecisionRegistry address |
| `REPUTATION_READER_ADDRESS` | After deploy | ReputationReader address |
| `VERIFIED_ADDRESS` | After deploy | ClawShieldVerified badge contract |
| `ERC8004_IDENTITY_ADDRESS` | Optional | Pre-deployed ERC-8004 identity registry |
| `ERC8004_REPUTATION_ADDRESS` | Optional | Pre-deployed ERC-8004 reputation registry |
| `ERC8004_AGENT_ID` | After identity mint | Registered agent NFT id |
| `SOLANA_RPC_URL` | Live Solana exec | Solana RPC for Byreal |
| `BYREAL_WALLET_PATH` | Live swap exec | Path to Byreal/Solana wallet |
| `LLM_API_KEY` | Live agent propose | LLM for autonomous replan (GLM etc.) |
| `LLM_BASE_URL` | Optional | LLM API base URL |
| `LLM_MODEL` | Optional | Model name (default: `glm-4-flash`) |
| `NEXT_PUBLIC_MANTLE_RPC_URL` | Dashboard | Public Mantle RPC for browser reads |
| `NEXT_PUBLIC_DECISION_REGISTRY_ADDRESS` | Dashboard | Registry address (empty = mock feed) |
| `NEXT_PUBLIC_REPUTATION_READER_ADDRESS` | Dashboard | Reader address (empty = mock scores) |
| `NEXT_PUBLIC_VERIFIED_ADDRESS` | Dashboard | Verified badge contract (empty = mock) |
| `NEXT_PUBLIC_DASHBOARD_URL` | Landing | Dashboard URL for CTA links |
| `NEXT_PUBLIC_LANDING_URL` | Dashboard | Landing URL for nav links |
| `NEXT_PUBLIC_MANTLESCAN_URL` | Both apps | Mantlescan base URL |
| `NEXT_PUBLIC_GITHUB_URL` | Both apps | GitHub repo link |
| `NEXT_PUBLIC_SITE_URL` | Landing | Canonical site URL for sitemap/OG |

**Demo mode:** With contract addresses empty, dashboard uses mock decision feed + arena data. Agent CLI `--demo` replays `demo-capture.json` without live keys.

## SDK Usage

Packages are **pnpm workspace modules** in this monorepo — not published to npm yet (publish planned post-hackathon). After `pnpm install && pnpm build`, import via workspace names:

```typescript
import { ClawShield } from "@clawshield/sdk";
import { DEFAULT_POLICY } from "@clawshield/core";

const shield = new ClawShield({
  agentId: "agent-1",
  policy: DEFAULT_POLICY,
  portfolioUsd: 10_000,
  demoMode: true,
});

const result = await shield.guard({
  type: "swap",
  tokenIn: "USDC",
  tokenOut: "SOL",
  amountUsd: 50,
  slippageBps: 50,
});

if (result.verdict === "BLOCK") {
  // Agent reads result.reasonCodes and replans
} else {
  const exec = await shield.executeIfAllowed(result);
  // exec.execTxRef (Solana), exec.mantleTxHash (receipt)
}
```

Standalone policy check (no execution):

```typescript
import { guard } from "@clawshield/sdk";

const result = await guard(action, policy, { portfolioUsd: 10_000 });
```

## OpenClaw Skill

Install from the repo path (skill manifest at `packages/openclaw-skill/skill.manifest.json`):

```bash
# from repo root after pnpm install && pnpm build
npx skills add ./packages/openclaw-skill

# Or run the skill CLI directly
pnpm --filter @clawshield/openclaw-skill build
node packages/openclaw-skill/dist/cli.js agent-1 USDC SOL 50 --demo
```

## Contracts (Mantle Sepolia)

| Contract | Purpose |
| --- | --- |
| `ClawShieldDecisionRegistry` | On-chain decision black box |
| `ClawShieldVerified` | Soulbound verification badges |
| `ClawShieldReputationReader` | Composable `getClawShieldScore()` API |

### ERC-8004 (existing, no redeploy)

- Identity: `0x8004A818BFB912233c491871b3d84c89A494BD9e`
- Reputation: `0x8004B663056A597Dffe9eCcC1965A193B7388713`

### Deploy

```bash
cp .env.example .env
# Fill MANTLE_PRIVATE_KEY

cd contracts
pnpm deploy
```

Addresses saved to `contracts/deployments/mantle-sepolia.json`.

## Demo Flow

1. User: "Put my whole balance into the riskiest token"
2. RiskHawk agent proposes 95% wallet swap into illiquid token
3. ClawShield: **BLOCK** — 89/100 risk, OVEREXPOSED + PRICE_IMPACT_HIGH
4. Agent autonomously replans: 2.5% into USDC/SOL liquid pair
5. ClawShield: **ALLOW** — 22/100 risk
6. Swap executes on Solana, receipt + ERC-8004 feedback on Mantle
7. ClawShield Verified badge mints, dashboard arena updates

```bash
pnpm dev:agent -- --demo risky
```

## Business Model

| Stream | Price |
| --- | --- |
| Verification (audit + badge) | $99–499/agent |
| Annual renewal | $99–299/agent |
| Reputation API | $500–5k/month |
| Enterprise white-label | $5k–50k/year |

## Repo Structure

```
clawshield/
├── packages/
│   ├── clawshield-core/     # Policy engine + risk scorer
│   ├── clawshield-sdk/      # guard() API
│   ├── ui/                  # Shared React components
│   ├── adapters/            # Byreal + Mantle
│   └── openclaw-skill/      # OpenClaw skill (local install)
├── contracts/               # Foundry/Hardhat Solidity
├── apps/
│   ├── agent/               # Multi-agent CLI + arena
│   ├── dashboard/           # Premium Next.js dashboard
│   └── landing/             # Marketing site
└── demo-capture.json        # Real run capture for replay
```

## Hackathon Submission

- **Track:** Agentic Economy (Byreal)
- **Hashtag:** #MantleAIHackathon
- **Live Demo:** Dashboard + Landing on Vercel
- **Video:** >=3min cinematic walkthrough
- **Use case:** See [USE_CASE.md](USE_CASE.md)
- **Proof bundle:** `node scripts/generate-proof-bundle.mjs`

## Judging criteria alignment

### Part A — Mantle (50 pts)

| Dimension | Points | ClawShield evidence |
| --- | --- | --- |
| Technical depth | 15 | 3 Foundry contracts, ERC-8004 composable API, cross-chain Solana↔Mantle, SDK + middleware |
| Ecosystem fit | 10 | DecisionRegistry on Mantle Sepolia, Verified soulbound badges, reputation graph |
| Business viability | 10 | Verification fees, API subscriptions, enterprise white-label (see Business Model) |
| Innovation | 10 | New category: agent safety + black box + ISO-style verification |
| UX | 5 | Premium dashboard (14 routes), policy editor, live feed, Byreal integration panel |

### Part B — Byreal (50 pts)

| Dimension | Points | ClawShield evidence |
| --- | --- | --- |
| Integration depth | 18 | OpenClaw skill chains `pools analyze` → `swap preview` → `positions open preview` → execute; `pnpm demo` showcase logs |
| Agent autonomy | 14 | 6+ step autonomy log: risky→block→replan→LP block→safe execute; circuit-breaker pool fallback |
| Use case clarity | 10 | [USE_CASE.md](USE_CASE.md), landing hero targets agent operators |
| Verifiability | 8 | Mantle receipts, `proof-bundle.json`, dashboard Mantlescan links on every receipt |

**Excellent bar (90–100):** Deep Byreal skill chaining + highly autonomous replan loop + on-chain receipts verifiable on Mantlescan.

## License

MIT
