// Hand-authored database types matching supabase/migrations.
//
// When the Supabase CLI is linked to the project you can regenerate this file
// with:  supabase gen types typescript --linked > src/lib/supabase/types.ts
// Until then, keep this in sync with the migrations by hand.

export type OperatorTypeSlug = 'physical_retail' | 'digital_unboxing';
export type PublishStatus = 'draft' | 'published';

export type ReviewBlockType =
  | 'RICH_TEXT'
  | 'IMAGE_LEFT'
  | 'IMAGE_RIGHT'
  | 'FULL_WIDTH_IMAGE'
  | 'SCREENSHOT_GALLERY'
  | 'FEATURE_GRID'
  | 'OFFER_CALLOUT'
  | 'PAYMENT_PANEL'
  | 'SHIPPING_PANEL'
  | 'SAFETY_PANEL'
  | 'DATA_TABLE'
  | 'QUOTE'
  | 'RELATED_GUIDES'
  | 'COMPARISON'
  | 'CTA';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      markets: {
        Row: {
          id: string;
          code: string;
          parent_id: string | null;
          name: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          parent_id?: string | null;
          name: string;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['markets']['Insert']>;
        Relationships: [];
      };
      operator_types: {
        Row: { id: string; slug: OperatorTypeSlug; name: string };
        Insert: { id?: string; slug: OperatorTypeSlug; name: string };
        Update: Partial<Database['public']['Tables']['operator_types']['Insert']>;
        Relationships: [];
      };
      operators: {
        Row: {
          id: string;
          slug: string;
          name: string;
          logo_url: string | null;
          operator_type_id: string;
          rating: number | null;
          tracking_url: string | null;
          licence_authority: string | null;
          licence_number: string | null;
          licence_verified_at: string | null;
          summary: string | null;
          pros: string[];
          cons: string[];
          active: boolean;
          created_at: string;
          updated_at: string;
          website_url: string | null;
          logo_light_url: string | null;
          logo_dark_url: string | null;
          hero_image_url: string | null;
          founded_year: number | null;
          owner: string | null;
          min_age: string | null;
          availability: string | null;
          kyc_required: string | null;
          buyback: string | null;
          mobile_app: string | null;
          shipping_info: string | null;
          support_info: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          logo_url?: string | null;
          operator_type_id: string;
          rating?: number | null;
          tracking_url?: string | null;
          licence_authority?: string | null;
          licence_number?: string | null;
          licence_verified_at?: string | null;
          summary?: string | null;
          pros?: string[];
          cons?: string[];
          active?: boolean;
          created_at?: string;
          updated_at?: string;
          website_url?: string | null;
          logo_light_url?: string | null;
          logo_dark_url?: string | null;
          hero_image_url?: string | null;
          founded_year?: number | null;
          owner?: string | null;
          min_age?: string | null;
          availability?: string | null;
          kyc_required?: string | null;
          buyback?: string | null;
          mobile_app?: string | null;
          shipping_info?: string | null;
          support_info?: string | null;
        };
        Update: Partial<Database['public']['Tables']['operators']['Insert']>;
        Relationships: [];
      };
      operator_markets: {
        Row: {
          operator_id: string;
          market_id: string;
          requires_geo_block: boolean;
          visible: boolean;
        };
        Insert: {
          operator_id: string;
          market_id: string;
          requires_geo_block?: boolean;
          visible?: boolean;
        };
        Update: Partial<Database['public']['Tables']['operator_markets']['Insert']>;
        Relationships: [];
      };
      offers: {
        Row: {
          id: string;
          operator_id: string;
          title: string;
          code: string | null;
          description: string | null;
          terms: string | null;
          starts_at: string | null;
          expires_at: string | null;
          active: boolean;
          cta_label: string | null;
          exclusive: boolean;
          eligibility: string | null;
          terms_url: string | null;
          last_verified_at: string | null;
        };
        Insert: {
          id?: string;
          operator_id: string;
          title: string;
          code?: string | null;
          description?: string | null;
          terms?: string | null;
          starts_at?: string | null;
          expires_at?: string | null;
          active?: boolean;
          cta_label?: string | null;
          exclusive?: boolean;
          eligibility?: string | null;
          terms_url?: string | null;
          last_verified_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['offers']['Insert']>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          market_id: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          market_id?: string | null;
        };
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
        Relationships: [];
      };
      operator_categories: {
        Row: { operator_id: string; category_id: string };
        Insert: { operator_id: string; category_id: string };
        Update: Partial<Database['public']['Tables']['operator_categories']['Insert']>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          operator_id: string;
          market_id: string;
          body: string | null;
          verdict: string | null;
          author: string | null;
          published_at: string | null;
          updated_at: string;
          status: PublishStatus;
          seo_title: string | null;
          meta_description: string | null;
          canonical_url: string | null;
          og_image_url: string | null;
          best_for_title: string | null;
          best_for_description: string | null;
          overall_score: number | null;
          score_descriptor: string | null;
          reviewer: string | null;
          last_checked_at: string | null;
          next_review_at: string | null;
        };
        Insert: {
          id?: string;
          operator_id: string;
          market_id: string;
          body?: string | null;
          verdict?: string | null;
          author?: string | null;
          published_at?: string | null;
          updated_at?: string;
          status?: PublishStatus;
          seo_title?: string | null;
          meta_description?: string | null;
          canonical_url?: string | null;
          og_image_url?: string | null;
          best_for_title?: string | null;
          best_for_description?: string | null;
          overall_score?: number | null;
          score_descriptor?: string | null;
          reviewer?: string | null;
          last_checked_at?: string | null;
          next_review_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
        Relationships: [];
      };
      review_ratings: {
        Row: { id: string; review_id: string; label: string; score: number; position: number };
        Insert: { id?: string; review_id: string; label: string; score: number; position?: number };
        Update: Partial<Database['public']['Tables']['review_ratings']['Insert']>;
        Relationships: [];
      };
      review_faqs: {
        Row: { id: string; review_id: string; question: string; answer: string; position: number };
        Insert: { id?: string; review_id: string; question: string; answer: string; position?: number };
        Update: Partial<Database['public']['Tables']['review_faqs']['Insert']>;
        Relationships: [];
      };
      review_blocks: {
        Row: {
          id: string;
          review_id: string;
          block_type: ReviewBlockType;
          position: number;
          heading: string | null;
          body: string | null;
          media_id: string | null;
          media_url: string | null;
          alt: string | null;
          caption: string | null;
          cta_label: string | null;
          cta_url: string | null;
          config: Json;
          visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          block_type: ReviewBlockType;
          position?: number;
          heading?: string | null;
          body?: string | null;
          media_id?: string | null;
          media_url?: string | null;
          alt?: string | null;
          caption?: string | null;
          cta_label?: string | null;
          cta_url?: string | null;
          config?: Json;
          visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['review_blocks']['Insert']>;
        Relationships: [];
      };
      operator_payment_methods: {
        Row: {
          id: string;
          operator_id: string;
          slug: string | null;
          name: string;
          kind: 'deposit' | 'withdrawal' | 'both';
          position: number;
        };
        Insert: {
          id?: string;
          operator_id: string;
          slug?: string | null;
          name: string;
          kind?: 'deposit' | 'withdrawal' | 'both';
          position?: number;
        };
        Update: Partial<Database['public']['Tables']['operator_payment_methods']['Insert']>;
        Relationships: [];
      };
      operator_related: {
        Row: { operator_id: string; related_operator_id: string; position: number };
        Insert: { operator_id: string; related_operator_id: string; position?: number };
        Update: Partial<Database['public']['Tables']['operator_related']['Insert']>;
        Relationships: [];
      };
      affiliate_clicks: {
        Row: {
          id: string;
          link_slug: string;
          operator_id: string | null;
          placement: string | null;
          cta_label: string | null;
          page_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          link_slug: string;
          operator_id?: string | null;
          placement?: string | null;
          cta_label?: string | null;
          page_path?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['affiliate_clicks']['Insert']>;
        Relationships: [];
      };
      pages: {
        Row: {
          id: string;
          slug: string;
          market_id: string;
          title: string;
          meta_description: string | null;
          body: string | null;
          status: PublishStatus;
          published_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          market_id: string;
          title: string;
          meta_description?: string | null;
          body?: string | null;
          status?: PublishStatus;
          published_at?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['pages']['Insert']>;
        Relationships: [];
      };
      admins: {
        Row: {
          id: string;
          user_id: string | null;
          email: string;
          name: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          email: string;
          name?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['admins']['Insert']>;
        Relationships: [];
      };
      media: {
        Row: {
          id: string;
          bucket: string;
          path: string;
          url: string | null;
          alt: string | null;
          title: string | null;
          mime_type: string | null;
          size_bytes: number | null;
          width: number | null;
          height: number | null;
          uploaded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bucket?: string;
          path: string;
          url?: string | null;
          alt?: string | null;
          title?: string | null;
          mime_type?: string | null;
          size_bytes?: number | null;
          width?: number | null;
          height?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['media']['Insert']>;
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          slug: string;
          market_id: string;
          title: string;
          excerpt: string | null;
          body: string | null;
          meta_description: string | null;
          cover_media_id: string | null;
          author: string | null;
          status: PublishStatus;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          market_id: string;
          title: string;
          excerpt?: string | null;
          body?: string | null;
          meta_description?: string | null;
          cover_media_id?: string | null;
          author?: string | null;
          status?: PublishStatus;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['posts']['Insert']>;
        Relationships: [];
      };
      affiliate_links: {
        Row: {
          id: string;
          slug: string;
          label: string;
          operator_id: string | null;
          market_id: string | null;
          target_url: string;
          rel: string;
          active: boolean;
          clicks: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          label: string;
          operator_id?: string | null;
          market_id?: string | null;
          target_url: string;
          rel?: string;
          active?: boolean;
          clicks?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['affiliate_links']['Insert']>;
        Relationships: [];
      };
      menu_items: {
        Row: {
          id: string;
          market_id: string;
          location: string;
          parent_id: string | null;
          label: string;
          url: string | null;
          position: number;
          open_in_new: boolean;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          market_id: string;
          location?: string;
          parent_id?: string | null;
          label: string;
          url?: string | null;
          position?: number;
          open_in_new?: boolean;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['menu_items']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_affiliate_click: {
        Args: { link_slug: string };
        Returns: undefined;
      };
      record_affiliate_click: {
        Args: {
          link_slug: string;
          placement?: string | null;
          cta_label?: string | null;
          page_path?: string | null;
        };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Convenience row aliases used across the app.
export type MarketRow = Database['public']['Tables']['markets']['Row'];
export type OperatorTypeRow = Database['public']['Tables']['operator_types']['Row'];
export type OperatorRow = Database['public']['Tables']['operators']['Row'];
export type OperatorMarketRow = Database['public']['Tables']['operator_markets']['Row'];
export type OfferRow = Database['public']['Tables']['offers']['Row'];
export type CategoryRow = Database['public']['Tables']['categories']['Row'];
export type ReviewRow = Database['public']['Tables']['reviews']['Row'];
export type PageRow = Database['public']['Tables']['pages']['Row'];
export type AdminRow = Database['public']['Tables']['admins']['Row'];
export type MediaRow = Database['public']['Tables']['media']['Row'];
export type PostRow = Database['public']['Tables']['posts']['Row'];
export type AffiliateLinkRow = Database['public']['Tables']['affiliate_links']['Row'];
export type MenuItemRow = Database['public']['Tables']['menu_items']['Row'];
export type ReviewRatingRow = Database['public']['Tables']['review_ratings']['Row'];
export type ReviewFaqRow = Database['public']['Tables']['review_faqs']['Row'];
export type ReviewBlockRow = Database['public']['Tables']['review_blocks']['Row'];
export type OperatorPaymentMethodRow =
  Database['public']['Tables']['operator_payment_methods']['Row'];
export type OperatorRelatedRow = Database['public']['Tables']['operator_related']['Row'];
export type AffiliateClickRow = Database['public']['Tables']['affiliate_clicks']['Row'];
