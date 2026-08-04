import { notFound } from 'next/navigation';

import { saveOffer } from '../actions';
import { Field, inputCls, PageHeader, SubmitRow } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';

const dtLocal = (iso: string | null | undefined) => (iso ? iso.slice(0, 16) : '');

export default async function OfferFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await adminPageClient();
  if (!db) return null;

  const isNew = id === 'new';
  const { data: operators } = await db.from('operators').select('id, name').order('name');

  let offer = null;
  if (!isNew) {
    const { data } = await db.from('offers').select('*').eq('id', id).maybeSingle();
    if (!data) notFound();
    offer = data;
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title={isNew ? 'New offer' : 'Edit offer'} />
      <form action={saveOffer} className="space-y-4">
        <input type="hidden" name="id" value={id} />

        <Field label="Operator" htmlFor="operator_id">
          <select id="operator_id" name="operator_id" required defaultValue={offer?.operator_id ?? ''} className={inputCls}>
            {!offer && <option value="">Select an operator</option>}
            {(operators ?? []).map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Title" htmlFor="title">
          <input id="title" name="title" required defaultValue={offer?.title ?? ''} className={inputCls} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Code" htmlFor="code">
            <input id="code" name="code" defaultValue={offer?.code ?? ''} className={inputCls} />
          </Field>
          <Field label="Active">
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={offer ? offer.active : true} />
              Show this offer
            </label>
          </Field>
        </div>

        <Field label="Description" htmlFor="description">
          <textarea id="description" name="description" rows={3} defaultValue={offer?.description ?? ''} className={inputCls} />
        </Field>

        <Field label="Terms" htmlFor="terms">
          <textarea id="terms" name="terms" rows={3} defaultValue={offer?.terms ?? ''} className={inputCls} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Starts at" htmlFor="starts_at">
            <input id="starts_at" name="starts_at" type="datetime-local" defaultValue={dtLocal(offer?.starts_at)} className={inputCls} />
          </Field>
          <Field label="Expires at" htmlFor="expires_at">
            <input id="expires_at" name="expires_at" type="datetime-local" defaultValue={dtLocal(offer?.expires_at)} className={inputCls} />
          </Field>
        </div>

        <SubmitRow cancelHref="/admin/offers" />
      </form>
    </div>
  );
}
