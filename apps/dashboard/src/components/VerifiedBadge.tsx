import type { VerifiedTier } from "@/lib/types";
import { VERIFIED_TIER_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

const tierStyles: Record<VerifiedTier, string> = {
  none: "bg-surface-elevated text-text-dim border-border",
  verified: "bg-emerald/10 text-emerald border-emerald/30 glow-emerald",
  gold: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  enterprise: "bg-cyan/10 text-cyan border-cyan/30 glow-cyan",
};

interface VerifiedBadgeProps {
  tier: VerifiedTier;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function VerifiedBadge({
  tier,
  size = "md",
  showLabel = true,
}: VerifiedBadgeProps) {
  if (tier === "none") {
    return showLabel ? (
      <span className="text-xs text-text-dim">Unverified</span>
    ) : null;
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        tierStyles[tier],
        sizeClasses[size]
      )}
    >
      <svg viewBox="0 0 20 20" className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} fill="currentColor">
        <path
          fillRule="evenodd"
          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      {showLabel && VERIFIED_TIER_LABELS[tier]}
    </span>
  );
}
