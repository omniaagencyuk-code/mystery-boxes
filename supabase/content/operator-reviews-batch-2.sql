-- ---------------------------------------------------------------------------
-- OPERATOR REVIEWS BATCH 2  (run once in the Supabase SQL Editor)
--
-- Six US-market mystery box / digital pack operators from the keyword research:
-- HypeDrop, Cases.gg, JemLit, RillaBox, Packz and LuxDrop. Each page targets its
-- "is X legit", "X reviews" and "what is X" intent with ~700 words, SEO fields,
-- pros/cons, FAQs and a real welcome offer with terms.
--
-- Offers and facts are sourced from the operators' sites and public reviews
-- (sources noted per operator) and stamped with last_verified_at = now(); you
-- should re-verify before relying on them. Codes are intentionally left blank:
-- add YOUR OWN affiliate code and tracking URL in Admin > Operators / Offers.
-- No editorial ratings/scores are set (rating and overall_score stay null) until
-- hands-on testing, matching the research note.
--
-- Idempotent: safe to re-run. Run AFTER the review-template migration.
-- ---------------------------------------------------------------------------

-- Helper note: operator_type is 'digital_unboxing' for all six.

-- ===========================================================================
-- 1. HYPEDROP  (/reviews/hypedrop)  target: "is hypedrop legit", "hypedrop review"
--    Sources: thespike.gg, gamechampions.com, mysteryboxscout.com (2026). US only.
-- ===========================================================================
insert into public.operators (slug, name, operator_type_id, availability, summary, pros, cons, active)
select 'hypedrop', 'HypeDrop', t.id, 'United States',
  $s$HypeDrop is a digital mystery box site where you buy boxes, open them, and win real items you can ship, exchange, or convert to their value. New accounts get three free boxes and a 5 percent deposit bonus.$s$,
  $j$[
    "Three free mystery boxes and a 5 percent deposit bonus for new accounts",
    "Ships real items, with a verifiable random draw",
    "You can ship a win, exchange it, or take its value"
  ]$j$::jsonb,
  $j$[
    "A large crypto payout dispute has been reported and widely discussed",
    "Operated offshore with no domestic licence or consumer backstop",
    "Disputes fall under arbitration on the operator's own terms"
  ]$j$::jsonb,
  true
from public.operator_types t where t.slug = 'digital_unboxing'
on conflict (slug) do update set name=excluded.name, operator_type_id=excluded.operator_type_id,
  availability=excluded.availability, summary=excluded.summary, pros=excluded.pros, cons=excluded.cons,
  active=true, updated_at=now();
insert into public.operator_markets (operator_id, market_id, visible, requires_geo_block)
select o.id, m.id, true, false from public.operators o, public.markets m where o.slug='hypedrop' and m.code='us'
on conflict (operator_id, market_id) do update set visible=true, requires_geo_block=false;
insert into public.reviews (operator_id, market_id, body, verdict, status, published_at, last_checked_at, best_for_title, best_for_description, seo_title, meta_description)
select o.id, m.id,
$md$If you are asking whether HypeDrop is legit, you want a clear read before you deposit. HypeDrop is a real, operating mystery box site, but it comes with genuine caveats worth knowing first. Here is what it is, how it works, the welcome offer, and where to be careful.

## What HypeDrop is

HypeDrop is a digital mystery box platform. You buy a box, open it on screen, and win a random item. If your search was what is HypeDrop, that is the core of it, an online unboxing site where the prizes are real products rather than points. When you win something you can have it shipped, exchange it, or take its cash value on the platform.

## How HypeDrop works

You fund your balance, choose a box, and open it. Each box shows the possible items and the draw is run on a random system that can be verified after the fact. From there you decide what to do with a win, ship it to your address, swap it, or convert it. As with any box site, read the odds on the specific box, because the headline items are rare and most opens land in the lower tiers.

## The welcome offer

New accounts get three free mystery boxes plus a 5 percent deposit bonus, which is a match applied when you fund your account. The free boxes let you try the site before you commit anything, which is the right way to test any platform like this. Confirm the current terms and any daily cap on the deposit bonus on site, and add your own promo code where the field asks for one.

## Is HypeDrop legit

The honest answer has two sides. On the mechanics, HypeDrop is legitimate. It ships what it promises for most users and the random draw is verifiable. On trust, there are real flags. A large cryptocurrency payout dispute involving HypeDrop has been reported and widely discussed, and the site operates offshore with no domestic licence and no consumer protection backstop, so a serious dispute would go to arbitration under terms the operator wrote.

None of that makes HypeDrop a scam for a typical low value session, but it does mean you should keep your spend modest, avoid holding a large balance on the platform, and use a payment method with buyer protection. Treat the site as entertainment, not a place to store value.

## What to check before you buy

Look at the drop table on the box you want and judge it on the common outcomes. Check how shipping works and who pays for it. Keep records, including screenshots of odds and of any win. And set a budget before you start, then treat it as spent.

## How HypeDrop compares

Against the wider mystery box field, HypeDrop sits in the middle. Its catalogue is broad and the welcome offer is competitive, but the trust picture is weaker than newer, provably fair focused rivals that lead on transparency. Sites like Cases.gg and RillaBox lean hard on published odds and auditable draws as their main selling point, while HypeDrop is better known for scale and its long running presence than for a spotless record. If your priority is the widest possible range of boxes and you are opening at low stakes, HypeDrop is a reasonable pick. If your priority is a clean trust history and a licence to fall back on, you will find the category as a whole is thin on both, and HypeDrop is not the one that changes that. The practical difference for you is not the mechanics, which are similar everywhere, but how much you are willing to hold on the platform. With HypeDrop the answer should be as little as possible, opened and shipped quickly rather than banked.

## Our take

HypeDrop is a real mystery box site with a decent welcome offer and a wide catalogue, but the trust picture is mixed enough that caution is the sensible default. We have not assigned a score yet, and we will add one after our own testing. In the meantime, spend small, ship your wins rather than banking a balance, and read the current terms.$md$,
  $v$HypeDrop is a real, well stocked mystery box site with a solid welcome offer, but a mixed trust record means you should spend small and ship your wins rather than hold a balance.$v$,
  'published', now(), now(),
  'Trying online unboxing at low stakes',
  'People who want the unboxing experience at modest stakes and will ship their wins rather than hold a balance on the platform.',
  'Is HypeDrop Legit? Our HypeDrop Review (2026)',
  'An honest HypeDrop review. What HypeDrop is, how it works, the free boxes and deposit bonus, whether HypeDrop is legit, and the trust caveats to know.'
from public.operators o, public.markets m where o.slug='hypedrop' and m.code='us'
on conflict (operator_id, market_id) do update set body=excluded.body, verdict=excluded.verdict, status='published',
  updated_at=now(), published_at=coalesce(public.reviews.published_at, excluded.published_at),
  last_checked_at=excluded.last_checked_at, best_for_title=excluded.best_for_title,
  best_for_description=excluded.best_for_description, seo_title=excluded.seo_title, meta_description=excluded.meta_description;

-- ===========================================================================
-- 2. CASES.GG  (/reviews/cases-gg)  target: "is cases.gg legit", "cases.gg review"
--    Sources: cases.gg, casinos.org, betterchecked.com, unpacked.gg (2026). Launched 2024.
-- ===========================================================================
insert into public.operators (slug, name, operator_type_id, founded_year, summary, pros, cons, active)
select 'cases-gg', 'Cases.gg', t.id, 2024,
  $s$Cases.gg is a mystery box site launched in 2024 where you open cases for real items, with transparent odds and a provably fair draw. New players get free cases and a first deposit bonus, and can choose to ship or sell wins.$s$,
  $j$[
    "Three free cases to open before you deposit",
    "Provably fair draw with transparent odds",
    "Choose to ship a win or sell it back",
    "Withdrawals are usually fast once identity checks clear"
  ]$j$::jsonb,
  $j$[
    "Free welcome boxes are mostly low tier filler",
    "Customer support replies can be slow",
    "Deposit bonus and free boxes come with the site's terms"
  ]$j$::jsonb,
  true
from public.operator_types t where t.slug = 'digital_unboxing'
on conflict (slug) do update set name=excluded.name, operator_type_id=excluded.operator_type_id,
  founded_year=excluded.founded_year, summary=excluded.summary, pros=excluded.pros, cons=excluded.cons,
  active=true, updated_at=now();
insert into public.operator_markets (operator_id, market_id, visible, requires_geo_block)
select o.id, m.id, true, false from public.operators o, public.markets m where o.slug='cases-gg' and m.code='us'
on conflict (operator_id, market_id) do update set visible=true, requires_geo_block=false;
insert into public.reviews (operator_id, market_id, body, verdict, status, published_at, last_checked_at, best_for_title, best_for_description, seo_title, meta_description)
select o.id, m.id,
$md$If you are checking whether Cases.gg is legit before you open a case, here is a straight rundown. Cases.gg is a newer but active mystery box site with transparent odds and a generous welcome offer, and like the rest of the category it works best treated as entertainment.

## What Cases.gg is

Cases.gg is a mystery box website that launched in 2024. You open cases and win real items, then decide whether to ship them or sell them back for credit. If your search was what is Cases.gg, that is the short version, an online unboxing site with a wide range of themed boxes and published odds on each one.

## How Cases.gg works

You add funds, pick a case, and open it. Every case lists its odds and the result comes from a provably fair draw, which means you can verify after the fact that the outcome was not changed once you committed. When you win, you either have the item shipped or sell it back into site credit. Withdrawals of that credit are usually processed quickly once identity checks clear, which reviewers often flag as a plus.

## The welcome offer

New players get three free cases to open before depositing, plus a first deposit bonus that has been advertised as high as a 200 percent match, along with a small bonus on your first purchase. The free cases are the honest way to test the site. Be realistic about them though, since free welcome boxes are weighted toward low tier filler, so treat any big pull as a bonus rather than the expectation. Confirm the current bonus percentage and its terms on site before depositing.

## Is Cases.gg legit

On the core question, Cases.gg is a legitimate, operating site rather than a scam. Prizes are awarded by a provably fair random system, the odds are shown up front, and users report quick withdrawals once verification is done. The main knocks are service related. Support reply rates and times have been criticised, so if you hit a problem, be prepared for slower responses than you would like.

As always, the odds on headline items are small and the house keeps an edge, so the sensible approach is to set a budget, judge a case on its common outcomes, and only open boxes where you would be happy to keep the mid tier result.

## What to check before you buy

Read the odds on the specific case, not the marketing. Check the current terms on the deposit bonus, since match offers usually carry conditions. Confirm shipping options and costs. And keep your spending inside a budget you set in advance.

## How Cases.gg compares

Among the newer wave of box sites, Cases.gg competes on two fronts, odds transparency and the size of its welcome offer, and it holds up well on both. Its published odds and provably fair draw put it in the same bracket as RillaBox and JemLit for verifiability, and its advertised deposit match is at the higher end of what the category offers. Where it slips behind is service. Sites with a longer track record tend to have steadier support, and the slow replies reviewers flag are the main thing separating Cases.gg from the front runners. For a new player weighing options, the trade is straightforward. You get strong transparency and a big headline bonus, in exchange for the risk of a slow response if something goes wrong. If you value being able to verify every draw and want the largest first deposit boost, Cases.gg is a strong candidate. If reliable support is your first concern, a more established name may suit you better.

## Our take

Cases.gg is a legitimate, well stocked mystery box site with strong odds transparency and a big welcome offer, held back mainly by patchy customer support. We have not assigned a score yet and will add one after testing. Go in for the fun of it, use the free cases to form your own view, and keep your stakes sensible.$md$,
  $v$Cases.gg is a legitimate, well stocked mystery box site with clear odds and a big welcome offer, let down mainly by slow customer support.$v$,
  'published', now(), now(),
  'A big welcome offer and clear odds',
  'People who want a wide box selection with transparent odds and a generous welcome offer, and who treat the spend as entertainment.',
  'Is Cases.gg Legit? Our Cases.gg Review (2026)',
  'An honest Cases.gg review. What Cases.gg is, how the cases and provably fair odds work, the free cases and deposit bonus, and whether Cases.gg is legit.'
from public.operators o, public.markets m where o.slug='cases-gg' and m.code='us'
on conflict (operator_id, market_id) do update set body=excluded.body, verdict=excluded.verdict, status='published',
  updated_at=now(), published_at=coalesce(public.reviews.published_at, excluded.published_at),
  last_checked_at=excluded.last_checked_at, best_for_title=excluded.best_for_title,
  best_for_description=excluded.best_for_description, seo_title=excluded.seo_title, meta_description=excluded.meta_description;

-- ===========================================================================
-- 3. JEMLIT  (/reviews/jemlit)  target: "is jemlit legit", "jemlit review"
--    Sources: valuewalk.com, lines.com, casinorankr.com (2026). JLT Digital Media LTD, London.
-- ===========================================================================
insert into public.operators (slug, name, operator_type_id, owner, availability, summary, pros, cons, active)
select 'jemlit', 'JemLit', t.id, 'JLT Digital Media LTD (London)', 'Worldwide',
  $s$JemLit is a mystery box site operated by a London registered company, JLT Digital Media LTD. You open boxes for tech, sneakers, designer items and more, with a provably fair draw and worldwide shipping. New accounts get free boxes and a deposit bonus.$s$,
  $j$[
    "Operated by a London registered company, JLT Digital Media LTD",
    "Around 4.2 out of 5 on Trustpilot at the time of writing",
    "Provably fair draw with worldwide shipping",
    "Swap unwanted items for JemLit credit"
  ]$j$::jsonb,
  $j$[
    "Identity checks can be slow to process",
    "Prize values can run below the advertised retail price",
    "Unlicensed, with UK reforms still under consultation"
  ]$j$::jsonb,
  true
from public.operator_types t where t.slug = 'digital_unboxing'
on conflict (slug) do update set name=excluded.name, operator_type_id=excluded.operator_type_id,
  owner=excluded.owner, availability=excluded.availability, summary=excluded.summary, pros=excluded.pros, cons=excluded.cons,
  active=true, updated_at=now();
insert into public.operator_markets (operator_id, market_id, visible, requires_geo_block)
select o.id, m.id, true, false from public.operators o, public.markets m where o.slug='jemlit' and m.code='us'
on conflict (operator_id, market_id) do update set visible=true, requires_geo_block=false;
insert into public.reviews (operator_id, market_id, body, verdict, status, published_at, last_checked_at, best_for_title, best_for_description, seo_title, meta_description)
select o.id, m.id,
$md$People searching whether JemLit is legit usually want to know if a mystery box site with real brand names actually delivers. JemLit is one of the more established names in the category, and here is what it is, how it works, the welcome offer, and the caveats.

## What JemLit is

JemLit is an online mystery box platform. You open boxes and win items across technology, electronics, sneakers, designer bags and watches, among other categories. If your search was what is JemLit, that is the essence of it, a themed unboxing site with a broad catalogue and a focus on recognisable brands. It is operated by JLT Digital Media LTD, a company registered in London, which gives it more visible corporate footing than many rivals.

## How JemLit works

You fund your account, choose a box, and open it. The outcome is decided by a provably fair system, so you can verify a result after the fact. When you win, JemLit offers worldwide shipping, or you can swap an unwanted item for JemLit credit to open more boxes. As with any box, the headline prizes are rare, so read the odds and judge a box on the common outcomes.

## The welcome offer

New players are offered three free mystery boxes plus a 25 percent deposit bonus to boost a first balance. There is also a referral programme that pays a percentage of a referred player's deposits. The free boxes are the sensible way to test the platform before committing. Check the current bonus terms on site, and add your own promo code in the field provided.

## Is JemLit legit

On the central question, JemLit is legitimate. It is run by a registered company, uses a provably fair draw, ships worldwide, and holds a Trustpilot score around the low fours at the time of writing, with users praising the interface and delivery. That corporate footing is a genuine point in its favour when you are weighing trust.

The recurring complaints are worth knowing. Identity checks can take longer than people expect, and prize values sometimes come in below the advertised retail price, a common gripe across the whole category. JemLit is also unlicensed, and UK regulation of this sector is under consultation, so rules may tighten. None of that makes it a scam, but it does mean you should treat it as paid entertainment and keep your spending controlled.

## What to check before you buy

Read the odds on the box you want. Confirm the current deposit bonus terms. Factor in shipping and any customs charges if you are outside the UK. And set a budget in advance that you are comfortable losing.

## How JemLit compares

JemLit's main edge over much of the field is corporate transparency. Many box sites hide behind offshore shells, while JemLit names a London registered company, JLT Digital Media LTD, which gives you a clearer party to hold accountable. Its Trustpilot standing in the low fours is solid for the category, sitting below reputation leaders like RillaBox but comfortably above the weakest operators. On mechanics it is level with the pack, a provably fair draw, worldwide shipping and a credit swap for unwanted wins. Where it is ordinary rather than exceptional is the value gap, since prizes can come in under retail, a complaint that follows almost every site in this space. For you, the choice comes down to what you weight most. If a named, registered company behind the site matters, JemLit is one of the stronger options. If you are chasing the highest user reputation or the biggest welcome bonus, other names edge ahead, and JemLit's appeal is more about credibility than headline generosity.

## Our take

JemLit is one of the more credible mystery box operators, with a registered company behind it, provably fair draws and worldwide shipping, held back by slow verification and the usual gap between prize value and retail price. We have not assigned a score yet and will add one after testing. Use the free boxes to form your own view and keep your stakes sensible.$md$,
  $v$JemLit is one of the more credible mystery box sites, run by a London registered company with provably fair draws and worldwide shipping, best treated as paid entertainment.$v$,
  'published', now(), now(),
  'Brand name boxes from a registered company',
  'People who want recognisable brand boxes from an operator with a registered company behind it, and who treat the spend as entertainment.',
  'Is JemLit Legit? Our JemLit Review (2026)',
  'An honest JemLit review. What JemLit is, who runs it, how the provably fair boxes work, the free boxes and deposit bonus, and whether JemLit is legit.'
from public.operators o, public.markets m where o.slug='jemlit' and m.code='us'
on conflict (operator_id, market_id) do update set body=excluded.body, verdict=excluded.verdict, status='published',
  updated_at=now(), published_at=coalesce(public.reviews.published_at, excluded.published_at),
  last_checked_at=excluded.last_checked_at, best_for_title=excluded.best_for_title,
  best_for_description=excluded.best_for_description, seo_title=excluded.seo_title, meta_description=excluded.meta_description;

-- ===========================================================================
-- 4. RILLABOX  (/reviews/rillabox)  target: "is rillabox legit", "rillabox review"
--    Sources: casinorankr.com, betterchecked.com, unpacked.gg (2026).
-- ===========================================================================
insert into public.operators (slug, name, operator_type_id, summary, pros, cons, active)
select 'rillabox', 'RillaBox', t.id,
  $s$RillaBox is a mystery box site with a large catalogue of boxes and a strong Trustpilot record. Draws are provably fair, it accepts cards and crypto, and new accounts get a free box on signup plus a deposit bonus.$s$,
  $j$[
    "High Trustpilot score, around 4.8 at the time of writing",
    "Over 200 boxes with a wide variety",
    "Provably fair draws with auditable seeds",
    "Accepts Visa, Mastercard, PayPal and 10 plus cryptocurrencies"
  ]$j$::jsonb,
  $j$[
    "No gaming licence, with Belize governed terms",
    "No external audit or regulatory backstop yet",
    "High variance, so the house keeps an edge"
  ]$j$::jsonb,
  true
from public.operator_types t where t.slug = 'digital_unboxing'
on conflict (slug) do update set name=excluded.name, operator_type_id=excluded.operator_type_id,
  summary=excluded.summary, pros=excluded.pros, cons=excluded.cons, active=true, updated_at=now();
insert into public.operator_markets (operator_id, market_id, visible, requires_geo_block)
select o.id, m.id, true, false from public.operators o, public.markets m where o.slug='rillabox' and m.code='us'
on conflict (operator_id, market_id) do update set visible=true, requires_geo_block=false;
insert into public.reviews (operator_id, market_id, body, verdict, status, published_at, last_checked_at, best_for_title, best_for_description, seo_title, meta_description)
select o.id, m.id,
$md$If you are asking whether RillaBox is legit, the short answer is that it is a well reviewed mystery box site, with the usual category caveats around licensing. Here is what it is, how it works, the welcome offer, and what to weigh.

## What RillaBox is

RillaBox is an online mystery box platform with a large catalogue, over two hundred boxes across a wide range of themes. You open a box and win a real item, which you can ship or sell back into credit. If your search was what is RillaBox, that is the core of it, a high variety unboxing site that has built a strong reputation among users.

## How RillaBox works

You add funds, choose a box, and open it. The draw is provably fair, using cryptographically auditable seeds, so you can check that a result was set before you committed and not changed afterwards. RillaBox accepts a broad set of payment methods, including Visa, Mastercard, PayPal and more than ten cryptocurrencies, which makes funding straightforward. When you win, you decide whether to ship the item or convert it.

## The welcome offer

New accounts get a free mystery box on signup, along with a deposit bonus in the region of 10 to 20 percent on a first deposit. The free box is the right way to test the site before spending. Confirm the exact current bonus and its terms on site, and use your own promo code in the field provided rather than a third party code.

## Is RillaBox legit

On the core question, RillaBox looks legitimate. Its Trustpilot score sits high, around 4.8 from a couple of thousand reviews at the time of writing, the draws are provably fair and auditable, and payments and payouts are widely reported to work as expected. That is a strong signal for a site in this space.

The honest caveat is regulatory. RillaBox has no gaming licence, its terms are governed offshore in Belize, and there is no external audit or dispute resolution scheme to fall back on. That does not make it a scam, but it does mean you carry more of the risk yourself, so treat it as high variance entertainment, never as a way to make money, and only spend what you can afford to lose.

## What to check before you buy

Read the odds on the specific box and judge it on the common outcomes. Confirm the current welcome bonus terms. Check shipping options and costs for your location. And set a firm budget before you start.

## How RillaBox compares

On user reputation, RillaBox is near the top of the category. Its Trustpilot score around 4.8 is higher than most rivals, and its catalogue of more than two hundred boxes is among the broadest, so on variety and sentiment it leads. Its payment support is also unusually flexible, covering cards, PayPal and more than ten cryptocurrencies, which is wider than many competitors accept. The one place it does not stand apart is regulation, since like almost every site here it is unlicensed and governed offshore, so the strong reviews do not come with a formal backstop. For you, that means RillaBox is an easy pick if your priority is choice, funding flexibility and a strong crowd verdict, and a level playing field with the rest if your priority is licensing and external oversight. Judged against the field, it is one of the better regarded options, held to the same structural ceiling that caps the whole category rather than any weakness specific to RillaBox.

## Our take

RillaBox is a well reviewed, high variety mystery box site with provably fair draws and flexible payments, with the standard unlicensed caveat that puts more risk on you. We have not assigned a score yet and will add one after testing. Use the free box to form your own view and keep your stakes sensible.$md$,
  $v$RillaBox is a well reviewed, high variety mystery box site with provably fair draws and flexible payments, best treated as high variance entertainment given it is unlicensed.$v$,
  'published', now(), now(),
  'Variety and a strong user reputation',
  'People who want a big box selection with a strong user reputation and flexible payments, and who treat the spend as entertainment.',
  'Is RillaBox Legit? Our RillaBox Review (2026)',
  'An honest RillaBox review. What RillaBox is, how the provably fair boxes and payments work, the free box and deposit bonus, and whether RillaBox is legit.'
from public.operators o, public.markets m where o.slug='rillabox' and m.code='us'
on conflict (operator_id, market_id) do update set body=excluded.body, verdict=excluded.verdict, status='published',
  updated_at=now(), published_at=coalesce(public.reviews.published_at, excluded.published_at),
  last_checked_at=excluded.last_checked_at, best_for_title=excluded.best_for_title,
  best_for_description=excluded.best_for_description, seo_title=excluded.seo_title, meta_description=excluded.meta_description;

-- ===========================================================================
-- 5. PACKZ  (/reviews/packz)  target: "is packz legit", "packz review"
--    Sources: winnersandwhiners.com, sportsgambler.com, deadspin.com (2026). Launched Sep 2025. US, 18+.
-- ===========================================================================
insert into public.operators (slug, name, operator_type_id, founded_year, availability, min_age, buyback, summary, pros, cons, active)
select 'packz', 'Packz', t.id, 2025, 'United States', '18+', '90 percent of fair market value',
  $s$Packz is a US digital trading card pack site that launched in 2025. You rip mystery packs of MLB, NBA, NFL and Pokemon cards, ship the cards, or sell them back at 90 percent of fair market value. Pull rates are published on every pack.$s$,
  $j$[
    "Pull rates are shown transparently on every pack",
    "Verifiable buyback at 90 percent of fair market value",
    "A 100 percent buyback safety net on your first pack",
    "Ship the real cards or sell them back for credit"
  ]$j$::jsonb,
  $j$[
    "Launched recently, in 2025, so the track record is short",
    "US only, and you must be at least 18",
    "The first pack buyback is capped, so read the limit"
  ]$j$::jsonb,
  true
from public.operator_types t where t.slug = 'digital_unboxing'
on conflict (slug) do update set name=excluded.name, operator_type_id=excluded.operator_type_id,
  founded_year=excluded.founded_year, availability=excluded.availability, min_age=excluded.min_age,
  buyback=excluded.buyback, summary=excluded.summary, pros=excluded.pros, cons=excluded.cons, active=true, updated_at=now();
insert into public.operator_markets (operator_id, market_id, visible, requires_geo_block)
select o.id, m.id, true, false from public.operators o, public.markets m where o.slug='packz' and m.code='us'
on conflict (operator_id, market_id) do update set visible=true, requires_geo_block=false;
insert into public.reviews (operator_id, market_id, body, verdict, status, published_at, last_checked_at, best_for_title, best_for_description, seo_title, meta_description)
select o.id, m.id,
$md$If you are searching whether Packz is legit, you are probably weighing a newer card ripping site against the more established names. Packz is young but transparent, with a genuinely useful buyback safety net. Here is what it is, how it works, the welcome offer, and the caveats.

## What Packz is

Packz is a digital trading card pack platform that launched in 2025. You buy a mystery pack, an animation rips it open on screen, and you win real cards, including MLB, NBA and NFL packs and Pokemon cards. If your search was what is Packz, that is the short version, an online repack site where the cards are physical and can be shipped to you, or sold back for credit.

## How Packz works

You pick a pack and open it. Every pack listing shows its pull rates up front, so you can see the odds before you spend. When you win, you either have the cards shipped to your door or use the buyback option to sell them back at 90 percent of their fair market value. That buyback is the feature that sets Packz apart, because it puts a clear floor under a pack that comes in below its price.

## The welcome offer

Packz runs a 100 percent buyback welcome offer on your first pack. If the card you pull is worth less than the pack price, you can sell it back for the full pack value in site credit, capped at 100 dollars. There is no code to enter, the offer activates automatically once your account is verified, and it applies to your first pack only. To claim it you must be at least 18 and in a US location where Packz operates.

## Is Packz legit

On the central question, Packz is a legitimate site rather than a scam. It publishes pull rates on every pack, operates a verifiable buyback at a stated percentage, and ships real cards. The transparency around odds and the buyback floor are genuine positives, and the first pack safety net lowers the risk of trying it.

The fair caveats are about maturity, not honesty. Packz launched recently, so its long term track record is still short, it is US only and strictly 18 plus, and the welcome buyback is capped, so read the limit before you assume a big pull is fully covered. As with any pack, the average open is set by the common cards, not the chase card.

## What to check before you buy

Read the pull rates on the pack you want. Understand the buyback percentage and the first pack cap. Confirm shipping timescales and costs. And keep your spending inside a budget.

## How Packz compares

Packz plays a slightly different game from the box sites it sits alongside. Instead of general merchandise it deals purely in trading card packs, which puts it closer to physical repack breakers than to sites like HypeDrop or Cases.gg. Its standout feature against that field is the buyback, a verifiable sell back at 90 percent of fair market value, plus a full buyback safety net on your first pack. Few competitors put such a clear floor under a weak pull, and that materially lowers the risk of trying it. Where it trails is maturity, since it launched in 2025 and cannot yet point to the years of history that more established names carry. For a collector, the comparison is simple. If you want cards specifically and value a transparent buyback that limits your downside, Packz is one of the more compelling picks. If a long, proven track record is what reassures you most, you may prefer to wait and watch how it settles, while using the capped first pack offer to form your own view cheaply.

## Our take

Packz is a transparent, well designed newcomer to digital card ripping, with published odds and a buyback that genuinely reduces risk, tempered by a short track record. We have not assigned a score yet and will add one after testing. The first pack buyback makes it a low risk way to form your own view.$md$,
  $v$Packz is a transparent digital card pack site with published pull rates and a real buyback safety net, tempered by a short track record as a 2025 newcomer.$v$,
  'published', now(), now(),
  'Ripping card packs with a buyback safety net',
  'US collectors who want to open card packs with published odds and a buyback that puts a floor under a weak pull.',
  'Is Packz Legit? Our Packz Review (2026)',
  'An honest Packz review. What Packz is, how the card packs and 90 percent buyback work, the first pack welcome offer, and whether Packz is legit.'
from public.operators o, public.markets m where o.slug='packz' and m.code='us'
on conflict (operator_id, market_id) do update set body=excluded.body, verdict=excluded.verdict, status='published',
  updated_at=now(), published_at=coalesce(public.reviews.published_at, excluded.published_at),
  last_checked_at=excluded.last_checked_at, best_for_title=excluded.best_for_title,
  best_for_description=excluded.best_for_description, seo_title=excluded.seo_title, meta_description=excluded.meta_description;

-- ===========================================================================
-- 6. LUXDROP  (/reviews/luxdrop)  target: "is luxdrop legit", "luxdrop review"
--    Sources: betterchecked.com, casinorankr.com, fairness.gg, unpacked.gg (2026).
-- ===========================================================================
insert into public.operators (slug, name, operator_type_id, buyback, summary, pros, cons, active)
select 'luxdrop', 'LuxDrop', t.id, 'Site credit or crypto, no cash out',
  $s$LuxDrop is a mystery box site focused on higher value, luxury style prizes. Draws are provably fair with a verifiable hash, and new accounts get free boxes plus a first deposit bonus. Balance cannot be cashed out, only won items can be shipped or converted to crypto.$s$,
  $j$[
    "Three free boxes on signup, plus a 5 percent first deposit bonus",
    "Provably fair draws with a verifiable SHA-256 hash",
    "Consistently ships real items, with buyers sharing proof"
  ]$j$::jsonb,
  $j$[
    "Deposited balance cannot be withdrawn as cash, only won items",
    "No gambling licence",
    "Some payment restrictions and minor interface bugs"
  ]$j$::jsonb,
  true
from public.operator_types t where t.slug = 'digital_unboxing'
on conflict (slug) do update set name=excluded.name, operator_type_id=excluded.operator_type_id,
  buyback=excluded.buyback, summary=excluded.summary, pros=excluded.pros, cons=excluded.cons, active=true, updated_at=now();
insert into public.operator_markets (operator_id, market_id, visible, requires_geo_block)
select o.id, m.id, true, false from public.operators o, public.markets m where o.slug='luxdrop' and m.code='us'
on conflict (operator_id, market_id) do update set visible=true, requires_geo_block=false;
insert into public.reviews (operator_id, market_id, body, verdict, status, published_at, last_checked_at, best_for_title, best_for_description, seo_title, meta_description)
select o.id, m.id,
$md$If you are asking whether LuxDrop is legit, here is a clear read on a site that leans into higher value, luxury style boxes. LuxDrop is a real, operating platform with provably fair draws, and it comes with one important structural catch. Here is what it is, how it works, the welcome offer, and what to weigh.

## What LuxDrop is

LuxDrop is an online mystery box site with a focus on premium prizes. You open boxes and win real items, which buyers regularly share proof of receiving. If your search was what is LuxDrop, that is the short version, an unboxing site pitched at people chasing higher value, luxury style rewards rather than everyday goods.

## How LuxDrop works

You fund your balance, choose a box, and open it. Each spin produces a provably fair result you can back audit through a SHA-256 hash, so you can confirm the outcome was set before you committed. When you win an item you can have it shipped, or convert it to crypto. The key structural point is that your deposited balance itself cannot be withdrawn as cash. Money only leaves LuxDrop as a shipped item or as crypto from a win, so treat a deposit as committed the moment it lands.

## The welcome offer

New accounts get three free mystery boxes on signup, with the value framed up to a high headline figure, plus a 5 percent bonus unlocked on a first deposit. The free boxes are the right way to test the platform before you commit. Confirm the current terms on site, and add your own promo code where the field asks for one.

## Is LuxDrop legit

On the core question, LuxDrop is legitimate rather than a scam. It ships real items, the draws are provably fair and verifiable, customer support is described as helpful, and there is no sign of fake reviews. Trust scores vary by source, sitting in the mid threes to low fours, which is reasonable for the category.

The honest caveats are structural and regulatory. You cannot cash out a balance, only won items, which matters if you change your mind after depositing. LuxDrop is unlicensed, and there are some payment restrictions by country and occasional interface bugs. None of that makes it fraudulent, but it does mean you should only deposit what you are happy to turn into items, and keep your spending controlled.

## What to check before you buy

Read the odds on the box you want and judge it on the common outcomes. Remember the no cash out rule before you deposit. Check shipping and any crypto conversion terms for a win. And set a budget you can comfortably lose.

## How LuxDrop compares

LuxDrop's positioning is what sets it apart from the pack, a deliberate lean toward higher value, luxury style boxes rather than everyday goods. On mechanics it matches the better sites, a provably fair draw you can back audit through a published hash, and it earns reasonable trust scores for shipping what it promises. The feature that makes it different, for better and worse, is the no cash out structure. Most rivals let you withdraw an unspent balance, while LuxDrop only lets value leave as a shipped item or as crypto from a win, which raises the commitment the moment you deposit. Against the field, that makes LuxDrop a narrower proposition. If the luxury slant appeals and you are comfortable turning every deposit into either items or a win, it is a legitimate, verifiable option. If flexibility to change your mind and pull funds back matters to you, more conventional box sites will suit you better. The draws are as fair as the leaders, but the money rules ask more of you up front.

## Our take

LuxDrop is a legitimate, provably fair mystery box site with a luxury slant and a decent welcome offer, defined by the no cash out structure that commits your deposit the moment it lands. We have not assigned a score yet and will add one after testing. Use the free boxes to form your own view and spend only what you would happily set aside.$md$,
  $v$LuxDrop is a legitimate, provably fair mystery box site with a luxury slant, defined by a no cash out structure that commits your deposit the moment it lands.$v$,
  'published', now(), now(),
  'Chasing higher value luxury boxes',
  'People drawn to higher value, luxury style boxes who understand the balance cannot be cashed out and treat the spend as entertainment.',
  'Is LuxDrop Legit? Our LuxDrop Review (2026)',
  'An honest LuxDrop review. What LuxDrop is, how the provably fair boxes work, the free boxes and deposit bonus, the no cash out catch, and whether LuxDrop is legit.'
from public.operators o, public.markets m where o.slug='luxdrop' and m.code='us'
on conflict (operator_id, market_id) do update set body=excluded.body, verdict=excluded.verdict, status='published',
  updated_at=now(), published_at=coalesce(public.reviews.published_at, excluded.published_at),
  last_checked_at=excluded.last_checked_at, best_for_title=excluded.best_for_title,
  best_for_description=excluded.best_for_description, seo_title=excluded.seo_title, meta_description=excluded.meta_description;

-- ===========================================================================
-- OFFERS  (insert-if-missing then refresh; codes left blank for your own)
-- ===========================================================================
insert into public.offers (operator_id, title, description, eligibility, active)
select o.id, v.title, v.descr, v.elig, true
from public.operators o
join (values
  ('hypedrop', '3 Free Mystery Boxes + 5% Deposit Bonus', 'Open three free boxes and get a 5 percent match on your deposit.', 'New accounts only. 18+. Deposit bonus subject to a daily cap and the site terms.'),
  ('cases-gg', '3 Free Cases + Up to 200% Deposit Bonus', 'Open three free cases before depositing, then claim a first deposit match advertised up to 200 percent, plus a small first purchase bonus.', 'New accounts only. 18+. Deposit bonus subject to the site terms.'),
  ('jemlit', '3 Free Mystery Boxes + 25% Deposit Bonus', 'Open three free boxes and get a 25 percent match on your first deposit.', 'New accounts only. 18+. Bonus subject to the site terms.'),
  ('rillabox', 'Free Box on Signup + Deposit Bonus', 'Claim a free mystery box when you sign up, plus a deposit bonus of around 10 to 20 percent on your first deposit.', 'New accounts only. 18+. Bonus subject to the site terms.'),
  ('packz', '100% Buyback on Your First Pack', 'Sell your first pack back for the full pack value in site credit if it comes in below the pack price. No code needed, applied automatically on verification.', 'New accounts only. 18+ and in a supported US location. First pack only, capped at 100 dollars in site credit.'),
  ('luxdrop', '3 Free Mystery Boxes + 5% Deposit Bonus', 'Open three free boxes on signup and unlock a 5 percent bonus on your first deposit.', 'New accounts only. 18+. Bonus subject to the site terms.')
) as v(slug, title, descr, elig) on v.slug = o.slug
where o.slug in ('hypedrop','cases-gg','jemlit','rillabox','packz','luxdrop')
  and not exists (select 1 from public.offers x where x.operator_id = o.id and x.title = v.title);

update public.offers set
  cta_label = 'Claim Offer',
  exclusive = false,
  last_verified_at = now()
where operator_id in (select id from public.operators where slug in ('hypedrop','cases-gg','jemlit','rillabox','packz','luxdrop'));

-- ===========================================================================
-- FAQs
-- ===========================================================================
delete from public.review_faqs
  where review_id in (
    select r.id from public.reviews r join public.operators o on o.id = r.operator_id
    where o.slug in ('hypedrop','cases-gg','jemlit','rillabox','packz','luxdrop')
  );

insert into public.review_faqs (review_id, question, answer, position)
select r.id, f.question, f.answer, f.position
from public.reviews r
join public.operators o on o.id = r.operator_id
join lateral (values
  ('hypedrop', 'Is HypeDrop legit?', $a$HypeDrop is a real, operating mystery box site that ships items and uses a verifiable draw, so it is not a scam for a typical session. Note the caveats though, a large payout dispute has been reported, it operates offshore with no domestic licence, and disputes go to arbitration. Spend small and ship your wins.$a$, 0),
  ('hypedrop', 'What is HypeDrop?', $a$HypeDrop is a digital mystery box site where you buy boxes, open them, and win real items you can ship, exchange, or take the value of.$a$, 1),
  ('hypedrop', 'Does HypeDrop have a free box offer?', $a$Yes. New accounts get three free mystery boxes and a 5 percent deposit bonus. Confirm the current terms on site and add your own promo code where prompted.$a$, 2),
  ('cases-gg', 'Is Cases.gg legit?', $a$Yes. Cases.gg is a legitimate mystery box site that launched in 2024, with provably fair odds and generally fast withdrawals once identity checks clear. The main drawback is slow customer support.$a$, 0),
  ('cases-gg', 'What is Cases.gg?', $a$Cases.gg is an online mystery box site where you open cases for real items and choose to ship them or sell them back for credit, with the odds shown on each case.$a$, 1),
  ('cases-gg', 'What is the Cases.gg welcome offer?', $a$New players get three free cases plus a first deposit bonus advertised as high as a 200 percent match, and a small first purchase bonus. Free boxes lean toward low tier items, so keep expectations realistic.$a$, 2),
  ('jemlit', 'Is JemLit legit?', $a$Yes. JemLit is operated by JLT Digital Media LTD, a company registered in London, uses a provably fair draw, ships worldwide, and holds a Trustpilot score around the low fours. Watch for slow identity checks and prize values below retail.$a$, 0),
  ('jemlit', 'What is JemLit?', $a$JemLit is an online mystery box platform with boxes across tech, sneakers, designer items and more, run by a London registered company.$a$, 1),
  ('jemlit', 'Does JemLit give free boxes?', $a$Yes. New accounts are offered three free mystery boxes plus a 25 percent deposit bonus, and there is a referral programme. Confirm the current terms on site.$a$, 2),
  ('rillabox', 'Is RillaBox legit?', $a$RillaBox looks legitimate, with a high Trustpilot score around 4.8, provably fair auditable draws and reliable payments. The caveat is that it is unlicensed with offshore terms, so treat it as high variance entertainment.$a$, 0),
  ('rillabox', 'What is RillaBox?', $a$RillaBox is an online mystery box site with over two hundred boxes, where you open a box and win a real item to ship or sell back for credit.$a$, 1),
  ('rillabox', 'Does RillaBox have a free box?', $a$Yes. New accounts get a free mystery box on signup plus a deposit bonus of around 10 to 20 percent. Confirm the exact current terms on site.$a$, 2),
  ('packz', 'Is Packz legit?', $a$Yes. Packz is a legitimate digital card pack site that launched in 2025, with published pull rates on every pack and a verifiable buyback at 90 percent of fair market value. It is US only and strictly 18 plus.$a$, 0),
  ('packz', 'What is Packz?', $a$Packz is a US digital trading card pack site where you rip mystery packs of sports and Pokemon cards, then ship the cards or sell them back for credit.$a$, 1),
  ('packz', 'What is the Packz welcome offer?', $a$Packz runs a 100 percent buyback on your first pack, so if the pack comes in below its price you can sell it back for the full pack value in site credit, capped at 100 dollars. It applies automatically once your account is verified.$a$, 2),
  ('luxdrop', 'Is LuxDrop legit?', $a$Yes. LuxDrop is a legitimate mystery box site that ships real items and uses provably fair draws you can back audit. The key catch is that you cannot cash out a balance, only won items, and it is unlicensed.$a$, 0),
  ('luxdrop', 'What is LuxDrop?', $a$LuxDrop is an online mystery box site focused on higher value, luxury style prizes, where you open boxes and win real items to ship or convert to crypto.$a$, 1),
  ('luxdrop', 'Can you withdraw cash from LuxDrop?', $a$No. Your deposited balance cannot be withdrawn as cash. Money only leaves LuxDrop as a shipped item or as crypto from a win, so treat a deposit as committed once it lands.$a$, 2)
) as f(slug, question, answer, position) on f.slug = o.slug
where o.slug in ('hypedrop','cases-gg','jemlit','rillabox','packz','luxdrop');
