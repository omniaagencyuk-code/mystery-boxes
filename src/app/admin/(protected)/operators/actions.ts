'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { adminContext, adminContextWithRole, adminDb } from '@/lib/admin/db';
import { logAudit } from '@/lib/admin/audit';
import {
  bool,
  jsonRows,
  lines,
  numOrNull,
  rowStr,
  slugify,
  str,
  strList,
  strOrNull,
  timestampOrNull,
} from '@/lib/admin/form';

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

export async function saveOperator(formData: FormData) {
  const { db, admin } = await adminContext();
  const id = str(formData, 'id');
  const name = str(formData, 'name').trim();

  // Logo: a picked media item wins over a pasted URL. We store the resolved URL
  // on the operator so rendering needs no extra lookup.
  let logoUrl = strOrNull(formData, 'logo_url');
  const logoMediaId = strOrNull(formData, 'logo_media_id');
  if (logoMediaId) {
    const { data: media } = await db.from('media').select('url').eq('id', logoMediaId).maybeSingle();
    if (media?.url) logoUrl = media.url;
  }

  const [heroImageUrl, logoLightUrl, logoDarkUrl] = await Promise.all([
    resolveMediaUrl(db, formData, 'hero_image_url'),
    resolveMediaUrl(db, formData, 'logo_light_url'),
    resolveMediaUrl(db, formData, 'logo_dark_url'),
  ]);

  const values = {
    slug: str(formData, 'slug').trim() || slugify(name),
    name,
    logo_url: logoUrl,
    operator_type_id: str(formData, 'operator_type_id'),
    rating: numOrNull(formData, 'rating'),
    tracking_url: strOrNull(formData, 'tracking_url'),
    licence_authority: strOrNull(formData, 'licence_authority'),
    licence_number: strOrNull(formData, 'licence_number'),
    licence_verified_at: timestampOrNull(formData, 'licence_verified_at'),
    summary: strOrNull(formData, 'summary'),
    pros: lines(formData, 'pros'),
    cons: lines(formData, 'cons'),
    active: bool(formData, 'active'),
    // Platform details.
    website_url: strOrNull(formData, 'website_url'),
    founded_year: numOrNull(formData, 'founded_year'),
    owner: strOrNull(formData, 'owner'),
    min_age: strOrNull(formData, 'min_age'),
    availability: strOrNull(formData, 'availability'),
    kyc_required: strOrNull(formData, 'kyc_required'),
    buyback: strOrNull(formData, 'buyback'),
    mobile_app: strOrNull(formData, 'mobile_app'),
    shipping_info: strOrNull(formData, 'shipping_info'),
    support_info: strOrNull(formData, 'support_info'),
    // Media.
    hero_image_url: heroImageUrl,
    logo_light_url: logoLightUrl,
    logo_dark_url: logoDarkUrl,
    // Homepage table controls (single source of truth for the comparison table).
    homepage_visible: bool(formData, 'homepage_visible'),
    homepage_position: numOrNull(formData, 'homepage_position'),
    recommended: bool(formData, 'recommended'),
    table_label: strOrNull(formData, 'table_label'),
  };

  // Upsert the operator and get its id.
  let operatorId = id;
  if (id && id !== 'new') {
    const { error } = await db.from('operators').update(values).eq('id', id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await db.from('operators').insert(values).select('id').single();
    if (error) throw new Error(error.message);
    operatorId = data.id;
  }

  // Sync market mapping. For each known market, an "include" checkbox decides
  // whether an operator_markets row exists; visible and geo-block are stored on it.
  const marketIds = str(formData, 'market_ids').split(',').filter(Boolean);
  for (const mid of marketIds) {
    if (bool(formData, `m_${mid}_include`)) {
      const { error } = await db.from('operator_markets').upsert(
        {
          operator_id: operatorId,
          market_id: mid,
          visible: bool(formData, `m_${mid}_visible`),
          requires_geo_block: bool(formData, `m_${mid}_geo`),
        },
        { onConflict: 'operator_id,market_id' },
      );
      if (error) throw new Error(error.message);
    } else {
      await db
        .from('operator_markets')
        .delete()
        .eq('operator_id', operatorId)
        .eq('market_id', mid);
    }
  }

  // Sync category mapping: replace the set with the selected categories.
  const categoryIds = strList(formData, 'category_ids');
  await db.from('operator_categories').delete().eq('operator_id', operatorId);
  if (categoryIds.length > 0) {
    const { error } = await db
      .from('operator_categories')
      .insert(categoryIds.map((cid) => ({ operator_id: operatorId, category_id: cid })));
    if (error) throw new Error(error.message);
  }

  // Payment methods: replace-all. Only rows with a name are kept; position is
  // the row order. kind is constrained to the allowed union.
  const kinds = new Set(['deposit', 'withdrawal', 'both']);
  const paymentRows = jsonRows(formData, 'payment_methods_json')
    .map((r, i) => {
      const rawKind = rowStr(r, 'kind');
      return {
        operator_id: operatorId,
        name: rowStr(r, 'name'),
        slug: rowStr(r, 'slug') || null,
        kind: (kinds.has(rawKind) ? rawKind : 'both') as 'deposit' | 'withdrawal' | 'both',
        position: i,
      };
    })
    .filter((r) => r.name.length > 0)
    .map((r, i) => ({ ...r, position: i }));
  await db.from('operator_payment_methods').delete().eq('operator_id', operatorId);
  if (paymentRows.length > 0) {
    const { error } = await db.from('operator_payment_methods').insert(paymentRows);
    if (error) throw new Error(error.message);
  }

  // Related platforms: replace-all. Order of selection is the position; self and
  // duplicates are dropped.
  const relatedIds: string[] = [];
  for (const rid of strList(formData, 'related_ids')) {
    if (rid && rid !== operatorId && !relatedIds.includes(rid)) relatedIds.push(rid);
  }
  await db.from('operator_related').delete().eq('operator_id', operatorId);
  if (relatedIds.length > 0) {
    const { error } = await db.from('operator_related').insert(
      relatedIds.map((rid, i) => ({
        operator_id: operatorId,
        related_operator_id: rid,
        position: i,
      })),
    );
    if (error) throw new Error(error.message);
  }

  await logAudit(db, admin, {
    action: id && id !== 'new' ? 'update' : 'create',
    entity: 'operator',
    entityId: operatorId,
    summary: name || null,
  });

  revalidatePath('/admin/operators');
  redirect('/admin/operators');
}

export async function deleteOperator(formData: FormData) {
  const { db, admin } = await adminContextWithRole(['admin']);
  const id = str(formData, 'id');
  if (id) {
    // operator_markets, operator_categories, offers, reviews cascade on delete.
    const { error } = await db.from('operators').delete().eq('id', id);
    if (error) throw new Error(error.message);
    await logAudit(db, admin, { action: 'delete', entity: 'operator', entityId: id });
  }
  revalidatePath('/admin/operators');
}
