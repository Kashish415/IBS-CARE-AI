export interface LogEntry {
  id?: string
  dateISO: string
  mood: number
  pain_level: number
  energy_level?: number
  notes: string
  triggers: string[]
  meals?: string[]
  symptoms?: string[]
  created_at?: string
  updated_at?: string
}

export interface ChatMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface AssessmentData {
  id?: string
  questions: AssessmentQuestion[]
  answers: Record<string, any>
  result?: AssessmentResult
  completed_at?: string
}

export interface AssessmentQuestion {
  id: string
  text: string
  type: 'multiple_choice' | 'scale' | 'text'
  options?: string[]
  required: boolean
}

export interface AssessmentResult {
  ibs_type: 'IBS-C' | 'IBS-D' | 'IBS-M' | 'IBS-U'
  severity: 'Mild' | 'Moderate' | 'Severe'
  score: number
  recommendations: string[]
}

export interface UserProfile {
  id: string
  email: string
  display_name?: string
  ibs_type?: string
  assessment_completed?: boolean
  created_at: string
  updated_at?: string
}

export interface HealthStats {
  avgMood: number
  avgPain: number
  avgEnergy: number
  totalLogs: number
  daysTracked: number
  moodChange: number
  painChange: number
  energyChange: number
}
