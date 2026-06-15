"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const routeLabels: Record<string, string> = {
  "/": "Live Feed",
  "/arena": "Agent Arena",
  "/receipts": "Receipts",
  "/policy": "Policy Editor",
  "/docs": "SDK Docs",
  "/marketplace": "Marketplace",
  "/verify": "Get Verified",
  "/analytics": "Analytics",
  "/settings": "Settings",
  "/compare": "Compare Agents",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { href: string; label: string }[] = [{ href: "/", label: "Dashboard" }];

  let path = "";
  for (const seg of segments) {
    path += `/${seg}`;
    const label = routeLabels[path] ?? (seg.startsWith("agent") ? "Agent Profile" : seg);
    crumbs.push({ href: path, label });
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-text-dim">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-2">
          {i > 0 && <span>/</span>}
          {i === crumbs.length - 1 ? (
            <span className="text-text-muted">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-emerald">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
