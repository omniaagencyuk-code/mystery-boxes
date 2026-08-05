'use client';

import { useMemo, useState } from 'react';

import { inputCls, labelCls } from '@/components/admin/ui';

export type RepeaterFieldType = 'text' | 'textarea' | 'number' | 'select' | 'checkbox';

export interface RepeaterField {
  key: string;
  label: string;
  type?: RepeaterFieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  hint?: string;
  /** Render across the full row width (textareas, JSON config). */
  full?: boolean;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
}

export type RepeaterItem = Record<string, string | boolean>;

/**
 * A client-managed array editor. It keeps an array of plain objects in React
 * state and mirrors the whole array into a single hidden <input> as JSON on
 * every change, so the server action can read one field and JSON.parse it.
 * Supports Add / Remove / Move up / Move down with real, keyboard-usable
 * buttons. Reorder is by position in the array (no drag-and-drop).
 */
export function Repeater({
  name,
  fields,
  initial = [],
  newItem,
  addLabel = 'Add row',
  itemLabel,
}: {
  name: string;
  fields: RepeaterField[];
  initial?: RepeaterItem[];
  newItem: RepeaterItem;
  addLabel?: string;
  itemLabel?: (item: RepeaterItem, index: number) => string;
}) {
  const [items, setItems] = useState<RepeaterItem[]>(() => initial.map((it) => ({ ...it })));

  const json = useMemo(() => JSON.stringify(items), [items]);

  function update(index: number, key: string, value: string | boolean) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [key]: value } : it)));
  }

  function add() {
    setItems((prev) => [...prev, { ...newItem }]);
  }

  function remove(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function move(index: number, delta: number) {
    setItems((prev) => {
      const to = index + delta;
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [row] = next.splice(index, 1);
      next.splice(to, 0, row);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={json} readOnly />

      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-line p-4 text-center text-sm text-muted">
          No rows yet.
        </p>
      )}

      {items.map((item, index) => (
        <div key={index} className="rounded-lg border border-line bg-elevated p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted">
              {itemLabel ? itemLabel(item, index) : `Row ${index + 1}`}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Move up"
                title="Move up"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="rounded px-2 py-1 text-sm text-ink hover:bg-surface disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                aria-label="Move down"
                title="Move down"
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                className="rounded px-2 py-1 text-sm text-ink hover:bg-surface disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                aria-label="Remove row"
                title="Remove row"
                onClick={() => remove(index)}
                className="rounded px-2 py-1 text-sm text-danger hover:bg-surface"
              >
                Remove
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => {
              const value = item[f.key];
              const wrapCls = f.full ? 'sm:col-span-2' : '';
              const fieldId = `${name}-${index}-${f.key}`;

              if (f.type === 'checkbox') {
                return (
                  <div key={f.key} className={wrapCls}>
                    <label htmlFor={fieldId} className="mt-1 flex items-center gap-2 text-sm text-ink">
                      <input
                        id={fieldId}
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(e) => update(index, f.key, e.target.checked)}
                      />
                      {f.label}
                    </label>
                    {f.hint && <p className="mt-1 text-xs text-muted">{f.hint}</p>}
                  </div>
                );
              }

              return (
                <div key={f.key} className={wrapCls}>
                  <label htmlFor={fieldId} className={labelCls}>
                    {f.label}
                  </label>
                  {f.type === 'textarea' ? (
                    <textarea
                      id={fieldId}
                      rows={f.rows ?? 3}
                      placeholder={f.placeholder}
                      value={typeof value === 'string' ? value : ''}
                      onChange={(e) => update(index, f.key, e.target.value)}
                      className={inputCls}
                    />
                  ) : f.type === 'select' ? (
                    <select
                      id={fieldId}
                      value={typeof value === 'string' ? value : ''}
                      onChange={(e) => update(index, f.key, e.target.value)}
                      className={inputCls}
                    >
                      {(f.options ?? []).map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={fieldId}
                      type={f.type === 'number' ? 'number' : 'text'}
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      placeholder={f.placeholder}
                      value={typeof value === 'string' ? value : ''}
                      onChange={(e) => update(index, f.key, e.target.value)}
                      className={inputCls}
                    />
                  )}
                  {f.hint && <p className="mt-1 text-xs text-muted">{f.hint}</p>}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-elevated"
      >
        + {addLabel}
      </button>
    </div>
  );
}
