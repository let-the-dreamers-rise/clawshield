import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "./lib/cn.js";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-muted">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-lg border bg-surface px-3 py-2 text-sm text-text",
            "placeholder:text-text-dim focus:border-emerald/50 focus:outline-none focus:ring-1 focus:ring-emerald/30",
            error ? "border-block" : "border-border",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-block">{error}</p>}
        {hint && !error && <p className="text-xs text-text-dim">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
