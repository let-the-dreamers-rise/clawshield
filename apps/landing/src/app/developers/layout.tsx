import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developers",
  description: "ClawShield SDK install, React hooks, API reference, and OpenClaw skill documentation.",
};

export default function DevelopersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
