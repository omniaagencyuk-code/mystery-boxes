import Link from 'next/link';

import { EmptyState, PageHeader } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';

type GapItem = { id: string; label: string; href: string };

function GapSection({ title, items }: { title: string; items: GapItem[] }) {
  return (
    <section className="rounded-lg border border-line bg-elevated u-glass p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        <span className="inline-flex rounded bg-elevated px-2 py-0.5 text-xs text-muted">
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <EmptyState>
          <span className="text-success">All good — nothing missing here.</span>
        </EmptyState>
      ) : (
        <ul className="divide-y divide-line text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-2">
              <span className="text-ink">{item.label}</span>
              <Link href={item.href} className="text-primary hover:underline">
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function isBlank(value: string | null): boolean {
  return value === null || value.trim() === '';
}

export default async function SeoManagerPage() {
  const db = await adminPageClient();
  if (!db) return null;

  const [
    { data: operators },
    { data: reviews },
    { data: categories },
    { data: pages },
  ] = await Promise.all([
    db.from('operators').select('id, name, logo_url'),
    db.from('reviews').select('id, operator_id, status, seo_title, meta_description'),
    db.from('categories').select('id, name, meta_description'),
    db.from('pages').select('id, title, status, meta_description'),
  ]);

  const operatorName = new Map((operators ?? []).map((o) => [o.id, o.name]));

  const operatorsMissingLogo: GapItem[] = (operators ?? [])
    .filter((o) => o.logo_url === null)
    .map((o) => ({ id: o.id, label: o.name, href: `/admin/operators/${o.id}` }));

  const publishedReviews = (reviews ?? []).filter((r) => r.status === 'published');

  const reviewLabel = (operatorId: string, id: string) =>
    operatorName.get(operatorId) ?? id;

  const reviewsMissingSeoTitle: GapItem[] = publishedReviews
    .filter((r) => isBlank(r.seo_title))
    .map((r) => ({
      id: r.id,
      label: reviewLabel(r.operator_id, r.id),
      href: `/admin/reviews/${r.id}`,
    }));

  const reviewsMissingMetaDescription: GapItem[] = publishedReviews
    .filter((r) => r.meta_description === null)
    .map((r) => ({
      id: r.id,
      label: reviewLabel(r.operator_id, r.id),
      href: `/admin/reviews/${r.id}`,
    }));

  const categoriesMissingMetaDescription: GapItem[] = (categories ?? [])
    .filter((c) => c.meta_description === null)
    .map((c) => ({ id: c.id, label: c.name, href: `/admin/categories/${c.id}` }));

  const pagesMissingMetaDescription: GapItem[] = (pages ?? [])
    .filter((p) => p.status === 'published' && p.meta_description === null)
    .map((p) => ({ id: p.id, label: p.title, href: `/admin/pages/${p.id}` }));

  const sections: { title: string; items: GapItem[] }[] = [
    { title: 'Operators missing a logo', items: operatorsMissingLogo },
    { title: 'Published reviews missing SEO title', items: reviewsMissingSeoTitle },
    { title: 'Published reviews missing meta description', items: reviewsMissingMetaDescription },
    { title: 'Categories missing meta description', items: categoriesMissingMetaDescription },
    { title: 'Published pages missing meta description', items: pagesMissingMetaDescription },
  ];

  return (
    <div>
      <PageHeader title="SEO manager" />
      <p className="mb-6 max-w-2xl text-sm text-muted">
        A read-only report of content gaps that hurt SEO. Each section lists items that are
        missing a key field, with a link to the relevant editor so you can fill it in.
      </p>
      <div className="flex flex-col gap-6">
        {sections.map((s) => (
          <GapSection key={s.title} title={s.title} items={s.items} />
        ))}
      </div>
    </div>
  );
}
