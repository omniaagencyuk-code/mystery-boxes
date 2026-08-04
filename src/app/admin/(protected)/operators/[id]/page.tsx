import { notFound } from 'next/navigation';

import { saveOperator } from '../actions';
import { Field, inputCls, PageHeader, SubmitRow } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';

const dtLocal = (iso: string | null | undefined) => (iso ? iso.slice(0, 16) : '');

export default async function OperatorFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await adminPageClient();
  if (!db) return null;

  const isNew = id === 'new';
  const [{ data: types }, { data: markets }, { data: categories }] = await Promise.all([
    db.from('operator_types').select('id, name, slug').order('name'),
    db.from('markets').select('id, code, name').order('code'),
    db.from('categories').select('id, name, market_id').order('name'),
  ]);

  let operator = null;
  const mapping = new Map<string, { visible: boolean; requires_geo_block: boolean }>();
  const selectedCategoryIds = new Set<string>();

  if (!isNew) {
    const { data } = await db.from('operators').select('*').eq('id', id).maybeSingle();
    if (!data) notFound();
    operator = data;

    const [{ data: oms }, { data: ocs }] = await Promise.all([
      db.from('operator_markets').select('*').eq('operator_id', id),
      db.from('operator_categories').select('category_id').eq('operator_id', id),
    ]);
    for (const om of oms ?? [])
      mapping.set(om.market_id, { visible: om.visible, requires_geo_block: om.requires_geo_block });
    for (const oc of ocs ?? []) selectedCategoryIds.add(oc.category_id);
  }

  const marketList = markets ?? [];

  return (
    <div className="max-w-3xl">
      <PageHeader title={isNew ? 'New operator' : 'Edit operator'} />
      <form action={saveOperator} className="space-y-5">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="market_ids" value={marketList.map((m) => m.id).join(',')} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="name">
            <input id="name" name="name" required defaultValue={operator?.name ?? ''} className={inputCls} />
          </Field>
          <Field label="Slug" htmlFor="slug" hint="Blank generates from the name.">
            <input id="slug" name="slug" defaultValue={operator?.slug ?? ''} className={inputCls} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type" htmlFor="operator_type_id" hint="Drives compliance furniture.">
            <select id="operator_type_id" name="operator_type_id" required defaultValue={operator?.operator_type_id ?? ''} className={inputCls}>
              {!operator && <option value="">Select a type</option>}
              {(types ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Rating" htmlFor="rating" hint="1.0 to 5.0. Leave blank if unrated.">
            <input id="rating" name="rating" type="number" step="0.1" min="1" max="5" defaultValue={operator?.rating ?? ''} className={inputCls} />
          </Field>
        </div>

        <Field label="Logo URL" htmlFor="logo_url" hint="Paste a URL, or upload in Media and paste it here.">
          <input id="logo_url" name="logo_url" defaultValue={operator?.logo_url ?? ''} className={inputCls} />
        </Field>

        <Field label="Tracking URL" htmlFor="tracking_url" hint="Outbound affiliate link. Rendered rel=sponsored nofollow.">
          <input id="tracking_url" name="tracking_url" defaultValue={operator?.tracking_url ?? ''} className={inputCls} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Licence authority" htmlFor="licence_authority">
            <input id="licence_authority" name="licence_authority" defaultValue={operator?.licence_authority ?? ''} className={inputCls} />
          </Field>
          <Field label="Licence number" htmlFor="licence_number">
            <input id="licence_number" name="licence_number" defaultValue={operator?.licence_number ?? ''} className={inputCls} />
          </Field>
          <Field label="Licence verified at" htmlFor="licence_verified_at">
            <input id="licence_verified_at" name="licence_verified_at" type="datetime-local" defaultValue={dtLocal(operator?.licence_verified_at)} className={inputCls} />
          </Field>
        </div>

        <Field label="Summary" htmlFor="summary" hint="Short text used on cards.">
          <textarea id="summary" name="summary" rows={2} defaultValue={operator?.summary ?? ''} className={inputCls} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Pros" htmlFor="pros" hint="One per line.">
            <textarea id="pros" name="pros" rows={4} defaultValue={(operator?.pros ?? []).join('\n')} className={inputCls} />
          </Field>
          <Field label="Cons" htmlFor="cons" hint="One per line.">
            <textarea id="cons" name="cons" rows={4} defaultValue={(operator?.cons ?? []).join('\n')} className={inputCls} />
          </Field>
        </div>

        <fieldset className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <legend className="px-1 text-sm font-medium">Markets</legend>
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
            Include the operator in a market, control whether it appears in listings (visible), and
            whether it is hard geo-blocked for that market (served a 404).
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-1">Market</th>
                <th className="py-1">Include</th>
                <th className="py-1">Visible</th>
                <th className="py-1">Geo-block</th>
              </tr>
            </thead>
            <tbody>
              {marketList.map((m) => {
                const map = mapping.get(m.id);
                const included = map !== undefined;
                return (
                  <tr key={m.id}>
                    <td className="py-1">{m.name} ({m.code})</td>
                    <td className="py-1"><input type="checkbox" name={`m_${m.id}_include`} defaultChecked={included} /></td>
                    <td className="py-1"><input type="checkbox" name={`m_${m.id}_visible`} defaultChecked={map ? map.visible : true} /></td>
                    <td className="py-1"><input type="checkbox" name={`m_${m.id}_geo`} defaultChecked={map ? map.requires_geo_block : false} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </fieldset>

        <Field label="Categories" htmlFor="category_ids" hint="Hold Cmd or Ctrl to select more than one.">
          <select
            id="category_ids"
            name="category_ids"
            multiple
            defaultValue={[...selectedCategoryIds]}
            className={`${inputCls} h-32`}
          >
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Active">
          <label className="mt-1 flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" defaultChecked={operator ? operator.active : true} />
            Operator is active
          </label>
        </Field>

        <SubmitRow cancelHref="/admin/operators" />
      </form>
    </div>
  );
}
