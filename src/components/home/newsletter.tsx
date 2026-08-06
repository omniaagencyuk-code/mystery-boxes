'use client';

import { useActionState } from 'react';

import { subscribeNewsletter, type NewsletterState } from '@/lib/actions/newsletter';

const INITIAL: NewsletterState = { ok: false, message: '' };

/**
 * Newsletter signup panel. Copy is CMS-driven (passed in). Submits to a real
 * server action that stores the email; shows inline success/error feedback.
 */
export function Newsletter({
  heading,
  body,
  market,
  placeholder = 'Enter your email',
  buttonLabel = 'Subscribe',
  privacyNote,
}: {
  heading: string;
  body: string;
  market: string;
  placeholder?: string;
  buttonLabel?: string;
  privacyNote?: string | null;
}) {
  const [state, action, pending] = useActionState(subscribeNewsletter, INITIAL);

  return (
    <section className="rounded-2xl border border-line bg-gradient-to-r from-primary/10 to-accent/5 p-6 sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <h2 className="text-2xl font-bold text-ink">{heading}</h2>
          <p className="mt-1 text-muted">{body}</p>
        </div>
        <form action={action} className="flex w-full max-w-md flex-col gap-2">
          <input type="hidden" name="market" value={market} />
          <div className="flex gap-2">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              name="email"
              required
              placeholder={placeholder}
              className="w-full rounded-lg border border-line bg-elevated px-3 py-2.5 text-sm text-ink outline-none focus-visible:border-primary"
            />
            <button
              type="submit"
              disabled={pending}
              className="u-btn-primary shrink-0 rounded-lg px-5 py-2.5 text-sm font-bold disabled:opacity-60"
            >
              {pending ? 'Saving' : buttonLabel}
            </button>
          </div>
          {privacyNote && <p className="text-xs text-muted">{privacyNote}</p>}
          {state.message && (
            <p className={`text-sm ${state.ok ? 'text-success' : 'text-danger'}`} role="status">
              {state.message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
