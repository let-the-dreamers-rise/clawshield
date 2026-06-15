import { spawn } from "node:child_process";
import type { ProposedAction } from "@clawshield/core";

export interface ByrealSwapPreview {
  priceImpactPct: number;
  slippageBps: number;
  liquidityUsd: number;
  poolAddress: string;
  estimatedOut: string;
}

export interface ByrealPoolAnalysis {
  poolAddress: string;
  liquidityUsd: number;
  riskScore: number;
  tokenA: string;
  tokenB: string;
}

export interface ByrealPositionPreview {
  poolAddress: string;
  liquidityUsd: number;
  priceImpactPct: number;
  rangeLower: number;
  rangeUpper: number;
}

export interface ByrealExecuteResult {
  txHash: string;
  status: "confirmed" | "simulated";
}

export class ByrealAdapter {
  constructor(
    private readonly cliPath = "npx",
    private readonly demoMode = false
  ) {}

  async swapPreview(action: ProposedAction): Promise<ByrealSwapPreview> {
    if (this.demoMode) {
      return this.demoSwapPreview(action);
    }

    const args = [
      "@byreal-io/byreal-cli",
      "swap",
      "preview",
      "--token-in",
      action.tokenIn,
      "--token-out",
      action.tokenOut,
      "--amount-usd",
      String(action.amountUsd),
      "--slippage-bps",
      String(action.slippageBps),
      "-o",
      "json",
    ];

    const result = await this.runCli(args);
    return {
      priceImpactPct: Number(result.priceImpactPct ?? result.priceImpact ?? 0),
      slippageBps: Number(result.slippageBps ?? action.slippageBps),
      liquidityUsd: Number(result.liquidityUsd ?? result.liquidity ?? 50000),
      poolAddress: String(result.poolAddress ?? result.pool ?? ""),
      estimatedOut: String(result.estimatedOut ?? result.outAmount ?? "0"),
    };
  }

  async swapExecute(action: ProposedAction): Promise<ByrealExecuteResult> {
    if (this.demoMode) {
      return { txHash: `demo-sol-swap-${Date.now()}`, status: "simulated" };
    }

    const args = [
      "@byreal-io/byreal-cli",
      "swap",
      "execute",
      "--token-in",
      action.tokenIn,
      "--token-out",
      action.tokenOut,
      "--amount-usd",
      String(action.amountUsd),
      "--slippage-bps",
      String(action.slippageBps),
      "-o",
      "json",
    ];

    const result = await this.runCli(args);
    return {
      txHash: String(result.txHash ?? result.signature ?? ""),
      status: "confirmed",
    };
  }

  async analyzePool(poolAddress: string): Promise<ByrealPoolAnalysis> {
    if (this.demoMode) {
      return {
        poolAddress,
        liquidityUsd: poolAddress.includes("thin") ? 8000 : 120000,
        riskScore: poolAddress.includes("thin") ? 85 : 20,
        tokenA: "SOL",
        tokenB: "USDC",
      };
    }

    const args = [
      "@byreal-io/byreal-cli",
      "pools",
      "analyze",
      poolAddress,
      "-o",
      "json",
    ];

    const result = await this.runCli(args);
    return {
      poolAddress,
      liquidityUsd: Number(result.liquidityUsd ?? result.liquidity ?? 0),
      riskScore: Number(result.riskScore ?? result.risk ?? 50),
      tokenA: String(result.tokenA ?? result.token0 ?? ""),
      tokenB: String(result.tokenB ?? result.token1 ?? ""),
    };
  }

  async positionOpenPreview(
    action: ProposedAction
  ): Promise<ByrealPositionPreview> {
    if (this.demoMode) {
      const thin = (action.poolAddress ?? "").includes("thin");
      return {
        poolAddress: action.poolAddress ?? "demo-pool",
        liquidityUsd: thin ? 8000 : 95000,
        priceImpactPct: thin ? 38 : 5,
        rangeLower: 0.95,
        rangeUpper: 1.05,
      };
    }

    const args = [
      "@byreal-io/byreal-cli",
      "positions",
      "open",
      "preview",
      "--pool",
      action.poolAddress ?? "",
      "--amount-usd",
      String(action.amountUsd),
      "-o",
      "json",
    ];

    const result = await this.runCli(args);
    return {
      poolAddress: String(result.poolAddress ?? action.poolAddress ?? ""),
      liquidityUsd: Number(result.liquidityUsd ?? 0),
      priceImpactPct: Number(result.priceImpactPct ?? 0),
      rangeLower: Number(result.rangeLower ?? 0),
      rangeUpper: Number(result.rangeUpper ?? 0),
    };
  }

  async positionOpenExecute(action: ProposedAction): Promise<ByrealExecuteResult> {
    if (this.demoMode) {
      return { txHash: `demo-sol-lp-${Date.now()}`, status: "simulated" };
    }

    const args = [
      "@byreal-io/byreal-cli",
      "positions",
      "open",
      "execute",
      "--pool",
      action.poolAddress ?? "",
      "--amount-usd",
      String(action.amountUsd),
      "-o",
      "json",
    ];

    const result = await this.runCli(args);
    return {
      txHash: String(result.txHash ?? result.signature ?? ""),
      status: "confirmed",
    };
  }

  private demoSwapPreview(action: ProposedAction): ByrealSwapPreview {
    const illiquid = action.tokenOut === "MEME" || action.amountUsd > 3000;
    return {
      priceImpactPct: illiquid ? 42 : 3,
      slippageBps: action.slippageBps,
      liquidityUsd: illiquid ? 12000 : 150000,
      poolAddress: illiquid ? "thin-pool-meme" : "sol-usdc-deep",
      estimatedOut: String(Math.floor(action.amountUsd * 0.98)),
    };
  }

  private runCli(args: string[]): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      const child = spawn(this.cliPath, args, {
        shell: true,
        stdio: ["ignore", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (chunk: Buffer) => {
        stdout += chunk.toString();
      });
      child.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      child.on("close", (code) => {
        if (code !== 0) {
          reject(
            new Error(
              `Byreal CLI failed (${code}): ${stderr || stdout || "unknown error"}`
            )
          );
          return;
        }

        try {
          const trimmed = stdout.trim();
          const jsonStart = trimmed.indexOf("{");
          const jsonPayload =
            jsonStart >= 0 ? trimmed.slice(jsonStart) : trimmed;
          resolve(JSON.parse(jsonPayload) as Record<string, unknown>);
        } catch {
          reject(new Error(`Failed to parse Byreal JSON: ${stdout}`));
        }
      });
    });
  }
}
