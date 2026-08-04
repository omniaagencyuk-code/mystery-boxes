// Small helpers for reading FormData in admin server actions.

export function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === 'string' ? v : '';
}

export function strOrNull(fd: FormData, key: string): string | null {
  const v = str(fd, key).trim();
  return v.length ? v : null;
}

export function bool(fd: FormData, key: string): boolean {
  const v = fd.get(key);
  return v === 'on' || v === 'true' || v === '1';
}

export function numOrNull(fd: FormData, key: string): number | null {
  const v = str(fd, key).trim();
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** One item per line, trimmed, blanks dropped. Used for pros/cons arrays. */
export function lines(fd: FormData, key: string): string[] {
  return str(fd, key)
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** ISO timestamp or null from a datetime-local input. */
export function timestampOrNull(fd: FormData, key: string): string | null {
  const v = str(fd, key).trim();
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
