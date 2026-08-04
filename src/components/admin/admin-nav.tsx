'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/operators', label: 'Operators' },
  { href: '/admin/reviews', label: 'Reviews' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/pages', label: 'Pages' },
  { href: '/admin/posts', label: 'Posts' },
  { href: '/admin/offers', label: 'Offers' },
  { href: '/admin/affiliate-links', label: 'Affiliate links' },
  { href: '/admin/media', label: 'Media' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 text-sm">
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-3 py-2 ${
              active ? 'bg-primary font-semibold text-onprimary' : 'text-muted hover:bg-elevated hover:text-ink'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
