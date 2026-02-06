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
    PostgrestVersion: "14.1"
  }
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
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          body: string
          created_at: string | null
          created_by: string | null
          id: string
          image_url: string | null
          priority: string
          scheduled_at: string | null
          sent_at: string | null
          stats: Json | null
          status: string
          target_audience: string
          target_criteria: Json | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          body: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          priority?: string
          scheduled_at?: string | null
          sent_at?: string | null
          stats?: Json | null
          status?: string
          target_audience?: string
          target_criteria?: Json | null
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          body?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          priority?: string
          scheduled_at?: string | null
          sent_at?: string | null
          stats?: Json | null
          status?: string
          target_audience?: string
          target_criteria?: Json | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_daily_summary: {
        Row: {
          active_users: number | null
          calculator_uses: number | null
          created_at: string | null
          date: string
          device_breakdown: Json | null
          id: string
          new_users: number | null
          province_breakdown: Json | null
          scholarship_views: number | null
          search_queries: number | null
          top_searches: Json | null
          top_universities: Json | null
          total_page_views: number | null
          total_sessions: number | null
          total_users: number | null
          university_views: number | null
        }
        Insert: {
          active_users?: number | null
          calculator_uses?: number | null
          created_at?: string | null
          date: string
          device_breakdown?: Json | null
          id?: string
          new_users?: number | null
          province_breakdown?: Json | null
          scholarship_views?: number | null
          search_queries?: number | null
          top_searches?: Json | null
          top_universities?: Json | null
          total_page_views?: number | null
          total_sessions?: number | null
          total_users?: number | null
          university_views?: number | null
        }
        Update: {
          active_users?: number | null
          calculator_uses?: number | null
          created_at?: string | null
          date?: string
          device_breakdown?: Json | null
          id?: string
          new_users?: number | null
          province_breakdown?: Json | null
          scholarship_views?: number | null
          search_queries?: number | null
          top_searches?: Json | null
          top_universities?: Json | null
          total_page_views?: number | null
          total_sessions?: number | null
          total_users?: number | null
          university_views?: number | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          app_version: string | null
          created_at: string | null
          device_type: string | null
          event_category: string | null
          event_data: Json | null
          event_name: string
          id: string
          os_version: string | null
          screen_name: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          app_version?: string | null
          created_at?: string | null
          device_type?: string | null
          event_category?: string | null
          event_data?: Json | null
          event_name: string
          id?: string
          os_version?: string | null
          screen_name?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          app_version?: string | null
          created_at?: string | null
          device_type?: string | null
          event_category?: string | null
          event_data?: Json | null
          event_name?: string
          id?: string
          os_version?: string | null
          screen_name?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      announcement_dismissals: {
        Row: {
          announcement_id: string | null
          dismissed_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          announcement_id?: string | null
          dismissed_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          announcement_id?: string | null
          dismissed_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcement_dismissals_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          action_label: string | null
          action_url: string | null
          created_at: string | null
          created_by: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_dismissible: boolean | null
          message: string
          priority: number | null
          start_date: string | null
          target: Database["public"]["Enums"]["announcement_target"] | null
          target_criteria: Json | null
          title: string
          type: Database["public"]["Enums"]["announcement_type"] | null
          updated_at: string | null
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_dismissible?: boolean | null
          message: string
          priority?: number | null
          start_date?: string | null
          target?: Database["public"]["Enums"]["announcement_target"] | null
          target_criteria?: Json | null
          title: string
          type?: Database["public"]["Enums"]["announcement_type"] | null
          updated_at?: string | null
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_dismissible?: boolean | null
          message?: string
          priority?: number | null
          start_date?: string | null
          target?: Database["public"]["Enums"]["announcement_target"] | null
          target_criteria?: Json | null
          title?: string
          type?: Database["public"]["Enums"]["announcement_type"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
          value_type: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
          value_type?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
          value_type?: string | null
        }
        Relationships: []
      }
      content_reports: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reporter_id: string | null
          resolution_notes: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["report_status"] | null
          updated_at: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reporter_id?: string | null
          resolution_notes?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string | null
          resolution_notes?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      content_versions: {
        Row: {
          change_summary: string | null
          changed_by: string | null
          content_id: string
          content_type: string
          created_at: string | null
          data: Json
          id: string
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          changed_by?: string | null
          content_id: string
          content_type: string
          created_at?: string | null
          data: Json
          id?: string
          version_number: number
        }
        Update: {
          change_summary?: string | null
          changed_by?: string | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          data?: Json
          id?: string
          version_number?: number
        }
        Relationships: []
      }
      entry_test_fields: {
        Row: {
          entry_test_id: string
          field_id: string
        }
        Insert: {
          entry_test_id: string
          field_id: string
        }
        Update: {
          entry_test_id?: string
          field_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entry_test_fields_entry_test_id_fkey"
            columns: ["entry_test_id"]
            isOneToOne: false
            referencedRelation: "entry_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_test_fields_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      entry_tests: {
        Row: {
          applicable_fields: string[] | null
          conducting_body: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          registration_deadline: string | null
          registration_fee: number | null
          short_name: string | null
          syllabus_url: string | null
          test_date: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          applicable_fields?: string[] | null
          conducting_body?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          registration_deadline?: string | null
          registration_fee?: number | null
          short_name?: string | null
          syllabus_url?: string | null
          test_date?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          applicable_fields?: string[] | null
          conducting_body?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          registration_deadline?: string | null
          registration_fee?: number | null
          short_name?: string | null
          syllabus_url?: string | null
          test_date?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      fee_structures: {
        Row: {
          academic_year: string | null
          admission_fee: number | null
          created_at: string | null
          currency: string | null
          exam_fee: number | null
          hostel_fee_per_month: number | null
          id: string
          is_self_finance: boolean | null
          lab_fee: number | null
          library_fee: number | null
          program_id: string | null
          security_deposit: number | null
          total_estimated_cost: number | null
          transport_fee_per_month: number | null
          tuition_per_semester: number | null
          tuition_per_year: number | null
        }
        Insert: {
          academic_year?: string | null
          admission_fee?: number | null
          created_at?: string | null
          currency?: string | null
          exam_fee?: number | null
          hostel_fee_per_month?: number | null
          id?: string
          is_self_finance?: boolean | null
          lab_fee?: number | null
          library_fee?: number | null
          program_id?: string | null
          security_deposit?: number | null
          total_estimated_cost?: number | null
          transport_fee_per_month?: number | null
          tuition_per_semester?: number | null
          tuition_per_year?: number | null
        }
        Update: {
          academic_year?: string | null
          admission_fee?: number | null
          created_at?: string | null
          currency?: string | null
          exam_fee?: number | null
          hostel_fee_per_month?: number | null
          id?: string
          is_self_finance?: boolean | null
          lab_fee?: number | null
          library_fee?: number | null
          program_id?: string | null
          security_deposit?: number | null
          total_estimated_cost?: number | null
          transport_fee_per_month?: number | null
          tuition_per_semester?: number | null
          tuition_per_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_structures_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      fields: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      merit_formulas: {
        Row: {
          applicable_education:
            | Database["public"]["Enums"]["education_system"][]
            | null
          created_at: string | null
          description: string | null
          entry_test_weightage: number | null
          field_id: string | null
          formula_expression: string | null
          hafiz_bonus: number | null
          id: string
          inter_weightage: number | null
          matric_weightage: number | null
          name: string
          program_id: string | null
          sports_bonus: number | null
          university_id: string | null
          updated_at: string | null
        }
        Insert: {
          applicable_education?:
            | Database["public"]["Enums"]["education_system"][]
            | null
          created_at?: string | null
          description?: string | null
          entry_test_weightage?: number | null
          field_id?: string | null
          formula_expression?: string | null
          hafiz_bonus?: number | null
          id?: string
          inter_weightage?: number | null
          matric_weightage?: number | null
          name: string
          program_id?: string | null
          sports_bonus?: number | null
          university_id?: string | null
          updated_at?: string | null
        }
        Update: {
          applicable_education?:
            | Database["public"]["Enums"]["education_system"][]
            | null
          created_at?: string | null
          description?: string | null
          entry_test_weightage?: number | null
          field_id?: string | null
          formula_expression?: string | null
          hafiz_bonus?: number | null
          id?: string
          inter_weightage?: number | null
          matric_weightage?: number | null
          name?: string
          program_id?: string | null
          sports_bonus?: number | null
          university_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merit_formulas_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merit_formulas_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merit_formulas_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      merit_lists: {
        Row: {
          applicants: number | null
          campus: string | null
          category: string
          city: string | null
          closing_merit: number
          created_at: string | null
          id: string
          last_merit: number | null
          list_number: number | null
          merit_seats: number | null
          merit_type: string | null
          opening_merit: number | null
          program_code: string | null
          program_id: string | null
          program_name: string
          self_finance_seats: number | null
          session: string | null
          total_seats: number | null
          university_id: string | null
          updated_at: string | null
          year: number
        }
        Insert: {
          applicants?: number | null
          campus?: string | null
          category: string
          city?: string | null
          closing_merit: number
          created_at?: string | null
          id?: string
          last_merit?: number | null
          list_number?: number | null
          merit_seats?: number | null
          merit_type?: string | null
          opening_merit?: number | null
          program_code?: string | null
          program_id?: string | null
          program_name: string
          self_finance_seats?: number | null
          session?: string | null
          total_seats?: number | null
          university_id?: string | null
          updated_at?: string | null
          year: number
        }
        Update: {
          applicants?: number | null
          campus?: string | null
          category?: string
          city?: string | null
          closing_merit?: number
          created_at?: string | null
          id?: string
          last_merit?: number | null
          list_number?: number | null
          merit_seats?: number | null
          merit_type?: string | null
          opening_merit?: number | null
          program_code?: string | null
          program_id?: string | null
          program_name?: string
          self_finance_seats?: number | null
          session?: string | null
          total_seats?: number | null
          university_id?: string | null
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "merit_lists_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merit_lists_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          action_label: string | null
          action_url: string | null
          body: string
          created_at: string | null
          created_by: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          priority: string
          target_audience: string | null
          title: string
          type: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          body: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          priority?: string
          target_audience?: string | null
          title: string
          type?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          body?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          priority?: string
          target_audience?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      poll_options: {
        Row: {
          created_at: string | null
          id: string
          name: string
          poll_id: string | null
          short_name: string | null
          votes: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          poll_id?: string | null
          short_name?: string | null
          votes?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          poll_id?: string | null
          short_name?: string | null
          votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string | null
          id: string
          option_id: string | null
          poll_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_id?: string | null
          poll_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          option_id?: string | null
          poll_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          question: string
          total_votes: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          question: string
          total_votes?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          question?: string
          total_votes?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          app_version: string | null
          avatar_url: string | null
          ban_expires_at: string | null
          ban_reason: string | null
          created_at: string | null
          device_info: Json | null
          education_system:
            | Database["public"]["Enums"]["education_system"]
            | null
          email: string | null
          entry_test_score: number | null
          entry_test_total: number | null
          full_name: string | null
          id: string
          inter_marks: number | null
          inter_total: number | null
          is_banned: boolean | null
          is_verified: boolean | null
          last_login_at: string | null
          login_count: number | null
          matric_marks: number | null
          matric_total: number | null
          preferred_field: string | null
          preferred_province: Database["public"]["Enums"]["province"] | null
          provider: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          app_version?: string | null
          avatar_url?: string | null
          ban_expires_at?: string | null
          ban_reason?: string | null
          created_at?: string | null
          device_info?: Json | null
          education_system?:
            | Database["public"]["Enums"]["education_system"]
            | null
          email?: string | null
          entry_test_score?: number | null
          entry_test_total?: number | null
          full_name?: string | null
          id: string
          inter_marks?: number | null
          inter_total?: number | null
          is_banned?: boolean | null
          is_verified?: boolean | null
          last_login_at?: string | null
          login_count?: number | null
          matric_marks?: number | null
          matric_total?: number | null
          preferred_field?: string | null
          preferred_province?: Database["public"]["Enums"]["province"] | null
          provider?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          app_version?: string | null
          avatar_url?: string | null
          ban_expires_at?: string | null
          ban_reason?: string | null
          created_at?: string | null
          device_info?: Json | null
          education_system?:
            | Database["public"]["Enums"]["education_system"]
            | null
          email?: string | null
          entry_test_score?: number | null
          entry_test_total?: number | null
          full_name?: string | null
          id?: string
          inter_marks?: number | null
          inter_total?: number | null
          is_banned?: boolean | null
          is_verified?: boolean | null
          last_login_at?: string | null
          login_count?: number | null
          matric_marks?: number | null
          matric_total?: number | null
          preferred_field?: string | null
          preferred_province?: Database["public"]["Enums"]["province"] | null
          provider?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      programs: {
        Row: {
          created_at: string | null
          credit_hours: number | null
          degree_title: string | null
          description: string | null
          duration_years: number | null
          eligibility_criteria: string | null
          field_id: string | null
          id: string
          is_evening: boolean | null
          is_morning: boolean | null
          level: Database["public"]["Enums"]["program_level"]
          min_percentage: number | null
          name: string
          required_education:
            | Database["public"]["Enums"]["education_system"][]
            | null
          seats_merit: number | null
          seats_self_finance: number | null
          seats_total: number | null
          university_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credit_hours?: number | null
          degree_title?: string | null
          description?: string | null
          duration_years?: number | null
          eligibility_criteria?: string | null
          field_id?: string | null
          id?: string
          is_evening?: boolean | null
          is_morning?: boolean | null
          level: Database["public"]["Enums"]["program_level"]
          min_percentage?: number | null
          name: string
          required_education?:
            | Database["public"]["Enums"]["education_system"][]
            | null
          seats_merit?: number | null
          seats_self_finance?: number | null
          seats_total?: number | null
          university_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credit_hours?: number | null
          degree_title?: string | null
          description?: string | null
          duration_years?: number | null
          eligibility_criteria?: string | null
          field_id?: string | null
          id?: string
          is_evening?: boolean | null
          is_morning?: boolean | null
          level?: Database["public"]["Enums"]["program_level"]
          min_percentage?: number | null
          name?: string
          required_education?:
            | Database["public"]["Enums"]["education_system"][]
            | null
          seats_merit?: number | null
          seats_self_finance?: number | null
          seats_total?: number | null
          university_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      push_tokens: {
        Row: {
          created_at: string | null
          device_info: Json | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          platform: string
          token: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          platform: string
          token: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          platform?: string
          token?: string
          user_id?: string | null
        }
        Relationships: []
      }
      scholarships: {
        Row: {
          admin_notes: string | null
          application_deadline: string | null
          application_url: string | null
          coverage_percentage: number | null
          covers_books: boolean | null
          covers_hostel: boolean | null
          covers_tuition: boolean | null
          created_at: string | null
          description: string | null
          eligibility_criteria: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_verified: boolean | null
          last_verified_at: string | null
          max_family_income: number | null
          min_percentage: number | null
          monthly_stipend: number | null
          name: string
          provider: string | null
          required_documents: string[] | null
          type: Database["public"]["Enums"]["scholarship_type"]
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          application_deadline?: string | null
          application_url?: string | null
          coverage_percentage?: number | null
          covers_books?: boolean | null
          covers_hostel?: boolean | null
          covers_tuition?: boolean | null
          created_at?: string | null
          description?: string | null
          eligibility_criteria?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          last_verified_at?: string | null
          max_family_income?: number | null
          min_percentage?: number | null
          monthly_stipend?: number | null
          name: string
          provider?: string | null
          required_documents?: string[] | null
          type: Database["public"]["Enums"]["scholarship_type"]
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          application_deadline?: string | null
          application_url?: string | null
          coverage_percentage?: number | null
          covers_books?: boolean | null
          covers_hostel?: boolean | null
          covers_tuition?: boolean | null
          created_at?: string | null
          description?: string | null
          eligibility_criteria?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          last_verified_at?: string | null
          max_family_income?: number | null
          min_percentage?: number | null
          monthly_stipend?: number | null
          name?: string
          provider?: string | null
          required_documents?: string[] | null
          type?: Database["public"]["Enums"]["scholarship_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      universities: {
        Row: {
          address: string | null
          admin_notes: string | null
          admission_deadline: string | null
          admission_open: boolean | null
          city: string
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          email: string | null
          established_year: number | null
          id: string
          is_featured: boolean | null
          is_hec_recognized: boolean | null
          is_verified: boolean | null
          last_verified_at: string | null
          logo_url: string | null
          name: string
          phone: string | null
          province: Database["public"]["Enums"]["province"]
          ranking_hec: string | null
          ranking_national: number | null
          short_name: string | null
          type: Database["public"]["Enums"]["university_type"]
          updated_at: string | null
          verified_by: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          admission_deadline?: string | null
          admission_open?: boolean | null
          city: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          id?: string
          is_featured?: boolean | null
          is_hec_recognized?: boolean | null
          is_verified?: boolean | null
          last_verified_at?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          province: Database["public"]["Enums"]["province"]
          ranking_hec?: string | null
          ranking_national?: number | null
          short_name?: string | null
          type: Database["public"]["Enums"]["university_type"]
          updated_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          admission_deadline?: string | null
          admission_open?: boolean | null
          city?: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          id?: string
          is_featured?: boolean | null
          is_hec_recognized?: boolean | null
          is_verified?: boolean | null
          last_verified_at?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          province?: Database["public"]["Enums"]["province"]
          ranking_hec?: string | null
          ranking_national?: number | null
          short_name?: string | null
          type?: Database["public"]["Enums"]["university_type"]
          updated_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Relationships: []
      }
      university_scholarships: {
        Row: {
          additional_criteria: string | null
          created_at: string | null
          id: string
          scholarship_id: string | null
          university_id: string | null
        }
        Insert: {
          additional_criteria?: string | null
          created_at?: string | null
          id?: string
          scholarship_id?: string | null
          university_id?: string | null
        }
        Update: {
          additional_criteria?: string | null
          created_at?: string | null
          id?: string
          scholarship_id?: string | null
          university_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "university_scholarships_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "university_scholarships_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          program_id: string | null
          scholarship_id: string | null
          university_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          program_id?: string | null
          scholarship_id?: string | null
          university_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          program_id?: string | null
          scholarship_id?: string | null
          university_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_bookmarks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bookmarks_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bookmarks_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_calculations: {
        Row: {
          calculated_aggregate: number | null
          created_at: string | null
          education_system:
            | Database["public"]["Enums"]["education_system"]
            | null
          entry_test_marks: number | null
          entry_test_total: number | null
          formula_id: string | null
          id: string
          inter_marks: number | null
          inter_total: number | null
          is_hafiz: boolean | null
          matric_marks: number | null
          matric_total: number | null
          notes: string | null
          program_name: string | null
          university_name: string | null
          user_id: string | null
        }
        Insert: {
          calculated_aggregate?: number | null
          created_at?: string | null
          education_system?:
            | Database["public"]["Enums"]["education_system"]
            | null
          entry_test_marks?: number | null
          entry_test_total?: number | null
          formula_id?: string | null
          id?: string
          inter_marks?: number | null
          inter_total?: number | null
          is_hafiz?: boolean | null
          matric_marks?: number | null
          matric_total?: number | null
          notes?: string | null
          program_name?: string | null
          university_name?: string | null
          user_id?: string | null
        }
        Update: {
          calculated_aggregate?: number | null
          created_at?: string | null
          education_system?:
            | Database["public"]["Enums"]["education_system"]
            | null
          entry_test_marks?: number | null
          entry_test_total?: number | null
          formula_id?: string | null
          id?: string
          inter_marks?: number | null
          inter_total?: number | null
          is_hafiz?: boolean | null
          matric_marks?: number | null
          matric_total?: number | null
          notes?: string | null
          program_name?: string | null
          university_name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_calculations_formula_id_fkey"
            columns: ["formula_id"]
            isOneToOne: false
            referencedRelation: "merit_formulas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feedback: {
        Row: {
          admin_response: string | null
          category: Database["public"]["Enums"]["feedback_category"] | null
          contact_email: string | null
          created_at: string | null
          id: string
          message: string
          rating: number | null
          responded_at: string | null
          responded_by: string | null
          screenshot_url: string | null
          status: Database["public"]["Enums"]["feedback_status"] | null
          title: string
          type: Database["public"]["Enums"]["feedback_type"] | null
          user_id: string | null
        }
        Insert: {
          admin_response?: string | null
          category?: Database["public"]["Enums"]["feedback_category"] | null
          contact_email?: string | null
          created_at?: string | null
          id?: string
          message: string
          rating?: number | null
          responded_at?: string | null
          responded_by?: string | null
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["feedback_status"] | null
          title: string
          type?: Database["public"]["Enums"]["feedback_type"] | null
          user_id?: string | null
        }
        Update: {
          admin_response?: string | null
          category?: Database["public"]["Enums"]["feedback_category"] | null
          contact_email?: string | null
          created_at?: string | null
          id?: string
          message?: string
          rating?: number | null
          responded_at?: string | null
          responded_by?: string | null
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["feedback_status"] | null
          title?: string
          type?: Database["public"]["Enums"]["feedback_type"] | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          body: string
          clicked: boolean | null
          clicked_at: string | null
          created_at: string | null
          data: Json | null
          delivered: boolean | null
          delivered_at: string | null
          id: string
          notification_id: string | null
          read: boolean | null
          read_at: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          body: string
          clicked?: boolean | null
          clicked_at?: string | null
          created_at?: string | null
          data?: Json | null
          delivered?: boolean | null
          delivered_at?: string | null
          id?: string
          notification_id?: string | null
          read?: boolean | null
          read_at?: string | null
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          body?: string
          clicked?: boolean | null
          clicked_at?: string | null
          created_at?: string | null
          data?: Json | null
          delivered?: boolean | null
          delivered_at?: string | null
          id?: string
          notification_id?: string | null
          read?: boolean | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "admin_notifications"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_notification_stats: { Args: never; Returns: Json }
      get_unread_notification_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: { Args: never; Returns: boolean }
      is_moderator_or_above: { Args: never; Returns: boolean }
      log_admin_action: {
        Args: {
          p_action: string
          p_new_values?: Json
          p_old_values?: Json
          p_target_id?: string
          p_target_type?: string
        }
        Returns: string
      }
      mark_all_notifications_read: {
        Args: { p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      announcement_target:
        | "all"
        | "users"
        | "moderators"
        | "admins"
        | "province_specific"
        | "field_specific"
      announcement_type: "info" | "warning" | "alert" | "update" | "promotion"
      education_system:
        | "fsc_pre_medical"
        | "fsc_pre_engineering"
        | "ics"
        | "icom"
        | "fa"
        | "dae"
        | "o_levels"
        | "a_levels"
      feedback_category: "bug" | "feature" | "improvement" | "content" | "other"
      feedback_status:
        | "new"
        | "in_review"
        | "planned"
        | "in_progress"
        | "completed"
        | "declined"
      feedback_type:
        | "bug"
        | "feature_request"
        | "content_error"
        | "general"
        | "complaint"
      program_level: "bachelor" | "master" | "phd" | "diploma" | "certificate"
      province:
        | "punjab"
        | "sindh"
        | "kpk"
        | "balochistan"
        | "islamabad"
        | "azad_kashmir"
        | "gilgit_baltistan"
      report_status: "pending" | "reviewing" | "resolved" | "dismissed"
      scholarship_type:
        | "merit_based"
        | "need_based"
        | "sports"
        | "hafiz_e_quran"
        | "disabled"
        | "government"
        | "private"
      university_type: "public" | "private" | "semi_government"
      user_role:
        | "user"
        | "moderator"
        | "content_editor"
        | "admin"
        | "super_admin"
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
    Enums: {
      announcement_target: [
        "all",
        "users",
        "moderators",
        "admins",
        "province_specific",
        "field_specific",
      ],
      announcement_type: ["info", "warning", "alert", "update", "promotion"],
      education_system: [
        "fsc_pre_medical",
        "fsc_pre_engineering",
        "ics",
        "icom",
        "fa",
        "dae",
        "o_levels",
        "a_levels",
      ],
      feedback_category: ["bug", "feature", "improvement", "content", "other"],
      feedback_status: [
        "new",
        "in_review",
        "planned",
        "in_progress",
        "completed",
        "declined",
      ],
      feedback_type: [
        "bug",
        "feature_request",
        "content_error",
        "general",
        "complaint",
      ],
      program_level: ["bachelor", "master", "phd", "diploma", "certificate"],
      province: [
        "punjab",
        "sindh",
        "kpk",
        "balochistan",
        "islamabad",
        "azad_kashmir",
        "gilgit_baltistan",
      ],
      report_status: ["pending", "reviewing", "resolved", "dismissed"],
      scholarship_type: [
        "merit_based",
        "need_based",
        "sports",
        "hafiz_e_quran",
        "disabled",
        "government",
        "private",
      ],
      university_type: ["public", "private", "semi_government"],
      user_role: [
        "user",
        "moderator",
        "content_editor",
        "admin",
        "super_admin",
      ],
    },
  },
} as const
