import Link from 'next/link';

// Rendered with a 404 status for genuinely missing pages and for hard
// geo-blocked operators. The copy is intentionally generic so a blocked page
// does not reveal that it exists.
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-bold text-ink">Page not found</h1>
      <p className="text-base text-muted">We could not find the page you were looking for.</p>
      <Link
        href="/"
        className="u-btn-primary rounded-lg px-5 py-2.5 text-sm font-bold"
      >
        Go to the homepage
      </Link>
    </main>
  );
}
