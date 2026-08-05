import type { OfferState } from '@/lib/reviews/offer-state';
import type { Json, OperatorTypeSlug, ReviewBlockType } from '@/lib/supabase/types';

export interface RatingCategory {
  label: string;
  score: number;
}

export interface ReviewFaqItem {
  question: string;
  answer: string;
}

export interface ReviewBlockView {
  id: string;
  type: ReviewBlockType;
  heading: string | null;
  body: string | null;
  mediaUrl: string | null;
  alt: string | null;
  caption: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  config: Json;
}

export interface PaymentMethodView {
  slug: string | null;
  name: string;
  kind: 'deposit' | 'withdrawal' | 'both';
}

export interface RelatedPlatformView {
  slug: string;
  name: string;
  logoUrl: string | null;
  rating: number | null;
  bestFor: string | null;
}

export interface OfferView {
  id: string;
  title: string;
  description: string | null;
  code: string | null;
  terms: string | null;
  termsUrl: string | null;
  eligibility: string | null;
  ctaLabel: string | null;
  exclusive: boolean;
  state: OfferState;
}

export interface PlatformView {
  id: string;
  slug: string;
  name: string;
  operatorType: OperatorTypeSlug;
  logoUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  heroImageUrl: string | null;
  rating: number | null;
  summary: string | null;
  websiteUrl: string | null;
  trackingUrl: string | null;
  foundedYear: number | null;
  owner: string | null;
  minAge: string | null;
  availability: string | null;
  kycRequired: string | null;
  buyback: string | null;
  mobileApp: string | null;
  shippingInfo: string | null;
  supportInfo: string | null;
  licenceAuthority: string | null;
  licenceNumber: string | null;
  pros: string[];
  cons: string[];
}

export interface ReviewView {
  id: string;
  summary: string | null;
  body: string | null;
  verdict: string | null;
  bestForTitle: string | null;
  bestForDescription: string | null;
  overallScore: number | null;
  scoreDescriptor: string | null;
  author: string | null;
  reviewer: string | null;
  publishedAt: string | null;
  updatedAt: string;
  lastCheckedAt: string | null;
  nextReviewAt: string | null;
  seoTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImageUrl: string | null;
  ratings: RatingCategory[];
  faqs: ReviewFaqItem[];
  blocks: ReviewBlockView[];
}

export interface ReviewPageData {
  platform: PlatformView;
  review: ReviewView;
  offer: OfferView | null;
  payments: PaymentMethodView[];
  related: RelatedPlatformView[];
  /** Affiliate link slug for tracked CTAs, when the operator has one. */
  affiliateSlug: string | null;
}
