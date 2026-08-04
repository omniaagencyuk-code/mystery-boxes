// Hand-authored database types matching supabase/migrations.
//
// When the Supabase CLI is linked to the project you can regenerate this file
// with:  supabase gen types typescript --linked > src/lib/supabase/types.ts
// Until then, keep this in sync with the migrations by hand.

export type OperatorTypeSlug = 'physical_retail' | 'digital_unboxing';
export type PublishStatus = 'draft' | 'published';

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
        };
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
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
