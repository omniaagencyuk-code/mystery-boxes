import { notFound } from 'next/navigation';

import { savePost } from '../actions';
import { MarkdownEditor } from '@/components/admin/markdown-editor';
import { Field, inputCls, MarketSelect, PageHeader, StatusSelect, SubmitRow } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';

export default async function PostFormPage({
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
    db.from('media').select('id, title, path, url, mime_type').order('created_at', { ascending: false }),
  ]);
  const imageMedia = (media ?? [])
    .filter((m) => m.mime_type?.startsWith('image/') && m.url)
    .map((m) => ({ url: m.url as string, title: m.title || m.path }));

  let post = null;
  if (!isNew) {
    const { data } = await db.from('posts').select('*').eq('id', id).maybeSingle();
    if (!data) notFound();
    post = data;
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title={isNew ? 'New post' : 'Edit post'} />
      <form action={savePost} className="space-y-4">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="published_at" value={post?.published_at ?? ''} />

        <Field label="Title" htmlFor="title">
          <input id="title" name="title" required defaultValue={post?.title ?? ''} className={inputCls} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug" htmlFor="slug" hint="Blank generates from the title.">
            <input id="slug" name="slug" defaultValue={post?.slug ?? ''} className={inputCls} />
          </Field>
          <Field label="Market">
            <MarketSelect markets={markets ?? []} defaultValue={post?.market_id} required />
          </Field>
        </div>

        <Field label="Author" htmlFor="author">
          <input id="author" name="author" defaultValue={post?.author ?? ''} className={inputCls} />
        </Field>

        <Field label="Excerpt" htmlFor="excerpt">
          <textarea id="excerpt" name="excerpt" rows={2} defaultValue={post?.excerpt ?? ''} className={inputCls} />
        </Field>

        <Field label="Cover image" htmlFor="cover_media_id" hint="Optional. Upload images in Media.">
          <select id="cover_media_id" name="cover_media_id" defaultValue={post?.cover_media_id ?? ''} className={inputCls}>
            <option value="">None</option>
            {(media ?? []).map((m) => (
              <option key={m.id} value={m.id}>
                {m.title || m.path}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Meta description" htmlFor="meta_description">
          <textarea id="meta_description" name="meta_description" rows={2} defaultValue={post?.meta_description ?? ''} className={inputCls} />
        </Field>

        <Field label="Body" hint="Use the toolbar for headings, links, tables and images. Preview shows the published look.">
          <div className="mt-1">
            <MarkdownEditor name="body" defaultValue={post?.body ?? ''} rows={16} media={imageMedia} />
          </div>
        </Field>

        <Field label="Status">
          <StatusSelect defaultValue={post?.status} />
        </Field>

        <SubmitRow cancelHref="/admin/posts" />
      </form>
    </div>
  );
}
