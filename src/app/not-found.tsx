import Link from 'next/link';

// Rendered with a 404 status for genuinely missing pages and for hard
// geo-blocked operators. The copy is intentionally generic so a blocked page
// does not reveal that it exists.
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-base text-gray-600 dark:text-gray-300">
        We could not find the page you were looking for.
      </p>
      <Link
        href="/"
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
      >
        Go to the homepage
      </Link>
    </main>
  );
}
