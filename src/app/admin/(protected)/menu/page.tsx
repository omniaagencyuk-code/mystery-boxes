import Link from 'next/link';

import { deleteMenuItem, moveMenuItem } from './actions';
import { DeleteButton, EmptyState, PageHeader } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';
import type { MenuItemRow } from '@/lib/supabase/types';

function MoveButton({ id, dir, label }: { id: string; dir: 'up' | 'down'; label: string }) {
  return (
    <form action={moveMenuItem} className="inline">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="dir" value={dir} />
      <button type="submit" className="rounded border border-line px-1.5 text-xs text-muted hover:text-ink" aria-label={`Move ${dir}`}>
        {label}
      </button>
    </form>
  );
}

function Row({ item, isChild }: { item: MenuItemRow; isChild?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 py-2 ${isChild ? 'pl-6' : ''}`}>
      <div className="min-w-0">
        <span className={`font-medium ${item.active ? 'text-ink' : 'text-muted line-through'}`}>
          {item.label}
        </span>{' '}
        <span className="text-xs text-muted">{item.url ?? '(dropdown label)'}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <MoveButton id={item.id} dir="up" label="▲" />
        <MoveButton id={item.id} dir="down" label="▼" />
        {!isChild && (
          <Link href={`/admin/menu/new?parent=${item.id}`} className="text-muted hover:text-ink">
            Add child
          </Link>
        )}
        <Link href={`/admin/menu/${item.id}`} className="text-primary hover:underline">
          Edit
        </Link>
        <DeleteButton action={deleteMenuItem} id={item.id} />
      </div>
    </div>
  );
}

export default async function MenuListPage() {
  const db = await adminPageClient();
  if (!db) return null;

  const [{ data: items }, { data: markets }] = await Promise.all([
    db.from('menu_items').select('*').order('position', { ascending: true }),
    db.from('markets').select('id, code, name').eq('active', true).order('code'),
  ]);
  const all = items ?? [];

  return (
    <div className="space-y-8">
      <PageHeader title="Menu" action={{ href: '/admin/menu/new', label: 'New item' }} />
      <p className="text-sm text-muted">
        Build the header and footer menus per market. Top-level items can have
        dropdown children. Use the arrows to reorder. Until a market has any
        header items, the default menu is shown on the site.
      </p>

      {(markets ?? []).map((market) => {
        const locations: Array<'header' | 'footer'> = ['header', 'footer'];
        return (
          <section key={market.id} className="space-y-4">
            <h2 className="text-lg font-bold text-ink">{market.name}</h2>
            {locations.map((loc) => {
              const groupTop = all
                .filter((i) => i.market_id === market.id && i.location === loc && i.parent_id === null)
                .sort((a, b) => a.position - b.position);
              return (
                <div key={loc} className="u-glass rounded-xl p-4">
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{loc}</div>
                  {groupTop.length === 0 ? (
                    <EmptyState>
                      {loc === 'header'
                        ? 'No items. The default header menu is shown on the site.'
                        : 'No items.'}
                    </EmptyState>
                  ) : (
                    <div className="divide-y divide-line">
                      {groupTop.map((top) => {
                        const children = all
                          .filter((i) => i.parent_id === top.id)
                          .sort((a, b) => a.position - b.position);
                        return (
                          <div key={top.id}>
                            <Row item={top} />
                            {children.map((child) => (
                              <Row key={child.id} item={child} isChild />
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
