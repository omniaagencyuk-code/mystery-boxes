import { notFound } from 'next/navigation';

import { savePage } from '../actions';
import { MarkdownEditor } from '@/components/admin/markdown-editor';
import { Field, inputCls, MarketSelect, PageHeader, StatusSelect, SubmitRow } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';

const GUIDE_CATEGORIES = ['Beginner', 'How To', 'Safety', 'Strategies', 'News'] as const;

type ImageMedia = { id: string; title: string | null; path: string; url: string | null };

/**
 * A media picker (select of image media, which overrides the URL) plus a URL
 * input. The select value is a media id; the action resolves it to a URL.
 */
function MediaPicker({
  label,
  base,
  currentUrl,
  imageMedia,
  hint,
}: {
  label: string;
  base: string;
  currentUrl: string | null | undefined;
  imageMedia: ImageMedia[];
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Field label={`${label} from media`} htmlFor={`${base}_media_id`} hint={hint}>
        <select id={`${base}_media_id`} name={`${base}_media_id`} defaultValue="" className={inputCls}>
          <option value="">Keep current / use URL below</option>
          {imageMedia.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title || m.path}
            </option>
          ))}
        </select>
      </Field>
      <Field label={`${label} URL`} htmlFor={base}>
        <input id={base} name={base} defaultValue={currentUrl ?? ''} className={inputCls} />
      </Field>
    </div>
  );
}

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
    db.from('media').select('id, title, path, url, mime_type').order('created_at', { ascending: false }),
  ]);
  const imageMedia = (media ?? [])
    .filter((m) => m.mime_type?.startsWith('image/') && m.url)
    .map((m) => ({ id: m.id as string, url: m.url as string, title: m.title || m.path, path: m.path }));

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

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">Guide fields</legend>
          <div className="mt-2 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Guide category"
                htmlFor="guide_category"
                hint="Only used for pages whose slug starts with guides/."
              >
                <select
                  id="guide_category"
                  name="guide_category"
                  defaultValue={page?.guide_category ?? ''}
                  className={inputCls}
                >
                  <option value="">Not a guide / none</option>
                  {GUIDE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Author" htmlFor="author">
                <input id="author" name="author" defaultValue={page?.author ?? ''} className={inputCls} />
              </Field>
            </div>

            <Field
              label="Summary"
              htmlFor="summary"
              hint="Short summary shown on the guides hub cards."
            >
              <textarea id="summary" name="summary" rows={2} defaultValue={page?.summary ?? ''} className={inputCls} />
            </Field>

            <MediaPicker
              label="Hero image"
              base="hero_image_url"
              currentUrl={page?.hero_image_url}
              imageMedia={imageMedia}
              hint="Picking media overrides the URL."
            />
          </div>
        </fieldset>

        <Field label="Status">
          <StatusSelect defaultValue={page?.status} />
        </Field>

        <SubmitRow cancelHref="/admin/pages" />
      </form>
    </div>
  );
}
