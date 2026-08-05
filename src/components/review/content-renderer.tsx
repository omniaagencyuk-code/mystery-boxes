import Image from 'next/image';

import { AffiliateCta } from '@/components/review/affiliate-cta';
import { PaymentMethodsPanel } from '@/components/review/payment-methods';
import { SafetyPanel, ShippingPanel, type SafetyItem } from '@/components/review/panels';
import { ReviewMarkdown } from '@/components/review/review-markdown';
import { SectionHeading } from '@/components/review/primitives';
import { GiftIcon } from '@/components/review/icons';
import type { CtaSources } from '@/lib/reviews/affiliate';
import type { Json } from '@/lib/supabase/types';
import type { PaymentMethodView, PlatformView, ReviewBlockView } from '@/lib/reviews/types';

// --- safe config readers -----------------------------------------------------
function asRecord(value: Json): Record<string, Json> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, Json>)
    : {};
}
function asArray(value: Json | undefined): Json[] {
  return Array.isArray(value) ? value : [];
}
function asString(value: Json | undefined): string {
  return typeof value === 'string' ? value : '';
}

export interface RenderContext {
  platform: PlatformView;
  payments: PaymentMethodView[];
  sources: CtaSources;
  page: string;
}

function BlockImage({
  src,
  alt,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl ${className ?? ''}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 640px"
        className="object-cover"
        loading={priority ? undefined : 'lazy'}
        priority={priority}
      />
    </div>
  );
}

function ImageWithText({
  block,
  side,
}: {
  block: ReviewBlockView;
  side: 'left' | 'right';
}) {
  const text = (
    <div className="space-y-3">
      {block.heading && <SectionHeading>{block.heading}</SectionHeading>}
      {block.body && <ReviewMarkdown>{block.body}</ReviewMarkdown>}
    </div>
  );
  const image = block.mediaUrl ? (
    <figure className="space-y-2">
      <BlockImage src={block.mediaUrl} alt={block.alt ?? block.heading ?? ''} className="aspect-[16/10]" />
      {block.caption && (
        <figcaption className="text-center text-xs text-[var(--rv-muted)]">{block.caption}</figcaption>
      )}
    </figure>
  ) : null;

  return (
    <div className="grid items-center gap-6 md:grid-cols-2">
      {side === 'left' ? (
        <>
          {image}
          {text}
        </>
      ) : (
        <>
          <div className="md:order-2">{image}</div>
          <div className="md:order-1">{text}</div>
        </>
      )}
    </div>
  );
}

function FeatureGrid({ block }: { block: ReviewBlockView }) {
  const items = asArray(asRecord(block.config).items)
    .map((it) => asRecord(it))
    .filter((it) => asString(it.title));
  if (items.length === 0) return null;
  return (
    <div className="space-y-4">
      {block.heading && <SectionHeading>{block.heading}</SectionHeading>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <div key={i} className="rv-card p-4">
            <div className="font-bold text-[var(--rv-text)]">{asString(it.title)}</div>
            {asString(it.description) && (
              <p className="mt-1 text-sm text-[var(--rv-text-2)]">{asString(it.description)}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenshotGallery({ block }: { block: ReviewBlockView }) {
  const images = asArray(asRecord(block.config).images)
    .map((it) => asRecord(it))
    .filter((it) => asString(it.url));
  if (images.length === 0) return null;
  return (
    <div className="space-y-4">
      {block.heading && <SectionHeading>{block.heading}</SectionHeading>}
      <div className="rv-panel grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((it, i) => (
          <figure key={i} className="space-y-1">
            <BlockImage src={asString(it.url)} alt={asString(it.alt)} className="aspect-[4/3]" />
            {asString(it.caption) && (
              <figcaption className="truncate text-center text-[11px] text-[var(--rv-muted)]">
                {asString(it.caption)}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
}

function OfferCallout({ block, ctx }: { block: ReviewBlockView; ctx: RenderContext }) {
  const label = block.ctaLabel?.trim() || 'Claim Offer';
  return (
    <div className="rv-panel flex flex-col gap-4 border-[var(--rv-border-green)] bg-[var(--rv-offer)]/[0.06] p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-[var(--rv-verified)]">
          <GiftIcon width={26} height={26} />
        </span>
        <div>
          {block.heading && (
            <div className="text-lg font-extrabold text-[var(--rv-text)]">{block.heading}</div>
          )}
          {block.body && <div className="mt-1 text-sm text-[var(--rv-text-2)]"><ReviewMarkdown>{block.body}</ReviewMarkdown></div>}
        </div>
      </div>
      {block.ctaUrl ? (
        <a
          href={block.ctaUrl}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          className="rv-btn-offer rv-focus inline-flex shrink-0 items-center justify-center px-6 py-3 text-sm"
        >
          {label}
        </a>
      ) : (
        <AffiliateCta
          sources={ctx.sources}
          placement="offer_callout"
          label={label}
          page={ctx.page}
          variant="offer"
          className="shrink-0 px-6 py-3 text-sm"
        >
          {label}
        </AffiliateCta>
      )}
    </div>
  );
}

function DataTable({ block }: { block: ReviewBlockView }) {
  const cfg = asRecord(block.config);
  const headers = asArray(cfg.headers).map(asString);
  const rows = asArray(cfg.rows).map((r) => asArray(r).map(asString));

  // Fall back to a markdown table in the body when no structured rows exist.
  if (rows.length === 0) {
    if (!block.body) return null;
    return (
      <div className="space-y-3">
        {block.heading && <SectionHeading>{block.heading}</SectionHeading>}
        <div className="rv-panel p-2">
          <ReviewMarkdown>{block.body}</ReviewMarkdown>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {block.heading && <SectionHeading>{block.heading}</SectionHeading>}
      <div className="rv-panel overflow-x-auto p-1">
        <table className="w-full border-collapse text-sm">
          {headers.length > 0 && (
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className="border-b border-[var(--rv-border)] px-3 py-2 text-left font-bold text-[var(--rv-text)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className="border-b border-[var(--rv-border)] px-3 py-2 text-[var(--rv-text-2)]"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Quote({ block }: { block: ReviewBlockView }) {
  if (!block.body) return null;
  const cite = asString(asRecord(block.config).cite);
  return (
    <blockquote className="rv-panel border-l-2 border-l-[var(--rv-blue)] p-6">
      <p className="text-lg font-medium italic text-[var(--rv-text)]">{block.body}</p>
      {cite && <cite className="mt-2 block text-sm not-italic text-[var(--rv-muted)]">{cite}</cite>}
    </blockquote>
  );
}

function RelatedGuides({ block }: { block: ReviewBlockView }) {
  const items = asArray(asRecord(block.config).items)
    .map((it) => asRecord(it))
    .filter((it) => asString(it.title) && asString(it.url));
  if (items.length === 0) return null;
  return (
    <div className="space-y-3">
      {block.heading && <SectionHeading>{block.heading}</SectionHeading>}
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((it, i) => (
          <a
            key={i}
            href={asString(it.url)}
            className="rv-card rv-focus block p-4 transition-colors hover:border-[var(--rv-border-strong)]"
          >
            <span className="font-semibold text-[var(--rv-blue)]">{asString(it.title)}</span>
            {asString(it.description) && (
              <p className="mt-1 text-sm text-[var(--rv-text-2)]">{asString(it.description)}</p>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

function Comparison({ block }: { block: ReviewBlockView }) {
  const cfg = asRecord(block.config);
  const rows = asArray(cfg.rows).map((r) => asRecord(r));
  const thisLabel = asString(cfg.thisLabel) || 'This platform';
  const otherLabel = asString(cfg.otherLabel) || 'Alternative';
  if (rows.length === 0) {
    return block.body ? (
      <div className="space-y-3">
        {block.heading && <SectionHeading>{block.heading}</SectionHeading>}
        <ReviewMarkdown>{block.body}</ReviewMarkdown>
      </div>
    ) : null;
  }
  return (
    <div className="space-y-3">
      {block.heading && <SectionHeading>{block.heading}</SectionHeading>}
      <div className="rv-panel overflow-x-auto p-1">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-[var(--rv-border)] px-3 py-2 text-left font-bold text-[var(--rv-text)]">
                Feature
              </th>
              <th className="border-b border-[var(--rv-border)] px-3 py-2 text-left font-bold text-[var(--rv-blue)]">
                {thisLabel}
              </th>
              <th className="border-b border-[var(--rv-border)] px-3 py-2 text-left font-bold text-[var(--rv-text-2)]">
                {otherLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="border-b border-[var(--rv-border)] px-3 py-2 text-[var(--rv-text)]">
                  {asString(r.feature)}
                </td>
                <td className="border-b border-[var(--rv-border)] px-3 py-2 text-[var(--rv-text-2)]">
                  {asString(r.this)}
                </td>
                <td className="border-b border-[var(--rv-border)] px-3 py-2 text-[var(--rv-text-2)]">
                  {asString(r.other)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CtaBlock({ block, ctx }: { block: ReviewBlockView; ctx: RenderContext }) {
  const label = block.ctaLabel?.trim() || `Visit ${ctx.platform.name}`;
  return (
    <div className="rv-panel flex flex-col items-center gap-3 p-6 text-center">
      {block.heading && <div className="text-xl font-extrabold text-[var(--rv-text)]">{block.heading}</div>}
      {block.body && <p className="max-w-xl text-sm text-[var(--rv-text-2)]">{block.body}</p>}
      {block.ctaUrl ? (
        <a
          href={block.ctaUrl}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          className="rv-btn-blue rv-focus inline-flex items-center justify-center px-6 py-3 text-sm"
        >
          {label}
        </a>
      ) : (
        <AffiliateCta
          sources={ctx.sources}
          placement="content_cta"
          label={label}
          page={ctx.page}
          variant="offer"
          className="px-6 py-3 text-sm"
        >
          {label}
        </AffiliateCta>
      )}
    </div>
  );
}

function safetyItemsFrom(block: ReviewBlockView): SafetyItem[] {
  return asArray(asRecord(block.config).items)
    .map((it) => asRecord(it))
    .filter((it) => asString(it.title))
    .map((it) => ({ title: asString(it.title), note: asString(it.note) || null }));
}

function renderBlock(block: ReviewBlockView, ctx: RenderContext) {
  switch (block.type) {
    case 'RICH_TEXT':
      return (
        <div className="space-y-3">
          {block.heading && <SectionHeading>{block.heading}</SectionHeading>}
          {block.body && <ReviewMarkdown>{block.body}</ReviewMarkdown>}
        </div>
      );
    case 'IMAGE_LEFT':
      return <ImageWithText block={block} side="left" />;
    case 'IMAGE_RIGHT':
      return <ImageWithText block={block} side="right" />;
    case 'FULL_WIDTH_IMAGE':
      return block.mediaUrl ? (
        <figure className="space-y-2">
          {block.heading && <SectionHeading>{block.heading}</SectionHeading>}
          <BlockImage src={block.mediaUrl} alt={block.alt ?? block.heading ?? ''} className="aspect-[21/9]" />
          {block.caption && (
            <figcaption className="text-center text-xs text-[var(--rv-muted)]">{block.caption}</figcaption>
          )}
        </figure>
      ) : null;
    case 'SCREENSHOT_GALLERY':
      return <ScreenshotGallery block={block} />;
    case 'FEATURE_GRID':
      return <FeatureGrid block={block} />;
    case 'OFFER_CALLOUT':
      return <OfferCallout block={block} ctx={ctx} />;
    case 'PAYMENT_PANEL':
      return (
        <div className="space-y-3">
          {block.heading && <SectionHeading>{block.heading}</SectionHeading>}
          <PaymentMethodsPanel methods={ctx.payments} />
        </div>
      );
    case 'SHIPPING_PANEL':
      return (
        <div className="space-y-3">
          {block.heading && <SectionHeading>{block.heading}</SectionHeading>}
          <ShippingPanel heading={null} body={block.body} fallback={ctx.platform.shippingInfo} />
        </div>
      );
    case 'SAFETY_PANEL':
      return <SafetyPanel heading={block.heading} items={safetyItemsFrom(block)} />;
    case 'DATA_TABLE':
      return <DataTable block={block} />;
    case 'QUOTE':
      return <Quote block={block} />;
    case 'RELATED_GUIDES':
      return <RelatedGuides block={block} />;
    case 'COMPARISON':
      return <Comparison block={block} />;
    case 'CTA':
      return <CtaBlock block={block} ctx={ctx} />;
    default:
      return null;
  }
}

/**
 * Renders the modular review body: the optional markdown lead (for reviews
 * authored before the block system, kept fully supported) followed by the
 * ordered content blocks. Server rendered, images lazy-loaded via next/image.
 */
export function ReviewContentRenderer({
  leadMarkdown,
  blocks,
  context,
}: {
  leadMarkdown: string | null;
  blocks: ReviewBlockView[];
  context: RenderContext;
}) {
  const hasLead = Boolean(leadMarkdown && leadMarkdown.trim());
  if (!hasLead && blocks.length === 0) return null;

  return (
    <div className="space-y-10">
      {hasLead && <ReviewMarkdown>{leadMarkdown as string}</ReviewMarkdown>}
      {blocks.map((block) => (
        <div key={block.id}>{renderBlock(block, context)}</div>
      ))}
    </div>
  );
}
