'use server';

import { createPublicSupabase } from '@/lib/supabase/public';

export interface NewsletterState {
  ok: boolean;
  message: string;
}

/**
 * Store a newsletter signup via the SECURITY DEFINER subscribe_newsletter
 * function (idempotent on email). Real capture, no third-party call. Used with
 * useActionState from the newsletter form.
 */
export async function subscribeNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const email = String(formData.get('email') ?? '').trim();
  const market = String(formData.get('market') ?? '').trim() || null;

  if (!email || !email.includes('@')) {
    return { ok: false, message: 'Enter a valid email address.' };
  }

  const supabase = createPublicSupabase();
  const { error } = await supabase.rpc('subscribe_newsletter', {
    subscriber_email: email,
    market,
  });
  if (error) return { ok: false, message: 'Something went wrong. Please try again.' };

  return { ok: true, message: 'Thanks, you are subscribed.' };
}
