import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { evaluatePolicy } from "@clawshield/core";
import type {
  ClawShieldScore,
  GuardResult,
  PolicyConfig,
  ProposedAction,
  VerifiedStatus,
} from "@clawshield/core";
import { ByrealAdapter } from "@clawshield/adapters";
import { MantleAdapter } from "@clawshield/adapters";

export interface ClawShieldConfig {
  policy: PolicyConfig;
  agentId: string;
  demoMode?: boolean;
  portfolioUsd?: number;
  dailySpendUsd?: number;
}

export interface ExecuteResult {
  guard: GuardResult;
  execTxRef?: string;
  mantleTxHash?: string;
}

export interface DemoCapture {
  agentId: string;
  steps: Array<{
    action: ProposedAction;
    guard: GuardResult;
    execTxRef?: string;
    mantleTxHash?: string;
  }>;
}

export class ClawShield {
  private readonly byreal: ByrealAdapter;
  private readonly mantle: MantleAdapter;
  private demoCapture: DemoCapture | null = null;
  private demoStep = 0;

  constructor(private readonly config: ClawShieldConfig) {
    const demo = config.demoMode ?? false;
    this.byreal = new ByrealAdapter("npx", demo);
    this.mantle = new MantleAdapter({ demoMode: demo });
  }

  loadDemoCapture(path?: string): void {
    const capturePath = resolveDemoCapture(path);
    this.demoCapture = JSON.parse(readFileSync(capturePath, "utf-8")) as DemoCapture;
    this.demoStep = 0;
  }

  async guard(action: ProposedAction): Promise<GuardResult> {
    if (this.demoCapture && this.demoStep < this.demoCapture.steps.length) {
      const step = this.demoCapture.steps[this.demoStep];
      this.demoStep += 1;
      return step.guard;
    }

    let poolLiquidityUsd = 50000;
    if (action.type === "swap") {
      const preview = await this.byreal.swapPreview(action);
      poolLiquidityUsd = preview.liquidityUsd;
    } else if (action.type === "lp_open" && action.poolAddress) {
      const pool = await this.byreal.analyzePool(action.poolAddress);
      poolLiquidityUsd = pool.liquidityUsd;
    }

    return evaluatePolicy(action, this.config.policy, {
      poolLiquidityUsd,
      portfolioUsd: this.config.portfolioUsd ?? 10000,
      dailySpendUsd: this.config.dailySpendUsd ?? 0,
    });
  }

  async executeIfAllowed(result: GuardResult): Promise<ExecuteResult> {
    if (result.verdict === "BLOCK") {
      return { guard: result };
    }

    const proposed: ProposedAction = {
      type: result.action.type,
      tokenIn: result.action.inputToken,
      tokenOut: result.action.outputToken,
      amountUsd: result.action.amountUsd,
      slippageBps: 50,
      poolAddress: result.action.poolId,
    };

    let execTxRef: string | undefined;
    if (result.action.type === "swap") {
      const tx = await this.byreal.swapExecute(proposed);
      execTxRef = tx.txHash;
    } else if (result.action.type === "lp_open") {
      const tx = await this.byreal.positionOpenExecute(proposed);
      execTxRef = tx.txHash;
    }

    const mantleTxHash = await this.writeReceipt(result, execTxRef ?? "");
    return { guard: result, execTxRef, mantleTxHash };
  }

  async writeReceipt(result: GuardResult, execTxRef = ""): Promise<string> {
    const hash = await this.mantle.writeReceipt(
      this.config.agentId,
      result,
      execTxRef
    );
    await this.mantle.giveFeedback(
      this.config.agentId,
      100 - result.riskScore,
      result.verdict.toLowerCase()
    );
    return hash;
  }

  async checkVerification(): Promise<VerifiedStatus> {
    return this.mantle.checkVerification(this.config.agentId);
  }

  async getScore(): Promise<ClawShieldScore> {
    return this.mantle.getClawShieldScore(this.config.agentId);
  }

  async mintBadge(tier: "verified" | "gold" | "enterprise" = "verified") {
    return this.mantle.mintVerifiedBadge(this.config.agentId, tier);
  }

  getMantleAdapter() {
    return this.mantle;
  }

  getByrealAdapter() {
    return this.byreal;
  }
}

export async function guard(
  action: ProposedAction,
  policy: PolicyConfig,
  options?: { portfolioUsd?: number; poolLiquidityUsd?: number; dailySpendUsd?: number }
): Promise<GuardResult> {
  return evaluatePolicy(action, policy, options);
}

export { evaluatePolicy } from "@clawshield/core";
export type {
  GuardResult,
  PolicyConfig,
  ProposedAction,
  VerifiedStatus,
  ClawShieldScore,
} from "@clawshield/core";
export { clawshieldExpressMiddleware, clawshieldFastifyHook } from "./middleware.js";
export type { GuardMiddlewareOptions } from "./middleware.js";

function resolveDemoCapture(explicit?: string): string {
  if (explicit && existsSync(explicit)) return explicit;
  const envPath = process.env.DEMO_CAPTURE_PATH;
  if (envPath && existsSync(envPath)) return envPath;

  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    const candidate = resolve(dir, "demo-capture.json");
    if (existsSync(candidate)) return candidate;
    dir = resolve(dir, "..");
  }

  throw new Error("demo-capture.json not found — set DEMO_CAPTURE_PATH or run from repo root");
}
