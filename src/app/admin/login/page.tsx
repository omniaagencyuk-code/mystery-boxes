'use client';

import { useState } from 'react';

import { createBrowserSupabase } from '@/lib/supabase/client';

// Login only. There is no public sign-up: admin auth users are created in the
// Supabase dashboard and added to the admins allowlist. createBrowserSupabase
// stores the session in cookies so the server can read it.
export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createBrowserSupabase();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const next = new URLSearchParams(window.location.search).get('next') || '/admin';
    window.location.assign(next);
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted">Sign in with your admin account.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-line bg-elevated px-3 py-2 text-ink"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-line bg-elevated px-3 py-2 text-ink"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="u-btn-primary w-full rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-60"
        >
          {loading ? 'Signing in' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
