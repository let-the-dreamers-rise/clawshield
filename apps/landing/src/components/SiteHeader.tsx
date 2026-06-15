import Link from "next/link";
import { DASHBOARD_URL, GITHUB_URL } from "@/lib/config";

export function SiteHeader() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald to-cyan">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-background" fill="currentColor">
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gradient">ClawShield</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-text-muted md:flex">
          <a href="/#pillars" className="hover:text-emerald">Product</a>
          <Link href="/pricing" className="hover:text-emerald">Pricing</Link>
          <Link href="/developers" className="hover:text-emerald">Developers</Link>
          <a href="/#verified" className="hover:text-emerald">Verified</a>
          <a href="/#faq" className="hover:text-emerald">FAQ</a>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-emerald">
            GitHub
          </a>
        </nav>

        <a
          href={DASHBOARD_URL}
          className="rounded-lg bg-emerald px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
        >
          Live Demo
        </a>
      </div>
    </header>
  );
}
