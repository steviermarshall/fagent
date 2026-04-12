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
      agent_comms: {
        Row: {
          from_agent: string
          id: string
          message: string
          timestamp: string | null
          to_agent: string
        }
        Insert: {
          from_agent: string
          id?: string
          message: string
          timestamp?: string | null
          to_agent: string
        }
        Update: {
          from_agent?: string
          id?: string
          message?: string
          timestamp?: string | null
          to_agent?: string
        }
        Relationships: []
      }
      agents: {
        Row: {
          agent_id: string
          created_at: string | null
          current_activity: string | null
          emoji: string
          last_seen: string | null
          name: string
          ring_color: string | null
          skills: string[] | null
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          agent_id?: string
          created_at?: string | null
          current_activity?: string | null
          emoji: string
          last_seen?: string | null
          name: string
          ring_color?: string | null
          skills?: string[] | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          current_activity?: string | null
          emoji?: string
          last_seen?: string | null
          name?: string
          ring_color?: string | null
          skills?: string[] | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      approval_queue: {
        Row: {
          approved_at: string | null
          company: string | null
          contact_name: string | null
          created_at: string | null
          dismissed_at: string | null
          email: string | null
          id: string
          phone: string | null
          sheet_source: string | null
          status: string | null
          suggested_email_body: string | null
          suggested_email_subject: string | null
          suggested_sms: string | null
          trigger_reason: string | null
        }
        Insert: {
          approved_at?: string | null
          company?: string | null
          contact_name?: string | null
          created_at?: string | null
          dismissed_at?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          sheet_source?: string | null
          status?: string | null
          suggested_email_body?: string | null
          suggested_email_subject?: string | null
          suggested_sms?: string | null
          trigger_reason?: string | null
        }
        Update: {
          approved_at?: string | null
          company?: string | null
          contact_name?: string | null
          created_at?: string | null
          dismissed_at?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          sheet_source?: string | null
          status?: string | null
          suggested_email_body?: string | null
          suggested_email_subject?: string | null
          suggested_sms?: string | null
          trigger_reason?: string | null
        }
        Relationships: []
      }
      board_columns: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          position: number
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          position?: number
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          position?: number
        }
        Relationships: []
      }
      council_sessions: {
        Row: {
          created_at: string | null
          id: string
          messages: Json | null
          participants: Json | null
          question: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          messages?: Json | null
          participants?: Json | null
          question: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          messages?: Json | null
          participants?: Json | null
          question?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      crossref_matches: {
        Row: {
          id: string
          last_scan: string
          match_count: number
          sheet_a: string
          sheet_b: string
        }
        Insert: {
          id?: string
          last_scan?: string
          match_count?: number
          sheet_a: string
          sheet_b: string
        }
        Update: {
          id?: string
          last_scan?: string
          match_count?: number
          sheet_a?: string
          sheet_b?: string
        }
        Relationships: []
      }
      daily_reports: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          report_date: string | null
          report_type: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          report_date?: string | null
          report_type: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          report_date?: string | null
          report_type?: string
        }
        Relationships: []
      }
      email_metrics: {
        Row: {
          bounced: number
          clicked: number
          created_at: string
          daily_target: number
          date: string
          day1_count: number
          day3_count: number
          day7_count: number
          delivered: number
          id: string
          opened: number
          replied: number
          sent: number
          updated_at: string
          warmup_day: number
        }
        Insert: {
          bounced?: number
          clicked?: number
          created_at?: string
          daily_target?: number
          date?: string
          day1_count?: number
          day3_count?: number
          day7_count?: number
          delivered?: number
          id?: string
          opened?: number
          replied?: number
          sent?: number
          updated_at?: string
          warmup_day?: number
        }
        Update: {
          bounced?: number
          clicked?: number
          created_at?: string
          daily_target?: number
          date?: string
          day1_count?: number
          day3_count?: number
          day7_count?: number
          delivered?: number
          id?: string
          opened?: number
          replied?: number
          sent?: number
          updated_at?: string
          warmup_day?: number
        }
        Relationships: []
      }
      engagement_rates: {
        Row: {
          bounce_rate: number
          click_rate: number
          created_at: string
          date: string
          drop_rate: number
          id: string
          open_rate: number
          reply_rate: number
        }
        Insert: {
          bounce_rate?: number
          click_rate?: number
          created_at?: string
          date?: string
          drop_rate?: number
          id?: string
          open_rate?: number
          reply_rate?: number
        }
        Update: {
          bounce_rate?: number
          click_rate?: number
          created_at?: string
          date?: string
          drop_rate?: number
          id?: string
          open_rate?: number
          reply_rate?: number
        }
        Relationships: []
      }
      github_deploys: {
        Row: {
          branch: string
          commit_message: string | null
          commit_sha: string | null
          deployed_at: string
          id: string
          pipeline_build: boolean
          pipeline_deploy: boolean
          pipeline_health: boolean
          pipeline_lint: boolean
          pipeline_test: boolean
          status: string
        }
        Insert: {
          branch?: string
          commit_message?: string | null
          commit_sha?: string | null
          deployed_at?: string
          id?: string
          pipeline_build?: boolean
          pipeline_deploy?: boolean
          pipeline_health?: boolean
          pipeline_lint?: boolean
          pipeline_test?: boolean
          status?: string
        }
        Update: {
          branch?: string
          commit_message?: string | null
          commit_sha?: string | null
          deployed_at?: string
          id?: string
          pipeline_build?: boolean
          pipeline_deploy?: boolean
          pipeline_health?: boolean
          pipeline_lint?: boolean
          pipeline_test?: boolean
          status?: string
        }
        Relationships: []
      }
      logs: {
        Row: {
          agent_emoji: string | null
          agent_name: string
          category: string | null
          created_at: string | null
          data: Json | null
          id: string
          message: string
          timestamp: string | null
        }
        Insert: {
          agent_emoji?: string | null
          agent_name: string
          category?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          timestamp?: string | null
        }
        Update: {
          agent_emoji?: string | null
          agent_name?: string
          category?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          timestamp?: string | null
        }
        Relationships: []
      }
      meetings: {
        Row: {
          action_items: Json | null
          ai_insights: string | null
          attendees: string[] | null
          created_at: string | null
          date: string | null
          duration_minutes: number | null
          external_domains: string[] | null
          has_external: boolean | null
          id: string
          sentiment: string | null
          summary: string | null
          title: string
          type: string | null
        }
        Insert: {
          action_items?: Json | null
          ai_insights?: string | null
          attendees?: string[] | null
          created_at?: string | null
          date?: string | null
          duration_minutes?: number | null
          external_domains?: string[] | null
          has_external?: boolean | null
          id?: string
          sentiment?: string | null
          summary?: string | null
          title: string
          type?: string | null
        }
        Update: {
          action_items?: Json | null
          ai_insights?: string | null
          attendees?: string[] | null
          created_at?: string | null
          date?: string | null
          duration_minutes?: number | null
          external_domains?: string[] | null
          has_external?: boolean | null
          id?: string
          sentiment?: string | null
          summary?: string | null
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      memory: {
        Row: {
          agent_name: string
          approved: boolean | null
          category: string | null
          content: string
          created_at: string | null
          id: string
        }
        Insert: {
          agent_name: string
          approved?: boolean | null
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
        }
        Update: {
          agent_name?: string
          approved?: boolean | null
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      queue: {
        Row: {
          action_name: string | null
          claimed_by: string | null
          created_at: string | null
          id: string
          payload: Json | null
          priority: string | null
          status: string | null
          task_type: string | null
          updated_at: string | null
        }
        Insert: {
          action_name?: string | null
          claimed_by?: string | null
          created_at?: string | null
          id?: string
          payload?: Json | null
          priority?: string | null
          status?: string | null
          task_type?: string | null
          updated_at?: string | null
        }
        Update: {
          action_name?: string | null
          claimed_by?: string | null
          created_at?: string | null
          id?: string
          payload?: Json | null
          priority?: string | null
          status?: string | null
          task_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sheets_sync: {
        Row: {
          created_at: string
          delta: number
          id: string
          last_sync: string
          row_count: number
          sheet_name: string
          status: string
        }
        Insert: {
          created_at?: string
          delta?: number
          id?: string
          last_sync?: string
          row_count?: number
          sheet_name: string
          status?: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          last_sync?: string
          row_count?: number
          sheet_name?: string
          status?: string
        }
        Relationships: []
      }
      sms_metrics: {
        Row: {
          a2p_status: string
          compliance_ok: boolean
          created_at: string
          delivered: number
          id: string
          replied: number
          sent: number
          updated_at: string
          week_start: string
          weekly_target: number
        }
        Insert: {
          a2p_status?: string
          compliance_ok?: boolean
          created_at?: string
          delivered?: number
          id?: string
          replied?: number
          sent?: number
          updated_at?: string
          week_start?: string
          weekly_target?: number
        }
        Update: {
          a2p_status?: string
          compliance_ok?: boolean
          created_at?: string
          delivered?: number
          id?: string
          replied?: number
          sent?: number
          updated_at?: string
          week_start?: string
          weekly_target?: number
        }
        Relationships: []
      }
      sms_replies: {
        Row: {
          company: string | null
          contact_name: string | null
          created_at: string | null
          from_number: string
          id: string
          message: string | null
          reply_status: string | null
          sinch_message_id: string | null
          timestamp: string | null
        }
        Insert: {
          company?: string | null
          contact_name?: string | null
          created_at?: string | null
          from_number: string
          id?: string
          message?: string | null
          reply_status?: string | null
          sinch_message_id?: string | null
          timestamp?: string | null
        }
        Update: {
          company?: string | null
          contact_name?: string | null
          created_at?: string | null
          from_number?: string
          id?: string
          message?: string | null
          reply_status?: string | null
          sinch_message_id?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      subtasks: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          task_id: string
          title: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          task_id: string
          title: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          task_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_assignees: {
        Row: {
          created_at: string
          display_name: string
          id: string
          task_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          task_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          task_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_assignees_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          board_column_id: string
          created_at: string
          created_by_bujji: boolean
          description: string | null
          due_date: string | null
          id: string
          position: number
          priority: string
          title: string
        }
        Insert: {
          board_column_id: string
          created_at?: string
          created_by_bujji?: boolean
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number
          priority?: string
          title: string
        }
        Update: {
          board_column_id?: string
          created_at?: string
          created_by_bujji?: boolean
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number
          priority?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_board_column_id_fkey"
            columns: ["board_column_id"]
            isOneToOne: false
            referencedRelation: "board_columns"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
