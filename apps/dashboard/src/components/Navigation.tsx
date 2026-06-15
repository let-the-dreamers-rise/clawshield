"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Live Feed" },
  { href: "/arena", label: "Agent Arena" },
  { href: "/receipts", label: "Receipts" },
  { href: "/policy", label: "Policy Editor" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald to-cyan glow-emerald">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-background" fill="currentColor">
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 2.18l7 3.89v5.43c0 4.52-3.07 8.78-7 9.93-3.93-1.15-7-5.41-7-9.93V8.07l7-3.89z" />
            </svg>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-gradient">
              ClawShield
            </span>
            <span className="ml-2 hidden text-xs text-text-dim sm:inline">
              Dashboard
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-all",
                pathname === link.href
                  ? "bg-surface-elevated text-emerald"
                  : "text-text-muted hover:bg-surface hover:text-text"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
