import { notFound } from 'next/navigation';

import { updateMedia } from '../actions';
import { Field, inputCls, PageHeader, SubmitRow } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';

export default async function MediaEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await adminPageClient();
  if (!db) return null;

  const { data: item } = await db.from('media').select('*').eq('id', id).maybeSingle();
  if (!item) notFound();

  return (
    <div className="max-w-xl space-y-4">
      <PageHeader title="Edit media" />

      {item.url && item.mime_type?.startsWith('image/') && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.url} alt={item.alt ?? ''} className="max-h-64 rounded border border-gray-200 dark:border-gray-700" />
      )}

      <p className="break-all text-xs text-gray-500 dark:text-gray-400">{item.url}</p>

      <form action={updateMedia} className="space-y-4">
        <input type="hidden" name="id" value={id} />
        <Field label="Title" htmlFor="title">
          <input id="title" name="title" defaultValue={item.title ?? ''} className={inputCls} />
        </Field>
        <Field label="Alt text" htmlFor="alt">
          <input id="alt" name="alt" defaultValue={item.alt ?? ''} className={inputCls} />
        </Field>
        <SubmitRow cancelHref="/admin/media" />
      </form>
    </div>
  );
}
