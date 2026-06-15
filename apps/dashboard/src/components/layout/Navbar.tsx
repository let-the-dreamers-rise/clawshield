"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/ThemeProvider";

const links = [
  { href: "/", label: "Feed" },
  { href: "/arena", label: "Arena" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/analytics", label: "Analytics" },
  { href: "/receipts", label: "Receipts" },
  { href: "/policy", label: "Policy" },
  { href: "/docs", label: "Docs" },
  { href: "/verify", label: "Verify" },
  { href: "/compare", label: "Compare" },
  { href: "/settings", label: "Settings" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald to-cyan glow-emerald">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-background" fill="currentColor">
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 2.18l7 3.89v5.43c0 4.52-3.07 8.78-7 9.93-3.93-1.15-7-5.41-7-9.93V8.07l7-3.89z" />
            </svg>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-gradient">ClawShield</span>
            <span className="ml-2 hidden text-xs text-text-dim sm:inline">Dashboard</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-2.5 py-2 text-sm font-medium transition-all",
                pathname === link.href
                  ? "bg-surface-elevated text-emerald"
                  : "text-text-muted hover:bg-surface hover:text-text"
              )}
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-text-muted hover:bg-surface"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border px-4 py-3 lg:hidden">
          <div className="grid grid-cols-2 gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium",
                  pathname === link.href ? "bg-surface-elevated text-emerald" : "text-text-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
