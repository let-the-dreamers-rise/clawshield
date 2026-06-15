import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://clawshield.xyz";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ClawShield — Safety Standard for AI Agents That Touch Money",
    template: "%s | ClawShield",
  },
  description:
    "The ISO-style safety and reputation layer for autonomous agents. Guard, black box, ClawShield Verified badges on Mantle.",
  keywords: ["ClawShield", "AI agents", "DeFi safety", "Mantle", "ERC-8004", "agent verification"],
  authors: [{ name: "ClawShield" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "ClawShield",
    title: "ClawShield — Safety Standard for AI Agents That Touch Money",
    description:
      "Guard every money-touching action. Permanent decision receipts. ClawShield Verified soulbound badges.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClawShield — Safety Standard for AI Agents",
    description: "The ISO-style safety and reputation layer for autonomous agents that touch money.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
