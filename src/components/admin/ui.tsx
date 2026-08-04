import Link from 'next/link';
import type { ReactNode } from 'react';

export const inputCls =
  'mt-1 w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm text-ink';
export const labelCls = 'block text-sm font-medium text-ink';

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelCls}>
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
}

export function PageHeader({
  title,
  action,
}: {
  title: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {action && (
        <Link
          href={action.href}
          className="u-btn-primary rounded-lg px-4 py-2 text-sm font-bold"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function SubmitRow({
  label = 'Save',
  cancelHref,
}: {
  label?: string;
  cancelHref: string;
}) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <button type="submit" className="u-btn-primary rounded-lg px-5 py-2 text-sm font-bold">
        {label}
      </button>
      <Link href={cancelHref} className="text-sm text-muted hover:text-ink">
        Cancel
      </Link>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const published = status === 'published';
  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-xs ${
        published ? 'bg-success/15 text-success' : 'bg-elevated text-muted'
      }`}
    >
      {status}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-muted">
      {children}
    </p>
  );
}

export function MarketSelect({
  markets,
  defaultValue,
  includeAll = false,
  required = false,
}: {
  markets: { id: string; code: string; name: string }[];
  defaultValue?: string | null;
  includeAll?: boolean;
  required?: boolean;
}) {
  return (
    <select name="market_id" defaultValue={defaultValue ?? ''} required={required} className={inputCls}>
      {includeAll && <option value="">All markets</option>}
      {!includeAll && !defaultValue && <option value="">Select a market</option>}
      {markets.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name} ({m.code})
        </option>
      ))}
    </select>
  );
}

export function StatusSelect({ defaultValue }: { defaultValue?: string | null }) {
  return (
    <select name="status" defaultValue={defaultValue ?? 'draft'} className={inputCls}>
      <option value="draft">Draft</option>
      <option value="published">Published</option>
    </select>
  );
}

/** Inline delete button as its own form, so no client JS is required. */
export function DeleteButton({
  action,
  id,
  label = 'Delete',
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label?: string;
}) {
  return (
    <form action={action} className="inline">
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-sm text-danger hover:underline">
        {label}
      </button>
    </form>
  );
}
