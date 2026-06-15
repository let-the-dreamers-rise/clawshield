import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-4xl font-bold text-gradient">404</h1>
      <p className="mt-4 text-text-muted">Agent or page not found</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-emerald px-4 py-2 text-sm font-semibold text-background"
      >
        Back to Feed
      </Link>
    </div>
  );
}
