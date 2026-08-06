'use client';

import { useMemo, useState } from 'react';

interface OrderItem {
  id: string;
  name: string;
}

/**
 * Drag-and-drop (and keyboard) reordering of the platforms shown in the homepage
 * comparison table. The order is mirrored into a hidden input as a JSON array of
 * operator ids; the save action writes it back to each operator's
 * homepage_position. Up/Down buttons make it usable without a pointer.
 */
export function HomepageOrder({ initial }: { initial: OrderItem[] }) {
  const [items, setItems] = useState<OrderItem[]>(initial);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const json = useMemo(() => JSON.stringify(items.map((i) => i.id)), [items]);

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length || from === to) return;
    setItems((prev) => {
      const next = [...prev];
      const [row] = next.splice(from, 1);
      next.splice(to, 0, row);
      return next;
    });
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted">No platforms are marked visible on the homepage yet.</p>;
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name="homepage_order_json" value={json} readOnly />
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li
            key={it.id}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIndex !== null) move(dragIndex, i);
              setDragIndex(null);
            }}
            onDragEnd={() => setDragIndex(null)}
            className={`flex items-center gap-2 rounded-lg border border-line bg-elevated px-3 py-2 ${
              dragIndex === i ? 'opacity-50' : ''
            }`}
          >
            <span aria-hidden className="cursor-grab select-none text-muted" title="Drag to reorder">
              ⠿
            </span>
            <span className="w-6 text-sm font-semibold text-muted">{i + 1}</span>
            <span className="flex-1 text-sm text-ink">{it.name}</span>
            <button
              type="button"
              aria-label={`Move ${it.name} up`}
              onClick={() => move(i, i - 1)}
              disabled={i === 0}
              className="rounded px-2 py-1 text-sm text-ink hover:bg-surface disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              aria-label={`Move ${it.name} down`}
              onClick={() => move(i, i + 1)}
              disabled={i === items.length - 1}
              className="rounded px-2 py-1 text-sm text-ink hover:bg-surface disabled:opacity-30"
            >
              ↓
            </button>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted">Drag rows or use the arrows to set the homepage table order. Save to apply.</p>
    </div>
  );
}
