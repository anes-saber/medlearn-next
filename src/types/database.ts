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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      majors: {
        Row: {
          created_at: string
          id: string
          name: string
          order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          order?: number
        }
        Relationships: []
      }
      modules: {
        Row: {
          created_at: string
          id: string
          major_id: string
          name: string
          order: number
        }
        Insert: {
          created_at?: string
          id?: string
          major_id: string
          name: string
          order?: number
        }
        Update: {
          created_at?: string
          id?: string
          major_id?: string
          name?: string
          order?: number
        }
        Relationships: [
          {
            foreignKeyName: "modules_major_id_fkey"
            columns: ["major_id"]
            isOneToOne: false
            referencedRelation: "majors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          id: string
          quiz_id: string
          user_id: string | null
          answers_json: Json
          score: number
          total: number
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          user_id?: string | null
          answers_json?: Json
          score?: number
          total?: number
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          user_id?: string | null
          answers_json?: Json
          score?: number
          total?: number
          completed_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      resources: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          description: string | null
          file_url: string | null
          id: string
          language: string
          link: string | null
          major_id: string
          module_id: string
          published: boolean
          title: string
          type: string
          youtube_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          language?: string
          link?: string | null
          major_id: string
          module_id: string
          published?: boolean
          title: string
          type: string
          youtube_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          language?: string
          link?: string | null
          major_id?: string
          module_id?: string
          published?: boolean
          title?: string
          type?: string
          youtube_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_major_id_fkey"
            columns: ["major_id"]
            isOneToOne: false
            referencedRelation: "majors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          id: string
          major_id: string
          module_id: string
          type: "scq" | "mcq" | "truefalse"
          statement_en: string | null
          statement_fr: string | null
          statement_ar: string | null
          options_json: Json
          correct_answer: Json
          explanation_en: string | null
          explanation_fr: string | null
          explanation_ar: string | null
          difficulty: "easy" | "medium" | "hard" | null
          tags: string[]
          published: boolean
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          major_id: string
          module_id: string
          type: "scq" | "mcq" | "truefalse"
          statement_en?: string | null
          statement_fr?: string | null
          statement_ar?: string | null
          options_json?: Json
          correct_answer: Json
          explanation_en?: string | null
          explanation_fr?: string | null
          explanation_ar?: string | null
          difficulty?: "easy" | "medium" | "hard" | null
          tags?: string[]
          published?: boolean
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          major_id?: string
          module_id?: string
          type?: "scq" | "mcq" | "truefalse"
          statement_en?: string | null
          statement_fr?: string | null
          statement_ar?: string | null
          options_json?: Json
          correct_answer?: Json
          explanation_en?: string | null
          explanation_fr?: string | null
          explanation_ar?: string | null
          difficulty?: "easy" | "medium" | "hard" | null
          tags?: string[]
          published?: boolean
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_major_id_fkey"
            columns: ["major_id"]
            isOneToOne: false
            referencedRelation: "majors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          id: string
          major_id: string
          module_id: string
          title_en: string | null
          title_fr: string | null
          title_ar: string | null
          rules_json: Json
          published: boolean
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          major_id: string
          module_id: string
          title_en?: string | null
          title_fr?: string | null
          title_ar?: string | null
          rules_json?: Json
          published?: boolean
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          major_id?: string
          module_id?: string
          title_en?: string | null
          title_fr?: string | null
          title_ar?: string | null
          rules_json?: Json
          published?: boolean
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_major_id_fkey"
            columns: ["major_id"]
            isOneToOne: false
            referencedRelation: "majors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          quiz_id: string
          question_id: string
          position: number
        }
        Insert: {
          quiz_id: string
          question_id: string
          position?: number
        }
        Update: {
          quiz_id?: string
          question_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      homeworks: {
        Row: {
          id: string
          major_id: string
          module_id: string
          title_en: string | null
          title_fr: string | null
          title_ar: string | null
          description_en: string | null
          description_fr: string | null
          description_ar: string | null
          due_at: string | null
          attachment_urls: string[]
          rules_json: Json
          published: boolean
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          major_id: string
          module_id: string
          title_en?: string | null
          title_fr?: string | null
          title_ar?: string | null
          description_en?: string | null
          description_fr?: string | null
          description_ar?: string | null
          due_at?: string | null
          attachment_urls?: string[]
          rules_json?: Json
          published?: boolean
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          major_id?: string
          module_id?: string
          title_en?: string | null
          title_fr?: string | null
          title_ar?: string | null
          description_en?: string | null
          description_fr?: string | null
          description_ar?: string | null
          due_at?: string | null
          attachment_urls?: string[]
          rules_json?: Json
          published?: boolean
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homeworks_major_id_fkey"
            columns: ["major_id"]
            isOneToOne: false
            referencedRelation: "majors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homeworks_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      homework_submissions: {
        Row: {
          id: string
          homework_id: string
          user_id: string | null
          submitter_name: string | null
          submitter_email: string | null
          submission_payload: Json
          grade: string | null
          feedback: string | null
          submitted_at: string
        }
        Insert: {
          id?: string
          homework_id: string
          user_id?: string | null
          submitter_name?: string | null
          submitter_email?: string | null
          submission_payload?: Json
          grade?: string | null
          feedback?: string | null
          submitted_at?: string
        }
        Update: {
          id?: string
          homework_id?: string
          user_id?: string | null
          submitter_name?: string | null
          submitter_email?: string | null
          submission_payload?: Json
          grade?: string | null
          feedback?: string | null
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_submissions_homework_id_fkey"
            columns: ["homework_id"]
            isOneToOne: false
            referencedRelation: "homeworks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }

    Functions: {
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: string
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
  public: {
    Enums: {},
  },
} as const
