-- ---------------------------------------------------------------------------
-- LOOTIE REVIEW  (run once in the Supabase SQL Editor)
--
-- Populates everything the dynamic review template needs so /reviews/lootie
-- renders with its hero, quick facts, payment methods, welcome offer, pros and
-- cons, the full editorial body and structured FAQs.
--
-- Every value here comes from the review the site owner supplied. Nothing is
-- invented: Lootie is unlicensed so licence fields stay empty, no founded year
-- or minimum age is stated in the source so those are left blank, and no rating
-- breakdown is added because the source gives only the single overall score.
-- No affiliate tracking URL is set, so the CTA button stays hidden until one is
-- added in Admin > Operators > Lootie.
--
-- Idempotent: safe to re-run. Re-running overwrites the operator, review and
-- child rows with what is below, so make later edits in the admin, not here.
-- Run AFTER the review-template migration (20260805130000_review_template.sql).
-- ---------------------------------------------------------------------------

-- 1. Operator -----------------------------------------------------------------
insert into public.operators (
  slug, name, operator_type_id, rating, summary, pros, cons, active,
  owner, availability, buyback, shipping_info, support_info
)
select
  'lootie',
  'Lootie',
  t.id,
  3.5,
  $s$Lootie is a real, established mystery box platform that ships genuine branded products and discloses its odds better than most of its rivals. It is also negative expected value for the average buyer and offers no cash out, so it works best as entertainment at the lower price bands rather than as a way to make money.$s$,
  $j$[
    "Large catalogue of more than 3,000 products with real brand names",
    "Per item odds shown on every box",
    "Provably fair draws you can verify yourself",
    "Ships worldwide, including to the US",
    "Free box for new accounts so you can test it first",
    "Fast responses on live chat"
  ]$j$::jsonb,
  $j$[
    "No cash withdrawals, you either ship the item or take site credit",
    "Sell back credit is usually well below the displayed prize value",
    "Negative expected value for most buyers, like every mystery box",
    "Headline items such as GPUs often sit below 0.1 percent",
    "Email support can be slow or unresponsive on high value orders",
    "Unlicensed, so there is no regulator to appeal to if something goes wrong"
  ]$j$::jsonb,
  true,
  'Lootie Limited (Dublin, Ireland)',
  'Worldwide',
  'Site credit only, no cash out',
  'Worldwide, no PO boxes',
  'Live chat (fast) and email (slower)'
from public.operator_types t
where t.slug = 'digital_unboxing'
on conflict (slug) do update set
  name             = excluded.name,
  operator_type_id = excluded.operator_type_id,
  rating           = excluded.rating,
  summary          = excluded.summary,
  pros             = excluded.pros,
  cons             = excluded.cons,
  active           = true,
  owner            = excluded.owner,
  availability     = excluded.availability,
  buyback          = excluded.buyback,
  shipping_info    = excluded.shipping_info,
  support_info     = excluded.support_info,
  updated_at       = now();

-- 2. Show it in the US (root) market ------------------------------------------
insert into public.operator_markets (operator_id, market_id, visible, requires_geo_block)
select o.id, m.id, true, false
from public.operators o, public.markets m
where o.slug = 'lootie' and m.code = 'us'
on conflict (operator_id, market_id) do update set
  visible            = true,
  requires_geo_block = false;

-- 3. Payment methods (from the review: deposit methods only, no cash out) ------
delete from public.operator_payment_methods
  where operator_id in (select id from public.operators where slug = 'lootie');
insert into public.operator_payment_methods (operator_id, slug, name, kind, position)
select o.id, v.slug, v.name, 'deposit', v.position
from public.operators o,
  (values
    ('visa', 'Visa', 0),
    ('mastercard', 'Mastercard', 1),
    ('paypal', 'PayPal', 2),
    ('crypto', 'Crypto (via Coinbase)', 3),
    ('steam', 'Steam', 4)
  ) as v(slug, name, position)
where o.slug = 'lootie';

-- 4. Welcome offer for the banner ---------------------------------------------
insert into public.offers (operator_id, title, description, active)
select o.id,
  'Free box for new accounts',
  'New Lootie accounts can claim a free mystery box to try the platform before depositing.',
  true
from public.operators o
where o.slug = 'lootie'
  and not exists (
    select 1 from public.offers x
    where x.operator_id = o.id and x.title = 'Free box for new accounts'
  );

update public.offers set
  cta_label        = 'Get Free Box',
  eligibility      = 'New accounts only.',
  exclusive        = false,
  last_verified_at = now()
where title = 'Free box for new accounts'
  and operator_id in (select id from public.operators where slug = 'lootie');

-- 5. The review ---------------------------------------------------------------
insert into public.reviews (
  operator_id, market_id, body, verdict, status, published_at,
  overall_score, score_descriptor, best_for_title, best_for_description,
  seo_title, meta_description, last_checked_at
)
select o.id, m.id,
$lootiebody$We spend a lot of time opening these boxes, and Lootie sells the fantasy better than almost anyone. Here is our honest take after digging through Lootie's own policies, its odds disclosures, and several thousand customer reviews.

## What Lootie Actually Is

Lootie is a digital mystery box platform. You buy a virtual box, an algorithm draws one item from a published prize pool, and you either have that item shipped to your door or sell it back for site credit.

The catalog runs to more than 3,000 products across streetwear, sneakers, electronics, accessories, and collectibles. The names on the box art are the ones you would expect: Supreme, Off-White, BAPE, Nike, Apple.

One point of confusion worth clearing up immediately, because the naming is unhelpful. Lootie is **not** a video game loot box, and it is not a CS:GO skin site. Those deal in virtual items inside a game. Lootie deals in physical products that arrive in a cardboard box. It grew out of that world, but it is a retail business now.

## How It Works

The flow is simple enough that you will understand it in about ninety seconds.

1. **Fund your balance.** Card, PayPal, or crypto.
2. **Pick a box.** Every box page lists every possible item and the exact percentage chance of pulling it.
3. **Open it.** The draw happens instantly with a provably fair seed you can verify afterward.
4. **Decide.** Ship the item, or sell it back to Lootie for site credit and roll again.

That fourth step is where Lootie differs from most of its competitors, and it is the single most important thing in this review.

## The No Cash Out Problem

**There is no way to withdraw money from Lootie.** Not fiat, not crypto, not ever.

If you pull a $400 jacket you do not want, your only options are to have it shipped to you or to convert it into store credit and keep opening boxes. Rivals like PackDraw and Cases.GG let you exchange wins for a withdrawable balance. Lootie does not.

This is not hidden and it is not a scam. It is a deliberate design choice, and it has a real consequence: **money that enters Lootie stays inside Lootie until it leaves as a physical object.** Every dollar you deposit is committed to eventually becoming merchandise.

It also has a knock on effect that shows up constantly in negative reviews. The sell back credit is typically lower than the prize value displayed on the box page. So the $400 jacket might only be worth $260 in credit. People feel misled by that gap, and I understand why, even though the numbers are disclosed.

**My rule:** only open boxes where you would be genuinely happy to receive and keep the most common outcome. If you are opening a box hoping to sell your way to something better, the structure is working against you.

## Odds, RTP, and the Math You Should Know

Credit where it is due. Lootie's odds transparency is better than most of the category. Every item carries a percentage, and the provably fair system lets you verify that the draw was not tampered with after the fact.

Now the uncomfortable part. Published return to player rates across the industry sit somewhere in the region of 60% to 85% depending on the box tier. That means for every $100 you spend, you should expect roughly $60 to $85 in prize value back on average.

**No mystery box platform offers positive expected value.** It cannot. The randomization format requires the house to retain margin, exactly like a retailer marks up inventory. Anyone telling you they have found a profitable box strategy is selling you something.

The headline items are also rarer than the thumbnails suggest. GPU and flagship phone tiers frequently sit below 0.1% per open. That is roughly one in a thousand. The box art shows you an RTX card; the realistic outcome is a cable organizer.

If your goal is to own a specific item at the best price, buy it from a retailer or an authenticated resale marketplace. That is not a knock on Lootie. It is just what the math says.

## Is Lootie Legal in the US?

Yes, and I want to correct something circulating on other review sites.

A handful of low quality affiliate pages currently claim Lootie is "prohibited in all US states." I could not find any support for that. Lootie's own shipping policy states worldwide shipping, its payment page carries US Visa and Mastercard, and there is no US geo-block in its terms.

On the gambling question, US law generally requires three elements together: consideration, chance, and prize. Mystery boxes typically fall outside that framework because **every buyer receives a product.** The randomness determines *which* item you get, not *whether* you get one. That structure is why commercial mystery boxes are treated as e-commerce rather than gambling, and no US state has classified them otherwise as of 2026.

Worth noting: Lootie is unlicensed, because there is no license to hold for this category. If something goes wrong, there is no regulator to appeal to. Your recourse is Lootie's support team and your card issuer's chargeback process. Factor that in.

## Shipping and Authentication

Lootie states it authenticates products before shipping and quotes the following delivery windows:

- **Clothing:** around 90% delivered within 14 days, the rest within roughly three weeks
- **Electronics:** around 80% delivered within 5 days, the remainder within 12 days

Import duties, customs, and taxes are the buyer's responsibility, which for US buyers receiving from Europe can mean an unexpected bill on higher value items. Budget for it.

Two things to know about the fine print. Lootie will not deliver to PO Boxes, and it asks you to report non arrival within two months of ordering or damage within five days of receipt. **Diary that two month window.** A large share of the angriest reviews online involve people who waited far longer than that before escalating.

## Reputation: The Honest Picture

Lootie holds a 4 star TrustScore on Trustpilot across roughly 5,600 reviews. You will see numbers between 3.7 and 4.7 quoted around the web, including 4.7 on Lootie's own homepage. Treat the marketing figure with a pinch of salt and the 4 star band as the fair read.

**What happy customers say:** wide selection, good value on the cheap boxes, fast delivery on smaller items, the provably fair system builds confidence, live chat responds quickly.

**What unhappy customers say:** items won and never received in some cases over many months, sell back credit landing well below the advertised prize value, email support taking days or going unanswered, and difficulty escalating disputes on high value pulls.

The pattern I see is that **low value orders generally go fine and high value orders are where the friction lives.** If you do use Lootie, use live chat rather than email. Response times are dramatically better, usually inside a few minutes versus 24 to 72 hours for tickets.

## Final Word

Lootie is the default name in this category for a reason. It is big, the catalog is genuinely impressive, the odds disclosure is better than most rivals, and it does deliver, particularly at the lower price points.

But it is not a shortcut to cheap designer goods, and the no cash out structure means your money is committed the moment it lands. Go in for the fun of it, spend only what you would happily set on fire, and ship your wins rather than chasing them.

Treat it as entertainment and it is a reasonable time. Treat it as a strategy and the math will find you eventually.

---

*Mystery boxes are a form of chance based spending. Only spend what you can comfortably afford to lose. If you feel your spending is becoming a problem, support is available through the National Council on Problem Gambling at 1-800-522-4700.*$lootiebody$,
  $v$Lootie is legitimate and well stocked, and it is best treated as entertainment at the lower price points rather than a way to profit or to buy a specific item cheaply.$v$,
  'published',
  now(),
  3.5,
  'Good',
  'Unboxing for the fun of it',
  'People who want the unboxing experience and would be happy owning the mid tier items.',
  'Lootie Review (2026): Is It Legit, and Is It Worth Your Money?',
  'An honest Lootie review for US buyers. Real odds, the no cash out catch, shipping times, Trustpilot complaints, and whether Lootie mystery boxes are actually worth it.',
  now()
from public.operators o, public.markets m
where o.slug = 'lootie' and m.code = 'us'
on conflict (operator_id, market_id) do update set
  body                = excluded.body,
  verdict             = excluded.verdict,
  status              = 'published',
  updated_at          = now(),
  published_at        = coalesce(public.reviews.published_at, excluded.published_at),
  overall_score       = excluded.overall_score,
  score_descriptor    = excluded.score_descriptor,
  best_for_title      = excluded.best_for_title,
  best_for_description= excluded.best_for_description,
  seo_title           = excluded.seo_title,
  meta_description    = excluded.meta_description,
  last_checked_at     = excluded.last_checked_at;

-- 6. FAQs (verbatim from the review's own FAQ section) ------------------------
delete from public.review_faqs
  where review_id in (
    select r.id from public.reviews r
    join public.operators o on o.id = r.operator_id
    where o.slug = 'lootie'
  );
insert into public.review_faqs (review_id, question, answer, position)
select r.id, f.question, f.answer, f.position
from public.reviews r
join public.operators o on o.id = r.operator_id
cross join (values
  ('Is Lootie legit?',
   $a$Yes. Lootie Limited is a registered Irish company that has been operating for several years and does ship real products. It holds a 4 star Trustpilot rating across roughly 5,600 reviews. It is legitimate, though not without meaningful customer service complaints on higher value orders.$a$, 0),
  ('Is Lootie a scam?',
   $a$No. The persistent complaints are about delivery delays, unresponsive support, and sell back values that fall short of displayed prize figures, rather than outright theft. Those are real problems, but they are service problems, not fraud.$a$, 1),
  ('Can I withdraw cash from Lootie?',
   $a$No. There is no cash withdrawal of any kind. You either ship the item you won or convert it to site credit for further openings.$a$, 2),
  ('Does Lootie ship to the United States?',
   $a$Yes. Lootie ships worldwide. US buyers are responsible for any customs duties or import taxes.$a$, 3),
  ('Is Lootie gambling?',
   $a$Under US law, generally no. Every purchase delivers a physical product, so the legal test for gambling is not met. Randomness determines which item you receive, not whether you receive one.$a$, 4),
  ('What are the odds of winning something good on Lootie?',
   $a$Every box lists exact per item percentages. Headline items such as GPUs and flagship electronics often sit below 0.1%. Assume you will land in the common tier and choose boxes accordingly.$a$, 5),
  ('Is Lootie still operating in 2026?',
   $a$Yes. Despite claims elsewhere that it shut down in late 2025, the platform is active and trading.$a$, 6)
) as f(question, answer, position)
where o.slug = 'lootie';
