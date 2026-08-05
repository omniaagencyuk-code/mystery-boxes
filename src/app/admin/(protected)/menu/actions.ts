'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { adminContext, adminContextWithRole, adminDb } from '@/lib/admin/db';
import { logAudit } from '@/lib/admin/audit';
import { bool, str, strOrNull } from '@/lib/admin/form';

async function nextPosition(
  db: Awaited<ReturnType<typeof adminDb>>,
  marketId: string,
  location: string,
  parentId: string | null,
): Promise<number> {
  let q = db
    .from('menu_items')
    .select('position')
    .eq('market_id', marketId)
    .eq('location', location)
    .order('position', { ascending: false })
    .limit(1);
  q = parentId ? q.eq('parent_id', parentId) : q.is('parent_id', null);
  const { data } = await q;
  return (data?.[0]?.position ?? -1) + 1;
}

export async function saveMenuItem(formData: FormData) {
  const { db, admin } = await adminContext();
  const id = str(formData, 'id');
  const marketId = str(formData, 'market_id');
  const location = str(formData, 'location') === 'footer' ? 'footer' : 'header';
  const parentId = strOrNull(formData, 'parent_id');

  // Enforce a single level of nesting: a parent must itself be top level, and it
  // must live in the same market and location.
  if (parentId) {
    const { data: parent } = await db
      .from('menu_items')
      .select('parent_id, market_id, location')
      .eq('id', parentId)
      .maybeSingle();
    if (!parent) throw new Error('Parent menu item not found');
    if (parent.parent_id) throw new Error('Menus support one level of dropdowns only');
    if (parent.market_id !== marketId || parent.location !== location) {
      throw new Error('A parent must be in the same market and location');
    }
  }

  const base = {
    market_id: marketId,
    location,
    parent_id: parentId,
    label: str(formData, 'label').trim(),
    url: strOrNull(formData, 'url'),
    open_in_new: bool(formData, 'open_in_new'),
    active: bool(formData, 'active'),
  };

  if (id && id !== 'new') {
    // If the sibling group changed, move to the end of the new group.
    const { data: existing } = await db
      .from('menu_items')
      .select('market_id, location, parent_id, position')
      .eq('id', id)
      .maybeSingle();
    const groupChanged =
      !existing ||
      existing.market_id !== marketId ||
      existing.location !== location ||
      (existing.parent_id ?? null) !== parentId;
    const position = groupChanged
      ? await nextPosition(db, marketId, location, parentId)
      : existing!.position;

    const { error } = await db.from('menu_items').update({ ...base, position }).eq('id', id);
    if (error) throw new Error(error.message);
  } else {
    const position = await nextPosition(db, marketId, location, parentId);
    const { error } = await db.from('menu_items').insert({ ...base, position });
    if (error) throw new Error(error.message);
  }

  await logAudit(db, admin, {
    action: id && id !== 'new' ? 'update' : 'create',
    entity: 'menu_item',
    entityId: id && id !== 'new' ? id : null,
    summary: base.label || null,
  });

  revalidatePath('/admin/menu');
  redirect('/admin/menu');
}

export async function deleteMenuItem(formData: FormData) {
  const { db, admin } = await adminContextWithRole(['admin']);
  const id = str(formData, 'id');
  if (id) {
    // Children cascade via the FK.
    const { error } = await db.from('menu_items').delete().eq('id', id);
    if (error) throw new Error(error.message);
    await logAudit(db, admin, { action: 'delete', entity: 'menu_item', entityId: id });
  }
  revalidatePath('/admin/menu');
}

export async function moveMenuItem(formData: FormData) {
  const { db, admin } = await adminContext();
  const id = str(formData, 'id');
  const dir = str(formData, 'dir'); // 'up' | 'down'

  const { data: item } = await db
    .from('menu_items')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (!item) return;

  let q = db
    .from('menu_items')
    .select('id, position')
    .eq('market_id', item.market_id)
    .eq('location', item.location)
    .order('position', { ascending: true });
  q = item.parent_id ? q.eq('parent_id', item.parent_id) : q.is('parent_id', null);
  const { data: siblings } = await q;
  if (!siblings) return;

  const idx = siblings.findIndex((s) => s.id === id);
  const swapWith = dir === 'up' ? siblings[idx - 1] : siblings[idx + 1];
  if (!swapWith) return;

  // Swap positions.
  await db.from('menu_items').update({ position: swapWith.position }).eq('id', item.id);
  await db.from('menu_items').update({ position: item.position }).eq('id', swapWith.id);

  await logAudit(db, admin, {
    action: 'update',
    entity: 'menu_item',
    entityId: item.id,
    summary: item.label ?? null,
  });

  revalidatePath('/admin/menu');
}
