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
      attendance: {
        Row: {
          check_in_time: string | null
          check_out_time: string | null
          checked_in_by: string | null
          class_id: string
          created_at: string
          date: string
          enrollment_id: string | null
          id: string
          is_free_permit: boolean
          permit_reason: string | null
          permit_type: Database["public"]["Enums"]["permit_type"] | null
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          check_in_time?: string | null
          check_out_time?: string | null
          checked_in_by?: string | null
          class_id: string
          created_at?: string
          date?: string
          enrollment_id?: string | null
          id?: string
          is_free_permit?: boolean
          permit_reason?: string | null
          permit_type?: Database["public"]["Enums"]["permit_type"] | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          check_in_time?: string | null
          check_out_time?: string | null
          checked_in_by?: string | null
          class_id?: string
          created_at?: string
          date?: string
          enrollment_id?: string | null
          id?: string
          is_free_permit?: boolean
          permit_reason?: string | null
          permit_type?: Database["public"]["Enums"]["permit_type"] | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "student_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          capacity: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          location: string | null
          name: string
          price_per_month: number
          schedule: string | null
          sessions_per_month: number
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          name: string
          price_per_month?: number
          schedule?: string | null
          sessions_per_month?: number
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          name?: string
          price_per_month?: number
          schedule?: string | null
          sessions_per_month?: number
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          billing_period_end: string
          billing_period_start: string
          created_at: string
          discount: number
          due_date: string
          enrollment_id: string | null
          id: string
          invoice_number: string
          notes: string | null
          paid_at: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          student_id: string
          total: number
          updated_at: string
        }
        Insert: {
          amount?: number
          billing_period_end: string
          billing_period_start: string
          created_at?: string
          discount?: number
          due_date: string
          enrollment_id?: string | null
          id?: string
          invoice_number: string
          notes?: string | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          student_id: string
          total?: number
          updated_at?: string
        }
        Update: {
          amount?: number
          billing_period_end?: string
          billing_period_start?: string
          created_at?: string
          discount?: number
          due_date?: string
          enrollment_id?: string | null
          id?: string
          invoice_number?: string
          notes?: string | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          student_id?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "student_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_enrollments: {
        Row: {
          billing_day: number
          class_id: string
          created_at: string
          enrollment_date: string
          free_permits_allowed: number
          free_permits_used: number
          id: string
          is_active: boolean
          sessions_quota: number
          sessions_used: number
          student_id: string
          updated_at: string
        }
        Insert: {
          billing_day?: number
          class_id: string
          created_at?: string
          enrollment_date?: string
          free_permits_allowed?: number
          free_permits_used?: number
          id?: string
          is_active?: boolean
          sessions_quota?: number
          sessions_used?: number
          student_id: string
          updated_at?: string
        }
        Update: {
          billing_day?: number
          class_id?: string
          created_at?: string
          enrollment_date?: string
          free_permits_allowed?: number
          free_permits_used?: number
          id?: string
          is_active?: boolean
          sessions_quota?: number
          sessions_used?: number
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string
          date_of_birth: string | null
          id: string
          is_active: boolean
          name: string
          parent_email: string | null
          parent_name: string | null
          parent_phone: string | null
          parent_user_id: string | null
          photo_url: string | null
          registration_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          parent_user_id?: string | null
          photo_url?: string | null
          registration_date?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          parent_user_id?: string | null
          photo_url?: string | null
          registration_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      trial_applications: {
        Row: {
          address: string | null
          admitted_at: string | null
          admitted_student_id: string | null
          allergies: string | null
          child_birth_date: string | null
          child_gender: string | null
          child_name: string
          child_nickname: string | null
          class_id: string | null
          created_at: string
          emergency_contact: string | null
          emergency_phone: string | null
          id: string
          medical_notes: string | null
          observation_notes: string | null
          parent_email: string
          parent_name: string
          parent_notes: string | null
          parent_phone: string
          parent_user_id: string
          program_key: string
          recommendation:
            | Database["public"]["Enums"]["trial_recommendation"]
            | null
          requested_start_date: string | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["trial_status"]
          trial_completed_at: string | null
          trial_scheduled_at: string | null
          tutor_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          admitted_at?: string | null
          admitted_student_id?: string | null
          allergies?: string | null
          child_birth_date?: string | null
          child_gender?: string | null
          child_name: string
          child_nickname?: string | null
          class_id?: string | null
          created_at?: string
          emergency_contact?: string | null
          emergency_phone?: string | null
          id?: string
          medical_notes?: string | null
          observation_notes?: string | null
          parent_email: string
          parent_name: string
          parent_notes?: string | null
          parent_phone: string
          parent_user_id: string
          program_key: string
          recommendation?:
            | Database["public"]["Enums"]["trial_recommendation"]
            | null
          requested_start_date?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["trial_status"]
          trial_completed_at?: string | null
          trial_scheduled_at?: string | null
          tutor_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          admitted_at?: string | null
          admitted_student_id?: string | null
          allergies?: string | null
          child_birth_date?: string | null
          child_gender?: string | null
          child_name?: string
          child_nickname?: string | null
          class_id?: string | null
          created_at?: string
          emergency_contact?: string | null
          emergency_phone?: string | null
          id?: string
          medical_notes?: string | null
          observation_notes?: string | null
          parent_email?: string
          parent_name?: string
          parent_notes?: string | null
          parent_phone?: string
          parent_user_id?: string
          program_key?: string
          recommendation?:
            | Database["public"]["Enums"]["trial_recommendation"]
            | null
          requested_start_date?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["trial_status"]
          trial_completed_at?: string | null
          trial_scheduled_at?: string | null
          tutor_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trial_applications_admitted_student_id_fkey"
            columns: ["admitted_student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trial_applications_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trial_applications_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_bonuses: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          month: number
          tutor_id: string
          year: number
        }
        Insert: {
          amount?: number
          created_at?: string
          description: string
          id?: string
          month: number
          tutor_id: string
          year: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          month?: number
          tutor_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "tutor_bonuses_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_class_assignments: {
        Row: {
          class_id: string
          created_at: string
          id: string
          is_active: boolean
          rate_per_session: number
          tutor_id: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          rate_per_session?: number
          tutor_id: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          rate_per_session?: number
          tutor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_class_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutor_class_assignments_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      tutors: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          photo_url: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waiting_list: {
        Row: {
          class_id: string
          confirmed_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          notes: string | null
          notified_at: string | null
          parent_email: string | null
          parent_name: string
          parent_phone: string | null
          parent_user_id: string | null
          priority: number
          status: Database["public"]["Enums"]["waiting_list_status"]
          student_name: string
          updated_at: string
        }
        Insert: {
          class_id: string
          confirmed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          notified_at?: string | null
          parent_email?: string | null
          parent_name: string
          parent_phone?: string | null
          parent_user_id?: string | null
          priority?: number
          status?: Database["public"]["Enums"]["waiting_list_status"]
          student_name: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          confirmed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          notified_at?: string | null
          parent_email?: string | null
          parent_name?: string
          parent_phone?: string | null
          parent_user_id?: string | null
          priority?: number
          status?: Database["public"]["Enums"]["waiting_list_status"]
          student_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "waiting_list_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admit_trial_candidate: {
        Args: { _trial_id: string }
        Returns: {
          address: string | null
          admitted_at: string | null
          admitted_student_id: string | null
          allergies: string | null
          child_birth_date: string | null
          child_gender: string | null
          child_name: string
          child_nickname: string | null
          class_id: string | null
          created_at: string
          emergency_contact: string | null
          emergency_phone: string | null
          id: string
          medical_notes: string | null
          observation_notes: string | null
          parent_email: string
          parent_name: string
          parent_notes: string | null
          parent_phone: string
          parent_user_id: string
          program_key: string
          recommendation:
            | Database["public"]["Enums"]["trial_recommendation"]
            | null
          requested_start_date: string | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["trial_status"]
          trial_completed_at: string | null
          trial_scheduled_at: string | null
          tutor_id: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "trial_applications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      submit_trial_review: {
        Args: {
          _observation_notes: string
          _recommendation: Database["public"]["Enums"]["trial_recommendation"]
          _trial_id: string
        }
        Returns: {
          address: string | null
          admitted_at: string | null
          admitted_student_id: string | null
          allergies: string | null
          child_birth_date: string | null
          child_gender: string | null
          child_name: string
          child_nickname: string | null
          class_id: string | null
          created_at: string
          emergency_contact: string | null
          emergency_phone: string | null
          id: string
          medical_notes: string | null
          observation_notes: string | null
          parent_email: string
          parent_name: string
          parent_notes: string | null
          parent_phone: string
          parent_user_id: string
          program_key: string
          recommendation:
            | Database["public"]["Enums"]["trial_recommendation"]
            | null
          requested_start_date: string | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["trial_status"]
          trial_completed_at: string | null
          trial_scheduled_at: string | null
          tutor_id: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "trial_applications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "parent" | "tutor"
      attendance_status: "present" | "absent" | "late" | "permit"
      invoice_status: "unpaid" | "paid" | "overdue" | "partial"
      permit_type: "sick" | "family" | "other"
      ticket_priority: "low" | "medium" | "high" | "urgent"
      ticket_status: "open" | "in_progress" | "resolved" | "closed"
      trial_recommendation: "suitable" | "repeat_trial" | "not_suitable"
      trial_status:
        | "submitted"
        | "scheduled"
        | "awaiting_review"
        | "recommended"
        | "repeat_trial"
        | "not_suitable"
        | "admitted"
      waiting_list_status:
        | "waiting"
        | "notified"
        | "confirmed"
        | "expired"
        | "cancelled"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user", "parent", "tutor"],
      attendance_status: ["present", "absent", "late", "permit"],
      invoice_status: ["unpaid", "paid", "overdue", "partial"],
      permit_type: ["sick", "family", "other"],
      ticket_priority: ["low", "medium", "high", "urgent"],
      ticket_status: ["open", "in_progress", "resolved", "closed"],
      trial_recommendation: ["suitable", "repeat_trial", "not_suitable"],
      trial_status: [
        "submitted",
        "scheduled",
        "awaiting_review",
        "recommended",
        "repeat_trial",
        "not_suitable",
        "admitted",
      ],
      waiting_list_status: [
        "waiting",
        "notified",
        "confirmed",
        "expired",
        "cancelled",
      ],
    },
  },
} as const
