import Link from 'next/link';

import { saveFreePage } from './actions';

import { AdminTabs } from '@/components/admin/admin-tabs';
import { FreePreview } from '@/components/admin/free-preview';
import { Repeater, type RepeaterField, type RepeaterItem } from '@/components/admin/repeater';
import { Field, inputCls, PageHeader } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';

export const dynamic = 'force-dynamic';

const SECTION_OPTIONS = [
  { value: 'HERO', label: 'Hero' },
  { value: 'FILTERS', label: 'Filters' },
  { value: 'FEATURED_OFFERS', label: 'Featured offers' },
  { value: 'OFFER_TABLE', label: 'Offer table' },
  { value: 'CATEGORY_CARDS', label: 'Category cards' },
  { value: 'BODY_CONTENT', label: 'SEO body content' },
  { value: 'FAQ', label: 'FAQ' },
  { value: 'NEWSLETTER', label: 'Newsletter' },
  { value: 'TRUST_STRIP', label: 'Trust strip' },
];
const BLOCK_OPTIONS = [
  'H2', 'H3', 'PARAGRAPH', 'LIST', 'IMAGE', 'CALLOUT', 'DATA_TABLE',
  'INTERNAL_LINK', 'CTA', 'RELATED_GUIDE', 'RELATED_REVIEW',
].map((v) => ({ value: v, label: v }));
const VALUE_KEY_OPTIONS = [
  { value: '', label: 'Static value' },
  { value: 'free_offers', label: 'Count of free offers' },
  { value: 'platforms', label: 'Count of platforms' },
  { value: 'updated', label: 'Updated (static)' },
  { value: 'availability', label: 'Availability (static)' },
];
const ICON_OPTIONS = ['check', 'shield', 'lock', 'globe', 'clock'].map((v) => ({ value: v, label: v }));
const SORT_OPTIONS = [
  { value: 'rating', label: 'Rating' },
  { value: 'last_verified', label: 'Last verified' },
  { value: 'category', label: 'Category' },
  { value: 'offer_type', label: 'Offer type' },
  { value: 'platform', label: 'Platform name' },
];
const FALLBACK_OPTIONS = [
  { value: 'visit_site', label: 'Visit Site' },
  { value: 'read_review', label: 'Read Review' },
  { value: 'hide', label: 'Hide CTA' },
  { value: 'view_alternatives', label: 'View Alternatives' },
];

export default async function FreeAdminPage() {
  const db = await adminPageClient();
  if (!db) return null;

  const [
    { data: settings },
    { data: sections },
    { data: stats },
    { data: featured },
    { data: cards },
    { data: blocks },
    { data: faqs },
    { data: trust },
    { data: operators },
    { data: categories },
  ] = await Promise.all([
    db.from('free_page_settings').select('*').eq('page_key', 'free').maybeSingle(),
    db.from('free_page_sections').select('*').order('position'),
    db.from('free_page_stats').select('*').order('position'),
    db.from('free_featured_offers').select('*').order('position'),
    db.from('free_category_cards').select('*').order('position'),
    db.from('free_body_blocks').select('*').order('position'),
    db.from('free_page_faqs').select('*').order('position'),
    db.from('free_trust_items').select('*').order('position'),
    db.from('operators').select('id, name, slug').eq('active', true).order('name'),
    db.from('categories').select('id, name, slug').order('name'),
  ]);

  const operatorOptions = [{ value: '', label: 'Select platform' }, ...(operators ?? []).map((o) => ({ value: o.id, label: o.name }))];
  const categoryOptions = [{ value: '', label: 'Select category' }, ...(categories ?? []).map((c) => ({ value: c.id, label: c.name }))];

  const sectionInit: RepeaterItem[] = (sections ?? []).map((r) => ({ section_type: r.section_type, visible: r.visible }));
  const statInit: RepeaterItem[] = (stats ?? []).map((r) => ({ label: r.label, value_key: r.value_key ?? '', static_value: r.static_value ?? '' }));
  const featuredInit: RepeaterItem[] = (featured ?? []).map((r) => ({ operator_id: r.operator_id, badge: r.badge ?? '' }));
  const cardInit: RepeaterItem[] = (cards ?? []).map((r) => ({ category_id: r.category_id ?? '', label: r.label ?? '', href: r.href ?? '', image_url: r.image_url ?? '' }));
  const blockInit: RepeaterItem[] = (blocks ?? []).map((r) => ({ block_type: r.block_type, heading: r.heading ?? '', body: r.body ?? '', media_url: r.media_url ?? '', href: r.href ?? '', visible: r.visible }));
  const faqInit: RepeaterItem[] = (faqs ?? []).map((r) => ({ question: r.question, answer: r.answer }));
  const trustInit: RepeaterItem[] = (trust ?? []).map((r) => ({ label: r.label, detail: r.detail ?? '', icon: r.icon ?? '' }));

  const v = (key: keyof NonNullable<typeof settings>): string => {
    const val = settings?.[key];
    return val == null ? '' : String(val);
  };

  const sectionFields: RepeaterField[] = [
    { key: 'section_type', label: 'Section', type: 'select', options: SECTION_OPTIONS },
    { key: 'visible', label: 'Visible', type: 'checkbox' },
  ];
  const statFields: RepeaterField[] = [
    { key: 'label', label: 'Label' },
    { key: 'value_key', label: 'Value source', type: 'select', options: VALUE_KEY_OPTIONS },
    { key: 'static_value', label: 'Static value', hint: 'Used when value source is Static' },
  ];
  const featuredFields: RepeaterField[] = [
    { key: 'operator_id', label: 'Platform', type: 'select', options: operatorOptions },
    { key: 'badge', label: 'Editorial badge', placeholder: 'Editor’s Pick' },
  ];
  const cardFields: RepeaterField[] = [
    { key: 'category_id', label: 'Category', type: 'select', options: categoryOptions },
    { key: 'label', label: 'Label override' },
    { key: 'href', label: 'Link override' },
    { key: 'image_url', label: 'Image URL', full: true },
  ];
  const blockFields: RepeaterField[] = [
    { key: 'block_type', label: 'Type', type: 'select', options: BLOCK_OPTIONS },
    { key: 'visible', label: 'Visible', type: 'checkbox' },
    { key: 'heading', label: 'Heading', full: true },
    { key: 'body', label: 'Body', type: 'textarea', full: true },
    { key: 'media_url', label: 'Media URL' },
    { key: 'href', label: 'Link URL' },
  ];
  const faqFields: RepeaterField[] = [
    { key: 'question', label: 'Question', full: true },
    { key: 'answer', label: 'Answer', type: 'textarea', full: true },
  ];
  const trustFields: RepeaterField[] = [
    { key: 'label', label: 'Label' },
    { key: 'icon', label: 'Icon', type: 'select', options: ICON_OPTIONS },
    { key: 'detail', label: 'Detail', full: true },
  ];

  const general = (
    <>
      <Field label="H1" htmlFor="h1"><input id="h1" name="h1" defaultValue={v('h1')} className={inputCls} /></Field>
      <Field label="Hero intro" htmlFor="hero_intro"><textarea id="hero_intro" name="hero_intro" rows={3} defaultValue={v('hero_intro')} className={inputCls} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Hero image URL" htmlFor="hero_image_url"><input id="hero_image_url" name="hero_image_url" defaultValue={v('hero_image_url')} className={inputCls} /></Field>
        <Field label="Mobile hero image URL" htmlFor="hero_image_mobile_url"><input id="hero_image_mobile_url" name="hero_image_mobile_url" defaultValue={v('hero_image_mobile_url')} className={inputCls} /></Field>
        <Field label="Primary CTA label" htmlFor="cta_primary_label"><input id="cta_primary_label" name="cta_primary_label" defaultValue={v('cta_primary_label')} className={inputCls} /></Field>
        <Field label="Primary CTA link" htmlFor="cta_primary_href"><input id="cta_primary_href" name="cta_primary_href" defaultValue={v('cta_primary_href')} className={inputCls} /></Field>
        <Field label="Secondary CTA label" htmlFor="cta_secondary_label"><input id="cta_secondary_label" name="cta_secondary_label" defaultValue={v('cta_secondary_label')} className={inputCls} /></Field>
        <Field label="Secondary CTA link" htmlFor="cta_secondary_href"><input id="cta_secondary_href" name="cta_secondary_href" defaultValue={v('cta_secondary_href')} className={inputCls} /></Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" name="published" defaultChecked={settings?.published ?? false} /> Published
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Author" htmlFor="author"><input id="author" name="author" defaultValue={v('author')} className={inputCls} /></Field>
        <Field label="Reviewer" htmlFor="reviewer"><input id="reviewer" name="reviewer" defaultValue={v('reviewer')} className={inputCls} /></Field>
      </div>
      <fieldset className="rounded-lg border border-line p-4">
        <legend className="px-1 text-sm font-semibold text-ink">Hero statistics</legend>
        <Repeater name="stats_json" fields={statFields} initial={statInit} newItem={{ label: '', value_key: '', static_value: '' }} labelKey="label" labelFallback="Stat" addLabel="Add stat" />
      </fieldset>
      <fieldset className="rounded-lg border border-line p-4">
        <legend className="px-1 text-sm font-semibold text-ink">Newsletter</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Heading" htmlFor="newsletter_heading"><input id="newsletter_heading" name="newsletter_heading" defaultValue={v('newsletter_heading')} className={inputCls} /></Field>
          <Field label="Button text" htmlFor="newsletter_button"><input id="newsletter_button" name="newsletter_button" defaultValue={v('newsletter_button')} className={inputCls} /></Field>
          <Field label="Body" htmlFor="newsletter_body"><input id="newsletter_body" name="newsletter_body" defaultValue={v('newsletter_body')} className={inputCls} /></Field>
          <Field label="Input placeholder" htmlFor="newsletter_placeholder"><input id="newsletter_placeholder" name="newsletter_placeholder" defaultValue={v('newsletter_placeholder')} className={inputCls} /></Field>
          <Field label="Privacy note" htmlFor="newsletter_privacy"><input id="newsletter_privacy" name="newsletter_privacy" defaultValue={v('newsletter_privacy')} className={inputCls} /></Field>
        </div>
      </fieldset>
      <fieldset className="rounded-lg border border-line p-4">
        <legend className="px-1 text-sm font-semibold text-ink">Trust strip</legend>
        <Repeater name="trust_json" fields={trustFields} initial={trustInit} newItem={{ label: '', detail: '', icon: 'check' }} labelKey="label" labelFallback="Trust item" addLabel="Add trust item" />
      </fieldset>
    </>
  );

  const layout = (
    <fieldset className="rounded-lg border border-line p-4">
      <legend className="px-1 text-sm font-semibold text-ink">Sections (order and visibility)</legend>
      <Repeater name="sections_json" fields={sectionFields} initial={sectionInit} newItem={{ section_type: 'HERO', visible: true }} labelKey="section_type" labelFallback="Section" addLabel="Add section" />
    </fieldset>
  );

  const table = (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Default sort" htmlFor="table_default_sort">
        <select id="table_default_sort" name="table_default_sort" defaultValue={v('table_default_sort') || 'rating'} className={inputCls}>
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>
      <Field label="Results per page" htmlFor="table_page_size"><input id="table_page_size" name="table_page_size" type="number" min={1} defaultValue={v('table_page_size') || '10'} className={inputCls} /></Field>
      <Field label="CTA fallback (when no affiliate URL)" htmlFor="table_cta_fallback">
        <select id="table_cta_fallback" name="table_cta_fallback" defaultValue={v('table_cta_fallback') || 'visit_site'} className={inputCls}>
          {FALLBACK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>
      <Field label="Empty state message" htmlFor="table_empty_state"><textarea id="table_empty_state" name="table_empty_state" rows={2} defaultValue={v('table_empty_state')} className={inputCls} /></Field>
    </div>
  );

  const seo = (
    <div className="space-y-4">
      <Field label="SEO title" htmlFor="seo_title"><input id="seo_title" name="seo_title" defaultValue={v('seo_title')} className={inputCls} /></Field>
      <Field label="Meta description" htmlFor="meta_description"><textarea id="meta_description" name="meta_description" rows={2} defaultValue={v('meta_description')} className={inputCls} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Canonical URL" htmlFor="canonical_url"><input id="canonical_url" name="canonical_url" defaultValue={v('canonical_url')} className={inputCls} /></Field>
        <Field label="Open Graph image URL" htmlFor="og_image_url"><input id="og_image_url" name="og_image_url" defaultValue={v('og_image_url')} className={inputCls} /></Field>
      </div>
      <Field label="Index status" htmlFor="index_status">
        <select id="index_status" name="index_status" defaultValue={v('index_status') || 'index'} className={inputCls}>
          <option value="index">Index</option>
          <option value="noindex">No index</option>
        </select>
      </Field>
    </div>
  );

  const tabs = [
    { id: 'general', label: 'General', content: general },
    { id: 'layout', label: 'Layout', content: layout },
    { id: 'featured', label: 'Featured Offers', content: <Repeater name="featured_json" fields={featuredFields} initial={featuredInit} newItem={{ operator_id: '', badge: '' }} labelKey="badge" labelFallback="Featured offer" addLabel="Add featured offer" /> },
    { id: 'table', label: 'Table', content: table },
    { id: 'categories', label: 'Categories', content: <Repeater name="cards_json" fields={cardFields} initial={cardInit} newItem={{ category_id: '', label: '', href: '', image_url: '' }} labelKey="label" labelFallback="Category card" addLabel="Add category card" /> },
    { id: 'content', label: 'Content', content: <Repeater name="blocks_json" fields={blockFields} initial={blockInit} newItem={{ block_type: 'H2', heading: '', body: '', media_url: '', href: '', visible: true }} labelKey="heading" labelFallback="Block" addLabel="Add block" /> },
    { id: 'faq', label: 'FAQ', content: <Repeater name="faqs_json" fields={faqFields} initial={faqInit} newItem={{ question: '', answer: '' }} labelKey="question" labelFallback="FAQ" addLabel="Add FAQ" /> },
    { id: 'seo', label: 'SEO', content: seo },
    { id: 'preview', label: 'Preview', content: <FreePreview /> },
  ];

  return (
    <div>
      <PageHeader title="Free page" action={{ href: '/free', label: 'View page' }} />
      <form action={saveFreePage}>
        <AdminTabs tabs={tabs} />
        <div className="mt-6 flex items-center gap-3 border-t border-line pt-4">
          <button type="submit" className="u-btn-primary rounded-lg px-5 py-2 text-sm font-bold">Save free page</button>
          <Link href="/admin" className="text-sm text-muted hover:text-ink">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
