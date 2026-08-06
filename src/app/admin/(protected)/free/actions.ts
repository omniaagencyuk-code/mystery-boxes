'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { logAudit } from '@/lib/admin/audit';
import { adminContext } from '@/lib/admin/db';
import { bool, jsonRows, numOrNull, rowBool, rowStr, str, strOrNull } from '@/lib/admin/form';
import type { FreeBodyBlockType, FreePageSectionType } from '@/lib/supabase/types';

const SECTION_TYPES = new Set<FreePageSectionType>([
  'HERO', 'FILTERS', 'FEATURED_OFFERS', 'OFFER_TABLE', 'CATEGORY_CARDS',
  'BODY_CONTENT', 'FAQ', 'NEWSLETTER', 'TRUST_STRIP',
]);
const BLOCK_TYPES = new Set<FreeBodyBlockType>([
  'H2', 'H3', 'PARAGRAPH', 'LIST', 'IMAGE', 'CALLOUT', 'DATA_TABLE',
  'INTERNAL_LINK', 'CTA', 'RELATED_GUIDE', 'RELATED_REVIEW',
]);
const VALUE_KEYS = new Set(['free_offers', 'platforms', 'updated', 'availability']);
const SORTS = new Set(['rating', 'last_verified', 'category', 'offer_type', 'platform']);
const CTA_FALLBACKS = new Set(['visit_site', 'read_review', 'hide', 'view_alternatives']);

/** Replace-all a child table keyed only by nothing (single-page tables). */
async function replaceAll<T extends Record<string, unknown>>(
  db: Awaited<ReturnType<typeof adminContext>>['db'],
  table: string,
  rows: T[],
) {
  const del = await db.from(table).delete().gte('position', -1);
  if (del.error) throw new Error(del.error.message);
  if (rows.length > 0) {
    // Dynamic table name widens the insert row type to never; the callers build
    // correctly-shaped rows, so cast through unknown for this generic helper.
    const ins = await db.from(table).insert(rows as unknown as never[]);
    if (ins.error) throw new Error(ins.error.message);
  }
}

export async function saveFreePage(formData: FormData) {
  const { db, admin } = await adminContext();

  const sort = str(formData, 'table_default_sort');
  const fallback = str(formData, 'table_cta_fallback');
  const indexStatus = str(formData, 'index_status');

  const settings = {
    page_key: 'free',
    h1: strOrNull(formData, 'h1'),
    hero_intro: strOrNull(formData, 'hero_intro'),
    hero_image_url: strOrNull(formData, 'hero_image_url'),
    hero_image_mobile_url: strOrNull(formData, 'hero_image_mobile_url'),
    cta_primary_label: strOrNull(formData, 'cta_primary_label'),
    cta_primary_href: strOrNull(formData, 'cta_primary_href'),
    cta_secondary_label: strOrNull(formData, 'cta_secondary_label'),
    cta_secondary_href: strOrNull(formData, 'cta_secondary_href'),
    newsletter_heading: strOrNull(formData, 'newsletter_heading'),
    newsletter_body: strOrNull(formData, 'newsletter_body'),
    newsletter_placeholder: strOrNull(formData, 'newsletter_placeholder'),
    newsletter_button: strOrNull(formData, 'newsletter_button'),
    newsletter_privacy: strOrNull(formData, 'newsletter_privacy'),
    table_default_sort: SORTS.has(sort) ? sort : 'rating',
    table_page_size: numOrNull(formData, 'table_page_size') ?? 10,
    table_cta_fallback: CTA_FALLBACKS.has(fallback) ? fallback : 'visit_site',
    table_empty_state: strOrNull(formData, 'table_empty_state'),
    seo_title: strOrNull(formData, 'seo_title'),
    meta_description: strOrNull(formData, 'meta_description'),
    canonical_url: strOrNull(formData, 'canonical_url'),
    og_image_url: strOrNull(formData, 'og_image_url'),
    index_status: indexStatus === 'noindex' ? 'noindex' : 'index',
    published: bool(formData, 'published'),
    author: strOrNull(formData, 'author'),
    reviewer: strOrNull(formData, 'reviewer'),
  };
  const { error: sErr } = await db.from('free_page_settings').upsert(settings, { onConflict: 'page_key' });
  if (sErr) throw new Error(sErr.message);

  // Sections (order + visibility).
  const sections = jsonRows(formData, 'sections_json')
    .filter((r) => SECTION_TYPES.has(rowStr(r, 'section_type') as FreePageSectionType))
    .map((r, i) => ({
      section_type: rowStr(r, 'section_type') as FreePageSectionType,
      visible: rowBool(r, 'visible'),
      position: i,
    }));
  await replaceAll(db, 'free_page_sections', sections);

  // Hero stats.
  const stats = jsonRows(formData, 'stats_json')
    .map((r) => ({ label: rowStr(r, 'label'), value_key: rowStr(r, 'value_key'), static_value: rowStr(r, 'static_value') }))
    .filter((r) => r.label.length > 0)
    .map((r, i) => ({
      label: r.label,
      value_key: VALUE_KEYS.has(r.value_key) ? r.value_key : null,
      static_value: r.static_value || null,
      position: i,
    }));
  await replaceAll(db, 'free_page_stats', stats);

  // Featured offers (curated).
  const featured = jsonRows(formData, 'featured_json')
    .map((r) => ({ operator_id: rowStr(r, 'operator_id'), badge: rowStr(r, 'badge') }))
    .filter((r) => r.operator_id.length > 0)
    .map((r, i) => ({ operator_id: r.operator_id, badge: r.badge || null, position: i }));
  await replaceAll(db, 'free_featured_offers', featured);

  // Category cards.
  const cards = jsonRows(formData, 'cards_json')
    .map((r) => ({
      category_id: rowStr(r, 'category_id'),
      label: rowStr(r, 'label'),
      href: rowStr(r, 'href'),
      image_url: rowStr(r, 'image_url'),
    }))
    .filter((r) => r.category_id.length > 0 || r.label.length > 0)
    .map((r, i) => ({
      category_id: r.category_id || null,
      label: r.label || null,
      href: r.href || null,
      image_url: r.image_url || null,
      position: i,
    }));
  await replaceAll(db, 'free_category_cards', cards);

  // SEO body blocks.
  const blocks = jsonRows(formData, 'blocks_json')
    .filter((r) => BLOCK_TYPES.has(rowStr(r, 'block_type') as FreeBodyBlockType))
    .map((r, i) => ({
      block_type: rowStr(r, 'block_type') as FreeBodyBlockType,
      heading: rowStr(r, 'heading') || null,
      body: rowStr(r, 'body') || null,
      media_url: rowStr(r, 'media_url') || null,
      href: rowStr(r, 'href') || null,
      visible: rowBool(r, 'visible'),
      position: i,
    }));
  await replaceAll(db, 'free_body_blocks', blocks);

  // FAQs.
  const faqs = jsonRows(formData, 'faqs_json')
    .map((r) => ({ question: rowStr(r, 'question'), answer: rowStr(r, 'answer') }))
    .filter((r) => r.question.length > 0 && r.answer.length > 0)
    .map((r, i) => ({ question: r.question, answer: r.answer, position: i }));
  await replaceAll(db, 'free_page_faqs', faqs);

  // Trust items.
  const trust = jsonRows(formData, 'trust_json')
    .map((r) => ({ label: rowStr(r, 'label'), detail: rowStr(r, 'detail'), icon: rowStr(r, 'icon') }))
    .filter((r) => r.label.length > 0)
    .map((r, i) => ({ label: r.label, detail: r.detail || null, icon: r.icon || null, position: i }));
  await replaceAll(db, 'free_trust_items', trust);

  await logAudit(db, admin, { action: 'update', entity: 'free_page', entityId: 'free' });

  revalidatePath('/admin/free');
  revalidatePath('/free');
  redirect('/admin/free');
}
