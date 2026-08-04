import { notFound } from 'next/navigation';

import { saveAffiliateLink } from '../actions';
import { Field, inputCls, MarketSelect, PageHeader, SubmitRow } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';

export default async function AffiliateLinkFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await adminPageClient();
  if (!db) return null;

  const isNew = id === 'new';
  const [{ data: operators }, { data: markets }] = await Promise.all([
    db.from('operators').select('id, name').order('name'),
    db.from('markets').select('id, code, name').order('code'),
  ]);

  let link = null;
  if (!isNew) {
    const { data } = await db.from('affiliate_links').select('*').eq('id', id).maybeSingle();
    if (!data) notFound();
    link = data;
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title={isNew ? 'New affiliate link' : 'Edit affiliate link'} />
      <form action={saveAffiliateLink} className="space-y-4">
        <input type="hidden" name="id" value={id} />

        <Field label="Label" htmlFor="label">
          <input id="label" name="label" required defaultValue={link?.label ?? ''} className={inputCls} />
        </Field>

        <Field label="Slug" htmlFor="slug" hint="Used at /go/<slug>. Blank generates from the label.">
          <input id="slug" name="slug" defaultValue={link?.slug ?? ''} className={inputCls} />
        </Field>

        <Field label="Target URL" htmlFor="target_url" hint="The real affiliate URL to redirect to.">
          <input id="target_url" name="target_url" type="url" required defaultValue={link?.target_url ?? ''} className={inputCls} />
        </Field>

        <Field label="rel attribute" htmlFor="rel" hint="Applied on outbound links that render this.">
          <input id="rel" name="rel" defaultValue={link?.rel ?? 'sponsored nofollow'} className={inputCls} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Operator" htmlFor="operator_id" hint="Optional association.">
            <select id="operator_id" name="operator_id" defaultValue={link?.operator_id ?? ''} className={inputCls}>
              <option value="">None</option>
              {(operators ?? []).map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Market" htmlFor="market_id" hint="Optional.">
            <MarketSelect markets={markets ?? []} defaultValue={link?.market_id} includeAll />
          </Field>
        </div>

        <Field label="Active">
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" defaultChecked={link ? link.active : true} />
            Link is live
          </label>
        </Field>

        <SubmitRow cancelHref="/admin/affiliate-links" />
      </form>
    </div>
  );
}
