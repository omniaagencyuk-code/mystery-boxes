import { notFound } from 'next/navigation';

import { saveCategory } from '../actions';
import { MarkdownEditor } from '@/components/admin/markdown-editor';
import { Repeater } from '@/components/admin/repeater';
import { Field, inputCls, PageHeader, SubmitRow } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';

type ImageMedia = { id: string; title: string | null; path: string; url: string | null };

/**
 * A media picker (select of image media, which overrides the URL) plus a URL
 * input, matching the operators logo/hero pattern. The select value is a media id.
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

export default async function CategoryFormPage({
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
    db
      .from('media')
      .select('id, title, path, url, mime_type')
      .order('created_at', { ascending: false }),
  ]);
  const imageMedia = (media ?? []).filter((m) => m.mime_type?.startsWith('image/') && m.url);
  const introMedia = imageMedia.map((m) => ({ url: m.url as string, title: m.title || m.path }));

  let category = null;
  let shortcuts: { label: string; target: string }[] = [];
  let brands: { name: string }[] = [];
  let faqs: { question: string; answer: string }[] = [];

  if (!isNew) {
    const { data } = await db.from('categories').select('*').eq('id', id).maybeSingle();
    if (!data) notFound();
    category = data;

    const [{ data: cs }, { data: cb }, { data: cf }] = await Promise.all([
      db.from('category_shortcuts').select('label, target, position').eq('category_id', id).order('position'),
      db.from('category_brands').select('name, position').eq('category_id', id).order('position'),
      db.from('category_faqs').select('question, answer, position').eq('category_id', id).order('position'),
    ]);
    shortcuts = (cs ?? []).map((s) => ({ label: s.label, target: s.target ?? '' }));
    brands = (cb ?? []).map((b) => ({ name: b.name }));
    faqs = (cf ?? []).map((f) => ({ question: f.question, answer: f.answer }));
  }

  return (
    <div className="max-w-2xl">
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

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">Editorial</legend>
          <div className="mt-2 space-y-4">
            <Field label="H1" htmlFor="h1" hint="Optional. Overrides the page heading.">
              <input id="h1" name="h1" defaultValue={category?.h1 ?? ''} placeholder="Defaults to the name" className={inputCls} />
            </Field>
            <Field label="Intro" hint="Markdown. Use the toolbar for headings, links and images.">
              <div className="mt-1">
                <MarkdownEditor name="intro" defaultValue={category?.intro ?? ''} rows={8} media={introMedia} />
              </div>
            </Field>
            <Field label="Accent color" htmlFor="accent_color" hint="A hex color used for landing accents.">
              <input id="accent_color" name="accent_color" defaultValue={category?.accent_color ?? ''} placeholder="#8157FF" className={inputCls} />
            </Field>
          </div>
        </fieldset>

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">Hero image</legend>
          <div className="mt-2">
            <MediaPicker
              label="Hero image"
              base="hero_image_url"
              currentUrl={category?.hero_image_url}
              imageMedia={imageMedia}
              hint="Pick an uploaded image; this overrides the URL below."
            />
          </div>
        </fieldset>

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">SEO &amp; meta</legend>
          <div className="mt-2 space-y-4">
            <Field label="SEO title" htmlFor="seo_title">
              <input id="seo_title" name="seo_title" defaultValue={category?.seo_title ?? ''} className={inputCls} />
            </Field>
            <Field label="Meta description" htmlFor="meta_description">
              <textarea id="meta_description" name="meta_description" rows={2} defaultValue={category?.meta_description ?? ''} className={inputCls} />
            </Field>
          </div>
        </fieldset>

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">Shortcut chips</legend>
          <p className="mb-3 text-xs text-muted">Quick links shown near the top of the landing page.</p>
          <Repeater
            name="shortcuts_json"
            addLabel="Add chip"
            initial={shortcuts}
            newItem={{ label: '', target: '' }}
            labelKey="label"
            labelFallback="New chip"
            fields={[
              { key: 'label', label: 'Label', type: 'text' },
              { key: 'target', label: 'Target', type: 'text', hint: 'A path like /reviews or an anchor like #compare' },
            ]}
          />
        </fieldset>

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">Popular brands</legend>
          <Repeater
            name="brands_json"
            addLabel="Add brand"
            initial={brands}
            newItem={{ name: '' }}
            labelKey="name"
            labelFallback="New brand"
            fields={[{ key: 'name', label: 'Name', type: 'text' }]}
          />
        </fieldset>

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">FAQs</legend>
          <Repeater
            name="faqs_json"
            addLabel="Add FAQ"
            initial={faqs}
            newItem={{ question: '', answer: '' }}
            labelKey="question"
            labelFallback="New FAQ"
            fields={[
              { key: 'question', label: 'Question', type: 'text', full: true },
              { key: 'answer', label: 'Answer', type: 'textarea', full: true, rows: 3 },
            ]}
          />
        </fieldset>

        <SubmitRow cancelHref="/admin/categories" />
      </form>
    </div>
  );
}
