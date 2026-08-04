import { notFound } from 'next/navigation';

import { savePage } from '../actions';
import { MarkdownEditor } from '@/components/admin/markdown-editor';
import { Field, inputCls, MarketSelect, PageHeader, StatusSelect, SubmitRow } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';

export default async function PageFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await adminPageClient();
  if (!db) return null;

  const isNew = id === 'new';
  const [{ data: markets }, { data: media }] = await Promise.all([
    db.from('markets').select('id, code, name').order('code'),
    db.from('media').select('title, path, url, mime_type').order('created_at', { ascending: false }),
  ]);
  const imageMedia = (media ?? [])
    .filter((m) => m.mime_type?.startsWith('image/') && m.url)
    .map((m) => ({ url: m.url as string, title: m.title || m.path }));

  let page = null;
  if (!isNew) {
    const { data } = await db.from('pages').select('*').eq('id', id).maybeSingle();
    if (!data) notFound();
    page = data;
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title={isNew ? 'New page' : 'Edit page'} />
      <form action={savePage} className="space-y-4">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="published_at" value={page?.published_at ?? ''} />

        <Field label="Title" htmlFor="title">
          <input id="title" name="title" required defaultValue={page?.title ?? ''} className={inputCls} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug" htmlFor="slug" hint="Blank generates from the title.">
            <input id="slug" name="slug" defaultValue={page?.slug ?? ''} className={inputCls} />
          </Field>
          <Field label="Market">
            <MarketSelect markets={markets ?? []} defaultValue={page?.market_id} required />
          </Field>
        </div>

        <Field label="Meta description" htmlFor="meta_description">
          <textarea id="meta_description" name="meta_description" rows={2} defaultValue={page?.meta_description ?? ''} className={inputCls} />
        </Field>

        <Field label="Body" hint="Use the toolbar for headings, links, tables and images. Preview shows the published look.">
          <div className="mt-1">
            <MarkdownEditor name="body" defaultValue={page?.body ?? ''} rows={16} media={imageMedia} />
          </div>
        </Field>

        <Field label="Status">
          <StatusSelect defaultValue={page?.status} />
        </Field>

        <SubmitRow cancelHref="/admin/pages" />
      </form>
    </div>
  );
}
