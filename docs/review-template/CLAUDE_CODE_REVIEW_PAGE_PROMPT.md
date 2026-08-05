# Mystery-Boxes.com Review Page Frontend Build Brief for Claude Code

## Objective

Rebuild every platform review page on Mystery-Boxes.com using the attached visual reference:

`review-page-visual-reference.png`

The reference image defines the required design quality, visual hierarchy, dark color system, page structure and overall experience.

Do not treat the image as loose inspiration. Recreate its visual system and layout logic closely while keeping the implementation original, responsive, accessible, fast and fully CMS driven.

This task is for the frontend review-page template and its reusable components. Do not hardcode Cases.gg or any other operator into the page structure.

Every review page must be generated from one central platform record and related review, offer, rating, FAQ, media and comparison data.

## Core result

Create one premium dynamic review template that powers URLs such as:

- `/reviews/cases-gg`
- `/reviews/jemlit`
- `/reviews/packz`
- `/reviews/boxed-gg`
- `/reviews/rillabox`
- `/reviews/luxdrop`
- `/reviews/hypedrop`
- `/reviews/courtyard`

The page must feel like a premium technology and gaming publication rather than a generic affiliate blog.

The visual balance should be:

- 75 percent premium SaaS and comparison platform
- 25 percent gaming and collectible energy

Avoid casino-style clutter, flashing effects, fake live wins, fake scarcity and unsupported claims.

# Visual design system

## Background colors

Use a layered dark navy system:

- Primary page background: `#030817`
- Secondary background: `#071126`
- Elevated panel: `#0B1730`
- Card background: `#0D1933`
- Dark input or nested area: `#091328`
- Header background: `rgba(3, 8, 23, 0.92)`

Use subtle radial gradients behind the hero and important commercial sections.

Do not use large white sections.

## Borders

Use thin restrained borders:

- Default border: `rgba(130, 155, 210, 0.16)`
- Highlight border: `rgba(69, 130, 255, 0.38)`
- Purple highlight: `rgba(132, 83, 255, 0.38)`
- Green offer border: `rgba(46, 213, 115, 0.38)`
- Gold rating border: `rgba(255, 193, 7, 0.34)`

Cards must have visible separation without appearing heavily boxed.

## Accent colors

Use:

- Electric blue: `#2684FF`
- Bright CTA blue: `#1677FF`
- Purple: `#8157FF`
- Cyan: `#19C7FF`
- Verified green: `#23D567`
- Offer green: `#27C968`
- Gold rating: `#FFC107`
- Warning orange: `#FF9F43`
- Error red: `#FF5A65`
- Main text: `#F6F8FF`
- Secondary text: `#A8B2CC`
- Muted text: `#75819B`

Use green primarily for verified status, positive features and commercial offer CTAs.
Use blue for navigation, internal CTAs and informational controls.
Use gold only for rating stars, rankings and selected editorial highlights.

## Typography

Use the existing site font if it is clean and modern. Otherwise use a high-quality variable sans font such as Inter or Geist.

Recommended desktop sizes:

- H1: 42–52px
- H2: 28–34px
- H3: 20–24px
- Body: 16–18px
- Small labels: 12–14px

Mobile typography must scale down cleanly without tiny body copy.

## Radius and shadows

Use:

- Primary cards: 14–18px radius
- Small cards and buttons: 10–14px
- Pills: full radius where appropriate

Use restrained shadows and inner highlights. Do not create large glow effects around every card.

## Spacing

Use a maximum content width around 1280px.
Desktop page gutters: 28–40px.
Mobile gutters: 16–20px.
Use generous vertical rhythm between major sections.
Do not leave large empty areas with no visual or editorial purpose.

# Review page structure

## 1 Header and breadcrumb

Use the existing global header, styled consistently with the visual reference.

Header items:

- Mystery-Boxes.com logo
- Reviews
- Compare
- Categories
- Promo Codes
- Guides
- News
- Search
- Browse All Sites button

Below it show breadcrumbs:

`Home > Reviews > [Platform Name] Review`

Breadcrumbs must be semantic, crawlable and supported by BreadcrumbList structured data.

## 2 Review hero

Create a premium three-part hero layout.

### Left logo panel

Display:

- Platform logo
- Logo alt text
- Optional verified-platform marker
- Dark card background

Support square, wide, light and dark logo variants. Never stretch a logo.

### Main identity panel

Display:

- `[Platform Name] Review`
- Verified review badge when the review has genuinely been checked
- Short editorial summary
- Availability or primary country field
- Overall score
- Rating descriptor such as Excellent, Good or Average
- Last checked date

Do not use unsupported claims.

### Hero image

Display a platform-specific hero image, product screenshot or category illustration.
Use the CMS hero image field.
Support a tasteful gradient overlay.
Do not scrape or hotlink imagery.
The hero must collapse cleanly on mobile.

## 3 Welcome offer bar

Place the welcome offer immediately below the hero.

Display:

- Gift icon
- Small `WELCOME OFFER` label
- Offer title
- Short terms or eligibility summary
- Promo code where verified
- Exclusive badge only when genuinely exclusive
- Last checked date
- Large CTA

CTA examples:

- Claim Offer
- Visit Site
- Get Free Boxes
- View Welcome Offer

The button must use the active affiliate URL when available.

All affiliate links must:

- Open in a new tab
- Use `rel="sponsored nofollow noopener"`
- Route through the existing safe affiliate-click tracker
- Record platform, offer, page, placement and CTA label

If no verified offer exists, display a neutral information state and use the configured CMS fallback.
Never invent a promo code.

## 4 Sticky section navigation

Suggested tabs:

- Overview
- How It Works
- Boxes or Packs
- Payments
- Shipping
- Buyback
- Pros and Cons
- FAQ

Desktop:
- Sticky beneath the main header
- Clear active state
- Smooth scroll

Mobile:
- Horizontally scrollable
- Large tap targets
- No clipped labels

## 5 Review summary grid

Create a three-column desktop layout.

### Bottom line card

Display:

- `THE BOTTOM LINE`
- Concise editorial verdict
- Best For panel
- Optional recommendation badge

### Overall rating card

Display:

- Large overall score
- Rating descriptor
- Star visualization
- Rating methodology note

List rating categories with compact bars:

- Trust and Safety
- Box or Pack Variety
- Payouts or Rewards
- Bonuses and Offers
- Payments
- User Experience
- Support
- Buyback System

Only show categories that apply to the platform.
Scores must come from structured CMS fields.

### Quick facts card

Display structured facts such as:

- Founded
- Owner
- Minimum age
- Availability
- Platform type
- Payment methods
- Buyback
- KYC
- Shipping
- Mobile app

Missing fields should be hidden rather than displayed as blank.

## 6 Pros, cons and commercial CTA

Use a three-column desktop row.

### Pros card

Use a restrained green tinted panel and show 4–8 concise pros.

### Cons card

Use a restrained red tinted panel and show 3–6 meaningful cons.

### Visit site card

Display:

- Platform name
- Short CTA explanation
- Primary affiliate CTA
- Affiliate disclosure
- Last link tested date where useful

On mobile, this can become a dismissible sticky bottom CTA after the user scrolls past the main offer.

## 7 Main editorial review

Use a readable content container with modular blocks, not one HTML wall.

Support:

- Rich text
- H2 and H3 sections
- Full-width image
- Image with text left
- Image with text right
- Screenshot gallery
- Feature cards
- Callout box
- Offer box
- Data table
- Payment method panel
- Shipping panel
- Safety panel
- Comparison card
- Related guide card

Suggested sections:

- `[Platform Name] Full Review`
- How the Platform Works
- Box or Pack Variety
- Free Boxes and Promotions
- Payments and Withdrawals
- Shipping and Prize Claims
- Buyback and Cash Out
- Is `[Platform Name]` Legit
- User Experience
- Customer Support
- Final Verdict

All section headings and content must be editable in the CMS.

## 8 Alternating editorial image blocks

Alternate text and images to create rhythm.
Images must use Next.js Image, have meaningful alt text, be optimized and lazy-loaded below the fold.

## 9 Offer feature panel

Create a strong panel for a verified promotion with artwork, offer title, explanation, CTA, eligibility note and last verified date.
It must change state automatically when the offer becomes stale or expired.

## 10 Payments panel

Display payment-method logos or text chips, deposit methods, withdrawal methods, processing notes, currencies and crypto support where applicable.
Only show methods stored in the CMS.

## 11 Safety and legitimacy section

Potential trust items:

- Provably fair system
- Secure connection
- Published odds
- Company information
- Age verification
- KYC
- Support availability
- Prize authenticity information

Avoid absolute safety or legitimacy claims without evidence.

## 12 FAQ and related reviews

Use a two-column desktop section.

FAQ:
- 5–8 CMS-driven accordions

Related reviews:
- 3 related platform cards with logo, name, rating, best-for label and Read Review button

## 13 Footer metadata

Show:

- Last updated date
- Last checked date
- Author
- Reviewer
- Affiliate disclosure
- Editorial policy
- Corrections policy
- Report outdated information link

# Responsive behavior

Desktop:
- Maximum width about 1280px
- Multi-column hero
- Three-column summary
- Three-column pros, cons and CTA
- Alternating editorial blocks
- Sticky section navigation

Tablet:
- Two-column layouts
- Quick facts can move below rating

Mobile order:

1. Breadcrumb
2. Logo
3. Review title and summary
4. Hero image
5. Offer
6. Section navigation
7. Bottom line
8. Rating
9. Quick facts
10. Pros
11. Cons
12. Main content
13. FAQ
14. Related reviews

Use one-column cards and no horizontal page overflow.

# Reusable React components

Create or refactor into components similar to:

- `ReviewHero`
- `PlatformLogoCard`
- `VerifiedReviewBadge`
- `ReviewMetaRow`
- `WelcomeOfferBanner`
- `ReviewSectionNav`
- `BottomLineCard`
- `OverallRatingCard`
- `RatingBreakdown`
- `QuickFactsCard`
- `ProsConsGrid`
- `AffiliateCtaCard`
- `ReviewContentRenderer`
- `EditorialImageBlock`
- `ScreenshotGallery`
- `FeatureCallout`
- `PaymentMethodsPanel`
- `ShippingPanel`
- `SafetyPanel`
- `OfferFeaturePanel`
- `ReviewFaq`
- `RelatedReviews`
- `ReviewAuthorBox`
- `ReviewUpdateMeta`
- `MobileStickyOffer`

Use server components by default. Use client components only for genuine interactions.

# CMS data required

Ensure the backend can manage every visible field.

Platform fields:
- Name
- Slug
- Short description
- Platform type
- Standard URL
- Affiliate URL
- Logo
- Light logo
- Dark logo
- Hero image
- Gallery
- Founded year
- Owner
- Minimum age
- Availability
- KYC required
- Buyback available
- Mobile app
- Payment methods
- Shipping information
- Support methods
- Categories

Review fields:
- Review H1
- Summary
- Bottom-line verdict
- Best-for title
- Best-for description
- Overall score
- Score descriptor
- Rating categories
- Pros
- Cons
- Review sections
- Author
- Reviewer
- Published date
- Updated date
- Last checked date
- Next review date
- FAQs
- Related platforms
- Related guides
- SEO title
- Meta description
- Canonical
- Open Graph image
- Published status

Offer fields:
- Offer title
- Offer description
- Promo code
- Affiliate URL
- Terms URL
- Eligibility
- State exclusions
- Start date
- Expiry date
- Last verified
- Status
- CTA label
- Fallback mode

# Content block system

Do not store the entire review as one HTML string.

Recommended block types:

- `RICH_TEXT`
- `IMAGE_LEFT`
- `IMAGE_RIGHT`
- `FULL_WIDTH_IMAGE`
- `SCREENSHOT_GALLERY`
- `FEATURE_GRID`
- `OFFER_CALLOUT`
- `PAYMENT_PANEL`
- `SHIPPING_PANEL`
- `SAFETY_PANEL`
- `DATA_TABLE`
- `QUOTE`
- `RELATED_GUIDES`
- `COMPARISON`
- `CTA`

Each block should support ID, review ID, type, display order, heading, body, media relationship, alt text, caption, CTA configuration, visibility and timestamps.

Build a reorderable admin editor so sections can be added, edited, moved and hidden without code changes.

# SEO requirements

Every review page must have:

- Server-rendered content
- Unique title
- Unique meta description
- Self-referencing canonical
- One H1
- Semantic H2 and H3 structure
- Open Graph metadata
- Breadcrumbs
- Valid structured data only
- Author and reviewer information
- Meaningful updated date
- Crawlable internal links
- Image alt text

Do not fabricate user reviews, aggregate rating counts or review schema.

# Accessibility

Meet WCAG 2.2 AA where practical.
Ensure keyboard-accessible tabs and accordions, visible focus states, accessible rating labels, text values for bars, descriptive buttons, alt text and reduced-motion support.

# Performance

Use Next.js Image, AVIF or WebP, responsive sizes, lazy loading, server rendering, minimal client JavaScript and CSS gradients rather than huge background files.

# Safety and truthfulness rules

Do not publish invented offers, promo codes, ratings, review counts, licenses, safety claims, urgency, live winners or activity feeds.
Every commercial offer must use the live-offer freshness system.

# Implementation process

1. Add the visual reference under project documentation only.
2. Audit the current review template and CMS schema.
3. Create reusable components.
4. Add missing database fields and migrations.
5. Build the structured review-block editor.
6. Rebuild the dynamic review template.
7. Apply the design system.
8. Connect all data to the CMS.
9. Add responsive behavior.
10. Add SEO and structured data.
11. Add affiliate tracking and disclosures.
12. Add tests.
13. Test with a general mystery-box site, digital card-pack site and physical mystery-box retailer.
14. Run type checking, linting, migrations and tests.
15. Fix all errors.

# Acceptance criteria

The work is complete when:

- All platform reviews use one dynamic template.
- The design closely matches the attached visual reference.
- Logos and hero images are CMS controlled.
- Welcome offers appear near the top.
- Expired and stale offers behave safely.
- Pros, cons, scores and quick facts are editable.
- Main review content supports modular text and image blocks.
- Payment, shipping, safety and buyback panels are reusable.
- FAQ and related reviews are dynamic.
- Affiliate CTAs are tracked and disclosed.
- Every page is responsive, server rendered and indexable.
- Admins can build a complete review without editing code.
- No claims or scores are invented.

Implement this on the current Mystery-Boxes.com project without redesigning unrelated page types.
