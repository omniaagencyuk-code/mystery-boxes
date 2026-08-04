import Link from 'next/link';

import type { MenuNode } from '@/lib/data/menu';

function FooterLink({ node }: { node: MenuNode }) {
  if (!node.url) return <span className="text-muted">{node.label}</span>;
  if (node.url.startsWith('/') && !node.openInNew) {
    return (
      <Link href={node.url} className="block hover:text-ink">
        {node.label}
      </Link>
    );
  }
  return (
    <a
      href={node.url}
      className="block hover:text-ink"
      target={node.openInNew ? '_blank' : undefined}
      rel={node.openInNew ? 'noopener noreferrer' : undefined}
    >
      {node.label}
    </a>
  );
}

/**
 * Data-driven footer. The brand block and affiliate disclosure are fixed
 * (compliance and identity). The columns are built from footer menu_items, with
 * a default fallback until an admin configures them.
 */
export function SiteFooter({ menu }: { menu: MenuNode[] }) {
  return (
    <footer className="border-t border-line bg-elevated/50 px-4 py-10 text-sm">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-2 sm:col-span-2 md:col-span-1">
          <div className="text-lg font-black text-primary">Mystery-Boxes.com</div>
          <p className="text-xs text-muted">
            An independent comparison and review directory. We may earn a
            commission when you use the links on this site. This does not affect
            what we write. Marked #ad where relevant.
          </p>
        </div>

        {menu.map((column) => (
          <div key={column.id} className="space-y-2 text-muted">
            <div className="text-xs font-bold uppercase tracking-wider text-ink">
              {column.url ? <FooterLink node={{ ...column, children: [] }} /> : column.label}
            </div>
            {column.children.map((child) => (
              <FooterLink key={child.id} node={child} />
            ))}
          </div>
        ))}
      </div>
    </footer>
  );
}
