import { notFound } from 'next/navigation';

import { saveReview } from '../actions';
import { MarkdownEditor } from '@/components/admin/markdown-editor';
import { Repeater } from '@/components/admin/repeater';
import { Field, inputCls, MarketSelect, PageHeader, StatusSelect, SubmitRow } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';
import type { ReviewBlockType } from '@/lib/supabase/types';

const dtLocal = (iso: string | null | undefined) => (iso ? iso.slice(0, 16) : '');

const BLOCK_TYPES: ReviewBlockType[] = [
  'RICH_TEXT',
  'IMAGE_LEFT',
  'IMAGE_RIGHT',
  'FULL_WIDTH_IMAGE',
  'SCREENSHOT_GALLERY',
  'FEATURE_GRID',
  'OFFER_CALLOUT',
  'PAYMENT_PANEL',
  'SHIPPING_PANEL',
  'SAFETY_PANEL',
  'DATA_TABLE',
  'QUOTE',
  'RELATED_GUIDES',
  'COMPARISON',
  'CTA',
];

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
  let ratings: { label: string; score: string }[] = [];
  let faqs: { question: string; answer: string }[] = [];
  let blocks: Record<string, string | boolean>[] = [];

  if (!isNew) {
    const { data } = await db.from('reviews').select('*').eq('id', id).maybeSingle();
    if (!data) notFound();
    review = data;

    const [{ data: rr }, { data: rf }, { data: rb }] = await Promise.all([
      db.from('review_ratings').select('label, score, position').eq('review_id', id).order('position'),
      db.from('review_faqs').select('question, answer, position').eq('review_id', id).order('position'),
      db.from('review_blocks').select('*').eq('review_id', id).order('position'),
    ]);
    ratings = (rr ?? []).map((r) => ({ label: r.label, score: String(r.score ?? '') }));
    faqs = (rf ?? []).map((f) => ({ question: f.question, answer: f.answer }));
    blocks = (rb ?? []).map((b) => ({
      block_type: b.block_type,
      heading: b.heading ?? '',
      body: b.body ?? '',
      media_url: b.media_url ?? '',
      alt: b.alt ?? '',
      caption: b.caption ?? '',
      cta_label: b.cta_label ?? '',
      cta_url: b.cta_url ?? '',
      config: b.config ? JSON.stringify(b.config) : '',
      visible: b.visible,
    }));
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

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">SEO &amp; meta</legend>
          <div className="mt-2 space-y-4">
            <Field label="SEO title" htmlFor="seo_title">
              <input id="seo_title" name="seo_title" defaultValue={review?.seo_title ?? ''} className={inputCls} />
            </Field>
            <Field label="Meta description" htmlFor="meta_description">
              <textarea id="meta_description" name="meta_description" rows={2} defaultValue={review?.meta_description ?? ''} className={inputCls} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Canonical URL" htmlFor="canonical_url">
                <input id="canonical_url" name="canonical_url" defaultValue={review?.canonical_url ?? ''} className={inputCls} />
              </Field>
              <Field label="OG image URL" htmlFor="og_image_url">
                <input id="og_image_url" name="og_image_url" defaultValue={review?.og_image_url ?? ''} className={inputCls} />
              </Field>
            </div>
          </div>
        </fieldset>

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">Scoring &amp; best-for</legend>
          <div className="mt-2 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Overall score" htmlFor="overall_score" hint="0 to 5.">
                <input id="overall_score" name="overall_score" type="number" step="0.1" min="0" max="5" defaultValue={review?.overall_score ?? ''} className={inputCls} />
              </Field>
              <Field label="Score descriptor" htmlFor="score_descriptor" hint="e.g. Excellent.">
                <input id="score_descriptor" name="score_descriptor" defaultValue={review?.score_descriptor ?? ''} className={inputCls} />
              </Field>
            </div>
            <Field label="Best-for title" htmlFor="best_for_title">
              <input id="best_for_title" name="best_for_title" defaultValue={review?.best_for_title ?? ''} className={inputCls} />
            </Field>
            <Field label="Best-for description" htmlFor="best_for_description">
              <textarea id="best_for_description" name="best_for_description" rows={2} defaultValue={review?.best_for_description ?? ''} className={inputCls} />
            </Field>
          </div>
        </fieldset>

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">Maintenance</legend>
          <div className="mt-2 space-y-4">
            <Field label="Reviewer" htmlFor="reviewer">
              <input id="reviewer" name="reviewer" defaultValue={review?.reviewer ?? ''} className={inputCls} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Last checked at" htmlFor="last_checked_at">
                <input id="last_checked_at" name="last_checked_at" type="datetime-local" defaultValue={dtLocal(review?.last_checked_at)} className={inputCls} />
              </Field>
              <Field label="Next review at" htmlFor="next_review_at">
                <input id="next_review_at" name="next_review_at" type="datetime-local" defaultValue={dtLocal(review?.next_review_at)} className={inputCls} />
              </Field>
            </div>
          </div>
        </fieldset>

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">Rating breakdown</legend>
          <p className="mb-3 text-xs text-muted">Individual scored criteria. Score is 0 to 5.</p>
          <Repeater
            name="ratings_json"
            addLabel="Add rating"
            initial={ratings}
            newItem={{ label: '', score: '' }}
            itemLabel={(it) => (typeof it.label === 'string' && it.label ? it.label : 'New rating')}
            fields={[
              { key: 'label', label: 'Label', type: 'text', placeholder: 'Value for money' },
              { key: 'score', label: 'Score', type: 'number', min: 0, max: 5, step: 0.1 },
            ]}
          />
        </fieldset>

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">FAQs</legend>
          <Repeater
            name="faqs_json"
            addLabel="Add FAQ"
            initial={faqs}
            newItem={{ question: '', answer: '' }}
            itemLabel={(it) => (typeof it.question === 'string' && it.question ? it.question : 'New FAQ')}
            fields={[
              { key: 'question', label: 'Question', type: 'text', full: true },
              { key: 'answer', label: 'Answer', type: 'textarea', full: true, rows: 3 },
            ]}
          />
        </fieldset>

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">Content blocks</legend>
          <p className="mb-3 text-xs text-muted">
            Ordered, add / remove / reorder / hide. Config is optional advanced JSON (default
            <code className="px-1">{'{}'}</code>).
          </p>
          <Repeater
            name="blocks_json"
            addLabel="Add block"
            initial={blocks}
            newItem={{
              block_type: 'RICH_TEXT',
              heading: '',
              body: '',
              media_url: '',
              alt: '',
              caption: '',
              cta_label: '',
              cta_url: '',
              config: '',
              visible: true,
            }}
            itemLabel={(it) =>
              typeof it.block_type === 'string' ? it.block_type : 'Block'
            }
            fields={[
              {
                key: 'block_type',
                label: 'Block type',
                type: 'select',
                options: BLOCK_TYPES.map((t) => ({ value: t, label: t })),
              },
              { key: 'heading', label: 'Heading', type: 'text' },
              { key: 'body', label: 'Body', type: 'textarea', full: true, rows: 4 },
              { key: 'media_url', label: 'Media URL', type: 'text' },
              { key: 'alt', label: 'Alt text', type: 'text' },
              { key: 'caption', label: 'Caption', type: 'text' },
              { key: 'cta_label', label: 'CTA label', type: 'text' },
              { key: 'cta_url', label: 'CTA URL', type: 'text' },
              {
                key: 'config',
                label: 'Config (JSON)',
                type: 'textarea',
                full: true,
                rows: 2,
                hint: 'Optional. Must be a JSON object, e.g. {"columns":2}.',
              },
              { key: 'visible', label: 'Visible', type: 'checkbox' },
            ]}
          />
        </fieldset>

        <Field label="Status">
          <StatusSelect defaultValue={review?.status} />
        </Field>

        <SubmitRow cancelHref="/admin/reviews" />
      </form>
    </div>
  );
}
