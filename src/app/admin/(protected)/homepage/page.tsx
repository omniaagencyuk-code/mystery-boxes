import Link from 'next/link';

import { saveHomepage } from './actions';
import { MarkdownEditor } from '@/components/admin/markdown-editor';
import { Repeater } from '@/components/admin/repeater';
import { Field, inputCls, PageHeader, SubmitRow } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';
import type { HomepageSectionType } from '@/lib/supabase/types';

type ImageMedia = { id: string; title: string | null; path: string; url: string | null };

/** The 12 section types, in the default on-page order, as select options. */
const SECTION_OPTIONS: { value: HomepageSectionType; label: string }[] = [
  { value: 'top_rated', label: 'Top rated' },
  { value: 'verified_offers', label: 'Verified offers' },
  { value: 'category_cards', label: 'Category cards' },
  { value: 'comparison', label: 'Comparison' },
  { value: 'latest_reviews', label: 'Latest reviews' },
  { value: 'latest_guides', label: 'Latest guides' },
  { value: 'featured_brands', label: 'Featured brands' },
  { value: 'how_we_rate', label: 'How we rate' },
  { value: 'trust', label: 'Trust' },
  { value: 'faq', label: 'FAQ' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'final_cta', label: 'Final CTA' },
  { value: 'best_sites_article', label: 'Best sites article' },
];

const ARTICLE_BLOCK_OPTIONS = [
  { value: 'H2', label: 'Heading (H2)' },
  { value: 'H3', label: 'Subheading (H3)' },
  { value: 'PARAGRAPH', label: 'Paragraph' },
  { value: 'LIST', label: 'List (one item per line)' },
  { value: 'IMAGE', label: 'Image' },
  { value: 'TABLE', label: 'Table (rows on lines, cells split by |)' },
  { value: 'INFO_BOX', label: 'Info box' },
  { value: 'WARNING_BOX', label: 'Warning box' },
  { value: 'PROS_CONS', label: 'Pros and cons (+ pro / - con per line)' },
  { value: 'BUTTON', label: 'Button' },
  { value: 'INTERNAL_LINK', label: 'Internal link' },
  { value: 'PLATFORM_CARD', label: 'Platform card' },
];

const CARD_STYLE_OPTIONS = [
  { value: '', label: 'Compact (default)' },
  { value: 'compact', label: 'Compact' },
  { value: 'featured', label: 'Featured' },
];

const DEFAULT_SECTION_ORDER: HomepageSectionType[] = [
  'top_rated',
  'verified_offers',
  'category_cards',
  'comparison',
  'latest_reviews',
  'latest_guides',
  'featured_brands',
  'how_we_rate',
  'trust',
  'faq',
  'newsletter',
  'final_cta',
  'best_sites_article',
];

/**
 * A media picker (select of image media, which overrides the URL) plus a URL
 * input, matching the operators pattern. The select value is a media id.
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

export default async function HomepageEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ market?: string }>;
}) {
  const db = await adminPageClient();
  if (!db) return null;

  const { market: marketParam } = await searchParams;

  const [{ data: markets }, { data: media }] = await Promise.all([
    db.from('markets').select('id, code, name').order('code'),
    db
      .from('media')
      .select('id, title, path, url, mime_type')
      .order('created_at', { ascending: false }),
  ]);
  const imageMedia = (media ?? []).filter((m) => m.mime_type?.startsWith('image/') && m.url);
  const introMedia = imageMedia.map((m) => ({ url: m.url as string, title: m.title || m.path }));

  const marketList = markets ?? [];
  const requestedCode = marketParam ?? 'us';
  const selectedMarket =
    marketList.find((m) => m.code === requestedCode) ??
    marketList.find((m) => m.code === 'us') ??
    marketList[0];

  if (!selectedMarket) {
    return (
      <div className="max-w-2xl">
        <PageHeader title="Homepage" />
        <p className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-muted">
          No markets found. Create a market first.
        </p>
      </div>
    );
  }

  const marketId = selectedMarket.id;

  const [
    { data: settings },
    { data: sectionRows },
    { data: trustRows },
    { data: faqRows },
    { data: articleRows },
    { data: operatorRows },
  ] = await Promise.all([
    db.from('homepage_settings').select('*').eq('market_id', marketId).maybeSingle(),
    db
      .from('homepage_sections')
      .select('section_type, visible, position')
      .eq('market_id', marketId)
      .order('position'),
    db
      .from('homepage_trust_indicators')
      .select('label, position')
      .eq('market_id', marketId)
      .order('position'),
    db
      .from('homepage_faqs')
      .select('question, answer, position')
      .eq('market_id', marketId)
      .order('position'),
    db
      .from('homepage_article_blocks')
      .select('block_type, heading, body, operator_id, badge, card_style, media_url, href, visible, position')
      .eq('market_id', marketId)
      .order('position'),
    db.from('operators').select('id, name, slug').eq('active', true).order('name'),
  ]);

  const operatorOptions = [
    { value: '', label: 'No platform' },
    ...(operatorRows ?? []).map((o) => ({ value: o.id, label: o.name })),
  ];
  const articleInitial = (articleRows ?? []).map((b) => ({
    block_type: b.block_type,
    badge: b.badge ?? '',
    heading: b.heading ?? '',
    body: b.body ?? '',
    operator_id: b.operator_id ?? '',
    card_style: b.card_style ?? '',
    media_url: b.media_url ?? '',
    href: b.href ?? '',
    visible: b.visible,
  }));

  const sectionsInitial =
    sectionRows && sectionRows.length > 0
      ? sectionRows.map((s) => ({ section_type: s.section_type, visible: s.visible }))
      : DEFAULT_SECTION_ORDER.map((section_type) => ({ section_type, visible: true }));
  const trustInitial = (trustRows ?? []).map((t) => ({ label: t.label }));
  const faqsInitial = (faqRows ?? []).map((f) => ({ question: f.question, answer: f.answer }));

  return (
    <div className="max-w-2xl">
      <PageHeader title="Homepage" />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {marketList.map((m) => {
          const active = m.id === marketId;
          return (
            <Link
              key={m.id}
              href={`/admin/homepage?market=${m.code}`}
              className={`rounded-md px-3 py-1.5 text-sm ${
                active
                  ? 'bg-primary font-semibold text-onprimary'
                  : 'border border-line text-muted hover:bg-elevated hover:text-ink'
              }`}
            >
              {m.name} ({m.code})
            </Link>
          );
        })}
      </div>

      <form action={saveHomepage} className="space-y-4">
        <input type="hidden" name="market_id" value={marketId} />

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">Hero</legend>
          <div className="mt-2 space-y-4">
            <Field label="Hero title" htmlFor="hero_title">
              <input id="hero_title" name="hero_title" defaultValue={settings?.hero_title ?? ''} className={inputCls} />
            </Field>
            <Field label="Hero intro" htmlFor="hero_intro">
              <textarea id="hero_intro" name="hero_intro" rows={3} defaultValue={settings?.hero_intro ?? ''} className={inputCls} />
            </Field>
            <MediaPicker
              label="Hero image"
              base="hero_image_url"
              currentUrl={settings?.hero_image_url}
              imageMedia={imageMedia}
              hint="Picking media overrides the URL."
            />
          </div>
        </fieldset>

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">Call to action buttons</legend>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <Field label="Primary label" htmlFor="cta_primary_label">
              <input id="cta_primary_label" name="cta_primary_label" defaultValue={settings?.cta_primary_label ?? ''} className={inputCls} />
            </Field>
            <Field label="Primary href" htmlFor="cta_primary_href">
              <input id="cta_primary_href" name="cta_primary_href" defaultValue={settings?.cta_primary_href ?? ''} className={inputCls} />
            </Field>
            <Field label="Secondary label" htmlFor="cta_secondary_label">
              <input id="cta_secondary_label" name="cta_secondary_label" defaultValue={settings?.cta_secondary_label ?? ''} className={inputCls} />
            </Field>
            <Field label="Secondary href" htmlFor="cta_secondary_href">
              <input id="cta_secondary_href" name="cta_secondary_href" defaultValue={settings?.cta_secondary_href ?? ''} className={inputCls} />
            </Field>
          </div>
        </fieldset>

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">Editorial</legend>
          <div className="mt-2 space-y-4">
            <Field label="How we rate" hint="Markdown. Use the toolbar for headings, links and images.">
              <div className="mt-1">
                <MarkdownEditor name="how_we_rate" defaultValue={settings?.how_we_rate ?? ''} rows={8} media={introMedia} />
              </div>
            </Field>
            <Field label="Trust content" hint="Markdown.">
              <div className="mt-1">
                <MarkdownEditor name="trust_content" defaultValue={settings?.trust_content ?? ''} rows={8} media={introMedia} />
              </div>
            </Field>
          </div>
        </fieldset>

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">Newsletter</legend>
          <div className="mt-2 space-y-4">
            <Field label="Heading" htmlFor="newsletter_heading">
              <input id="newsletter_heading" name="newsletter_heading" defaultValue={settings?.newsletter_heading ?? ''} className={inputCls} />
            </Field>
            <Field label="Body" htmlFor="newsletter_body">
              <textarea id="newsletter_body" name="newsletter_body" rows={3} defaultValue={settings?.newsletter_body ?? ''} className={inputCls} />
            </Field>
          </div>
        </fieldset>

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">Final CTA</legend>
          <div className="mt-2 space-y-4">
            <Field label="Heading" htmlFor="final_cta_heading">
              <input id="final_cta_heading" name="final_cta_heading" defaultValue={settings?.final_cta_heading ?? ''} className={inputCls} />
            </Field>
            <Field label="Body" htmlFor="final_cta_body">
              <textarea id="final_cta_body" name="final_cta_body" rows={3} defaultValue={settings?.final_cta_body ?? ''} className={inputCls} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Button label" htmlFor="final_cta_label">
                <input id="final_cta_label" name="final_cta_label" defaultValue={settings?.final_cta_label ?? ''} className={inputCls} />
              </Field>
              <Field label="Button href" htmlFor="final_cta_href">
                <input id="final_cta_href" name="final_cta_href" defaultValue={settings?.final_cta_href ?? ''} className={inputCls} />
              </Field>
            </div>
          </div>
        </fieldset>

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">SEO &amp; meta</legend>
          <div className="mt-2 space-y-4">
            <Field label="SEO title" htmlFor="seo_title">
              <input id="seo_title" name="seo_title" defaultValue={settings?.seo_title ?? ''} className={inputCls} />
            </Field>
            <Field label="Meta description" htmlFor="meta_description">
              <textarea id="meta_description" name="meta_description" rows={2} defaultValue={settings?.meta_description ?? ''} className={inputCls} />
            </Field>
            <Field label="Canonical URL" htmlFor="canonical_url">
              <input id="canonical_url" name="canonical_url" defaultValue={settings?.canonical_url ?? ''} className={inputCls} />
            </Field>
            <MediaPicker
              label="OG image"
              base="og_image_url"
              currentUrl={settings?.og_image_url}
              imageMedia={imageMedia}
              hint="Picking media overrides the URL."
            />
          </div>
        </fieldset>

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">Sections (order &amp; visibility)</legend>
          <p className="mb-3 text-xs text-muted">
            The order here is the on-page order. Unchecking Visible hides a section without removing it.
          </p>
          <Repeater
            name="sections_json"
            addLabel="Add section"
            initial={sectionsInitial}
            newItem={{ section_type: 'top_rated', visible: true }}
            labelKey="section_type"
            labelFallback="Section"
            fields={[
              { key: 'section_type', label: 'Section', type: 'select', options: SECTION_OPTIONS },
              { key: 'visible', label: 'Visible', type: 'checkbox' },
            ]}
          />
        </fieldset>

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">Best sites article</legend>
          <p className="mb-3 text-xs text-muted">
            The homepage article, in order. Use a Platform card block and pick the platform to show its
            card with a Sign up and Read review button. Enable the &ldquo;Best sites article&rdquo; section above to display it.
          </p>
          <Repeater
            name="article_json"
            addLabel="Add block"
            initial={articleInitial}
            newItem={{ block_type: 'PARAGRAPH', badge: '', heading: '', body: '', operator_id: '', card_style: '', media_url: '', href: '', visible: true }}
            labelKey="block_type"
            labelFallback="Block"
            fields={[
              { key: 'block_type', label: 'Type', type: 'select', options: ARTICLE_BLOCK_OPTIONS },
              { key: 'visible', label: 'Visible', type: 'checkbox' },
              { key: 'operator_id', label: 'Platform (for a Platform card)', type: 'select', options: operatorOptions },
              { key: 'card_style', label: 'Card style (Platform card)', type: 'select', options: CARD_STYLE_OPTIONS },
              { key: 'badge', label: 'Badge (e.g. Best Overall)' },
              { key: 'heading', label: 'Heading / label', full: true },
              { key: 'body', label: 'Body text', type: 'textarea', full: true },
              { key: 'media_url', label: 'Image URL (Image block)' },
              { key: 'href', label: 'Link URL (Button / link)' },
            ]}
          />
        </fieldset>

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">Trust indicators</legend>
          <Repeater
            name="trust_json"
            addLabel="Add indicator"
            initial={trustInitial}
            newItem={{ label: '' }}
            labelKey="label"
            labelFallback="New indicator"
            fields={[{ key: 'label', label: 'Label', type: 'text' }]}
          />
        </fieldset>

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">FAQs</legend>
          <Repeater
            name="faqs_json"
            addLabel="Add FAQ"
            initial={faqsInitial}
            newItem={{ question: '', answer: '' }}
            labelKey="question"
            labelFallback="New FAQ"
            fields={[
              { key: 'question', label: 'Question', type: 'text', full: true },
              { key: 'answer', label: 'Answer', type: 'textarea', full: true, rows: 3 },
            ]}
          />
        </fieldset>

        <SubmitRow cancelHref="/admin" />
      </form>
    </div>
  );
}
