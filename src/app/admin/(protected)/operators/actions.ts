'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { adminDb } from '@/lib/admin/db';
import { bool, lines, numOrNull, str, strList, strOrNull, slugify, timestampOrNull } from '@/lib/admin/form';

export async function saveOperator(formData: FormData) {
  const db = await adminDb();
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

  revalidatePath('/admin/operators');
  redirect('/admin/operators');
}

export async function deleteOperator(formData: FormData) {
  const db = await adminDb();
  const id = str(formData, 'id');
  if (id) {
    // operator_markets, operator_categories, offers, reviews cascade on delete.
    const { error } = await db.from('operators').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
  revalidatePath('/admin/operators');
}
