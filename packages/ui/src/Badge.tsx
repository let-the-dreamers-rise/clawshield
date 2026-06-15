import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./lib/cn.js";

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "outline";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-surface-elevated text-text-muted border-border",
  success: "bg-emerald/10 text-emerald border-emerald/30",
  warning: "bg-warn/10 text-warn border-warn/30",
  danger: "bg-block/10 text-block border-block/30",
  info: "bg-cyan/10 text-cyan border-cyan/30",
  outline: "bg-transparent text-text-muted border-border",
};

export function Badge({ children, variant = "default", size = "sm", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
