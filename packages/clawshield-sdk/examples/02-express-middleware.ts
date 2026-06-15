/**
 * Example 2: Express middleware integration
 */
import express from "express";
import { clawshieldExpressMiddleware } from "@clawshield/sdk/middleware";
import { DEFAULT_POLICY } from "@clawshield/core";

const app = express();
app.use(express.json());

app.post(
  "/trade",
  clawshieldExpressMiddleware({
    policy: DEFAULT_POLICY,
    portfolioUsd: 10_000,
    onBlock: (result) => console.warn("Blocked trade:", result.reasonCodes),
  }),
  (req, res) => {
    res.json({ status: "executed", action: req.body.action });
  }
);

app.listen(3001, () => console.log("Example server on :3001"));
