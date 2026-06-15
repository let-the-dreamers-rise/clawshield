import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-4 text-text-muted">Page not found.</p>
      <Link
        href="/"
        className="mt-8 rounded-lg border border-emerald/40 bg-emerald/10 px-4 py-2 text-sm text-emerald transition hover:bg-emerald/20"
      >
        Back to home
      </Link>
    </main>
  );
}
