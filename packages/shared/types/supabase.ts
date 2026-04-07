export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      addon_entitlements: {
        Row: {
          addon_id: string
          entitlement_key: string
          id: string
        }
        Insert: {
          addon_id: string
          entitlement_key: string
          id?: string
        }
        Update: {
          addon_id?: string
          entitlement_key?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "addon_entitlements_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "addons"
            referencedColumns: ["id"]
          },
        ]
      }
      addon_purchases: {
        Row: {
          addon_id: string
          amount: number
          created_at: string
          id: string
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          addon_id: string
          amount?: number
          created_at?: string
          id?: string
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          addon_id?: string
          amount?: number
          created_at?: string
          id?: string
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "addon_purchases_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "addons"
            referencedColumns: ["id"]
          },
        ]
      }
      addons: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          grants_core_months: number | null
          id: string
          plan: string
          price: number
          status: string
          stripe_price_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          grants_core_months?: number | null
          id?: string
          plan?: string
          price?: number
          status?: string
          stripe_price_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          grants_core_months?: number | null
          id?: string
          plan?: string
          price?: number
          status?: string
          stripe_price_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_global_usage: {
        Row: {
          month: string
          tokens_used: number
          updated_at: string
        }
        Insert: {
          month: string
          tokens_used?: number
          updated_at?: string
        }
        Update: {
          month?: string
          tokens_used?: number
          updated_at?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          safety_category: string | null
          session_id: string
          tokens_in: number | null
          tokens_out: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          safety_category?: string | null
          session_id: string
          tokens_in?: number | null
          tokens_out?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          safety_category?: string | null
          session_id?: string
          tokens_in?: number | null
          tokens_out?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_quotas: {
        Row: {
          day: string
          messages_used: number
          tokens_used: number
          user_id: string
        }
        Insert: {
          day: string
          messages_used?: number
          tokens_used?: number
          user_id: string
        }
        Update: {
          day?: string
          messages_used?: number
          tokens_used?: number
          user_id?: string
        }
        Relationships: []
      }
      ai_sessions: {
        Row: {
          created_at: string
          id: string
          status: string
          tone: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          tone: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          tone?: string
          user_id?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      benefit_clicks: {
        Row: {
          benefit_id: string
          created_at: string
          id: string
          meta: Json
          user_id: string | null
        }
        Insert: {
          benefit_id: string
          created_at?: string
          id?: string
          meta?: Json
          user_id?: string | null
        }
        Update: {
          benefit_id?: string
          created_at?: string
          id?: string
          meta?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "benefit_clicks_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
        ]
      }
      benefits: {
        Row: {
          code: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          plan: string
          position: number
          status: string
          title: string
          updated_at: string | null
          url: string
          utm_template: string | null
        }
        Insert: {
          code?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          plan?: string
          position?: number
          status?: string
          title: string
          updated_at?: string | null
          url: string
          utm_template?: string | null
        }
        Update: {
          code?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          plan?: string
          position?: number
          status?: string
          title?: string
          updated_at?: string | null
          url?: string
          utm_template?: string | null
        }
        Relationships: []
      }
      content_categories: {
        Row: {
          created_at: string
          description: string | null
          icon_url: string | null
          id: string
          is_active: boolean
          slug: string
          sort_order: number
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          slug: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          slug?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      content_item_categories: {
        Row: {
          category_id: string
          content_item_id: string
          id: string
          position: number
        }
        Insert: {
          category_id: string
          content_item_id: string
          id?: string
          position?: number
        }
        Update: {
          category_id?: string
          content_item_id?: string
          id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_item_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_item_categories_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      content_item_objectives: {
        Row: {
          content_item_id: string
          id: string
          objective_id: string
          position: number
        }
        Insert: {
          content_item_id: string
          id?: string
          objective_id: string
          position?: number
        }
        Update: {
          content_item_id?: string
          id?: string
          objective_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_item_objectives_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "content_objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_item_objectives_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items: {
        Row: {
          available_from: string | null
          available_to: string | null
          body: string | null
          community_segment: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_seconds: number | null
          entitlement_key: string | null
          external_url: string | null
          id: string
          media_url: string | null
          objective_id: string | null
          plan: string
          published_at: string | null
          status: string
          subtitle: string | null
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          available_from?: string | null
          available_to?: string | null
          body?: string | null
          community_segment?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_seconds?: number | null
          entitlement_key?: string | null
          external_url?: string | null
          id?: string
          media_url?: string | null
          objective_id?: string | null
          plan?: string
          published_at?: string | null
          status?: string
          subtitle?: string | null
          thumbnail_url?: string | null
          title: string
          type: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          available_from?: string | null
          available_to?: string | null
          body?: string | null
          community_segment?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_seconds?: number | null
          entitlement_key?: string | null
          external_url?: string | null
          id?: string
          media_url?: string | null
          objective_id?: string | null
          plan?: string
          published_at?: string | null
          status?: string
          subtitle?: string | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_items_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "content_objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      content_objectives: {
        Row: {
          id: string
          position: number
          slug: string
          title: string
        }
        Insert: {
          id?: string
          position?: number
          slug: string
          title: string
        }
        Update: {
          id?: string
          position?: number
          slug?: string
          title?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          created_at: string
          date: string
          id: string
          payload: Json
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          payload?: Json
          type: string
          user_id?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          payload?: Json
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_plans: {
        Row: {
          badge_subtitle: string | null
          badge_title: string | null
          community_segment: string | null
          created_at: string
          created_by: string | null
          date: string
          id: string
          primary_action_payload: Json
          primary_action_ref: string | null
          primary_action_type: string
          status: string
          updated_at: string | null
        }
        Insert: {
          badge_subtitle?: string | null
          badge_title?: string | null
          community_segment?: string | null
          created_at?: string
          created_by?: string | null
          date: string
          id?: string
          primary_action_payload?: Json
          primary_action_ref?: string | null
          primary_action_type: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          badge_subtitle?: string | null
          badge_title?: string | null
          community_segment?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          id?: string
          primary_action_payload?: Json
          primary_action_ref?: string | null
          primary_action_type?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          community_segment: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          duration: string | null
          end_at: string | null
          entitlement_key: string | null
          id: string
          plan: string | null
          start_at: string
          status: string
          title: string
          updated_at: string | null
          vimeo_id: string | null
          vimeo_live_event_id: string | null
          vimeo_url: string | null
        }
        Insert: {
          community_segment?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          end_at?: string | null
          entitlement_key?: string | null
          id?: string
          plan?: string | null
          start_at: string
          status?: string
          title: string
          updated_at?: string | null
          vimeo_id?: string | null
          vimeo_live_event_id?: string | null
          vimeo_url?: string | null
        }
        Update: {
          community_segment?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          end_at?: string | null
          entitlement_key?: string | null
          id?: string
          plan?: string | null
          start_at?: string
          status?: string
          title?: string
          updated_at?: string | null
          vimeo_id?: string | null
          vimeo_live_event_id?: string | null
          vimeo_url?: string | null
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          answers: Json
          created_at: string
          form_id: string
          id: string
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          form_id: string
          id?: string
          user_id?: string
        }
        Update: {
          answers?: Json
          created_at?: string
          form_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          created_at: string
          description: string | null
          fields: Json
          id: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          fields?: Json
          id?: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          fields?: Json
          id?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          id: string
          meta: Json
          stripe_event_id: string
          stripe_object_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          meta?: Json
          stripe_event_id: string
          stripe_object_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          meta?: Json
          stripe_event_id?: string
          stripe_object_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          body: string
          created_at: string
          id: string
          post_id: string
          status: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          post_id: string
          status?: string
          user_id?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reaction: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reaction: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reaction?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_user_id: string | null
          body: string
          community_segment: string | null
          created_at: string
          id: string
          is_official: boolean
          media_url: string | null
          status: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          author_user_id?: string | null
          body: string
          community_segment?: string | null
          created_at?: string
          id?: string
          is_official?: boolean
          media_url?: string | null
          status?: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          author_user_id?: string | null
          body?: string
          community_segment?: string | null
          created_at?: string
          id?: string
          is_official?: boolean
          media_url?: string | null
          status?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          community_segment: string
          created_at: string
          display_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          community_segment: string
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          community_segment?: string
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      program_checkins: {
        Row: {
          created_at: string
          day_index: number
          id: string
          payload: Json
          program_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_index: number
          id?: string
          payload?: Json
          program_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          day_index?: number
          id?: string
          payload?: Json
          program_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_checkins_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      program_day_items: {
        Row: {
          content_item_id: string | null
          form_id: string | null
          id: string
          position: number
          program_day_id: string
          type: string
        }
        Insert: {
          content_item_id?: string | null
          form_id?: string | null
          id?: string
          position?: number
          program_day_id: string
          type?: string
        }
        Update: {
          content_item_id?: string | null
          form_id?: string | null
          id?: string
          position?: number
          program_day_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_day_items_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_day_items_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_day_items_program_day_id_fkey"
            columns: ["program_day_id"]
            isOneToOne: false
            referencedRelation: "program_days"
            referencedColumns: ["id"]
          },
        ]
      }
      program_days: {
        Row: {
          day_index: number
          description: string | null
          id: string
          program_id: string
          title: string | null
        }
        Insert: {
          day_index: number
          description?: string | null
          id?: string
          program_id: string
          title?: string | null
        }
        Update: {
          day_index?: number
          description?: string | null
          id?: string
          program_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_days_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      program_enrollments: {
        Row: {
          enrolled_at: string
          id: string
          program_id: string
          status: string
          user_id: string
        }
        Insert: {
          enrolled_at?: string
          id?: string
          program_id: string
          status?: string
          user_id?: string
        }
        Update: {
          enrolled_at?: string
          id?: string
          program_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_enrollments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          community_segment: string | null
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          entitlement_key: string | null
          id: string
          is_active: boolean
          plan: string
          start_date: string | null
          status: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          community_segment?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          entitlement_key?: string | null
          id?: string
          is_active?: boolean
          plan?: string
          start_date?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          community_segment?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          entitlement_key?: string | null
          id?: string
          is_active?: boolean
          plan?: string
          start_date?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          id: string
          title: string
          description: string | null
          price: number
          interval: string
          cover_url: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          title: string
          description?: string | null
          price?: number
          interval?: string
          cover_url?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          price?: number
          interval?: string
          cover_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          current_period_end: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          current_period_end?: string | null
          id?: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          current_period_end?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_entitlements: {
        Row: {
          created_at: string
          entitlement_key: string
          id: string
          source: string
          source_ref: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          entitlement_key: string
          id?: string
          source: string
          source_ref?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          entitlement_key?: string
          id?: string
          source?: string
          source_ref?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          best_streak: number
          current_streak: number
          last_checkin_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          best_streak?: number
          current_streak?: number
          last_checkin_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          best_streak?: number
          current_streak?: number
          last_checkin_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_hoy_page: {
        Args: { p_date?: string }
        Returns: Json
      }
      count_completed_days: { Args: Record<PropertyKey, never>; Returns: number }
      get_subscriber_user_ids: { Args: Record<PropertyKey, never>; Returns: string[] }
      check_email_exists: { Args: { p_email: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      search_content: {
        Args: { search_query: string; max_results?: number }
        Returns: {
          id: string
          title: string
          type: string
          duration_seconds: number | null
          thumbnail_url: string | null
          entitlement_key: string | null
          category_title: string | null
          rank: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

