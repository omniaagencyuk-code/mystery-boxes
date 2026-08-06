'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import type { MenuNode } from '@/lib/data/menu';
import { marketPath, type MarketCode } from '@/lib/geo';

function isInternal(url: string) {
  return url.startsWith('/');
}

function MenuLink({
  node,
  onNavigate,
  className,
}: {
  node: MenuNode;
  onNavigate?: () => void;
  className?: string;
}) {
  if (!node.url) return <span className={className}>{node.label}</span>;
  if (isInternal(node.url) && !node.openInNew) {
    return (
      <Link href={node.url} onClick={onNavigate} className={className}>
        {node.label}
      </Link>
    );
  }
  return (
    <a
      href={node.url}
      onClick={onNavigate}
      className={className}
      target={node.openInNew ? '_blank' : undefined}
      rel={node.openInNew ? 'noopener noreferrer' : undefined}
    >
      {node.label}
    </a>
  );
}

function DesktopItem({ node, active }: { node: MenuNode; active: (url: string | null) => boolean }) {
  const [open, setOpen] = useState(false);

  if (node.children.length === 0) {
    return (
      <MenuLink
        node={node}
        className={
          active(node.url)
            ? 'border-b-2 border-primary pb-1 font-semibold text-primary'
            : 'text-muted hover:text-ink'
        }
      />
    );
  }

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-muted hover:text-ink"
        aria-expanded={open}
      >
        {node.label}
        <span aria-hidden className="text-xs">▾</span>
      </button>
      {open && (
        <div className="u-glass absolute left-0 top-full mt-2 min-w-44 rounded-lg p-2">
          {node.url && (
            <MenuLink
              node={node}
              className="block rounded-md px-3 py-2 text-sm font-semibold text-ink hover:bg-elevated"
            />
          )}
          {node.children.map((child) => (
            <MenuLink
              key={child.id}
              node={child}
              className="block rounded-md px-3 py-2 text-sm text-muted hover:bg-elevated hover:text-ink"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function SiteNav({
  current,
  menu,
}: {
  current: MarketCode;
  menu: MenuNode[];
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const active = (url: string | null) =>
    !!url && (pathname === url || pathname.startsWith(`${url}/`));

  return (
    <header className="u-glass sticky top-0 z-50 border-x-0 border-t-0">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-6">
          <Link href={marketPath(current)} className="text-lg font-black tracking-tight text-ink">
            Mystery-Boxes.com
          </Link>
          <nav className="hidden items-center gap-5 text-sm md:flex">
            {menu.map((node) => (
              <DesktopItem key={node.id} node={node} active={active} />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink md:hidden"
          >
            Menu
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-line px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1 text-sm">
            {menu.map((node) => (
              <div key={node.id}>
                <MenuLink
                  node={node}
                  onNavigate={() => setMobileOpen(false)}
                  className={`block rounded-md px-3 py-2 ${
                    active(node.url) ? 'bg-elevated font-semibold text-ink' : 'text-muted'
                  }`}
                />
                {node.children.length > 0 && (
                  <div className="ml-3 border-l border-line pl-2">
                    {node.children.map((child) => (
                      <MenuLink
                        key={child.id}
                        node={child}
                        onNavigate={() => setMobileOpen(false)}
                        className="block rounded-md px-3 py-2 text-muted"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
