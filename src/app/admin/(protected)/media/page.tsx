import Link from 'next/link';

import { deleteMedia, uploadMedia } from './actions';
import { DeleteButton, EmptyState, Field, inputCls, PageHeader } from '@/components/admin/ui';
import { adminPageClient } from '@/lib/admin/db';

export default async function MediaListPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const db = await adminPageClient();
  if (!db) return null;

  const { error } = await searchParams;
  const { data: media } = await db.from('media').select('*').order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader title="Media" />

      {error && (
        <p className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <form action={uploadMedia} className="space-y-3 u-glass rounded-lg p-4">
        <h2 className="text-sm font-semibold">Upload</h2>
        <p className="text-xs text-muted">PNG, JPEG, WebP, GIF or AVIF. Maximum 5 MB.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="File" htmlFor="file">
            <input
              id="file"
              name="file"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
              required
              className={inputCls}
            />
          </Field>
          <Field label="Title" htmlFor="title">
            <input id="title" name="title" className={inputCls} />
          </Field>
          <Field label="Alt text" htmlFor="alt">
            <input id="alt" name="alt" className={inputCls} />
          </Field>
        </div>
        <button type="submit" className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500">
          Upload
        </button>
      </form>

      {!media || media.length === 0 ? (
        <EmptyState>No media yet.</EmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((m) => (
            <div key={m.id} className="u-glass rounded-lg p-2">
              {m.url && m.mime_type?.startsWith('image/') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt={m.alt ?? ''} className="mb-2 h-32 w-full rounded object-cover" />
              ) : (
                <div className="mb-2 flex h-32 items-center justify-center rounded bg-elevated text-xs text-muted">
                  {m.mime_type ?? 'file'}
                </div>
              )}
              <div className="truncate text-sm" title={m.title ?? m.path}>
                {m.title ?? m.path}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <Link href={`/admin/media/${m.id}`} className="text-primary hover:underline">
                  Edit
                </Link>
                <DeleteButton action={deleteMedia} id={m.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
