export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          timezone: string
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          timezone?: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          timezone?: string
          created_at?: string
        }
      }
      daily_logs: {
        Row: {
          id: string
          user_id: string
          log_date: string
          mood: string | null
          energy: number | null
          symptom_severity: number | null
          symptoms: any | null
          sleep_hours: number | null
          water_ml: number | null
          meals: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          log_date: string
          mood?: string | null
          energy?: number | null
          symptom_severity?: number | null
          symptoms?: any | null
          sleep_hours?: number | null
          water_ml?: number | null
          meals?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          log_date?: string
          mood?: string | null
          energy?: number | null
          symptom_severity?: number | null
          symptoms?: any | null
          sleep_hours?: number | null
          water_ml?: number | null
          meals?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string
          role: string
          content: string
          metadata: any | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          content: string
          metadata?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          content?: string
          metadata?: any | null
          created_at?: string
        }
      }
      user_embeddings: {
        Row: {
          id: string
          user_id: string
          embedding: number[]
          doc: any | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          embedding: number[]
          doc?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          embedding?: number[]
          doc?: any | null
          created_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type DailyLog = Database['public']['Tables']['daily_logs']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type UserEmbedding = Database['public']['Tables']['user_embeddings']['Row']

export interface DashboardStats {
  totalLogs: number
  avgMood: number
  avgEnergy: number
  avgSymptomSeverity: number
  daysTracked: number
  lastLogDate: string | null
}

export interface ChatResponse {
  reply: string
  sources: string[]
  tokens_used?: number
  summary?: string
  recommendations?: string[]
  reasoning?: string
  source_context?: string[]
}