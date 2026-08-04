-- ---------------------------------------------------------------------------
-- CONTENT BATCH 1  (run once in the Supabase SQL Editor)
--
-- 1. Removes all demo/sample content (slug like 'demo-%').
-- 2. Publishes the first set of SEO guides for the US (root) market.
--
-- Guides are stored as pages with a `guides/` slug prefix, so they live at
-- /guides/<slug>. Bodies are markdown (rendered with headings and lists).
-- Content is original and informational. No operator names, ratings, licences
-- or offer terms are invented. Legal-heavy guides (is it gambling, is it legit)
-- are intentionally NOT included here pending review.
--
-- Idempotent: safe to re-run (guides use on conflict do nothing).
-- ---------------------------------------------------------------------------

-- 1. Remove demo content ----------------------------------------------------
delete from public.operators where slug like 'demo-%';
delete from public.categories where slug like 'demo-%';
delete from public.posts where slug like 'demo-%';
delete from public.pages where slug like 'demo-%';

-- 2. Guides -----------------------------------------------------------------

insert into public.pages (slug, market_id, title, meta_description, body, status, published_at)
select 'guides/how-online-mystery-boxes-work', m.id,
  'How Online Mystery Boxes Work',
  'A plain-English guide to how online mystery box and pack-opening sites work, from paying to opening to shipping or selling your prize.',
$md$We spend a lot of time opening these boxes so you do not have to go in blind. Here is how online mystery box sites actually work, in plain terms, before you spend anything.

## What an online mystery box is

An online mystery box is a paid, randomised reveal. You pay a set price, the site runs a random draw against a list of possible items, and you get whatever the draw lands on. Some items are worth more than what you paid. Most are worth less. That gap is how the site makes money.

## The two main types

There are two very different products that both get called mystery boxes, and it matters which one you are using.

- **Digital pack opening.** You pay to open a box on screen and see a randomised result instantly. If you win a physical item you can usually ship it to yourself or sell it back to the site for credit or cash.
- **Physical retail boxes.** You buy a sealed box of real goods that gets posted to you. There is still a surprise element, but there is no on-screen gamble and usually no sell-back.

The digital kind behaves much more like a game of chance, so it carries extra responsibilities around age checks and responsible play. The physical kind is closer to ordinary online shopping.

## What happens when you open one

For a digital box the flow is normally the same. You add funds, you pick a box, you open it, and you see the result. If it is a physical prize you then choose to ship it or sell it back. Read the sell-back rate carefully, because it is often lower than the item is worth on the open market.

## Odds and value

Every box has a set of possible outcomes and a price. If you added up the value of every possible prize, weighted by how likely it is, you would get the box's expected value. That number is almost always lower than the price you pay. We explain this properly in our guide on how the odds work.

## Getting your prize

This is where sites differ the most. Before you open anything, check three things.

1. Whether physical prizes ship to your address, and who pays for shipping and any import charges.
2. The sell-back or cash-out rate, and whether it is paid in site credit or real money.
3. How withdrawals work, including any identity checks and minimum amounts.

## What to check before you buy

We look for clear odds, a real company behind the site, sensible withdrawal terms, and honest marketing. If any of those are missing, we treat that as a warning sign. Take your time, set a budget before you start, and never chase a loss.

## Common questions

**Are the results really random?** Reputable sites publish odds and many use a provably fair system you can check. We cover that in a separate guide.

**Can I get my money back?** A randomised reveal is usually final. Refunds are rare once a box is opened, so treat the spend as spent.

**Is this the same as gambling?** The digital pay-to-open format shares a lot with gambling and should be treated with the same caution. Only spend what you are happy to lose.$md$,
  'published', now()
from public.markets m where m.code = 'us'
on conflict (market_id, slug) do nothing;

insert into public.pages (slug, market_id, title, meta_description, body, status, published_at)
select 'guides/how-mystery-box-odds-work', m.id,
  'How Mystery Box Odds and Probabilities Work',
  'Understand mystery box odds, drop rates and expected value so you can see the real cost before you open a box.',
$md$Odds are the single most important thing to understand before you open a mystery box, and they are also the thing sites are quietest about. Here is how to read them.

## Where the odds come from

Each box has a fixed list of possible items and a probability attached to each one. Added together those probabilities make up the drop table. A good site shows you this table. If you cannot find it, that is a problem worth pausing on.

## Expected value in plain terms

Expected value is what an average open is worth over the long run. You take each prize, multiply its value by its chance of dropping, and add them all up. On almost every box that number comes out below the price you pay. The difference is the site's margin, and it is how the business stays in business.

## Why the house keeps an edge

The gap between price and expected value is not a bug. It is the model. A box that paid out more than it cost, on average, would lose money on every open, so it will not exist for long. Treat any promise of guaranteed profit as false.

## Reading a drop table

When you look at a drop table, focus on two things.

- **The big prizes have tiny chances.** The headline item you saw in the advert is usually a fraction of a percent.
- **The common outcomes set your real experience.** Most opens land in the cheapest tiers, so that is what an average session looks like.

## Rarity tiers

Many sites group items into tiers such as common, rare and legendary. Tiers are a presentation choice, not a guarantee. What matters is the actual percentage on each item, not the label next to it.

## Common myths

- **A box is due a big win.** It is not. Each open is independent, so past results do not change the next one.
- **Spending more improves your odds.** It does not, unless the site clearly changes the drop table, which is unusual.
- **Streaks are predictable.** Random results clump together. A streak of losses is normal and tells you nothing about the next open.

## How we assess odds

We look for a published drop table, a sensible relationship between price and expected value, and no misleading emphasis on prizes that almost never land. Clear odds do not make a box a good deal, but hidden odds are a reason to walk away.

## Common questions

**What is a fair drop rate?** There is no single fair number. Fairness here means the odds are disclosed and accurate, not that you are likely to profit.

**Can I beat the odds over time?** No strategy changes a fixed drop table. Set a budget, treat it as entertainment, and stop when you hit your limit.$md$,
  'published', now()
from public.markets m where m.code = 'us'
on conflict (market_id, slug) do nothing;

insert into public.pages (slug, market_id, title, meta_description, body, status, published_at)
select 'guides/what-provably-fair-means', m.id,
  'What Provably Fair Means on Mystery Box Websites',
  'What provably fair actually means, how the verification works, and what it does and does not guarantee.',
$md$Provably fair is a phrase you will see on a lot of digital pack sites. It sounds reassuring, and the idea behind it is genuinely useful, but it is often misunderstood. Here is what it really means.

## The problem it solves

When a site runs the random draw on its own servers, you have to trust that it did not tamper with the result after seeing what you picked. Provably fair is a method that lets you check, after the fact, that the result was locked in before you committed.

## How it works

The mechanics vary, but the common pattern uses a few ingredients.

- A **server seed** the site generates and keeps secret at first, but commits to by publishing a hashed version.
- A **client seed** that you provide or that your session generates.
- A combination of the two, run through a fixed formula, that produces the outcome.

Because the site published the hash of its server seed before the open, it cannot change that seed afterwards without the hash no longer matching. After the round, the site reveals the original seed so you can run the same formula and confirm the result yourself.

## How to verify a result

Reputable sites give you the seeds and a verification tool or clear instructions. You take the revealed server seed, your client seed, and the round details, run them through the published method, and check that you get the same outcome. If it matches, the result was not altered after the fact.

## What it does and does not guarantee

This is the part that gets lost. Provably fair proves that a specific result was not changed after you played. It does **not** prove that the odds are good, that the drop table is generous, or that the prizes are worth the price. A site can be provably fair and still be a poor deal.

## Questions to ask a site

- Does it publish the hashing method and let you verify rounds yourself?
- Can you set or see your client seed?
- Does it reveal the server seed after the round?
- Are the underlying odds published separately and clearly?

## Common questions

**Is provably fair the same as regulated?** No. It is a technical check on individual results, not a licence or a consumer protection scheme.

**If a site is provably fair, is it safe?** It is one good sign among several. Still check the odds, the company behind it, and the withdrawal terms.$md$,
  'published', now()
from public.markets m where m.code = 'us'
on conflict (market_id, slug) do nothing;

insert into public.pages (slug, market_id, title, meta_description, body, status, published_at)
select 'guides/mystery-box-scams', m.id,
  'Mystery Box Scams and Red Flags to Avoid',
  'The most common mystery box scams and red flags, and simple checks that help you avoid losing money to a bad site.',
$md$Most mystery box sites are ordinary businesses. A minority are not, and a few are outright traps. These are the red flags we watch for, and the checks that keep you out of trouble.

## The most common red flags

- **Hidden odds.** If you cannot find a drop table anywhere, assume the worst.
- **Guaranteed profit language.** No legitimate site can promise you will come out ahead. The maths does not allow it.
- **No real company behind it.** A trustworthy site tells you who runs it, where they are based, and how to contact a human.

## Fake scarcity and pressure

Countdown timers, "only a few left" banners and constant popups exist to rush you. A real deal is still there tomorrow. If a site is pushing you to act right now, slow down on purpose.

## Unclear or shifting odds

Watch for drop tables that are vague, buried, or that seem to change. Screenshot the odds before you open anything. If the numbers do not match your experience over many opens, take that seriously.

## Withdrawal and buyback traps

This is where people lose the most. Before you deposit, read exactly how you get money or prizes out.

- Are there high minimum withdrawal amounts that trap your balance?
- Is the sell-back rate far below the item's real value?
- Are there surprise fees or endless verification loops when you try to cash out?

## Payment red flags

Be cautious with sites that only accept hard-to-reverse payment methods, ask for unusual gift-card top-ups, or push you off the platform to pay. Using a payment method with buyer protection gives you a fallback.

## How to protect yourself

1. Set a budget before you start and treat it as spent.
2. Read the withdrawal and buyback terms first, not after you deposit.
3. Look up the company and search for recent user complaints.
4. Keep records, including screenshots of odds and offers.
5. Never share more personal or financial detail than a normal checkout needs.

## Where to report a problem

In the United States you can report deceptive practices to the Federal Trade Commission at [reportfraud.ftc.gov](https://reportfraud.ftc.gov). Your card issuer or payment provider may also help if you paid through them.

## Common questions

**Are mystery box sites a scam?** Most are legitimate businesses selling a randomised product with a built-in margin. The scam risk comes from a minority of sites, which is why the checks above matter.

**I think I was scammed. What now?** Contact the site, then your payment provider about a possible chargeback, and report it to the FTC. Keep every screenshot and email.$md$,
  'published', now()
from public.markets m where m.code = 'us'
on conflict (market_id, slug) do nothing;
