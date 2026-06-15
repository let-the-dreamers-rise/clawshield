import "dotenv/config";
import { ClawShield } from "@clawshield/sdk";
import { DEFAULT_POLICY } from "@clawshield/core";
import { explainVerdict } from "@clawshield/core";

const TELEGRAM_API = "https://api.telegram.org/bot";

interface TelegramUpdate {
  update_id: number;
  message?: {
    chat: { id: number };
    text?: string;
  };
}

async function sendMessage(token: string, chatId: number, text: string): Promise<void> {
  await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });
}

function parseTradePrompt(text: string) {
  const lower = text.toLowerCase();
  const amountMatch = text.match(/\$?(\d+(?:\.\d+)?)/);
  const amountUsd = amountMatch ? parseFloat(amountMatch[1]!) : 50;

  if (lower.includes("pay") || lower.includes("payment")) {
    return { type: "payment" as const, tokenIn: "USDC", tokenOut: "MERCHANT", amountUsd, slippageBps: 0 };
  }
  if (lower.includes("risky") || lower.includes("meme") || lower.includes("all")) {
    return { type: "swap" as const, tokenIn: "USDC", tokenOut: "MEME", amountUsd: Math.max(amountUsd, 5000), slippageBps: 300 };
  }
  return { type: "swap" as const, tokenIn: "USDC", tokenOut: "SOL", amountUsd, slippageBps: 50 };
}

async function handleMessage(token: string, chatId: number, text: string): Promise<void> {
  const shield = new ClawShield({
    agentId: "telegram-bot",
    policy: DEFAULT_POLICY,
    portfolioUsd: 5000,
    demoMode: true,
  });

  if (text.startsWith("/start")) {
    await sendMessage(
      token,
      chatId,
      "*ClawShield Bot*\n\nSend a trade prompt like:\n`swap $50 USDC to SOL`\n`pay $200 to merchant`\n\nI'll run guard checks and reply with the verdict."
    );
    return;
  }

  if (text.startsWith("/help")) {
    await sendMessage(token, chatId, "Commands: /start, /help, or any natural-language trade prompt.");
    return;
  }

  const action = parseTradePrompt(text);
  const result = await shield.guard(action);
  const explanation = explainVerdict(result.verdict, result.reasonCodes, result.riskScore, action.type);

  const emoji = result.verdict === "BLOCK" ? "🛑" : result.verdict === "WARN" ? "⚠️" : "✅";
  let reply = `${emoji} *${result.verdict}*\nRisk: ${result.riskScore}/100\n\n${explanation.summary}`;

  if (explanation.replanHints.length > 0) {
    reply += `\n\n*Replan hints:*\n${explanation.replanHints.map((h) => `• ${h}`).join("\n")}`;
  }

  await sendMessage(token, chatId, reply);
}

async function poll(token: string, offset = 0): Promise<number> {
  const res = await fetch(`${TELEGRAM_API}${token}/getUpdates?offset=${offset}&timeout=30`);
  const data = (await res.json()) as { ok: boolean; result: TelegramUpdate[] };
  if (!data.ok) throw new Error("Telegram API error");

  let nextOffset = offset;
  for (const update of data.result) {
    nextOffset = update.update_id + 1;
    const text = update.message?.text;
    const chatId = update.message?.chat.id;
    if (text && chatId) {
      try {
        await handleMessage(token, chatId, text);
      } catch (err) {
        console.error("Handle message error:", err);
      }
    }
  }
  return nextOffset;
}

async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log("TELEGRAM_BOT_TOKEN not set — running stub mode");
    console.log("Example: swap $100 USDC to SOL");
    const shield = new ClawShield({ agentId: "stub", policy: DEFAULT_POLICY, demoMode: true });
    const result = await shield.guard(parseTradePrompt("swap $100 USDC to SOL"));
    console.log(JSON.stringify({ verdict: result.verdict, risk: result.riskScore, message: result.message }, null, 2));
    return;
  }

  console.log("ClawShield Telegram bot polling...");
  let offset = 0;
  while (true) {
    offset = await poll(token, offset);
  }
}

main().catch(console.error);
