"use client";

import { Providers } from "../providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { StatusBar } from "@/components/StatusBar";
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Navbar />
      <StatusBar />
      <main className="mx-auto min-h-[calc(100vh-8rem)] max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumbs />
        {children}
      </main>
      <Footer />
    </Providers>
  );
}
