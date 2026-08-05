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

/** All values for a repeated field (e.g. a multi-select), as strings. */
export function strList(fd: FormData, key: string): string[] {
  return fd.getAll(key).filter((v): v is string => typeof v === 'string' && v.length > 0);
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

/**
 * Parse a Repeater's hidden JSON input into an array of plain objects. Defensive:
 * returns [] on malformed input, and drops anything that is not a plain object.
 */
export function jsonRows(fd: FormData, key: string): Record<string, unknown>[] {
  const raw = str(fd, key).trim();
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r): r is Record<string, unknown> =>
        typeof r === 'object' && r !== null && !Array.isArray(r),
    );
  } catch {
    return [];
  }
}

/** Read a string field from a parsed JSON row, trimmed; '' when absent. */
export function rowStr(row: Record<string, unknown>, key: string): string {
  const v = row[key];
  return typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '';
}

/** Read a numeric field from a parsed JSON row, or null. */
export function rowNumOrNull(row: Record<string, unknown>, key: string): number | null {
  const v = row[key];
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string' && v.trim()) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Read a boolean field from a parsed JSON row. */
export function rowBool(row: Record<string, unknown>, key: string): boolean {
  const v = row[key];
  return v === true || v === 'true' || v === 'on' || v === 1 || v === '1';
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
