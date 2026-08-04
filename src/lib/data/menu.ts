import { cache } from 'react';

import { getMarketByCode } from '@/lib/data/markets';
import type { MarketCode } from '@/lib/geo';
import { createServerSupabase } from '@/lib/supabase/server';

export interface MenuNode {
  id: string;
  label: string;
  url: string | null;
  openInNew: boolean;
  children: MenuNode[];
}

/**
 * Default header menu used when an admin has not configured one yet, so the site
 * is never left without navigation. Once any active header items exist for the
 * market, the configured menu takes over entirely.
 */
function defaultHeaderMenu(market: MarketCode): MenuNode[] {
  const link = (label: string, path: string): MenuNode => ({
    id: `default-${path}`,
    label,
    url: `/${market}${path}`,
    openInNew: false,
    children: [],
  });
  return [
    link('Reviews', '/reviews'),
    link('Compare', '/compare'),
    link('Promo codes', '/promo-codes'),
    link('Categories', '/categories'),
    link('News', '/news'),
  ];
}

/**
 * The header menu for a market as a one-level tree (top-level items with optional
 * dropdown children), ordered by position. Falls back to the default menu when
 * nothing is configured.
 */
export const getHeaderMenu = cache(async (market: MarketCode): Promise<MenuNode[]> => {
  const record = await getMarketByCode(market);
  if (!record) return defaultHeaderMenu(market);

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('menu_items')
    .select('*')
    .eq('market_id', record.id)
    .eq('location', 'header')
    .order('position', { ascending: true });

  const items = data ?? [];
  if (items.length === 0) return defaultHeaderMenu(market);

  const tops = items.filter((i) => i.parent_id === null);
  const childrenOf = (parentId: string) =>
    items
      .filter((i) => i.parent_id === parentId)
      .map((i) => ({ id: i.id, label: i.label, url: i.url, openInNew: i.open_in_new, children: [] }));

  return tops.map((i) => ({
    id: i.id,
    label: i.label,
    url: i.url,
    openInNew: i.open_in_new,
    children: childrenOf(i.id),
  }));
});
