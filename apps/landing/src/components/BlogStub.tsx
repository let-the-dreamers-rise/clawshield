import Link from "next/link";

const POSTS = [
  {
    slug: "clawshield-verified-launch",
    title: "Introducing ClawShield Verified",
    date: "Jun 10, 2026",
    excerpt: "The ISO-style verification standard for agents that touch money is now live on Mantle Sepolia.",
    tag: "Product",
  },
  {
    slug: "agent-arena-leaderboard",
    title: "Agent Arena: Profit After Violations",
    date: "Jun 8, 2026",
    excerpt: "Why we rank agents by safety-adjusted returns, not raw PnL — and how the leaderboard works.",
    tag: "Engineering",
  },
  {
    slug: "openclaw-skill-release",
    title: "OpenClaw Skill: One Command Safety",
    date: "Jun 5, 2026",
    excerpt: "Add ClawShield guard to any Byreal/OpenClaw agent with npx skills add clawshield.",
    tag: "SDK",
  },
];

export function BlogStub() {
  return (
    <section id="updates" className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">
            Latest <span className="text-gradient">updates</span>
          </h2>
          <Link href="/blog" className="text-sm text-emerald hover:underline">
            View all →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {POSTS.map((post) => (
            <article
              key={post.slug}
              className="group rounded-xl border border-border bg-surface p-6 transition-colors hover:border-emerald/30"
            >
              <span className="text-xs font-medium text-emerald">{post.tag}</span>
              <h3 className="mt-2 text-lg font-semibold group-hover:text-emerald">{post.title}</h3>
              <p className="mt-2 text-sm text-text-muted">{post.excerpt}</p>
              <p className="mt-4 text-xs text-text-dim">{post.date}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
