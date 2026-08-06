import { notFound } from 'next/navigation';

import { saveMenuItem } from '../actions';
import { Field, inputCls, PageHeader, SubmitRow } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';

export default async function MenuItemFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ parent?: string }>;
}) {
  const { id } = await params;
  const { parent: parentFromQuery } = await searchParams;
  const db = await adminPageClient();
  if (!db) return null;

  const isNew = id === 'new';
  const [{ data: markets }, { data: tops }] = await Promise.all([
    db.from('markets').select('id, code, name').eq('active', true).order('code'),
    db.from('menu_items').select('id, label, market_id, location').is('parent_id', null).order('label'),
  ]);

  let item = null;
  if (!isNew) {
    const { data } = await db.from('menu_items').select('*').eq('id', id).maybeSingle();
    if (!data) notFound();
    item = data;
  }

  const parentDefault = item?.parent_id ?? parentFromQuery ?? '';
  const marketCode = new Map((markets ?? []).map((m) => [m.id, m.code]));

  return (
    <div className="max-w-xl">
      <PageHeader title={isNew ? 'New menu item' : 'Edit menu item'} />
      <form action={saveMenuItem} className="space-y-4">
        <input type="hidden" name="id" value={id} />

        <Field label="Label" htmlFor="label">
          <input id="label" name="label" required defaultValue={item?.label ?? ''} className={inputCls} />
        </Field>

        <Field label="URL" htmlFor="url" hint="Internal path like /reviews or a full external URL. Leave blank for a dropdown label with no link.">
          <input id="url" name="url" defaultValue={item?.url ?? ''} className={inputCls} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Market" htmlFor="market_id">
            <select id="market_id" name="market_id" required defaultValue={item?.market_id ?? ''} className={inputCls}>
              {!item && <option value="">Select a market</option>}
              {(markets ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.code})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Location" htmlFor="location">
            <select id="location" name="location" defaultValue={item?.location ?? 'header'} className={inputCls}>
              <option value="header">Header</option>
              <option value="footer">Footer</option>
            </select>
          </Field>
        </div>

        <Field label="Parent" htmlFor="parent_id" hint="Choose a top-level item to make this a dropdown child. Must match the market and location.">
          <select id="parent_id" name="parent_id" defaultValue={parentDefault} className={inputCls}>
            <option value="">None (top level)</option>
            {(tops ?? [])
              .filter((t) => t.id !== id)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label} ({marketCode.get(t.market_id)} / {t.location})
                </option>
              ))}
          </select>
        </Field>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="open_in_new" defaultChecked={item ? item.open_in_new : false} />
            Open in a new tab
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" defaultChecked={item ? item.active : true} />
            Active
          </label>
        </div>

        <SubmitRow cancelHref="/admin/menu" />
      </form>
    </div>
  );
}
