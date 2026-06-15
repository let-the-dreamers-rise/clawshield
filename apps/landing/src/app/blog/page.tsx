import Link from "next/link";
import { BlogStub } from "@/components/BlogStub";

export default function BlogPage() {
  return (
    <main className="pt-24 pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <h1 className="text-4xl font-bold">
          Blog & <span className="text-gradient">Updates</span>
        </h1>
        <p className="mt-4 text-text-muted">
          Product announcements, engineering deep-dives, and ecosystem news
        </p>
        <BlogStub />
        <p className="mt-8 text-center text-sm text-text-dim">
          More posts coming soon.{" "}
          <Link href="/" className="text-emerald hover:underline">Back to home</Link>
        </p>
      </div>
    </main>
  );
}
