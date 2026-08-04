import { notFound } from 'next/navigation';

import { saveCategory } from '../actions';
import { Field, inputCls, PageHeader, SubmitRow } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';

export default async function CategoryFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await adminPageClient();
  if (!db) return null;

  const isNew = id === 'new';
  const { data: markets } = await db.from('markets').select('id, code, name').order('code');

  let category = null;
  if (!isNew) {
    const { data } = await db.from('categories').select('*').eq('id', id).maybeSingle();
    if (!data) notFound();
    category = data;
  }

  return (
    <div className="max-w-xl">
      <PageHeader title={isNew ? 'New category' : 'Edit category'} />
      <form action={saveCategory} className="space-y-4">
        <input type="hidden" name="id" value={id} />

        <Field label="Name" htmlFor="name">
          <input id="name" name="name" required defaultValue={category?.name ?? ''} className={inputCls} />
        </Field>

        <Field label="Slug" htmlFor="slug" hint="Leave blank to generate from the name.">
          <input id="slug" name="slug" defaultValue={category?.slug ?? ''} className={inputCls} />
        </Field>

        <Field label="Description" htmlFor="description">
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={category?.description ?? ''}
            className={inputCls}
          />
        </Field>

        <Field label="Market" htmlFor="market_id" hint="All markets, or a specific one.">
          <select
            id="market_id"
            name="market_id"
            defaultValue={category?.market_id ?? ''}
            className={inputCls}
          >
            <option value="">All markets</option>
            {(markets ?? []).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.code})
              </option>
            ))}
          </select>
        </Field>

        <SubmitRow cancelHref="/admin/categories" />
      </form>
    </div>
  );
}
