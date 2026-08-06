-- ---------------------------------------------------------------------------
-- HOMEPAGE ARTICLE
--
-- Turns the homepage into the "Best Mystery Box Sites" article: an ordered list
-- of editorial blocks (headings, paragraphs) and PLATFORM_CARD blocks that each
-- render an operator card with a "Sign up" affiliate CTA and a "Read review"
-- link. Content is CMS-managed (Admin > Homepage) and platform cards resolve the
-- live operator, so ratings, availability and the tracked affiliate link stay in
-- sync with the operator record. Additive and idempotent.
-- ---------------------------------------------------------------------------

create table if not exists public.homepage_article_blocks (
  id          uuid primary key default gen_random_uuid(),
  market_id   uuid not null references public.markets (id) on delete cascade,
  block_type  text not null check (block_type in ('H2','H3','PARAGRAPH','PLATFORM_CARD','CALLOUT')),
  position    integer not null default 0,
  heading     text,
  body        text,
  operator_id uuid references public.operators (id) on delete set null,
  badge       text,
  visible     boolean not null default true
);
create index if not exists homepage_article_blocks_market_idx
  on public.homepage_article_blocks (market_id, position);

alter table public.homepage_article_blocks enable row level security;
drop policy if exists homepage_article_blocks_public_read on public.homepage_article_blocks;
create policy homepage_article_blocks_public_read on public.homepage_article_blocks
  for select to anon, authenticated using (true);
grant select on public.homepage_article_blocks to anon, authenticated;
grant all on public.homepage_article_blocks to service_role;

-- Allow the new 'best_sites_article' homepage section type.
alter table public.homepage_sections drop constraint if exists homepage_sections_section_type_check;
alter table public.homepage_sections add constraint homepage_sections_section_type_check
  check (section_type in (
    'top_rated','comparison','category_cards','featured_brands','verified_offers',
    'latest_reviews','latest_guides','how_we_rate','trust','faq','newsletter','final_cta',
    'best_sites_article'
  ));

-- Seed the article blocks for the root market (only when none exist yet).
insert into public.homepage_article_blocks (market_id, block_type, position, heading, body, operator_id, badge, visible)
select m.id, b.block_type, b.position, b.heading, b.body,
       (select o.id from public.operators o where o.slug = b.operator_slug),
       b.badge, true
from public.markets m
cross join (values
    ($blk$H2$blk$, 0, $blk$The Best Mystery Box Websites Reviewed$blk$, null, null, null),
    ($blk$PLATFORM_CARD$blk$, 1, null, $blk$Cases.gg publishes cryptographic seeds for every box opening and lists the odds on each box page before you commit any funds, a combination rarer across mystery box platforms than the marketing on most sites suggests. Premium tiers hold luxury goods and merchandise from top brands, and in our testing both a withdrawal and a physical delivery completed with working tracking. The catch is that the available boxes vary less than on larger sites, so it is best suited to buyers who value transparency over selection and want to check the data themselves rather than take fairness on trust.$blk$, $blk$cases-gg$blk$, $blk$Best Overall$blk$),
    ($blk$PLATFORM_CARD$blk$, 2, null, $blk$HypeDrop offers one of the widest selections we tested, with themed boxes spanning sneakers, tech, gaming gear, beauty, toys and collectibles, so most interests are represented somewhere in the catalogue. New players get free boxes and a deposit bonus on registration, and verification is standard for the market and worth completing before you build a balance worth withdrawing. Odds are published, and it is best for buyers who want to browse and discover rather than commit to a single category from the start.$blk$, $blk$hypedrop$blk$, $blk$Best for Wide Selection$blk$),
    ($blk$PLATFORM_CARD$blk$, 3, null, $blk$Open That Pack focuses on trading card games, with Pokemon, Magic and Lorcana packs, sealed product and the real cards shipped to you, plus the option to sell the rest back to the vault for credit. Collectors will find more depth here than on any general mystery box site, and sealed pack odds are advertised up front, which matters far more to this audience than a headline figure. Best for collectors buying to keep rather than to flip, and for anyone whose interest is cards rather than merchandise.$blk$, $blk$open-that-pack$blk$, $blk$Best for Collectible Cards$blk$),
    ($blk$PLATFORM_CARD$blk$, 4, null, $blk$RillaBox accepts both cards and crypto, giving it one of the more flexible funding setups on this list, and it pairs that with a large catalogue and a strong Trustpilot record. New accounts get a free box on signup plus a deposit bonus, and draws are provably fair. Best for buyers who want flexible funding options, or whose bank has declined gambling-adjacent deposits elsewhere.$blk$, $blk$rillabox$blk$, $blk$Best for Payment Methods$blk$),
    ($blk$PLATFORM_CARD$blk$, 5, null, $blk$LuxDrop is built around higher-value, luxury-style prizes, with premium tiers holding watches, designer apparel and accessories, and a verifiable hash behind every provably fair draw. Won items can be shipped or converted to crypto, though balance itself cannot be cashed out. Purchase prices start higher and variance is high, so this is best for buyers with a meaningful budget who understand what they are risking.$blk$, $blk$luxdrop$blk$, $blk$Best for Luxury Items$blk$),
    ($blk$PLATFORM_CARD$blk$, 6, null, $blk$Giveaways.com leans towards tech and gadgets, where you load credits, open boxes and can win electronics, then ship the item, keep it in an inventory or sell it back for credits. Check warranty coverage and regional model compatibility before buying, since neither is guaranteed and both affect resale value. Best for buyers chasing tech and gaming hardware who would keep the prize rather than exchange it for credit.$blk$, $blk$giveaways-com$blk$, $blk$Best for Gaming Gear$blk$),
    ($blk$PLATFORM_CARD$blk$, 7, null, $blk$JemLit is operated by a London-registered company and keeps the experience clean and easy to navigate, with a provably fair draw, worldwide shipping and free boxes plus a deposit bonus for new accounts. Reward types, odds and the exchange rules are explained in plain language, which is genuinely helpful when you are starting out. Best as a first account while you learn how box opening and withdrawals actually work.$blk$, $blk$jemlit$blk$, $blk$Best for Beginners$blk$),
    ($blk$PLATFORM_CARD$blk$, 8, null, $blk$Upgrader pairs box opening with case battles, a mines game and an upgrade-style mode, so there is more to do than open a box and wait. Those extra game modes sit outside what we assess on this page, so treat them as a separate product with separate risks when you judge the site overall. It is unlicensed with mixed reviews, so it is best for buyers who want more interaction around the purchase and are comfortable with a platform whose focus is split. Play small and to a budget.$blk$, $blk$upgrader$blk$, $blk$Best for Community Features$blk$),
    ($blk$H2$blk$, 9, $blk$How We Score Mystery Box Platforms$blk$, null, null, null),
    ($blk$PARAGRAPH$blk$, 10, null, $blk$Each site is tested against five weighted criteria, and we publish the full rubric so you can judge whether our priorities match yours. A site can rank well on selection and still score badly overall if it fails on fairness.$blk$, null, null),
    ($blk$PARAGRAPH$blk$, 11, null, $blk$Provably fair verification. We check whether the platform publishes a server seed, a client seed and a nonce, then verify a real opening ourselves using its own tool. A site that describes a provably fair system without letting you verify an actual result scores zero here, regardless of how the marketing reads.$blk$, null, null),
    ($blk$PARAGRAPH$blk$, 12, null, $blk$Published odds and house edge. Odds must be visible on the box page before purchase, not buried in the terms. We calculate the average expected return against purchase price and flag any platform where the numbers cannot be checked independently or appear to have been manipulated.$blk$, null, null),
    ($blk$PARAGRAPH$blk$, 13, null, $blk$Delivery and withdrawal. We push one physical item to a real address and one withdrawal to a real card, and record delivery times, fees, verification friction and packaging quality, because a prize that arrives damaged has lost its value as surely as one that never ships.$blk$, null, null),
    ($blk$PARAGRAPH$blk$, 14, null, $blk$Payment methods and fees. We test what the site accepts, whether adding funds is instant, what rate applies when converting items to site balance, and what it costs to withdraw. Hidden charges at the exchange step are more common than charges at deposit.$blk$, null, null),
    ($blk$PARAGRAPH$blk$, 15, null, $blk$Box variety and value. We count available boxes, categories and price tiers, then compare the listed retail price against realistic resale value on a sample of items. Inflated retail pricing is the most common way a mediocre box is made to look generous.$blk$, null, null),
    ($blk$H2$blk$, 16, $blk$What to Check Before You Buy Mystery Boxes$blk$, null, null, null),
    ($blk$PARAGRAPH$blk$, 17, null, $blk$Five minutes of checking before you deposit will tell you more about a site than any review, including this one. Verify the seed yourself rather than trusting a fairness badge: open one cheap box, take the seed data, and run it through the platform's own verification tool. If that process is difficult or the tool does not work, you have your answer already.$blk$, null, null),
    ($blk$PARAGRAPH$blk$, 18, null, $blk$Read the exchange rate, not the box value. Most platforms let you exchange unwanted items for site credit rather than shipping them, and that rate is frequently well below the retail price displayed on the item. The gap between the two is where the real cost of playing sits.$blk$, null, null),
    ($blk$PARAGRAPH$blk$, 19, null, $blk$Check shipping to your address and confirm the platform ships physical items to your country and state before depositing, since some sites restrict delivery on specific categories. Confirm the minimum and maximum withdrawal and any fee, and complete verification early, while your balance is small, so registration checks never become the obstacle between you and your funds.$blk$, null, null),
    ($blk$H2$blk$, 20, $blk$What's Inside Mystery Boxes$blk$, null, null, null),
    ($blk$PARAGRAPH$blk$, 21, null, $blk$Sneakers, streetwear and luxury goods are the largest category by volume, with premium tiers reaching designer merchandise and genuine luxury items. Tech, gadgets and gaming gear cover phones, headphones, consoles and PC components, where warranty coverage and regional model compatibility are worth checking before buying.$blk$, null, null),
    ($blk$PARAGRAPH$blk$, 22, null, $blk$Collectible cards behave differently from every other category, with graded slabs, sealed packs and published pull rates rather than box odds. Watches and jewellery are high-value boxes where authentication matters more than the odds do, so confirm what happens if an item fails verification before you commit anything.$blk$, null, null),
    ($blk$H2$blk$, 23, $blk$Are Mystery Box Sites Legit?$blk$, null, null, null),
    ($blk$PARAGRAPH$blk$, 24, null, $blk$Some are. The market contains genuinely transparent platforms operating alongside sites that publish odds nobody can check, relying on the fact that almost nobody tries. The warning signs are consistent across the sites that fail: no verifiable cryptographic seeds, odds that appear only in the terms if at all, real user reviews describing deliveries that never arrived, and no working contact route beyond an unanswered email address.$blk$, null, null),
    ($blk$PARAGRAPH$blk$, 25, null, $blk$A site being unregulated is not the same as a site being dishonest, and plenty of legitimate platforms operate outside any licensing framework. What matters is whether the claims a platform makes can be independently checked by you.$blk$, null, null),
    ($blk$H2$blk$, 26, $blk$How Mystery Box Odds Work$blk$, null, null, null),
    ($blk$PARAGRAPH$blk$, 27, null, $blk$Every box has a fixed distribution of outcomes and a house edge built into it. The average return across many openings sits below the purchase price, and that difference is how the platform makes a profit. This is the market working as designed rather than evidence of a scam.$blk$, null, null),
    ($blk$PARAGRAPH$blk$, 28, null, $blk$What varies between sites is how large that edge is and whether the platform tells you before you buy. A site with a 15 percent edge that publishes its odds is a better proposition than one with a 10 percent edge that hides them, because only one of those numbers can be verified.$blk$, null, null),
    ($blk$H2$blk$, 29, $blk$Payment Methods and Withdrawals$blk$, null, null, null),
    ($blk$PARAGRAPH$blk$, 30, null, $blk$Most mystery box sites accept Visa and debit cards, and a growing number now accept crypto. Card deposits usually clear instantly, though some banks decline them automatically as gambling-adjacent transactions regardless of how the platform is classified. Withdrawals are slower than deposits and always require verification, so complete that step early rather than at the point you want your money.$blk$, null, null),
    ($blk$H2$blk$, 31, $blk$Free Boxes, Bonuses and Promo Codes$blk$, null, null, null),
    ($blk$PARAGRAPH$blk$, 32, null, $blk$Several platforms offer a free daily box, a welcome perk on registration, or bonus credits that unlock after a first deposit. These are marketing spend rather than genuine value, but they do let you test how a site behaves at minimal cost. Current codes are tracked and dated on our promo codes page, and platforms with permanently free mechanics are listed under free mystery boxes.$blk$, null, null),
    ($blk$H2$blk$, 33, $blk$Our Verdict on the Best Mystery Box Sites$blk$, null, null, null),
    ($blk$PARAGRAPH$blk$, 34, null, $blk$Cases.gg takes the top position because it does the two things that matter most: it publishes odds you can read before buying and seeds you can verify afterwards. HypeDrop is the better pick if selection matters more to you than transparency, and Open That Pack is the clear choice for anyone whose interest is collectible cards rather than merchandise. Whichever you choose, the house holds an edge on every box on every site. Pick on fairness and delivery reliability, not on the size of the prize in the marketing.$blk$, null, null),
    ($blk$H2$blk$, 35, $blk$Playing Within Your Limits$blk$, null, null, null),
    ($blk$PARAGRAPH$blk$, 36, null, $blk$Box opening is designed to feel exciting, and that is exactly why it is worth setting a spending limit before you deposit rather than after. If you find yourself chasing losses or spending more than you planned, our guide to setting limits covers practical steps and where to find support.$blk$, null, null)
) as b(block_type, position, heading, body, operator_slug, badge)
where m.code = 'us'
  and not exists (select 1 from public.homepage_article_blocks x where x.market_id = m.id);

-- Homepage layout: at-a-glance comparison, the article, FAQ, newsletter.
delete from public.homepage_sections where market_id = (select id from public.markets where code = 'us');
insert into public.homepage_sections (market_id, section_type, position, visible)
select (select id from public.markets where code = 'us'), s.t, s.p, true
from (values ('comparison',0),('best_sites_article',1),('faq',2),('newsletter',3)) as s(t,p);
