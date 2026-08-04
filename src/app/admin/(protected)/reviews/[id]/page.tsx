import { notFound } from 'next/navigation';

import { saveReview } from '../actions';
import { MarkdownEditor } from '@/components/admin/markdown-editor';
import { Field, inputCls, MarketSelect, PageHeader, StatusSelect, SubmitRow } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';

export default async function ReviewFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await adminPageClient();
  if (!db) return null;

  const isNew = id === 'new';
  const [{ data: operators }, { data: markets }, { data: media }] = await Promise.all([
    db.from('operators').select('id, name').order('name'),
    db.from('markets').select('id, code, name').order('code'),
    db.from('media').select('title, path, url, mime_type').order('created_at', { ascending: false }),
  ]);
  const imageMedia = (media ?? [])
    .filter((m) => m.mime_type?.startsWith('image/') && m.url)
    .map((m) => ({ url: m.url as string, title: m.title || m.path }));

  let review = null;
  if (!isNew) {
    const { data } = await db.from('reviews').select('*').eq('id', id).maybeSingle();
    if (!data) notFound();
    review = data;
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title={isNew ? 'New review' : 'Edit review'} />
      <p className="mb-4 text-sm text-muted">
        One review per operator per market. UK and US reviews of the same operator can differ.
      </p>
      <form action={saveReview} className="space-y-4">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="published_at" value={review?.published_at ?? ''} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Operator" htmlFor="operator_id">
            <select id="operator_id" name="operator_id" required defaultValue={review?.operator_id ?? ''} className={inputCls}>
              {!review && <option value="">Select an operator</option>}
              {(operators ?? []).map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Market">
            <MarketSelect markets={markets ?? []} defaultValue={review?.market_id} required />
          </Field>
        </div>

        <Field label="Author" htmlFor="author">
          <input id="author" name="author" defaultValue={review?.author ?? ''} className={inputCls} />
        </Field>

        <Field label="Verdict" htmlFor="verdict">
          <input id="verdict" name="verdict" defaultValue={review?.verdict ?? ''} className={inputCls} />
        </Field>

        <Field label="Body" hint="Use the toolbar for headings, links, tables and images. Preview shows the published look.">
          <div className="mt-1">
            <MarkdownEditor name="body" defaultValue={review?.body ?? ''} rows={16} media={imageMedia} />
          </div>
        </Field>

        <Field label="Status">
          <StatusSelect defaultValue={review?.status} />
        </Field>

        <SubmitRow cancelHref="/admin/reviews" />
      </form>
    </div>
  );
}
