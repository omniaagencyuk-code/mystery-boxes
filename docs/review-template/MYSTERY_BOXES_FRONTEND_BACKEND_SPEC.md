# Mystery-Boxes.com Frontend and Backend Build Specification

## Instruction to Claude Code

Read this document in full before making changes.

The attached images are the visual authority for the frontend:

- `01-review-master-reference.png`
- `02-unified-pages-reference.png`
- `03-category-reference.png`

The live review-page style is the master design language. Rebuild and align all other public page types to that same system.

Do not use the screenshots as webpage images. Recreate them with reusable components connected to the existing database and CMS.

Preserve all production data. Do not generate fake brands, offers, ratings, wins, promo codes, reviews or traffic statistics.

---

# 1 Product objective

Build Mystery-Boxes.com as a premium US-focused comparison and editorial platform for:

- Online mystery-box websites
- Digital pack-opening platforms
- Trading-card pack websites
- Luxury-watch mystery boxes
- Tech mystery boxes
- Sneaker mystery boxes
- Gaming mystery boxes
- Sports-card packs
- Pokémon card packs
- Physical mystery boxes
- High-value prize categories
- Future categories such as cars, villas, holidays, jewelry and handbags

The website does not sell boxes itself.

It helps visitors:

- Discover platforms
- Read independent reviews
- Compare sites
- Find current welcome offers
- Understand shipping, buyback and safety
- Browse category rankings
- Read guides
- Click tracked affiliate links

The admin system must let a nontechnical editor manage the full site without editing code.

---

# 2 Required technology

Use the existing application stack where possible.

Preferred architecture:

- Next.js App Router
- TypeScript
- PostgreSQL
- Prisma ORM
- Tailwind CSS
- Server Components by default
- Auth.js or existing secure authentication
- Vercel deployment
- Vercel Blob or S3-compatible media storage
- Resend or existing email provider
- Zod validation
- React Hook Form
- Playwright for end-to-end testing
- Sentry or equivalent for error monitoring

Do not replace working infrastructure unnecessarily.

---

# 3 Master visual system

## 3.1 Design direction

The review reference is the benchmark.

The entire site should feel:

- Premium
- Dark
- Data-led
- Trustworthy
- Editorial
- Fast
- Technological
- Visually consistent

Target balance:

- 75 percent premium SaaS and editorial platform
- 25 percent gaming, collectible and luxury energy

Avoid:

- Bright casino styling
- Excessive purple
- Neon everywhere
- White template sections
- Generic affiliate-blog layouts
- Fake live-win feeds
- Flashing urgency
- Hardcoded page-specific styling

## 3.2 Color tokens

Use CSS variables or Tailwind theme tokens.

```css
--bg-primary: #030817;
--bg-secondary: #071126;
--bg-elevated: #0B1730;
--surface-card: #0D1933;
--surface-nested: #091328;
--surface-header: rgba(3, 8, 23, 0.92);

--text-primary: #F6F8FF;
--text-secondary: #A8B2CC;
--text-muted: #75819B;

--accent-blue: #2684FF;
--accent-blue-strong: #1677FF;
--accent-purple: #8157FF;
--accent-cyan: #19C7FF;
--accent-green: #23D567;
--accent-offer: #27C968;
--accent-gold: #FFC107;
--accent-warning: #FF9F43;
--accent-danger: #FF5A65;

--border-default: rgba(130, 155, 210, 0.16);
--border-blue: rgba(69, 130, 255, 0.38);
--border-purple: rgba(132, 83, 255, 0.38);
--border-green: rgba(46, 213, 115, 0.38);
--border-gold: rgba(255, 193, 7, 0.34);
```

Purple should normally occupy less than 15 percent of the interface.

Use blue as the main UI accent.

Use green for verified states and commercial offer CTAs.

Use gold for ratings and premium category details.

## 3.3 Typography

Use the current clean site font or Geist/Inter.

Desktop guidance:

- H1: 44 to 58px
- H2: 28 to 36px
- H3: 20 to 24px
- Body: 16 to 18px
- Secondary copy: 14 to 16px
- Labels: 12 to 14px

Mobile text must remain readable.

Avoid excessive uppercase headings.

## 3.4 Surfaces

Cards:

- Dark layered backgrounds
- 12 to 18px radius
- Thin borders
- Subtle inner highlights
- Soft hover elevation
- No heavy glow

Buttons:

Primary:
- Bright blue
- Strong contrast
- Slight hover brightness
- 10 to 14px radius

Commercial offer:
- Verified green
- Only for active verified offers

Secondary:
- Dark glass surface
- Thin border
- White text

## 3.5 Layout

Maximum content width: approximately 1280px.

Desktop gutters: 28 to 40px.

Mobile gutters: 16 to 20px.

Use deliberate responsive layouts rather than simply stacking every desktop element.

---

# 4 Shared frontend component library

Create one reusable component system.

Required components:

- `SiteHeader`
- `MobileNavigation`
- `SiteFooter`
- `Breadcrumbs`
- `PageHero`
- `HeroArtwork`
- `TrustBadgeStrip`
- `StatItem`
- `SectionHeader`
- `PlatformLogo`
- `PlatformRankingCard`
- `ReviewCard`
- `OfferCard`
- `PromoCodeCard`
- `VerifiedBadge`
- `RatingStars`
- `RatingBreakdown`
- `QuickFactsCard`
- `ProsConsGrid`
- `AffiliateCta`
- `InternalCta`
- `CategoryChip`
- `CategoryCard`
- `CategoryRankingGrid`
- `ComparisonTable`
- `ComparisonMobileCards`
- `GuideCard`
- `ArticleCard`
- `NewsletterPanel`
- `FaqAccordion`
- `MethodologyPanel`
- `RelatedPlatforms`
- `RelatedGuides`
- `RelatedCategories`
- `LastCheckedMeta`
- `AffiliateDisclosure`
- `ReportOutdatedLink`
- `MobileStickyCta`
- `LoadingSkeleton`
- `EmptyState`
- `ErrorState`

Use Server Components by default.

Use client components only for:

- Accordions
- Copy-code actions
- Filters
- Compare selectors
- Galleries
- Sticky navigation
- Mobile menus
- Dismissible CTAs

---

# 5 Public frontend page layouts

## 5.1 Homepage

The homepage must use the review-page color balance and card treatment.

### Header

- Logo
- Reviews
- Compare
- Categories
- Promo Codes
- Guides
- News
- Search
- Browse All Sites CTA

### Hero

Left:

- H1
- Supporting text
- Browse Reviews CTA
- Compare Sites CTA
- Genuine database-driven statistics
- Trust indicators

Right:

- CMS-controlled hero visual
- Optimized image
- Dark blue and restrained purple lighting

### Top-rated sites

Display 5 or 6 platforms.

Each card includes:

- Rank
- Logo
- Score
- Rating descriptor
- Verified active offer
- View Review
- Compare
- Visit Site where enabled

### Homepage modules

CMS-controlled and reorderable:

- Recently verified
- Latest offers
- Browse categories
- Popular comparisons
- Latest guides
- How we rate
- Newsletter
- Responsible-use notice

## 5.2 Review pages

Use the existing review specification and the review reference image.

Required sections:

1. Breadcrumb
2. Logo and title hero
3. Welcome offer near the top
4. Sticky section navigation
5. Bottom line
6. Overall rating
7. Rating breakdown
8. Quick facts
9. Pros
10. Cons
11. Affiliate CTA
12. Modular text and image review sections
13. Payments
14. Shipping
15. Buyback
16. Safety
17. FAQ
18. Related reviews
19. Author, reviewer and update metadata

All fields must be CMS-driven.

## 5.3 Promo-code hub

URL:

`/promo-codes`

Hero:

- H1
- Description
- Last checked date
- Disclosure

Filters:

- All Offers
- Free Boxes
- Deposit Bonus
- No Deposit
- Cashback
- Referral
- No Code Required

Offer rows or cards:

- Logo
- Offer title
- Description
- Code or no-code state
- Copy code
- Claim offer
- Verified status
- Last checked
- Eligibility
- Terms
- Read review

Supporting modules:

- Why our codes work
- Popular offer categories
- Top platforms
- Newsletter

## 5.4 Individual promo page

URL:

`/promo-codes/[platform]`

Required sections:

- Platform logo
- Promo title
- Active status
- Code
- Copy button
- Claim CTA
- How to claim
- Eligibility
- Restrictions
- Expiry
- Last verified
- Terms
- Review link
- Alternatives
- FAQ
- Disclosure
- Report outdated offer

Use the live-offer freshness system.

## 5.5 Compare page

URL:

`/compare`

Allow up to four platforms.

Required features:

- Add platform
- Remove platform
- Clear all
- Share
- Sticky platform headers
- Desktop table
- Mobile comparison cards

Rows:

- Overall score
- Trust
- Transparency
- Prize quality
- Value
- Payouts
- Shipping
- Buyback
- Payment methods
- Free boxes
- US availability
- Minimum age
- Welcome offer
- Last checked

Do not automatically declare a winner unless editors configure one.

## 5.6 Guides hub

URL:

`/guides`

Hero:

- H1
- Summary
- Search
- Filters

Guide categories:

- Beginner
- How To
- Safety
- Strategies
- News
- All Guides

Guide cards:

- Image
- Category
- Title
- Summary
- Date
- Read time

Supporting sidebar:

- Popular guides
- Newsletter
- Related categories

## 5.7 Guide article

Required layout:

- Breadcrumbs
- H1
- Summary
- Author
- Reviewer
- Published date
- Updated date
- Read time
- Hero image
- Table of contents
- Rich modular content
- Source citations
- Related reviews
- Related categories
- FAQs
- Author box
- Corrections link

## 5.8 Dynamic category landing page

Use one template for all categories.

Examples:

- Luxury watches
- Cars
- Villas
- Holidays
- Jewelry
- Handbags
- Sneakers
- Tech
- Gaming
- Pokémon
- Sports cards
- Trading cards
- Physical mystery boxes

### Category hero

Left:

- Breadcrumb
- H1
- Intro
- Trust indicators
- Reviewed sites count
- Verified offers count
- Last updated

Right:

- Category-specific CMS hero image
- Same overall color system as review pages
- Category accent used sparingly

### Shortcut chips

Examples:

- All Sites
- Rolex
- Omega
- Buyback
- US Shipping
- Crypto Accepted

Chips may:

- Filter
- Scroll
- Link to child pages

### Top-rated category sites

Display 5 platform cards.

Each card:

- Rank
- Logo
- Editorial badge
- Score
- Verified offer
- Visit Site
- Read Review

### Category comparison

Rows depend on category.

Base rows:

- Overall rating
- Best for
- Prize types
- Minimum spend
- Free box or free entry
- Buyback
- Shipping or fulfilment
- US availability
- Payment methods
- Offer

Custom category rows:

Watches:
- Brands
- Authenticity
- Insurance

Cars:
- Vehicle type
- Cash alternative
- Delivery region

Villas:
- Location
- Ownership or stay
- Fees and taxes
- Cash alternative

Cards:
- Card type
- Grading
- Vault
- Marketplace
- Buyback

### Optional modules

- Popular brands
- Recent verified wins
- How it works
- FAQs
- Related reviews
- Related guides
- Latest offers
- Newsletter
- How we rank

Recent wins must be hidden unless evidence is stored.

---

# 6 Backend and CMS architecture

## 6.1 Roles

Create or preserve:

### Administrator

Can manage:

- Users
- Roles
- Platforms
- Reviews
- Offers
- Categories
- Guides
- Comparisons
- Media
- SEO
- Navigation
- Site settings
- Audit logs
- Affiliate links

### Editor

Can:

- Create and edit drafts
- Update offers
- Upload media
- Edit categories
- Submit for approval

### Reviewer

Can:

- Verify facts
- Approve reviews
- Verify offers
- Add review notes
- Set last-checked dates

All authorization checks must occur server-side.

## 6.2 Admin navigation

Build a consistent admin interface:

- Dashboard
- Platforms
- Reviews
- Offers
- Categories
- Comparisons
- Guides
- News
- Media
- Affiliate Links
- SEO
- Navigation
- Users
- Audit Log
- Settings

## 6.3 Dashboard

Show:

- Published platforms
- Draft reviews
- Reviews due
- Active offers
- Stale offers
- Expiring offers
- Broken affiliate links
- Missing logos
- Missing hero images
- Missing SEO titles
- Recently edited pages
- Top clicked platforms
- Most viewed pages

## 6.4 Platform manager

Each platform record must control the entire site.

Fields:

- Name
- Slug
- Legal name
- Standard URL
- Affiliate URL
- Affiliate status
- Platform type
- Summary
- Logo
- Light logo
- Dark logo
- Hero image
- Gallery
- Founded year
- Owner
- Minimum age
- Countries
- US states excluded
- Payment methods
- Shipping
- Buyback
- KYC
- Mobile app
- Categories
- Published
- Featured
- Display order
- Last checked
- Next review date

Actions:

- Create
- Edit
- Duplicate
- Archive
- Publish
- Unpublish
- Delete where safe
- Preview

## 6.5 Review manager

Review fields:

- Platform
- H1
- Summary
- Bottom-line verdict
- Best-for text
- Scores
- Score descriptor
- Pros
- Cons
- Modular content blocks
- FAQs
- Author
- Reviewer
- Published date
- Updated date
- Last checked
- Next review
- Related platforms
- Related guides
- SEO fields
- Status

Statuses:

- Draft
- In Review
- Changes Requested
- Approved
- Published
- Archived

## 6.6 Structured review blocks

Do not store full reviews as one HTML blob.

Required block types:

- Rich Text
- Image Left
- Image Right
- Full Width Image
- Screenshot Gallery
- Feature Grid
- Offer Callout
- Payment Panel
- Shipping Panel
- Safety Panel
- Buyback Panel
- Data Table
- Quote
- Related Guides
- Comparison
- CTA

Every block supports:

- Heading
- Body
- Media
- Alt text
- Caption
- CTA
- Display order
- Visibility
- Created date
- Updated date

Admin must support drag-and-drop ordering.

## 6.7 Offer manager

Use the existing offer-freshness architecture.

Required fields:

- Platform
- Offer title
- Offer description
- Promo code
- Affiliate URL
- Standard URL
- Terms URL
- Source URL
- Countries
- US state exclusions
- Minimum age
- Start date
- Expiry date
- Last verified
- Next review
- Verifier
- Status
- CTA label
- Fallback behavior
- Internal notes

Statuses:

- Draft
- Needs Verification
- Verified
- Stale
- Expired
- Paused
- No Current Offer

Admin features:

- Expiring soon
- Stale queue
- Broken links
- Missing evidence
- Bulk assign
- Bulk pause
- Export CSV
- Revision history

## 6.8 Category manager

One category record must generate the full category page.

Fields:

- Name
- Slug
- H1
- Short description
- Long introduction
- Hero image
- Mobile hero image
- Accent color
- Icon
- Type
- Published
- Featured
- Display order
- Last reviewed
- Next review
- SEO title
- Meta description
- Canonical
- Open Graph image
- Index status
- Shortcut chips
- Featured platforms
- Popular brands
- Comparison fields
- FAQs
- Related categories
- Related guides
- Related comparisons
- Section order
- Section visibility

Category section editor:

- Add
- Remove
- Reorder
- Duplicate
- Hide
- Preview

Supported section types:

- Hero
- Shortcuts
- Top Platforms
- Editorial Intro
- Feature Strip
- Comparison
- Popular Brands
- Verified Wins
- How It Works
- FAQ
- Related Reviews
- Related Guides
- Related Categories
- Latest Offers
- Newsletter
- Methodology
- Rich Text

## 6.9 Comparison manager

Allow editors to create:

- Dynamic comparisons
- Saved comparison URLs
- Editorial verdict
- Featured comparison
- Custom rows
- Category-specific rows
- Related guides
- SEO fields

Comparisons must pull live platform data rather than duplicating facts.

## 6.10 Guides CMS

Guide fields:

- Title
- Slug
- Summary
- Hero image
- Category
- Author
- Reviewer
- Modular content blocks
- Sources
- Related platforms
- Related categories
- FAQs
- Published date
- Updated date
- SEO fields
- Status

## 6.11 Media library

Support:

- Platform logos
- Hero images
- Screenshots
- Category images
- Guide images
- Open Graph images
- Author images

Features:

- Upload
- Folder
- Search
- Filter
- Alt text
- Caption
- Replace asset
- Delete unused
- Focal point
- Desktop crop
- Mobile crop
- AVIF/WebP generation
- File-size validation
- Usage references

Do not hotlink third-party images.

## 6.12 SEO manager

Display:

- Missing titles
- Missing descriptions
- Missing canonicals
- Missing OG images
- Missing H1s
- Noindex pages
- Orphan pages
- Broken internal links
- Sitemap status
- Redirect issues
- Review freshness
- Thin category warnings

## 6.13 Site settings

Editable:

- Site name
- Logo
- Favicon
- Contact details
- Social links
- Header navigation
- Footer
- Affiliate disclosure
- Editorial policy links
- Newsletter copy
- Homepage sections
- Default SEO
- Offer review intervals
- Category defaults
- US-state settings

---

# 7 Suggested Prisma models

Create or extend relational models for:

- User
- Role
- StaffProfile
- Platform
- PlatformMedia
- PlatformRating
- Category
- CategoryPlatform
- CategoryBrand
- CategorySection
- CategoryShortcut
- CategoryComparisonField
- Country
- State
- PlatformCountry
- PlatformStateExclusion
- PaymentMethod
- PlatformPaymentMethod
- Offer
- OfferRevision
- AffiliateProgramme
- AffiliateLink
- AffiliateClick
- Review
- ReviewBlock
- ReviewRevision
- Author
- Guide
- GuideBlock
- GuideCategory
- Comparison
- ComparisonPlatform
- ComparisonField
- FAQ
- Media
- NavigationItem
- SitePage
- SiteSetting
- NewsletterSubscriber
- ContactSubmission
- AuditLog

Use relational joins.

Do not store important relationships as comma-separated text.

---

# 8 SEO requirements

Every public page must have:

- Server-rendered content
- Unique title
- Unique meta description
- One H1
- Self-referencing canonical
- Open Graph metadata
- Breadcrumbs
- Crawlable links
- Image alt text
- Sitemap entry
- Meaningful updated date

Do not index:

- Admin pages
- Preview pages
- Internal search
- Thin filters
- Duplicate comparison parameters
- Empty categories
- Account pages

The site targets the US from the root domain.

Do not recreate `/us/`.

Support one-to-one redirects from previous `/us/` URLs.

---

# 9 Affiliate link requirements

All commercial outbound links must:

- Use a server-side tracked redirect
- Open in a new tab
- Use `rel="sponsored nofollow noopener"`
- Validate the destination against stored approved URLs
- Record platform
- Record offer
- Record page
- Record placement
- Record CTA label
- Record timestamp

Prevent open redirects.

Hide or replace broken CTAs safely.

---

# 10 Accessibility

Meet WCAG 2.2 AA where practical.

Required:

- Keyboard navigation
- Visible focus states
- Accessible tables
- Accessible accordions
- Semantic headings
- Strong contrast
- Screen-reader labels
- Reduced motion
- Large tap targets
- Text alternatives for icons
- Non-color indicators for statuses

---

# 11 Performance

Use:

- Server Components
- Minimal client JavaScript
- Next.js Image
- AVIF/WebP
- Responsive image sizes
- Lazy loading
- Font optimization
- Cached data
- Pagination
- Database indexes
- CSS gradients instead of oversized assets

Target strong Core Web Vitals.

---

# 12 Truthfulness rules

Do not publish:

- Fake ratings
- Fake review counts
- Fake offers
- Fake promo codes
- Fake wins
- Unsupported licences
- Unsupported payment methods
- Unsupported shipping claims
- Unsupported nationwide availability
- Fake freshness dates

Unknown data should be hidden or clearly marked.

---

# 13 Required testing

Add:

- Unit tests
- Integration tests
- Playwright tests
- Role-permission tests
- Offer-expiry tests
- Affiliate redirect tests
- Category-rendering tests
- Comparison tests
- SEO metadata tests
- Image fallback tests
- Mobile layout tests

Test:

- Homepage
- Review
- Promo hub
- Promo detail
- Compare
- Guides hub
- Guide article
- Luxury watch category
- Pokémon category
- Cars or villas category using the same template
- Expired offer
- Missing image
- Missing logo
- No related content
- Long platform names

---

# 14 Implementation sequence

1. Audit current frontend and backend.
2. Add design tokens.
3. Consolidate shared components.
4. Align homepage to review styling.
5. Align promo pages.
6. Align compare pages.
7. Align guides.
8. Align category pages.
9. Confirm reviews still match the master reference.
10. Expand backend schemas.
11. Build structured editors.
12. Build media library.
13. Connect offer freshness.
14. Add SEO manager.
15. Add accessibility.
16. Add tests.
17. Run migrations.
18. Run type checking.
19. Run linting.
20. Run tests.
21. Run production build.
22. Fix all errors.

Do not overwrite production records.

---

# 15 Acceptance criteria

The build is complete when:

- All public pages use the review-page design system.
- Homepage, promo, compare, guides and categories visually match the references.
- Review pages remain dynamic and CMS-controlled.
- All categories use one reusable template.
- Admins can add a category without code.
- Admins can create full reviews without code.
- Admins can manage offers and freshness.
- Admins can manage logos and media.
- All affiliate links are tracked and disclosed.
- All pages are responsive.
- All pages are server-rendered and indexable where appropriate.
- No fake data is published.
- Root-domain US SEO is preserved.
- The production build passes.
