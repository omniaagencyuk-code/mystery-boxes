-- ---------------------------------------------------------------------------
-- OPERATOR REVIEWS BATCH 1  (run once in the Supabase SQL Editor)
--
-- Publishes three operator reviews for the US (root) market, chosen from the
-- keyword research as the highest value, lowest difficulty trust queries the
-- plan underweighted: Boxed.gg, Arena Club and Courtyard.io. Each page targets
-- its "is X legit", "X reviews" and "what is X" intent with ~700 words plus SEO
-- fields and FAQs.
--
-- Facts are grounded in public sources (see comments per operator). Nothing is
-- invented: no ratings or scores are set (rating and overall_score stay null,
-- so the page shows "Not yet rated" until an editor completes hands-on testing),
-- and NO promo codes or offers are created (the research says not to generate
-- codes for these). Add verified specifics, an affiliate tracking URL and a
-- logo in the admin.
--
-- Idempotent: safe to re-run. Run AFTER the review-template migration.
-- ---------------------------------------------------------------------------

-- ===========================================================================
-- 1. BOXED.GG  (/reviews/boxed-gg)  target: "is boxed.gg legit", "boxed.gg reviews"
--    Sources: thespike.gg, draftsim.com, deadspin.com, betterchecked.com (2026)
-- ===========================================================================
insert into public.operators (
  slug, name, operator_type_id, summary, pros, cons, active
)
select 'boxed-gg', 'Boxed.gg', t.id,
  $s$Boxed.gg is a digital pack opening site for trading cards. You buy gems, open mystery boxes, and win random Pokemon and sports cards, with a published drop table and a provably fair draw.$s$,
  $j$[
    "Published drop tables show the odds on every card",
    "Provably fair draw you can verify after the fact",
    "You are guaranteed a card on every open",
    "Wide range of Pokemon and sports card boxes"
  ]$j$::jsonb,
  $j$[
    "Gems are site credit and cannot be withdrawn as cash",
    "Headline cards carry small published odds",
    "Designed to keep you opening, so set a budget first"
  ]$j$::jsonb,
  true
from public.operator_types t where t.slug = 'digital_unboxing'
on conflict (slug) do update set
  name = excluded.name, operator_type_id = excluded.operator_type_id,
  summary = excluded.summary, pros = excluded.pros, cons = excluded.cons,
  active = true, updated_at = now();

insert into public.operator_markets (operator_id, market_id, visible, requires_geo_block)
select o.id, m.id, true, false from public.operators o, public.markets m
where o.slug = 'boxed-gg' and m.code = 'us'
on conflict (operator_id, market_id) do update set visible = true, requires_geo_block = false;

insert into public.reviews (
  operator_id, market_id, body, verdict, status, published_at, last_checked_at,
  best_for_title, best_for_description, seo_title, meta_description
)
select o.id, m.id,
$md$If you are searching for whether Boxed.gg is legit, you probably want one straight answer before you spend anything. Here is what Boxed.gg is, how it works, and what to check first, so you can decide with your eyes open.

## What Boxed.gg is

Boxed.gg is a digital pack opening site built around trading cards. You buy the site's gems, use them to open mystery boxes, and receive a random card such as Pokemon, soccer, hockey, racing or baseball. It sits in the same family as other online mystery box websites, but the prizes are real trading cards rather than sneakers or electronics. If your search was simply what is Boxed.gg, that is the short version. It is a card focused pack opener, not a video game skin site and not a physical store.

## How Boxed.gg works

The flow is quick to learn. You add gems, which are the site credit, then pick a box and open it. Every box shows a drop table, so before you spend you can see each possible card, its gem value, and the exact chance of pulling it. The draw runs on a provably fair system, and you are always guaranteed a card when you open a box, so an open never leaves you with nothing at all.

One point matters more than any other. Gems are site credit and cannot be withdrawn as cash. Money that enters Boxed.gg stays inside Boxed.gg until it leaves as a card, or as store credit where that is offered. Treat a deposit as committed the moment it lands, and only add what you are happy to turn into cards.

## Is Boxed.gg legit

On the core question, Boxed.gg is a real, operating site rather than a scam. You receive a card on every open, the odds are published up front, and the provably fair system lets you confirm that a result was not altered after you committed. Reviewers who have tested the site reach the same broad conclusion, that it pays out what it shows and behaves like a legitimate pack opener.

That does not make it an automatic good deal. Like every pack and box site, Boxed.gg is designed to be engaging, with the usual features that nudge you to keep opening for the chance of a rare hit. The odds on the headline cards are small, and most opens land in the cheaper tiers. The honest way to use the site is to read the drop table rather than the marketing, and to judge each box on the common outcomes, not the grail.

## What to check before you buy

Before you deposit, look at four things. First, the drop table on the specific box you want, because the average open is set by the cheap tiers, not the top card. Second, how you get cards out, whether that means shipping to your address and who covers postage. Third, any fees or minimums on withdrawals or shipping. Fourth, your own budget, set before you start and treated as spent.

## Getting your cards

Because prizes are physical trading cards, fulfilment is the part that varies most across sites like this. Confirm the current shipping options, timescales and any costs directly on Boxed.gg before you open a lot of boxes, and keep screenshots of the odds and of anything you win. If you plan to sell rather than keep, check the resale value of the common tiers, since that is what an average session is really worth.

## Our take

Boxed.gg is a legitimate way to open trading card packs online, and its odds transparency is better than a good part of the category. Go in treating it as entertainment, set a budget, and only chase cards you would be genuinely happy to keep. We have not assigned a score yet. We will add one once we have completed our own hands on testing, and we will update the last checked date when we do.$md$,
  $v$Boxed.gg is a legitimate card focused pack opener with clear published odds, best treated as entertainment rather than a way to make money.$v$,
  'published', now(), now(),
  'Opening trading card packs for fun',
  'People who want the pack opening experience and would be happy keeping the common tier cards, treating the spend as entertainment.',
  'Is Boxed.gg Legit? Our Boxed.gg Review (2026)',
  'An honest Boxed.gg review. What Boxed.gg is, how the gems and drop tables work, whether it is legit, and what to check before you open a box.'
from public.operators o, public.markets m
where o.slug = 'boxed-gg' and m.code = 'us'
on conflict (operator_id, market_id) do update set
  body = excluded.body, verdict = excluded.verdict, status = 'published',
  updated_at = now(), published_at = coalesce(public.reviews.published_at, excluded.published_at),
  last_checked_at = excluded.last_checked_at, best_for_title = excluded.best_for_title,
  best_for_description = excluded.best_for_description, seo_title = excluded.seo_title,
  meta_description = excluded.meta_description;

-- ===========================================================================
-- 2. ARENA CLUB  (/reviews/arena-club)  target: "is arena club legit", "arena club reviews"
--    Sources: sportico.com, sportscollectorsdaily.com, cardlines.com (Arena Club,
--    co-founded by Derek Jeter, CEO Brian Lee; grading + vault + marketplace)
-- ===========================================================================
insert into public.operators (
  slug, name, operator_type_id, summary, owner, founded_year, availability, pros, cons, active
)
select 'arena-club', 'Arena Club', t.id,
  $s$Arena Club is a sports card grading, vaulting and marketplace platform co-founded by Derek Jeter. It grades cards with computer vision and human review, stores them in a secured vault, and logs cards and transactions on the Flow blockchain.$s$,
  'Co-founded by Derek Jeter, CEO Brian Lee',
  2022,
  'United States',
  $j$[
    "Backed by a known team, co-founded by Derek Jeter",
    "Grading uses computer vision plus a human review, with a condition report",
    "Temperature and moisture controlled vault storage",
    "Cards and transactions are logged on the Flow blockchain"
  ]$j$::jsonb,
  $j$[
    "Grading turnaround can take around 30 business days",
    "Fees apply to grade, vault and list your cards",
    "It is a grading and marketplace service, not a low cost mystery box"
  ]$j$::jsonb,
  true
from public.operator_types t where t.slug = 'digital_unboxing'
on conflict (slug) do update set
  name = excluded.name, operator_type_id = excluded.operator_type_id,
  summary = excluded.summary, owner = excluded.owner, founded_year = excluded.founded_year,
  availability = excluded.availability, pros = excluded.pros, cons = excluded.cons,
  active = true, updated_at = now();

insert into public.operator_markets (operator_id, market_id, visible, requires_geo_block)
select o.id, m.id, true, false from public.operators o, public.markets m
where o.slug = 'arena-club' and m.code = 'us'
on conflict (operator_id, market_id) do update set visible = true, requires_geo_block = false;

insert into public.reviews (
  operator_id, market_id, body, verdict, status, published_at, last_checked_at,
  best_for_title, best_for_description, seo_title, meta_description
)
select o.id, m.id,
$md$People searching whether Arena Club is legit are usually weighing up sending real cards to a newer grading company. It is a fair question, so here is what Arena Club is, who is behind it, and how the grading, vault and marketplace fit together.

## What Arena Club is

Arena Club is a sports card grading, vaulting and marketplace platform. In plain terms, you can send in cards to be graded, store the graded cards in the company's vault or have them returned, and buy or sell cards with other collectors on the same site. If your search was what is Arena Club, that is the core of it, a single place to grade, hold and trade cards rather than a mystery box.

## Who is behind it

Arena Club was co-founded by Derek Jeter, with Brian Lee as chief executive, a founder previously behind other well known consumer companies. That backing does not guarantee a good experience on its own, but it does mean the platform is a real, funded operation rather than an anonymous site, which is the first thing to check when you are deciding if something is legit.

## How the grading works

Arena Club grades submitted cards using computer vision and machine learning alongside a human eye, and it provides a detailed report on anything that might keep a card from the top grade. Graded cards can then be stored in a temperature and moisture controlled vault or sent to you in protective slabs. Cards and transactions are logged on the Flow blockchain, which is used to create a digital proof of what you own.

Turnaround and fees are worth confirming before you commit, because they change over time. At launch the company described tiered pricing, for example one fee to grade, vault and list a card for sale, and a higher fee to grade and return it, with a turnaround measured in weeks rather than days. Check the current fees and timescales on the site before you send anything valuable.

## Is Arena Club legit

On the central question, Arena Club is a legitimate company rather than a scam. It is a funded business with named founders, a physical grading and vault operation, and an on chain record of cards and trades. The transparency around grading and ownership is a genuine point in its favour, and it is aimed squarely at the fraud and trust problems that collectors worry about.

Legit does not mean risk free. Grading is subjective at the margins, turnaround times can be long, and the value of a graded card still depends on a resale market that moves. If your card is valuable or sentimental, weigh the vault and marketplace convenience against sending it away for weeks, and read the current terms on storage, insurance and selling fees.

## Who it suits

Arena Club fits collectors who want grading, secure storage and a place to sell in one platform, and who are comfortable with a modern, technology led approach that records ownership on chain. It is less relevant if you are looking for a cheap pack opening thrill, since it is a grading and marketplace service first.

## How it compares

The established graders such as PSA, SGC and Beckett have longer track records and the deepest market recognition, and a grade from them still tends to carry the most weight at resale. Arena Club's pitch is speed, a transparent report and an all in one vault and marketplace, rather than replacing those names outright. If your goal is the highest resale confidence on a genuinely valuable card, weigh that recognition against the convenience here. If you want grading, storage and selling handled together with a clear digital record, Arena Club is built for exactly that.

## Our take

Arena Club is a legitimate, well backed entry into card grading and trading, with a transparent process and a serious vault operation. We have not assigned a score yet, and we will add one after hands on testing of the grading and selling experience. Before you send cards, confirm the current fees, turnaround and insurance details on the site.$md$,
  $v$Arena Club is a legitimate, well backed sports card grading, vault and marketplace platform, best for collectors who want grading and secure storage in one place.$v$,
  'published', now(), now(),
  'Grading, vaulting and selling cards in one place',
  'Collectors who want to grade, securely store and sell cards on one modern platform, and are comfortable with on chain ownership records.',
  'Is Arena Club Legit? Our Arena Club Review (2026)',
  'An honest Arena Club review. What Arena Club is, who is behind it, how grading and the vault work, and whether Arena Club is legit for collectors.'
from public.operators o, public.markets m
where o.slug = 'arena-club' and m.code = 'us'
on conflict (operator_id, market_id) do update set
  body = excluded.body, verdict = excluded.verdict, status = 'published',
  updated_at = now(), published_at = coalesce(public.reviews.published_at, excluded.published_at),
  last_checked_at = excluded.last_checked_at, best_for_title = excluded.best_for_title,
  best_for_description = excluded.best_for_description, seo_title = excluded.seo_title,
  meta_description = excluded.meta_description;

-- ===========================================================================
-- 3. COURTYARD.IO  (/reviews/courtyard)  target: "is courtyard.io legit", "courtyard.io reviews"
--    Sources: docs.courtyard.io, courtyard.io, polygon.technology, thirdweb.com
--    (vault + tokenize physical cards, Brink's storage, Chainlink VRF packs, YC W22)
-- ===========================================================================
insert into public.operators (
  slug, name, operator_type_id, summary, owner, founded_year, availability, pros, cons, active
)
select 'courtyard', 'Courtyard.io', t.id,
  $s$Courtyard.io vaults physical graded cards and tokenizes them as NFTs you can trade or redeem for the real card. Cards are stored and insured with Brink's, and digital pack openings use Chainlink verifiable randomness with published odds.$s$,
  'Courtyard (Y Combinator W22)',
  2022,
  'Worldwide',
  $j$[
    "Physical cards are vaulted and insured, stored with Brink's",
    "Pack odds are published and use Chainlink verifiable randomness",
    "Buy with card or crypto and redeem for the physical card anytime",
    "Every token is backed one to one by a real graded card"
  ]$j$::jsonb,
  $j$[
    "Ownership is tokenized on chain, which is unfamiliar to some collectors",
    "Card values depend on a resale market that can move",
    "Redeeming the physical card is a separate step and may carry costs"
  ]$j$::jsonb,
  true
from public.operator_types t where t.slug = 'digital_unboxing'
on conflict (slug) do update set
  name = excluded.name, operator_type_id = excluded.operator_type_id,
  summary = excluded.summary, owner = excluded.owner, founded_year = excluded.founded_year,
  availability = excluded.availability, pros = excluded.pros, cons = excluded.cons,
  active = true, updated_at = now();

insert into public.operator_markets (operator_id, market_id, visible, requires_geo_block)
select o.id, m.id, true, false from public.operators o, public.markets m
where o.slug = 'courtyard' and m.code = 'us'
on conflict (operator_id, market_id) do update set visible = true, requires_geo_block = false;

insert into public.reviews (
  operator_id, market_id, body, verdict, status, published_at, last_checked_at,
  best_for_title, best_for_description, seo_title, meta_description
)
select o.id, m.id,
$md$If you are asking whether Courtyard.io is legit, the honest answer starts with understanding that it works differently from a normal mystery box site. Here is what Courtyard.io is, how the vault and packs work, and what to weigh before you buy.

## What Courtyard.io is

Courtyard.io is a platform that takes physical graded collectibles, mainly trading cards, secures them in a professional vault, and represents each one as a digital token you can buy, sell or trade. Every token is backed one to one by a real card held in storage, and you can redeem the token for the physical card whenever you want. If your search was what is Courtyard.io, that is the heart of it, a bridge between physical cards and a fast digital marketplace.

## How Courtyard.io works

The cards behind Courtyard are stored and insured with Brink's, the established security company, and monitored around the clock. When you buy a card on the platform you receive the token that represents it, and you can hold it, trade it with other collectors, or request the physical card to be shipped to you. You can pay with a card or with crypto, which keeps it accessible whether or not you are used to digital wallets.

Courtyard also runs digital pack openings. These use Chainlink verifiable randomness, a system that produces a provably fair result, and the odds are published before you buy. As with any pack, read those odds and judge a pack on its common outcomes rather than the headline card.

## Is Courtyard.io legit

On the core question, Courtyard.io shows the markers of a legitimate operation rather than a scam. It came through a well known startup programme, it partners with Brink's for physical storage and insurance, and it uses a transparent, verifiable randomness system for pack odds. Each token is backed by a real, vaulted card, so you are not buying a purely digital item with nothing behind it.

The honest caveats are about how it works, not whether it is real. Ownership is recorded on chain, which is unfamiliar and offputting to some collectors. The value of a card still depends on a resale market that can rise and fall. And redeeming the physical card is a separate step that can carry shipping and handling costs, so factor that in if your plan is always to hold the real thing.

## What to check before you buy

Confirm the current fees for buying, selling and especially for redeeming a physical card, since that last step is where costs are easy to miss. Look at the published pack odds on whatever you plan to open. And decide up front whether you want the card in hand or are happy holding it as a vaulted, insured token you can trade quickly.

## Who it suits

Courtyard.io suits collectors who like the idea of trading graded cards quickly and safely without shipping them back and forth, and who are comfortable with tokenized ownership backed by real storage. It is less suited to someone who only ever wants the physical card in a binder and has no interest in the digital layer.

## How it compares to holding cards yourself

Keeping graded cards at home costs nothing in fees, but you carry the risk of damage, loss and the slow friction of packing and shipping every time you sell. Courtyard trades that for insured professional storage and near instant trading, at the cost of platform fees and a redemption step if you want the physical card back in hand. Neither approach is strictly better. It comes down to whether you value speed and security over having the card in a binder, and whether the fees make sense for the value of the cards you hold.

## Our take

Courtyard.io is a legitimate, seriously backed way to hold and trade physical cards through a digital marketplace, with insured storage and provably fair pack odds. We have not assigned a score yet, and we will add one after hands on testing. Before you spend, confirm the current buying, selling and redemption fees on the site.$md$,
  $v$Courtyard.io is a legitimate, insured way to trade physical graded cards through a digital marketplace, best for collectors comfortable with tokenized ownership.$v$,
  'published', now(), now(),
  'Trading vaulted cards through a digital marketplace',
  'Collectors who want to trade graded cards quickly and safely with insured storage, and are comfortable with tokenized ownership they can redeem for the physical card.',
  'Is Courtyard.io Legit? Our Courtyard.io Review (2026)',
  'An honest Courtyard.io review. What Courtyard.io is, how the vault, Brink''s storage and provably fair packs work, and whether Courtyard.io is legit.'
from public.operators o, public.markets m
where o.slug = 'courtyard' and m.code = 'us'
on conflict (operator_id, market_id) do update set
  body = excluded.body, verdict = excluded.verdict, status = 'published',
  updated_at = now(), published_at = coalesce(public.reviews.published_at, excluded.published_at),
  last_checked_at = excluded.last_checked_at, best_for_title = excluded.best_for_title,
  best_for_description = excluded.best_for_description, seo_title = excluded.seo_title,
  meta_description = excluded.meta_description;

-- ===========================================================================
-- 4. FAQs (verbatim answers targeting the "is X legit" and "what is X" queries)
-- ===========================================================================
delete from public.review_faqs
  where review_id in (
    select r.id from public.reviews r join public.operators o on o.id = r.operator_id
    where o.slug in ('boxed-gg','arena-club','courtyard')
  );

insert into public.review_faqs (review_id, question, answer, position)
select r.id, f.question, f.answer, f.position
from public.reviews r
join public.operators o on o.id = r.operator_id
join lateral (
  values
    ('boxed-gg', 'Is Boxed.gg legit?',
      $a$Yes. Boxed.gg is a real, operating pack opening site, not a scam. You are guaranteed a card on every open, the odds are published in a drop table, and the provably fair system lets you verify a result. Treat it as entertainment rather than a way to make money.$a$, 0),
    ('boxed-gg', 'What is Boxed.gg?',
      $a$Boxed.gg is a digital pack opening site for trading cards. You buy gems, open mystery boxes, and win random Pokemon and sports cards, with the odds shown up front.$a$, 1),
    ('boxed-gg', 'How does Boxed.gg work?',
      $a$You add gems, pick a box, and open it. Each box lists a drop table with the odds on every card, the draw is provably fair, and you always receive a card. Gems are site credit and cannot be withdrawn as cash.$a$, 2),
    ('arena-club', 'Is Arena Club legit?',
      $a$Yes. Arena Club is a legitimate, funded company co-founded by Derek Jeter, with a real grading and vault operation and on chain records of cards and trades. Confirm the current fees and turnaround before sending valuable cards.$a$, 0),
    ('arena-club', 'What is Arena Club?',
      $a$Arena Club is a sports card grading, vaulting and marketplace platform. You can grade cards, store them in a secured vault or have them returned, and buy or sell with other collectors on the same site.$a$, 1),
    ('arena-club', 'How does Arena Club grading work?',
      $a$Arena Club grades cards using computer vision and machine learning alongside a human review, and provides a condition report. Graded cards can be vaulted or returned in slabs. Check the current fees and turnaround on the site.$a$, 2),
    ('courtyard', 'Is Courtyard.io legit?',
      $a$Yes. Courtyard.io shows the markers of a legitimate operation. It stores and insures physical cards with Brink's, backs every token one to one with a real card, and uses Chainlink verifiable randomness with published odds for pack openings.$a$, 0),
    ('courtyard', 'What is Courtyard.io?',
      $a$Courtyard.io vaults physical graded cards and represents each as a digital token you can trade or redeem for the physical card. Every token is backed one to one by a real card held in insured storage.$a$, 1),
    ('courtyard', 'How does Courtyard.io work?',
      $a$You buy digital packs or individual cards with a card or crypto. Each item is backed by a vaulted physical card, you can trade it quickly with other collectors, and you can redeem it for the physical card whenever you want.$a$, 2)
) as f(slug, question, answer, position) on f.slug = o.slug
where o.slug in ('boxed-gg','arena-club','courtyard');
