/**
 * TypeScript types for Supabase database schema
 * Generated based on the betting tips database structure
 */

export interface Database {
  public: {
    Tables: {
      tips: {
        Row: {
          id: string
          date_iso: string
          bet_type: 'single' | 'accumulator'
          risk: 'safe' | 'medium' | 'high'
          rationale: string
          result: 'pending' | 'win' | 'loss' | 'void'
          combined_avg_odds: number | null
          combined_bookmakers: Json | null
          created_at: string
          updated_at: string
          generated_by: string
        }
        Insert: {
          id: string
          date_iso: string
          bet_type: 'single' | 'accumulator'
          risk: 'safe' | 'medium' | 'high'
          rationale: string
          result?: 'pending' | 'win' | 'loss' | 'void'
          combined_avg_odds?: number | null
          combined_bookmakers?: Json | null
          created_at?: string
          updated_at?: string
          generated_by?: string
        }
        Update: {
          id?: string
          date_iso?: string
          bet_type?: 'single' | 'accumulator'
          risk?: 'safe' | 'medium' | 'high'
          rationale?: string
          result?: 'pending' | 'win' | 'loss' | 'void'
          combined_avg_odds?: number | null
          combined_bookmakers?: Json | null
          created_at?: string
          updated_at?: string
          generated_by?: string
        }
      }
      tip_legs: {
        Row: {
          id: string
          tip_id: string
          leg_index: number
          sport: string
          league: string | null
          event_name: string
          home_team: string | null
          away_team: string | null
          scheduled_at: string
          timezone: string | null
          market: string
          selection: string
          avg_odds: number
        }
        Insert: {
          id?: string
          tip_id: string
          leg_index?: number
          sport: string
          league?: string | null
          event_name: string
          home_team?: string | null
          away_team?: string | null
          scheduled_at: string
          timezone?: string | null
          market: string
          selection: string
          avg_odds: number
        }
        Update: {
          id?: string
          tip_id?: string
          leg_index?: number
          sport?: string
          league?: string | null
          event_name?: string
          home_team?: string | null
          away_team?: string | null
          scheduled_at?: string
          timezone?: string | null
          market?: string
          selection?: string
          avg_odds?: number
        }
      }
      bookmaker_odds: {
        Row: {
          id: string
          tip_leg_id: string
          bookmaker_name: string
          odds: number
          bookmaker_url: string | null
        }
        Insert: {
          id?: string
          tip_leg_id: string
          bookmaker_name: string
          odds: number
          bookmaker_url?: string | null
        }
        Update: {
          id?: string
          tip_leg_id?: string
          bookmaker_name?: string
          odds?: number
          bookmaker_url?: string | null
        }
      }
      daily_metadata: {
        Row: {
          date_iso: string
          version: number
          generated_at: string
          generated_by: string
          seo_title: string | null
          seo_description: string | null
          tips_count: number
          safe_tips_count: number
          medium_tips_count: number
          high_tips_count: number
        }
        Insert: {
          date_iso: string
          version?: number
          generated_at?: string
          generated_by?: string
          seo_title?: string | null
          seo_description?: string | null
          tips_count?: number
          safe_tips_count?: number
          medium_tips_count?: number
          high_tips_count?: number
        }
        Update: {
          date_iso?: string
          version?: number
          generated_at?: string
          generated_by?: string
          seo_title?: string | null
          seo_description?: string | null
          tips_count?: number
          safe_tips_count?: number
          medium_tips_count?: number
          high_tips_count?: number
        }
      }
    }
    Views: {
      v_tips_complete: {
        Row: {
          id: string
          date_iso: string
          bet_type: 'single' | 'accumulator'
          risk: 'safe' | 'medium' | 'high'
          rationale: string
          result: 'pending' | 'win' | 'loss' | 'void'
          combined_avg_odds: number | null
          combined_bookmakers: Json | null
          created_at: string
          updated_at: string
          generated_by: string
          legs: Json
        }
      }
      v_daily_summary: {
        Row: {
          date_iso: string
          version: number
          generated_at: string
          generated_by: string
          seo_title: string | null
          seo_description: string | null
          tips_count: number
          safe_tips_count: number
          medium_tips_count: number
          high_tips_count: number
          actual_tips_count: number
          wins: number
          losses: number
          pending: number
          voids: number
          win_rate_percentage: number | null
        }
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Helper types
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never
