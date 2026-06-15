import Link from "next/link";
import { GITHUB_URL } from "@/lib/config";

const footerLinks = [
  { href: "/docs", label: "SDK Docs" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/verify", label: "Get Verified" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="text-lg font-bold text-gradient">ClawShield</span>
            <p className="mt-2 text-sm text-text-dim">
              The safety and reputation layer for autonomous agents that touch money.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text">Platform</h4>
            <ul className="mt-3 space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-text-dim hover:text-emerald">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text">Resources</h4>
            <ul className="mt-3 space-y-2 text-sm text-text-dim">
              <li>
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-emerald">
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://sepolia.mantlescan.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-emerald">
                  Mantlescan
                </a>
              </li>
              <li>
                <Link href="/docs" className="hover:text-emerald">API Reference</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text">Status</h4>
            <p className="mt-3 text-sm text-text-dim">
              Mantle Sepolia · ERC-8004 · Live
            </p>
            <p className="mt-1 text-xs text-emerald">All systems operational</p>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-xs text-text-dim">
          © {new Date().getFullYear()} ClawShield. Built for the Mantle AI Hackathon.
        </div>
      </div>
    </footer>
  );
}
