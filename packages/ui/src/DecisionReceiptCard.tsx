import { Badge } from "./Badge.js";
import { Card } from "./Card.js";
import { cn } from "./lib/cn.js";

export type Verdict = "ALLOW" | "WARN" | "BLOCK";

export interface DecisionReceiptCardProps {
  decisionHash: string;
  agentName: string;
  actionType: string;
  riskScore: number;
  verdict: Verdict;
  reasonCodes?: string[];
  timestamp: number;
  txHash?: string;
  explorerUrl?: string;
  className?: string;
  animated?: boolean;
}

const verdictVariant: Record<Verdict, "success" | "warning" | "danger"> = {
  ALLOW: "success",
  WARN: "warning",
  BLOCK: "danger",
};

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(ts).toLocaleDateString();
}

function truncateHash(hash: string, len = 10): string {
  if (hash.length <= len * 2) return hash;
  return `${hash.slice(0, len)}…${hash.slice(-6)}`;
}

export function DecisionReceiptCard({
  decisionHash,
  agentName,
  actionType,
  riskScore,
  verdict,
  reasonCodes = [],
  timestamp,
  txHash,
  explorerUrl,
  className,
  animated,
}: DecisionReceiptCardProps) {
  return (
    <Card
      variant="elevated"
      padding="md"
      className={cn(
        "relative overflow-hidden",
        animated && "animate-slide-in",
        className
      )}
    >
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald to-cyan" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={verdictVariant[verdict]}>{verdict}</Badge>
            <span className="text-xs text-text-dim">{formatTime(timestamp)}</span>
          </div>
          <p className="mt-2 font-medium text-text">{agentName}</p>
          <p className="text-sm text-text-muted">
            {actionType} · Risk {riskScore}/100
          </p>
          {reasonCodes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {reasonCodes.map((code) => (
                <Badge key={code} variant="outline" size="sm">
                  {code}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="text-right text-xs font-mono text-text-dim">
          <p>{truncateHash(decisionHash)}</p>
          {txHash && explorerUrl && (
            <a
              href={`${explorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-emerald hover:underline"
            >
              View receipt →
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
