export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      event_songs: {
        Row: {
          created_at: string
          custom_key: string | null
          event_id: string
          id: string
          moment: string
          order_index: number
          selected_by: Database["public"]["Enums"]["selected_by"]
          song_id: string
          status: Database["public"]["Enums"]["event_song_status"]
        }
        Insert: {
          created_at?: string
          custom_key?: string | null
          event_id: string
          id?: string
          moment: string
          order_index?: number
          selected_by?: Database["public"]["Enums"]["selected_by"]
          song_id: string
          status?: Database["public"]["Enums"]["event_song_status"]
        }
        Update: {
          created_at?: string
          custom_key?: string | null
          event_id?: string
          id?: string
          moment?: string
          order_index?: number
          selected_by?: Database["public"]["Enums"]["selected_by"]
          song_id?: string
          status?: Database["public"]["Enums"]["event_song_status"]
        }
        Relationships: [
          {
            foreignKeyName: "event_songs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          access_code: string
          ceremony_type: string | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          contact_whatsapp: string | null
          couple_name: string
          couple_notes: string | null
          created_at: string
          event_date: string
          event_time: string | null
          event_type: Database["public"]["Enums"]["event_type"] | null
          fee: number | null
          formation: string | null
          id: string
          internal_notes: string | null
          photos: Json | null
          selection_deadline: string | null
          stars_rating: number | null
          status: Database["public"]["Enums"]["event_status"]
          testimonial: string | null
          updated_at: string
          venue: string | null
        }
        Insert: {
          access_code: string
          ceremony_type?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          couple_name: string
          couple_notes?: string | null
          created_at?: string
          event_date: string
          event_time?: string | null
          event_type?: Database["public"]["Enums"]["event_type"] | null
          fee?: number | null
          formation?: string | null
          id?: string
          internal_notes?: string | null
          photos?: Json | null
          selection_deadline?: string | null
          stars_rating?: number | null
          status?: Database["public"]["Enums"]["event_status"]
          testimonial?: string | null
          updated_at?: string
          venue?: string | null
        }
        Update: {
          access_code?: string
          ceremony_type?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          couple_name?: string
          couple_notes?: string | null
          created_at?: string
          event_date?: string
          event_time?: string | null
          event_type?: Database["public"]["Enums"]["event_type"] | null
          fee?: number | null
          formation?: string | null
          id?: string
          internal_notes?: string | null
          photos?: Json | null
          selection_deadline?: string | null
          stars_rating?: number | null
          status?: Database["public"]["Enums"]["event_status"]
          testimonial?: string | null
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      rehearsals: {
        Row: {
          agenda: string[] | null
          created_at: string
          done: boolean
          event_id: string | null
          id: string
          location: string | null
          members_present: string[] | null
          notes: string | null
          rehearsal_date: string
          rehearsal_time: string | null
        }
        Insert: {
          agenda?: string[] | null
          created_at?: string
          done?: boolean
          event_id?: string | null
          id?: string
          location?: string | null
          members_present?: string[] | null
          notes?: string | null
          rehearsal_date: string
          rehearsal_time?: string | null
        }
        Update: {
          agenda?: string[] | null
          created_at?: string
          done?: boolean
          event_id?: string | null
          id?: string
          location?: string | null
          members_present?: string[] | null
          notes?: string | null
          rehearsal_date?: string
          rehearsal_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rehearsals_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      song_suggestions: {
        Row: {
          artist: string | null
          couple_notes: string | null
          created_at: string
          event_id: string
          id: string
          moment: string | null
          song_title: string
          status: Database["public"]["Enums"]["suggestion_status"]
        }
        Insert: {
          artist?: string | null
          couple_notes?: string | null
          created_at?: string
          event_id: string
          id?: string
          moment?: string | null
          song_title: string
          status?: Database["public"]["Enums"]["suggestion_status"]
        }
        Update: {
          artist?: string | null
          couple_notes?: string | null
          created_at?: string
          event_id?: string
          id?: string
          moment?: string | null
          song_title?: string
          status?: Database["public"]["Enums"]["suggestion_status"]
        }
        Relationships: [
          {
            foreignKeyName: "song_suggestions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      songs: {
        Row: {
          arrangement_notes: string | null
          artist: string | null
          band_key: string | null
          created_at: string
          genre: Database["public"]["Enums"]["song_genre"] | null
          id: string
          is_active: boolean
          moments: string[] | null
          original_key: string | null
          sheet_url: string | null
          times_played: number
          title: string
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          arrangement_notes?: string | null
          artist?: string | null
          band_key?: string | null
          created_at?: string
          genre?: Database["public"]["Enums"]["song_genre"] | null
          id?: string
          is_active?: boolean
          moments?: string[] | null
          original_key?: string | null
          sheet_url?: string | null
          times_played?: number
          title: string
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          arrangement_notes?: string | null
          artist?: string | null
          band_key?: string | null
          created_at?: string
          genre?: Database["public"]["Enums"]["song_genre"] | null
          id?: string
          is_active?: boolean
          moments?: string[] | null
          original_key?: string | null
          sheet_url?: string | null
          times_played?: number
          title?: string
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_band_member: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "banda"
      event_song_status: "planned" | "played" | "skipped" | "replaced"
      event_status: "confirmed" | "pending" | "cancelled" | "done"
      event_type: "religious" | "civil" | "mixed"
      selected_by: "band" | "couple"
      song_genre:
        | "catholic"
        | "classical"
        | "pop"
        | "gospel"
        | "mpb"
        | "jazz"
        | "soul"
      suggestion_status: "pending" | "approved" | "rejected"
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
  public: {
    Enums: {
      app_role: ["admin", "banda"],
      event_song_status: ["planned", "played", "skipped", "replaced"],
      event_status: ["confirmed", "pending", "cancelled", "done"],
      event_type: ["religious", "civil", "mixed"],
      selected_by: ["band", "couple"],
      song_genre: [
        "catholic",
        "classical",
        "pop",
        "gospel",
        "mpb",
        "jazz",
        "soul",
      ],
      suggestion_status: ["pending", "approved", "rejected"],
    },
  },
} as const
