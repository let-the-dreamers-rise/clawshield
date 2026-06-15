# ClawShield — Agentic Economy Scorecard Map

**Target tier:** Excellent (90–100)  
**Track:** Agentic Economy (Byreal)  
**Bar:** *Deep purposeful Byreal integration; highly autonomous agent; compelling use case fully verified on-chain.*

This document maps every judging criterion to a ClawShield proof point, the exact demo/video beat, and the Mantlescan link judges should click.

---

## Part A — Mantle (50 pts)

| # | Criterion | Pts | ClawShield Feature | Demo / Video Beat | Mantlescan Link |
|---|-----------|-----|-------------------|-------------------|-----------------|
| A1 | **Technical Depth** | 15 | 3 Foundry contracts (`DecisionRegistry`, `ClawShieldVerified`, `ReputationReader`); cross-chain Solana execution + Mantle receipts; ERC-8004 identity/reputation hooks; composable `getClawShieldScore()`; OpenClaw skill + SDK middleware | Terminal: `pnpm demo` → guard verdicts, Solana tx ref, Mantle receipt hash. Dashboard: `/docs` SDK snippet + `/receipts` decoded events | **Contract:** [DecisionRegistry](https://sepolia.mantlescan.xyz/address/0x5fbdb2315678afecb367f032d93f642f64180aa3) · [ReputationReader](https://sepolia.mantlescan.xyz/address/0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0) · [Verified](https://sepolia.mantlescan.xyz/address/0xe7f1725e7734ce288f8367e1bb143e90bb3f0512) |
| A2 | **Mantle Ecosystem Integration** | 10 | Decision black box on Mantle Sepolia; ERC-8004 pre-deployed registries; soulbound Verified badges; reputation graph queryable by any marketplace | Dashboard live feed (`DecisionRecorded` events) → click tx → Mantlescan. Show ERC-8004 addresses on `/verify` | **ERC-8004 Identity:** [0x8004…BD9e](https://sepolia.mantlescan.xyz/address/0x8004A818BFB912233c491871b3d84c89A494BD9e) · **Reputation:** [0x8004…8713](https://sepolia.mantlescan.xyz/address/0x8004B663056A597Dffe9eCcC1965A193B7388713) · **Tx:** `/tx/{mantleTxHash}` from live feed |
| A3 | **Business Model** | 10 | ClawShield Verified tiers (Verified / Gold / Enterprise); audit + badge ($99–499), API ($500–5k/mo), enterprise white-label ($5k–50k/yr); marketplace filter use case | Landing: pricing + Verified table. Dashboard: `/verify` criteria checklist + badge mint. Video close: "ISO standard marketplaces filter on" | **Badge contract:** `/address/{VERIFIED_ADDRESS}` → read `isVerified(agentId)` |
| A4 | **Innovation** | 10 | New category: agent conscience + black box + public reputation — not middleware, infrastructure. Profit-after-violations arena ranking | Landing pillars + arena leaderboard (`/arena`). Terminal: block receipt still written (negative decisions are auditable) | **Block receipt tx:** `/tx/{mantleTxHash}` for a BLOCK verdict (proves allow *and* block are recorded) |
| A5 | **UX / Dashboard** | 5 | Premium Next.js dashboard (14 routes): live feed, risk breakdown math, receipt explorer, policy editor, agent profiles, arena, marketplace, analytics | Full-screen dashboard tour: select decision → weighted risk panel → Mantlescan link → composable query widget | **Deep link:** `/receipts` → any row → **View on Mantlescan** |

---

## Part B — Byreal (50 pts)

| # | Criterion | Pts | ClawShield Feature | Demo / Video Beat | Mantlescan Link |
|---|-----------|-----|-------------------|-------------------|-----------------|
| B1 | **Byreal Integration Depth** | 18 | `ByrealAdapter` wraps `@byreal-io/byreal-cli`: `swap preview`, `swap execute`, `pool analyze`, `positions open preview`, `positions open execute`. OpenClaw skill chains guard → Byreal → receipt | **Must be on screen:** CLI args visible in terminal or split-pane: `npx @byreal-io/byreal-cli swap preview … -o json` → guard uses preview fields → execute on ALLOW. Second beat: LP pool analyze + position open | N/A (Solana exec) — cross-reference Mantle receipt `execTxRef` field linking Solana hash to guard decision |
| B2 | **Agent Autonomy** | 14 | LLM/heuristic propose → `guard()` BLOCK → agent reads `reasonCodes` → autonomous replan (swap + LP) → ALLOW → execute. No human in the loop | **3-step replan visible:** (1) RiskHawk proposes $9,500 USDC→MEME → BLOCK 88/100, (2) `[replan]` log + safer $25 USDC→SOL → ALLOW 12/100, (3) LP thin pool BLOCK → replan deep pool ALLOW | Receipt tx shows verdict transition: first tx = BLOCK, second = ALLOW with `execTxRef` |
| B3 | **Use Case Clarity** | 10 | "Would you let an AI wallet manage $10,000?" — safety layer before any agent touches money | 0:00 hook on landing hero. One sentence problem → one risky prompt → one block → one safe outcome | Landing CTA → dashboard proves the story in < 60s |
| B4 | **Verifiability** | 8 | Every decision (ALLOW + BLOCK) writes `DecisionRecorded` on Mantle; dashboard links directly to Mantlescan; `getClawShieldScore()` returns live on-chain data | Click Mantlescan from live feed; decode event: `agentId`, `decisionHash`, `riskScore`, `reasonCodes`, `verdict`, `execTxRef` | **Tx:** `https://sepolia.mantlescan.xyz/tx/{hash}` · **Event:** `DecisionRecorded` on DecisionRegistry |

---

## 90+ Checklist (before submit)

- [ ] `pnpm preflight` — 7/7 green
- [ ] `pnpm demo` — swap block → replan → execute → LP block → replan → badge → score
- [ ] Contracts deployed; addresses in `.env` + `contracts/deployments/mantle-sepolia.json`
- [ ] Dashboard live (not localhost) with `NEXT_PUBLIC_*` contract addresses set
- [ ] Video shows Byreal CLI **on screen** (not just narration)
- [ ] Video shows **3-step replan** with reason codes readable
- [ ] Video clicks through to **Mantlescan receipt**
- [ ] Video tours dashboard UX + Verified badge
- [ ] DoraHacks BUIDL: GitHub, video, live links, contract addresses filled

---

## Quick Judge Commands

```bash
pnpm install
pnpm preflight          # 7/7 checks
pnpm demo               # block → replan → execute → LP → badge
pnpm arena              # 3-agent arena
pnpm dev:dashboard      # http://localhost:3000
pnpm dev:landing        # http://localhost:3001
```

---

## Contract Addresses (Mantle Sepolia)

From `contracts/deployments/mantle-sepolia.json` — replace with your deployed addresses if different:

| Contract | Address | Mantlescan |
|----------|---------|------------|
| ClawShieldDecisionRegistry | `0x5fbdb2315678afecb367f032d93f642f64180aa3` | [/address/0x5fbd…](https://sepolia.mantlescan.xyz/address/0x5fbdb2315678afecb367f032d93f642f64180aa3) |
| ClawShieldVerified | `0xe7f1725e7734ce288f8367e1bb143e90bb3f0512` | [/address/0xe7f1…](https://sepolia.mantlescan.xyz/address/0xe7f1725e7734ce288f8367e1bb143e90bb3f0512) |
| ClawShieldReputationReader | `0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0` | [/address/0x9fe4…](https://sepolia.mantlescan.xyz/address/0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0) |
| ERC-8004 Identity (existing) | `0x8004A818BFB912233c491871b3d84c89A494BD9e` | [/address/0x8004A8…](https://sepolia.mantlescan.xyz/address/0x8004A818BFB912233c491871b3d84c89A494BD9e) |
| ERC-8004 Reputation (existing) | `0x8004B663056A597Dffe9eCcC1965A193B7388713` | [/address/0x8004B6…](https://sepolia.mantlescan.xyz/address/0x8004B663056A597Dffe9eCcC1965A193B7388713) |
