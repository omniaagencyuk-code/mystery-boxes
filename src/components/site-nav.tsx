'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import type { MarketCode } from '@/lib/geo';

interface NavCategory {
  slug: string;
  name: string;
}

export function SiteNav({
  current,
  other,
  otherLabel,
  categories,
}: {
  current: MarketCode;
  other: MarketCode;
  otherLabel: string;
  categories: NavCategory[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: `/${current}/reviews`, label: 'Reviews' },
    { href: `/${current}/compare`, label: 'Compare' },
    { href: `/${current}/promo-codes`, label: 'Promo codes' },
    { href: `/${current}/categories`, label: 'Categories' },
    { href: `/${current}/news`, label: 'News' },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="u-glass sticky top-0 z-50 border-x-0 border-t-0">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-6">
          <Link href={`/${current}`} className="text-lg font-black tracking-tight text-ink">
            Mystery-Boxes.com
          </Link>
          <nav className="hidden items-center gap-5 text-sm md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive(link.href)
                    ? 'border-b-2 border-primary pb-1 font-semibold text-primary'
                    : 'text-muted hover:text-ink'
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted lg:inline">
            {current.toUpperCase()}
          </span>
          <Link
            href={`/${other}`}
            className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-ink hover:bg-elevated"
          >
            Switch to {otherLabel}
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink md:hidden"
          >
            Menu
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-line px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-2 ${
                  isActive(link.href) ? 'bg-elevated font-semibold text-ink' : 'text-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {categories.length > 0 && (
              <div className="mt-2 border-t border-line pt-2">
                <div className="px-3 pb-1 text-xs font-bold uppercase tracking-wider text-muted">
                  Types
                </div>
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/${current}/${cat.slug}`}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2 text-muted"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
