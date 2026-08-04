import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { signOut } from '@/app/admin/actions';
import { AdminNav } from '@/components/admin/admin-nav';
import { createServerSupabase } from '@/lib/supabase/server';

// Admin is never indexed.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Admin',
};

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Proxy already redirects anonymous users, this is the belt-and-braces check.
  if (!user) redirect('/admin/login');

  const { data: admin } = await supabase
    .from('admins')
    .select('*')
    .eq('user_id', user.id)
    .eq('active', true)
    .maybeSingle();

  // Logged in but not on the allowlist. Do not redirect to login (that would
  // loop); show a clear message with a way out.
  if (!admin) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-xl font-bold text-ink">Not authorised</h1>
        <p className="text-sm text-muted">
          The account {user.email} is not an admin on this site.
        </p>
        <form action={signOut}>
          <button className="u-btn-primary rounded-lg px-4 py-2 text-sm font-bold">
            Sign out
          </button>
        </form>
      </main>
    );
  }

  return (
    <div className="mx-auto flex min-h-full max-w-6xl gap-6 px-4 py-6">
      <aside className="w-56 shrink-0 space-y-4">
        <Link href="/admin" className="block font-black tracking-tight text-ink">
          Mystery Boxes admin
        </Link>
        <AdminNav />
        <form action={signOut}>
          <button className="w-full rounded-md border border-line px-3 py-2 text-left text-sm text-muted hover:bg-elevated hover:text-ink">
            Sign out {admin.name ? `(${admin.name})` : ''}
          </button>
        </form>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
