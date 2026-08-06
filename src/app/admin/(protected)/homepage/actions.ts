'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { adminContext, adminDb } from '@/lib/admin/db';
import { logAudit } from '@/lib/admin/audit';
import { jsonRows, rowBool, rowStr, str, strOrNull } from '@/lib/admin/form';
import type { HomepageArticleBlockType, HomepageSectionType } from '@/lib/supabase/types';

/** The valid homepage section types. */
const SECTION_TYPES = new Set<HomepageSectionType>([
  'top_rated',
  'comparison',
  'category_cards',
  'featured_brands',
  'verified_offers',
  'latest_reviews',
  'latest_guides',
  'how_we_rate',
  'trust',
  'faq',
  'newsletter',
  'final_cta',
  'best_sites_article',
]);

const ARTICLE_BLOCK_TYPES = new Set<HomepageArticleBlockType>([
  'H2',
  'H3',
  'PARAGRAPH',
  'PLATFORM_CARD',
  'CALLOUT',
]);

/** Resolve a media picker: a chosen media id's URL wins over a pasted URL. */
async function resolveMediaUrl(
  db: Awaited<ReturnType<typeof adminDb>>,
  formData: FormData,
  urlKey: string,
): Promise<string | null> {
  let url = strOrNull(formData, urlKey);
  const mediaId = strOrNull(formData, `${urlKey.replace(/_url$/, '')}_media_id`);
  if (mediaId) {
    const { data: media } = await db.from('media').select('url').eq('id', mediaId).maybeSingle();
    if (media?.url) url = media.url;
  }
  return url;
}

export async function saveHomepage(formData: FormData) {
  const { db, admin } = await adminContext();
  const market_id = str(formData, 'market_id');
  if (!market_id) return;

  const [heroImageUrl, ogImageUrl] = await Promise.all([
    resolveMediaUrl(db, formData, 'hero_image_url'),
    resolveMediaUrl(db, formData, 'og_image_url'),
  ]);

  const values = {
    hero_title: strOrNull(formData, 'hero_title'),
    hero_intro: strOrNull(formData, 'hero_intro'),
    hero_image_url: heroImageUrl,
    cta_primary_label: strOrNull(formData, 'cta_primary_label'),
    cta_primary_href: strOrNull(formData, 'cta_primary_href'),
    cta_secondary_label: strOrNull(formData, 'cta_secondary_label'),
    cta_secondary_href: strOrNull(formData, 'cta_secondary_href'),
    how_we_rate: strOrNull(formData, 'how_we_rate'),
    trust_content: strOrNull(formData, 'trust_content'),
    newsletter_heading: strOrNull(formData, 'newsletter_heading'),
    newsletter_body: strOrNull(formData, 'newsletter_body'),
    final_cta_heading: strOrNull(formData, 'final_cta_heading'),
    final_cta_body: strOrNull(formData, 'final_cta_body'),
    final_cta_label: strOrNull(formData, 'final_cta_label'),
    final_cta_href: strOrNull(formData, 'final_cta_href'),
    seo_title: strOrNull(formData, 'seo_title'),
    meta_description: strOrNull(formData, 'meta_description'),
    canonical_url: strOrNull(formData, 'canonical_url'),
    og_image_url: ogImageUrl,
  };

  const { error: settingsError } = await db
    .from('homepage_settings')
    .upsert({ market_id, ...values }, { onConflict: 'market_id' });
  if (settingsError) throw new Error(settingsError.message);

  // Sections: replace-all for this market. Order sets position; unknown types dropped.
  const sections = jsonRows(formData, 'sections_json')
    .filter((r) => SECTION_TYPES.has(rowStr(r, 'section_type') as HomepageSectionType))
    .map((r, i) => ({
      market_id,
      section_type: rowStr(r, 'section_type') as HomepageSectionType,
      visible: rowBool(r, 'visible'),
      position: i,
    }));
  await db.from('homepage_sections').delete().eq('market_id', market_id);
  if (sections.length > 0) {
    const { error } = await db.from('homepage_sections').insert(sections);
    if (error) throw new Error(error.message);
  }

  // Trust indicators: replace-all, position = order, empty labels dropped.
  const trustRows = jsonRows(formData, 'trust_json')
    .map((r) => ({ label: rowStr(r, 'label') }))
    .filter((r) => r.label.length > 0)
    .map((r, i) => ({ market_id, label: r.label, position: i }));
  await db.from('homepage_trust_indicators').delete().eq('market_id', market_id);
  if (trustRows.length > 0) {
    const { error } = await db.from('homepage_trust_indicators').insert(trustRows);
    if (error) throw new Error(error.message);
  }

  // FAQs: replace-all, position = order, empty questions dropped.
  const faqRows = jsonRows(formData, 'faqs_json')
    .map((r) => ({ question: rowStr(r, 'question'), answer: rowStr(r, 'answer') }))
    .filter((r) => r.question.length > 0)
    .map((r, i) => ({ market_id, question: r.question, answer: r.answer, position: i }));
  await db.from('homepage_faqs').delete().eq('market_id', market_id);
  if (faqRows.length > 0) {
    const { error } = await db.from('homepage_faqs').insert(faqRows);
    if (error) throw new Error(error.message);
  }

  // Article blocks: replace-all for this market. Order sets position; an empty
  // operator becomes null so a Platform card without a platform renders nothing.
  const articleRows = jsonRows(formData, 'article_json')
    .filter((r) => ARTICLE_BLOCK_TYPES.has(rowStr(r, 'block_type') as HomepageArticleBlockType))
    .map((r, i) => {
      const operatorId = rowStr(r, 'operator_id');
      const cardStyle = rowStr(r, 'card_style');
      return {
        market_id,
        block_type: rowStr(r, 'block_type') as HomepageArticleBlockType,
        heading: rowStr(r, 'heading') || null,
        body: rowStr(r, 'body') || null,
        operator_id: operatorId || null,
        badge: rowStr(r, 'badge') || null,
        card_style: cardStyle === 'compact' || cardStyle === 'featured' ? cardStyle : null,
        media_url: rowStr(r, 'media_url') || null,
        href: rowStr(r, 'href') || null,
        visible: rowBool(r, 'visible'),
        position: i,
      };
    });
  await db.from('homepage_article_blocks').delete().eq('market_id', market_id);
  if (articleRows.length > 0) {
    const { error } = await db.from('homepage_article_blocks').insert(articleRows);
    if (error) throw new Error(error.message);
  }

  // Homepage table order: the drag-and-drop control posts an ordered array of
  // operator ids. Write the position back to each operator (shared record), so
  // the homepage comparison table reflects the new order.
  const orderIds = (() => {
    try {
      const parsed: unknown = JSON.parse(str(formData, 'homepage_order_json') || '[]');
      return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
    } catch {
      return [];
    }
  })();
  for (let i = 0; i < orderIds.length; i += 1) {
    const { error } = await db
      .from('operators')
      .update({ homepage_position: (i + 1) * 10 })
      .eq('id', orderIds[i]);
    if (error) throw new Error(error.message);
  }

  await logAudit(db, admin, { action: 'update', entity: 'homepage', entityId: market_id });

  revalidatePath('/admin/homepage');
  redirect('/admin/homepage');
}
