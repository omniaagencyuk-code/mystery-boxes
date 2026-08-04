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

export type MenuLocation = 'header' | 'footer';

const leaf = (label: string, url: string | null): MenuNode => ({
  id: `default-${label}-${url ?? ''}`,
  label,
  url,
  openInNew: false,
  children: [],
});

/**
 * Default menus used when an admin has not configured a location yet, so the
 * site is never left without navigation. Once any active item exists for the
 * market and location, the configured menu takes over entirely.
 */
function defaultMenu(market: MarketCode, location: MenuLocation): MenuNode[] {
  if (location === 'footer') {
    return [
      {
        ...leaf('Explore', null),
        children: [
          leaf('Reviews', `/${market}/reviews`),
          leaf('Compare', `/${market}/compare`),
          leaf('Promo codes', `/${market}/promo-codes`),
          leaf('Categories', `/${market}/categories`),
          leaf('News', `/${market}/news`),
        ],
      },
      {
        ...leaf('Legal', null),
        children: [
          leaf('About us', `/${market}/about`),
          leaf('Privacy policy', `/${market}/privacy-policy`),
          leaf('Terms of use', `/${market}/terms`),
          leaf('Responsible gambling', `/${market}/responsible-gambling`),
        ],
      },
      { ...leaf('More', null), children: [leaf('Sitemap', '/sitemap.xml')] },
    ];
  }

  return [
    leaf('Reviews', `/${market}/reviews`),
    leaf('Compare', `/${market}/compare`),
    leaf('Promo codes', `/${market}/promo-codes`),
    leaf('Categories', `/${market}/categories`),
    leaf('News', `/${market}/news`),
  ];
}

/**
 * A menu for a market and location as a one-level tree (top-level items with
 * optional children), ordered by position. Falls back to the default menu when
 * nothing is configured.
 */
export const getMenu = cache(
  async (market: MarketCode, location: MenuLocation): Promise<MenuNode[]> => {
    const record = await getMarketByCode(market);
    if (!record) return defaultMenu(market, location);

    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .eq('market_id', record.id)
      .eq('location', location)
      .order('position', { ascending: true });

    const items = data ?? [];
    if (items.length === 0) return defaultMenu(market, location);

    const tops = items.filter((i) => i.parent_id === null);
    return tops.map((i) => ({
      id: i.id,
      label: i.label,
      url: i.url,
      openInNew: i.open_in_new,
      children: items
        .filter((c) => c.parent_id === i.id)
        .map((c) => ({ id: c.id, label: c.label, url: c.url, openInNew: c.open_in_new, children: [] })),
    }));
  },
);

export const getHeaderMenu = (market: MarketCode) => getMenu(market, 'header');
export const getFooterMenu = (market: MarketCode) => getMenu(market, 'footer');
