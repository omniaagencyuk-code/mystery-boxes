'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { adminDb } from '@/lib/admin/db';
import { jsonRows, rowStr, slugify, str, strOrNull } from '@/lib/admin/form';

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

export async function saveCategory(formData: FormData) {
  const db = await adminDb();
  const id = str(formData, 'id');
  const name = str(formData, 'name').trim();
  const slug = str(formData, 'slug').trim() || slugify(name);
  const marketRaw = str(formData, 'market_id').trim();

  const heroImageUrl = await resolveMediaUrl(db, formData, 'hero_image_url');

  const values = {
    name,
    slug,
    description: strOrNull(formData, 'description'),
    market_id: marketRaw || null, // empty means all markets
    h1: strOrNull(formData, 'h1'),
    intro: strOrNull(formData, 'intro'),
    hero_image_url: heroImageUrl,
    accent_color: strOrNull(formData, 'accent_color'),
    seo_title: strOrNull(formData, 'seo_title'),
    meta_description: strOrNull(formData, 'meta_description'),
  };

  // Upsert the category first so we have an id for the child rows.
  let categoryId = id;
  if (id && id !== 'new') {
    const { error } = await db.from('categories').update(values).eq('id', id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await db.from('categories').insert(values).select('id').single();
    if (error) throw new Error(error.message);
    categoryId = data.id;
  }

  // Shortcut chips: replace-all, position = row order. Rows without a label are dropped.
  const shortcutRows = jsonRows(formData, 'shortcuts_json')
    .map((r) => ({ label: rowStr(r, 'label'), target: rowStr(r, 'target') || null }))
    .filter((r) => r.label.length > 0)
    .map((r, i) => ({ category_id: categoryId, label: r.label, target: r.target, position: i }));
  await db.from('category_shortcuts').delete().eq('category_id', categoryId);
  if (shortcutRows.length > 0) {
    const { error } = await db.from('category_shortcuts').insert(shortcutRows);
    if (error) throw new Error(error.message);
  }

  // Popular brands: replace-all, position = row order. Rows without a name are dropped.
  const brandRows = jsonRows(formData, 'brands_json')
    .map((r) => ({ name: rowStr(r, 'name') }))
    .filter((r) => r.name.length > 0)
    .map((r, i) => ({ category_id: categoryId, name: r.name, position: i }));
  await db.from('category_brands').delete().eq('category_id', categoryId);
  if (brandRows.length > 0) {
    const { error } = await db.from('category_brands').insert(brandRows);
    if (error) throw new Error(error.message);
  }

  // FAQs: replace-all, position = row order. Rows without a question are dropped.
  const faqRows = jsonRows(formData, 'faqs_json')
    .map((r) => ({ question: rowStr(r, 'question'), answer: rowStr(r, 'answer') }))
    .filter((r) => r.question.length > 0)
    .map((r, i) => ({ category_id: categoryId, question: r.question, answer: r.answer, position: i }));
  await db.from('category_faqs').delete().eq('category_id', categoryId);
  if (faqRows.length > 0) {
    const { error } = await db.from('category_faqs').insert(faqRows);
    if (error) throw new Error(error.message);
  }

  revalidatePath('/admin/categories');
  redirect('/admin/categories');
}

export async function deleteCategory(formData: FormData) {
  const db = await adminDb();
  const id = str(formData, 'id');
  if (id) {
    const { error } = await db.from('categories').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
  revalidatePath('/admin/categories');
}
