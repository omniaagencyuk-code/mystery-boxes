'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { adminDb } from '@/lib/admin/db';
import {
  jsonRows,
  numOrNull,
  rowBool,
  rowNumOrNull,
  rowStr,
  str,
  strOrNull,
  timestampOrNull,
} from '@/lib/admin/form';
import type { Json, PublishStatus, ReviewBlockType } from '@/lib/supabase/types';

const BLOCK_TYPES = new Set<ReviewBlockType>([
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
]);

/** Parse a JSON-object config string; anything else falls back to {}. */
function parseConfig(raw: string): Json {
  if (!raw.trim()) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Json;
    return {};
  } catch {
    return {};
  }
}

export async function saveReview(formData: FormData) {
  const db = await adminDb();
  const id = str(formData, 'id');
  const status: PublishStatus = str(formData, 'status') === 'published' ? 'published' : 'draft';
  const existingPublishedAt = strOrNull(formData, 'published_at');

  const values = {
    operator_id: str(formData, 'operator_id'),
    market_id: str(formData, 'market_id'),
    body: strOrNull(formData, 'body'),
    verdict: strOrNull(formData, 'verdict'),
    author: strOrNull(formData, 'author'),
    status,
    published_at:
      status === 'published' ? existingPublishedAt ?? new Date().toISOString() : existingPublishedAt,
    // SEO & meta.
    seo_title: strOrNull(formData, 'seo_title'),
    meta_description: strOrNull(formData, 'meta_description'),
    canonical_url: strOrNull(formData, 'canonical_url'),
    og_image_url: strOrNull(formData, 'og_image_url'),
    // Scoring & best-for.
    overall_score: numOrNull(formData, 'overall_score'),
    score_descriptor: strOrNull(formData, 'score_descriptor'),
    best_for_title: strOrNull(formData, 'best_for_title'),
    best_for_description: strOrNull(formData, 'best_for_description'),
    // Maintenance.
    reviewer: strOrNull(formData, 'reviewer'),
    last_checked_at: timestampOrNull(formData, 'last_checked_at'),
    next_review_at: timestampOrNull(formData, 'next_review_at'),
  };

  // Upsert the review row first so we have an id for the child rows.
  let reviewId = id;
  if (id && id !== 'new') {
    const { error } = await db.from('reviews').update(values).eq('id', id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await db.from('reviews').insert(values).select('id').single();
    if (error) throw new Error(error.message);
    reviewId = data.id;
  }

  // Rating breakdown: replace-all, position = row order. Rows without a label
  // are dropped.
  const ratingRows = jsonRows(formData, 'ratings_json')
    .map((r) => ({ label: rowStr(r, 'label'), score: rowNumOrNull(r, 'score') ?? 0 }))
    .filter((r) => r.label.length > 0)
    .map((r, i) => ({ review_id: reviewId, label: r.label, score: r.score, position: i }));
  await db.from('review_ratings').delete().eq('review_id', reviewId);
  if (ratingRows.length > 0) {
    const { error } = await db.from('review_ratings').insert(ratingRows);
    if (error) throw new Error(error.message);
  }

  // FAQs: replace-all, position = row order. Rows without a question are dropped.
  const faqRows = jsonRows(formData, 'faqs_json')
    .map((r) => ({ question: rowStr(r, 'question'), answer: rowStr(r, 'answer') }))
    .filter((r) => r.question.length > 0)
    .map((r, i) => ({ review_id: reviewId, question: r.question, answer: r.answer, position: i }));
  await db.from('review_faqs').delete().eq('review_id', reviewId);
  if (faqRows.length > 0) {
    const { error } = await db.from('review_faqs').insert(faqRows);
    if (error) throw new Error(error.message);
  }

  // Content blocks: replace-all, position = row order. block_type is constrained
  // to the allowed union; empty rows (no type) are dropped.
  const blockRows = jsonRows(formData, 'blocks_json')
    .map((r) => {
      const rawType = rowStr(r, 'block_type') as ReviewBlockType;
      return {
        block_type: BLOCK_TYPES.has(rawType) ? rawType : ('RICH_TEXT' as ReviewBlockType),
        heading: rowStr(r, 'heading') || null,
        body: rowStr(r, 'body') || null,
        media_url: rowStr(r, 'media_url') || null,
        alt: rowStr(r, 'alt') || null,
        caption: rowStr(r, 'caption') || null,
        cta_label: rowStr(r, 'cta_label') || null,
        cta_url: rowStr(r, 'cta_url') || null,
        config: parseConfig(rowStr(r, 'config')),
        visible: rowBool(r, 'visible'),
        _hasType: rowStr(r, 'block_type').length > 0,
      };
    })
    .filter((r) => r._hasType)
    .map((r, i) => {
      const { _hasType, ...rest } = r;
      void _hasType;
      return { review_id: reviewId, position: i, ...rest };
    });
  await db.from('review_blocks').delete().eq('review_id', reviewId);
  if (blockRows.length > 0) {
    const { error } = await db.from('review_blocks').insert(blockRows);
    if (error) throw new Error(error.message);
  }

  revalidatePath('/admin/reviews');
  redirect('/admin/reviews');
}

export async function deleteReview(formData: FormData) {
  const db = await adminDb();
  const id = str(formData, 'id');
  if (id) {
    const { error } = await db.from('reviews').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
  revalidatePath('/admin/reviews');
}
