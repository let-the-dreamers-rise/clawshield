import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "ClawShield Verified tiers — Verified, Gold, and Enterprise pricing with feature matrix.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
