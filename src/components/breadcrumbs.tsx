import Link from 'next/link';

import { JsonLd } from '@/components/json-ld';
import { breadcrumbJsonLd, type BreadcrumbItem } from '@/lib/seo';

/**
 * Visible breadcrumb trail plus BreadcrumbList JSON-LD. Used on every page so
 * search engines get a consistent breadcrumb graph.
 */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-500 dark:text-gray-400">
      <JsonLd data={breadcrumbJsonLd(items)} />
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1">
              {last ? (
                <span aria-current="page" className="text-gray-700 dark:text-gray-200">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link href={item.path} className="hover:underline">
                    {item.name}
                  </Link>
                  <span aria-hidden>/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
