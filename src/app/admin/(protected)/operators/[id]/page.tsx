import { notFound } from 'next/navigation';

import { saveOperator } from '../actions';
import { Repeater } from '@/components/admin/repeater';
import { Field, inputCls, PageHeader, SubmitRow } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';

const dtLocal = (iso: string | null | undefined) => (iso ? iso.slice(0, 16) : '');

type ImageMedia = { id: string; title: string | null; path: string; url: string | null };

/**
 * A media picker (select of image media, which overrides the URL) plus a URL
 * input, matching the existing logo pattern. The select value is a media id.
 */
function MediaPicker({
  label,
  base,
  currentUrl,
  imageMedia,
  hint,
}: {
  label: string;
  base: string;
  currentUrl: string | null | undefined;
  imageMedia: ImageMedia[];
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Field label={`${label} from media`} htmlFor={`${base}_media_id`} hint={hint}>
        <select id={`${base}_media_id`} name={`${base}_media_id`} defaultValue="" className={inputCls}>
          <option value="">Keep current / use URL below</option>
          {imageMedia.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title || m.path}
            </option>
          ))}
        </select>
      </Field>
      <Field label={`${label} URL`} htmlFor={base}>
        <input id={base} name={base} defaultValue={currentUrl ?? ''} className={inputCls} />
      </Field>
    </div>
  );
}

export default async function OperatorFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await adminPageClient();
  if (!db) return null;

  const isNew = id === 'new';
  const [{ data: types }, { data: markets }, { data: categories }, { data: media }, { data: allOperators }] =
    await Promise.all([
      db.from('operator_types').select('id, name, slug').order('name'),
      db.from('markets').select('id, code, name').order('code'),
      db.from('categories').select('id, name, market_id').order('name'),
      db
        .from('media')
        .select('id, title, path, url, mime_type')
        .order('created_at', { ascending: false }),
      db.from('operators').select('id, name').order('name'),
    ]);
  const imageMedia = (media ?? []).filter((m) => m.mime_type?.startsWith('image/') && m.url);

  let operator = null;
  const mapping = new Map<string, { visible: boolean; requires_geo_block: boolean }>();
  const selectedCategoryIds = new Set<string>();
  let paymentMethods: { name: string; slug: string; kind: string }[] = [];
  const relatedIds: string[] = [];

  if (!isNew) {
    const { data } = await db.from('operators').select('*').eq('id', id).maybeSingle();
    if (!data) notFound();
    operator = data;

    const [{ data: oms }, { data: ocs }, { data: opm }, { data: orel }] = await Promise.all([
      db.from('operator_markets').select('*').eq('operator_id', id),
      db.from('operator_categories').select('category_id').eq('operator_id', id),
      db
        .from('operator_payment_methods')
        .select('name, slug, kind, position')
        .eq('operator_id', id)
        .order('position'),
      db
        .from('operator_related')
        .select('related_operator_id, position')
        .eq('operator_id', id)
        .order('position'),
    ]);
    for (const om of oms ?? [])
      mapping.set(om.market_id, { visible: om.visible, requires_geo_block: om.requires_geo_block });
    for (const oc of ocs ?? []) selectedCategoryIds.add(oc.category_id);
    paymentMethods = (opm ?? []).map((p) => ({
      name: p.name,
      slug: p.slug ?? '',
      kind: p.kind,
    }));
    for (const r of orel ?? []) relatedIds.push(r.related_operator_id);
  }

  const marketList = markets ?? [];
  const relatedOptions = (allOperators ?? []).filter((o) => o.id !== id);

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

        <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
          {operator?.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={operator.logo_url}
              alt=""
              className="h-16 w-16 rounded-lg border border-line object-contain"
            />
          )}
          <div className="space-y-4">
            <Field label="Logo from media" htmlFor="logo_media_id" hint="Upload brand logos in Media, then pick one here. This overrides the URL below.">
              <select id="logo_media_id" name="logo_media_id" defaultValue="" className={inputCls}>
                <option value="">Keep current / use URL below</option>
                {imageMedia.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title || m.path}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Logo URL" htmlFor="logo_url" hint="Or paste a logo URL directly.">
              <input id="logo_url" name="logo_url" defaultValue={operator?.logo_url ?? ''} className={inputCls} />
            </Field>
          </div>
        </div>

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

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">Platform details</legend>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <Field label="Website URL" htmlFor="website_url">
              <input id="website_url" name="website_url" defaultValue={operator?.website_url ?? ''} className={inputCls} />
            </Field>
            <Field label="Founded year" htmlFor="founded_year">
              <input id="founded_year" name="founded_year" type="number" min="1800" max="2100" step="1" defaultValue={operator?.founded_year ?? ''} className={inputCls} />
            </Field>
            <Field label="Owner" htmlFor="owner">
              <input id="owner" name="owner" defaultValue={operator?.owner ?? ''} className={inputCls} />
            </Field>
            <Field label="Minimum age" htmlFor="min_age">
              <input id="min_age" name="min_age" defaultValue={operator?.min_age ?? ''} className={inputCls} />
            </Field>
            <Field label="Availability" htmlFor="availability">
              <input id="availability" name="availability" defaultValue={operator?.availability ?? ''} className={inputCls} />
            </Field>
            <Field label="KYC required" htmlFor="kyc_required">
              <input id="kyc_required" name="kyc_required" defaultValue={operator?.kyc_required ?? ''} className={inputCls} />
            </Field>
            <Field label="Buyback" htmlFor="buyback">
              <input id="buyback" name="buyback" defaultValue={operator?.buyback ?? ''} className={inputCls} />
            </Field>
            <Field label="Mobile app" htmlFor="mobile_app">
              <input id="mobile_app" name="mobile_app" defaultValue={operator?.mobile_app ?? ''} className={inputCls} />
            </Field>
            <Field label="Shipping info" htmlFor="shipping_info">
              <textarea id="shipping_info" name="shipping_info" rows={3} defaultValue={operator?.shipping_info ?? ''} className={inputCls} />
            </Field>
            <Field label="Support info" htmlFor="support_info">
              <textarea id="support_info" name="support_info" rows={3} defaultValue={operator?.support_info ?? ''} className={inputCls} />
            </Field>
          </div>
        </fieldset>

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">Media</legend>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <MediaPicker
              label="Hero image"
              base="hero_image_url"
              currentUrl={operator?.hero_image_url}
              imageMedia={imageMedia}
              hint="Picking media overrides the URL."
            />
            <div className="grid gap-4">
              <MediaPicker
                label="Light logo"
                base="logo_light_url"
                currentUrl={operator?.logo_light_url}
                imageMedia={imageMedia}
              />
              <MediaPicker
                label="Dark logo"
                base="logo_dark_url"
                currentUrl={operator?.logo_dark_url}
                imageMedia={imageMedia}
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">Payment methods</legend>
          <p className="mb-3 text-xs text-muted">
            Name is required. Slug hint is optional (e.g. visa, mastercard, paypal, bitcoin, ethereum,
            litecoin, tron, skrill, neteller, applepay, googlepay, amex, discover).
          </p>
          <Repeater
            name="payment_methods_json"
            addLabel="Add payment method"
            initial={paymentMethods}
            newItem={{ name: '', slug: '', kind: 'both' }}
            labelKey="name"
            labelFallback="New method"
            fields={[
              { key: 'name', label: 'Name', type: 'text', placeholder: 'Visa' },
              { key: 'slug', label: 'Slug hint', type: 'text', placeholder: 'visa' },
              {
                key: 'kind',
                label: 'Kind',
                type: 'select',
                options: [
                  { value: 'both', label: 'Both' },
                  { value: 'deposit', label: 'Deposit' },
                  { value: 'withdrawal', label: 'Withdrawal' },
                ],
              },
            ]}
          />
        </fieldset>

        <fieldset className="u-glass rounded-lg p-4">
          <legend className="px-1 text-sm font-medium">Markets</legend>
          <p className="mb-2 text-xs text-muted">
            Include the operator in a market, control whether it appears in listings (visible), and
            whether it is hard geo-blocked for that market (served a 404).
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted">
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

        <Field label="Related platforms" htmlFor="related_ids" hint="Hold Cmd or Ctrl to select more than one. Order of selection sets display order.">
          <select
            id="related_ids"
            name="related_ids"
            multiple
            defaultValue={relatedIds}
            className={`${inputCls} h-32`}
          >
            {relatedOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
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
