export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      weddings: {
        Row: {
          id: string;
          user_id: string;
          partner1_name: string;
          partner2_name: string;
          wedding_date: string;
          venue: string;
          city: string;
          total_budget: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          partner1_name: string;
          partner2_name: string;
          wedding_date: string;
          venue?: string;
          city?: string;
          total_budget?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          partner1_name?: string;
          partner2_name?: string;
          wedding_date?: string;
          venue?: string;
          city?: string;
          total_budget?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          wedding_id: string;
          text: string;
          completed: boolean;
          priority: 'high' | 'medium' | 'low';
          due_date: string | null;
          assignee: string;
          category: string;
          github_issue_number: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          text: string;
          completed?: boolean;
          priority?: 'high' | 'medium' | 'low';
          due_date?: string | null;
          assignee?: string;
          category?: string;
          github_issue_number?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          text?: string;
          completed?: boolean;
          priority?: 'high' | 'medium' | 'low';
          due_date?: string | null;
          assignee?: string;
          category?: string;
          github_issue_number?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      budget_items: {
        Row: {
          id: string;
          wedding_id: string;
          category: string;
          vendor_name: string;
          allocated: number;
          spent: number;
          paid: boolean;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          category: string;
          vendor_name?: string;
          allocated?: number;
          spent?: number;
          paid?: boolean;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          category?: string;
          vendor_name?: string;
          allocated?: number;
          spent?: number;
          paid?: boolean;
          notes?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      guests: {
        Row: {
          id: string;
          wedding_id: string;
          name: string;
          email: string;
          phone: string;
          side: 'bride' | 'groom' | 'mutual';
          guest_group: string;
          rsvp_status: 'accepted' | 'declined' | 'pending' | 'maybe';
          plus_ones: number;
          dietary: string;
          table_number: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          name: string;
          email?: string;
          phone?: string;
          side?: 'bride' | 'groom' | 'mutual';
          guest_group?: string;
          rsvp_status?: 'accepted' | 'declined' | 'pending' | 'maybe';
          plus_ones?: number;
          dietary?: string;
          table_number?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          name?: string;
          email?: string;
          phone?: string;
          side?: 'bride' | 'groom' | 'mutual';
          guest_group?: string;
          rsvp_status?: 'accepted' | 'declined' | 'pending' | 'maybe';
          plus_ones?: number;
          dietary?: string;
          table_number?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      vendors: {
        Row: {
          id: string;
          wedding_id: string;
          name: string;
          category: string;
          phone: string;
          email: string;
          cost: number;
          status: 'booked' | 'pending' | 'cancelled' | 'contacted';
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          name: string;
          category?: string;
          phone?: string;
          email?: string;
          cost?: number;
          status?: 'booked' | 'pending' | 'cancelled' | 'contacted';
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          name?: string;
          category?: string;
          phone?: string;
          email?: string;
          cost?: number;
          status?: 'booked' | 'pending' | 'cancelled' | 'contacted';
          notes?: string;
          created_at?: string;
        };
         Relationships: [];
      };
      wedding_sites: {
        Row: {
          id: string;
          wedding_id: string;
          slug: string;
          template_id: string;
          sections: WeddingSiteSection[];
          is_published: boolean;
          custom_story: string;
          custom_events: WeddingSiteEvent[];
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          slug: string;
          template_id?: string;
          sections?: WeddingSiteSection[];
          is_published?: boolean;
          custom_story?: string;
          custom_events?: WeddingSiteEvent[];
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          slug?: string;
          template_id?: string;
          sections?: WeddingSiteSection[];
          is_published?: boolean;
          custom_story?: string;
          custom_events?: WeddingSiteEvent[];
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_rsvps: {
        Row: {
          id: string;
          wedding_site_id: string;
          wedding_id: string;
          name: string;
          email: string;
          rsvp_status: 'accepted' | 'declined';
          plus_ones: number;
          dietary: string;
          blessing: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          wedding_site_id: string;
          wedding_id: string;
          name: string;
          email?: string;
          rsvp_status?: 'accepted' | 'declined';
          plus_ones?: number;
          dietary?: string;
          blessing?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          wedding_site_id?: string;
          wedding_id?: string;
          name?: string;
          email?: string;
          rsvp_status?: 'accepted' | 'declined';
          plus_ones?: number;
          dietary?: string;
          blessing?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Wedding Site sub-types (stored as JSONB)
export interface WeddingSiteSection {
  id: string;
  title: string;
  icon: string;
  enabled: boolean;
  content: string;
}

export interface WeddingSiteEvent {
  id: string;
  name: string;
  icon: string;
  date: string;
  time: string;
  venue: string;
  dressCode: string;
  description: string;
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Wedding = Database['public']['Tables']['weddings']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type BudgetItem = Database['public']['Tables']['budget_items']['Row'];
export type Guest = Database['public']['Tables']['guests']['Row'];
export type Vendor = Database['public']['Tables']['vendors']['Row'];
export type WeddingSite = Database['public']['Tables']['wedding_sites']['Row'];
export type SiteRsvp = Database['public']['Tables']['site_rsvps']['Row'];
