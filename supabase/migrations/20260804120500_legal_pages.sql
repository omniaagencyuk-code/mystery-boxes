-- Migration: seed placeholder legal and info pages for each market.
--
-- These are created as normal editable pages so an admin can rewrite them in the
-- dashboard. The copy is clearly marked placeholder and must be replaced with
-- reviewed text before launch. Idempotent via the (market_id, slug) unique key.

insert into public.pages (slug, market_id, title, meta_description, body, status, published_at)
select 'about', m.id, 'About us',
  'An independent directory that reviews and compares mystery box operators.',
  'This is placeholder copy for our about page. We are an independent directory '
  || 'that reviews and compares mystery box operators. We will replace this text '
  || 'with our full story before launch.',
  'published', now()
from public.markets m
where m.code in ('uk', 'us')
on conflict (market_id, slug) do nothing;

insert into public.pages (slug, market_id, title, meta_description, body, status, published_at)
select 'privacy-policy', m.id, 'Privacy policy',
  'How we handle your data.',
  'This is placeholder copy for our privacy policy. We will publish a reviewed '
  || 'policy that explains what data we collect and how we use it before launch. '
  || 'Do not treat this text as a real policy.',
  'published', now()
from public.markets m
where m.code in ('uk', 'us')
on conflict (market_id, slug) do nothing;

insert into public.pages (slug, market_id, title, meta_description, body, status, published_at)
select 'terms', m.id, 'Terms of use',
  'The terms that apply when you use this site.',
  'This is placeholder copy for our terms of use. We will publish reviewed terms '
  || 'before launch. Do not treat this text as a binding agreement.',
  'published', now()
from public.markets m
where m.code in ('uk', 'us')
on conflict (market_id, slug) do nothing;

insert into public.pages (slug, market_id, title, meta_description, body, status, published_at)
select 'responsible-gambling', m.id, 'Responsible gambling',
  'Play safe and know where to find help.',
  'This is placeholder copy for our responsible gambling page. Some operators we '
  || 'list run pay to open products with a randomised result. If it stops being '
  || 'fun it is time to take a break. We will add vetted support resources here '
  || 'before launch.',
  'published', now()
from public.markets m
where m.code in ('uk', 'us')
on conflict (market_id, slug) do nothing;
