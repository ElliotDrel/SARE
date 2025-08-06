export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          collection_goal: number | null
          collection_status:
            | Database["public"]["Enums"]["collection_status"]
            | null
          created_at: string
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          reflection_completed: boolean | null
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"] | null
        }
        Insert: {
          collection_goal?: number | null
          collection_status?:
            | Database["public"]["Enums"]["collection_status"]
            | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          reflection_completed?: boolean | null
          updated_at?: string
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Update: {
          collection_goal?: number | null
          collection_status?:
            | Database["public"]["Enums"]["collection_status"]
            | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          reflection_completed?: boolean | null
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          ai_insights: Json | null
          created_at: string
          generated_at: string | null
          id: string
          is_locked: boolean | null
          strengths_digest: string | null
          themes_summary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_insights?: Json | null
          created_at?: string
          generated_at?: string | null
          id?: string
          is_locked?: boolean | null
          strengths_digest?: string | null
          themes_summary?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_insights?: Json | null
          created_at?: string
          generated_at?: string | null
          id?: string
          is_locked?: boolean | null
          strengths_digest?: string | null
          themes_summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      self_reflections: {
        Row: {
          completed_at: string | null
          created_at: string
          evidence_response: string | null
          growth_themes_response: string | null
          id: string
          personal_narrative: string | null
          strengths_response: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          evidence_response?: string | null
          growth_themes_response?: string | null
          id?: string
          personal_narrative?: string | null
          strengths_response?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          evidence_response?: string | null
          growth_themes_response?: string | null
          id?: string
          personal_narrative?: string | null
          strengths_response?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          created_at: string
          id: string
          status: Database["public"]["Enums"]["story_status"] | null
          story_one: string
          story_three: string | null
          story_two: string | null
          storyteller_id: string
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["story_status"] | null
          story_one: string
          story_three?: string | null
          story_two?: string | null
          storyteller_id: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["story_status"] | null
          story_one?: string
          story_three?: string | null
          story_two?: string | null
          storyteller_id?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "storytellers"
            referencedColumns: ["id"]
          },
        ]
      }
      story_drafts: {
        Row: {
          auto_saved_at: string | null
          created_at: string
          id: string
          notes: string | null
          progress_metadata: Json | null
          story_one: string | null
          story_three: string | null
          story_two: string | null
          storyteller_id: string
          updated_at: string
        }
        Insert: {
          auto_saved_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          progress_metadata?: Json | null
          story_one?: string | null
          story_three?: string | null
          story_two?: string | null
          storyteller_id: string
          updated_at?: string
        }
        Update: {
          auto_saved_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          progress_metadata?: Json | null
          story_one?: string | null
          story_three?: string | null
          story_two?: string | null
          storyteller_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_drafts_storyteller_id_fkey"
            columns: ["storyteller_id"]
            isOneToOne: false
            referencedRelation: "storytellers"
            referencedColumns: ["id"]
          },
        ]
      }
      storytellers: {
        Row: {
          access_method: Database["public"]["Enums"]["access_method"] | null
          auth_user_id: string | null
          created_at: string
          email: string
          first_access_at: string | null
          id: string
          invitation_status:
            | Database["public"]["Enums"]["invitation_status"]
            | null
          invitation_token: string | null
          invited_at: string | null
          last_access_at: string | null
          last_contacted_at: string | null
          magic_link_sent_at: string | null
          name: string
          notes: string | null
          phone: string | null
          reminder_count: number | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_method?: Database["public"]["Enums"]["access_method"] | null
          auth_user_id?: string | null
          created_at?: string
          email: string
          first_access_at?: string | null
          id?: string
          invitation_status?:
            | Database["public"]["Enums"]["invitation_status"]
            | null
          invitation_token?: string | null
          invited_at?: string | null
          last_access_at?: string | null
          last_contacted_at?: string | null
          magic_link_sent_at?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          reminder_count?: number | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_method?: Database["public"]["Enums"]["access_method"] | null
          auth_user_id?: string | null
          created_at?: string
          email?: string
          first_access_at?: string | null
          id?: string
          invitation_status?:
            | Database["public"]["Enums"]["invitation_status"]
            | null
          invitation_token?: string | null
          invited_at?: string | null
          last_access_at?: string | null
          last_contacted_at?: string | null
          magic_link_sent_at?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          reminder_count?: number | null
          token_expires_at?: string | null
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
      can_view_stories: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      cleanup_expired_tokens: {
        Args: {}
        Returns: undefined
      }
      get_storyteller_by_email: {
        Args: { target_email: string }
        Returns: {
          id: string
          name: string
          email: string
          auth_user_id: string | null
          invitation_status: string | null
          access_method: string | null
          has_submitted: boolean
          has_draft: boolean
        }[]
      }
      get_user_story_count: {
        Args: { target_user_id: string }
        Returns: number
      }
      increment_reminder_count: {
        Args: { storyteller_id: string }
        Returns: number
      }
      update_storyteller_access: {
        Args: { storyteller_id: string; auth_user_id?: string }
        Returns: undefined
      }
    }
    Enums: {
      access_method: "pending" | "magic_link" | "return_user" | "direct_access"
      collection_status: "preparing" | "collecting" | "reflecting" | "completed"
      invitation_status:
        | "pending"
        | "sent"
        | "opened"
        | "submitted"
        | "reminded"
      story_status: "draft" | "submitted"
      user_type: "requester" | "storyteller"
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
      collection_status: ["preparing", "collecting", "reflecting", "completed"],
      invitation_status: ["pending", "sent", "opened", "submitted", "reminded"],
      story_status: ["draft", "submitted"],
    },
  },
} as const
