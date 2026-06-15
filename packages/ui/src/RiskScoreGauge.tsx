import { cn } from "./lib/cn.js";

export interface RiskScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
  className?: string;
}

function scoreColor(score: number): string {
  if (score < 30) return "#10b981";
  if (score < 60) return "#f59e0b";
  return "#ef4444";
}

export function RiskScoreGauge({ score, size = 120, label, className }: RiskScoreGaugeProps) {
  const clamped = Math.min(100, Math.max(0, score));
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const color = scoreColor(clamped);

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-2xl font-bold" style={{ color }}>
          {clamped}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-text-dim">Risk</span>
      </div>
      {label && <span className="mt-2 text-xs text-text-muted">{label}</span>}
    </div>
  );
}
