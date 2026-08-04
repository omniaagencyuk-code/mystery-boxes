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
      };
      operator_types: {
        Row: { id: string; slug: OperatorTypeSlug; name: string };
        Insert: { id?: string; slug: OperatorTypeSlug; name: string };
        Update: Partial<Database['public']['Tables']['operator_types']['Insert']>;
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
      };
      operator_categories: {
        Row: { operator_id: string; category_id: string };
        Insert: { operator_id: string; category_id: string };
        Update: Partial<Database['public']['Tables']['operator_categories']['Insert']>;
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
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
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
