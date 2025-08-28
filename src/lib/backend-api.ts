import api from './api'
import { aiService } from './ai-service'

export interface BackendChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface BackendChatResponse {
  reply: string
  tokens_used: number
  context_used: boolean
  error?: string
}

export interface IntroMessageResponse {
  intro_message: string
  suggestions: string[]
  context_available: boolean
}

export interface ChatHistoryResponse {
  messages: BackendChatMessage[]
  count: number
}

export interface AssessmentResult {
  type: string
  severity: string
  score: number
  recommendations: string[]
  symptoms: string[]
  triggers: string[]
}

export interface HealthMetrics {
  average_mood: number
  average_energy: number
  average_symptom_severity: number
  total_logs: number
  days_tracked: number
  current_streak: number
}

class BackendAPIService {
  private backendAvailable: boolean | null = null
  private lastHealthCheck: number = 0
  private healthCheckInterval: number = 30000 // Check every 30 seconds

  /**
   * Check backend health/status
   */
  async checkBackendHealth(): Promise<boolean> {
    const now = Date.now()
    
    // Use cached result if recent
    if (this.backendAvailable !== null && now - this.lastHealthCheck < this.healthCheckInterval) {
      return this.backendAvailable
    }

    try {
      const response = await api.get('/health')
      this.backendAvailable = response.status === 200
      this.lastHealthCheck = now
      return this.backendAvailable
    } catch (error: any) {
      this.backendAvailable = false
      this.lastHealthCheck = now
      return false
    }
  }

  /**
   * Send a message to the AI chat backend with fallback to client-side AI
   */
  async sendChatMessage(message: string, userId?: string): Promise<BackendChatResponse> {
    // Check if backend is available
    const isBackendHealthy = await this.checkBackendHealth()
    
    if (isBackendHealthy) {
      try {
        const response = await api.post('/chat', {
          message: message.trim(),
          user_id: userId
        })
        
        return response.data
      } catch (error: any) {
        console.warn('Backend chat failed, falling back to client-side AI:', error.message)
        // Fall through to client-side fallback
      }
    }

    // Use client-side AI as fallback
    if (userId) {
      try {
        const clientResponse = await aiService.sendMessage(userId, message.trim())
        return {
          reply: clientResponse.reply,
          tokens_used: clientResponse.tokens_used,
          context_used: clientResponse.context_used
        }
      } catch (clientError: any) {
        throw new Error('AI services are temporarily unavailable. Please try again later.')
      }
    }

    throw new Error('Authentication required for AI chat functionality.')
  }

  /**
   * Get personalized intro message and suggestions
   */
  async getIntroMessage(userId?: string): Promise<IntroMessageResponse> {
    const isBackendHealthy = await this.checkBackendHealth()
    
    if (isBackendHealthy && userId) {
      try {
        const response = await api.get('/chat/intro', {
          params: { user_id: userId }
        })
        return response.data
      } catch (error: any) {
        console.warn('Backend intro failed, using client-side fallback')
        // Fall through to client-side fallback
      }
    }

    // Client-side fallback
    if (userId) {
      try {
        const personalizedIntro = await aiService.getPersonalizedIntro(userId)
        return {
          intro_message: personalizedIntro,
          suggestions: [
            "How can I improve my digestive health?",
            "What foods should I avoid with IBS?",
            "Help me manage stress and anxiety",
            "Tell me about my symptom patterns"
          ],
          context_available: true
        }
      } catch (error) {
        // Default fallback
      }
    }

    return {
      intro_message: "Hello! I'm your IBS care assistant. I'm here to help you manage your symptoms and provide personalized advice. How are you feeling today?",
      suggestions: [
        "How can I improve my digestive health?",
        "What foods should I avoid with IBS?",
        "Help me manage stress and anxiety",
        "Complete my health assessment"
      ],
      context_available: false
    }
  }

  /**
   * Submit health assessment
   */
  async submitAssessment(assessmentData: any): Promise<AssessmentResult> {
    const isBackendHealthy = await this.checkBackendHealth()
    
    if (isBackendHealthy) {
      try {
        const response = await api.post('/assessment', assessmentData)
        return response.data
      } catch (error: any) {
        console.warn('Backend assessment failed:', error.message)
        // Fall through to client-side logic
      }
    }

    // Client-side assessment logic as fallback
    return this.processAssessmentClientSide(assessmentData)
  }

  /**
   * Client-side assessment processing
   */
  private processAssessmentClientSide(data: any): AssessmentResult {
    const symptoms = data.symptoms || []
    const triggers = data.triggers || []
    const severity = data.severity_rating || 3
    const frequency = data.frequency || 'sometimes'
    
    // Calculate IBS type based on symptoms
    let type = 'IBS-Mixed'
    const hasConstipation = symptoms.includes('constipation')
    const hasDiarrhea = symptoms.includes('diarrhea')
    
    if (hasConstipation && !hasDiarrhea) {
      type = 'IBS-Constipation'
    } else if (hasDiarrhea && !hasConstipation) {
      type = 'IBS-Diarrhea'
    }

    // Calculate severity
    let severityLevel = 'Mild'
    if (severity >= 7 || frequency === 'daily') {
      severityLevel = 'Severe'
    } else if (severity >= 5 || frequency === 'often') {
      severityLevel = 'Moderate'
    }

    // Calculate score
    const score = Math.min(100, (severity * 10) + (symptoms.length * 5) + (triggers.length * 3))

    // Generate recommendations based on assessment
    const recommendations = this.generateRecommendations(type, severityLevel, symptoms, triggers)

    return {
      type,
      severity: severityLevel,
      score,
      recommendations,
      symptoms,
      triggers
    }
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(type: string, severity: string, symptoms: string[], triggers: string[]): string[] {
    const recommendations = []

    // General IBS recommendations
    recommendations.push('Follow a low FODMAP diet to identify trigger foods')
    recommendations.push('Maintain regular meal times and eat smaller, frequent meals')
    recommendations.push('Stay hydrated with at least 8 glasses of water daily')
    recommendations.push('Practice stress management techniques like meditation or yoga')

    // Type-specific recommendations
    if (type.includes('Constipation')) {
      recommendations.push('Increase fiber intake gradually with soluble fiber foods')
      recommendations.push('Engage in regular physical activity to promote bowel movement')
      recommendations.push('Consider probiotic supplements to support gut health')
    } else if (type.includes('Diarrhea')) {
      recommendations.push('Avoid high-fat and spicy foods that can trigger episodes')
      recommendations.push('Include binding foods like bananas, rice, and toast')
      recommendations.push('Monitor and limit caffeine and alcohol intake')
    }

    // Severity-specific recommendations
    if (severity === 'Severe') {
      recommendations.push('Consult with a gastroenterologist for specialized treatment')
      recommendations.push('Consider keeping a detailed food and symptom diary')
      recommendations.push('Discuss prescription medications with your healthcare provider')
    }

    // Trigger-specific recommendations
    if (triggers.includes('stress')) {
      recommendations.push('Implement daily stress reduction practices')
      recommendations.push('Consider counseling or therapy for stress management')
    }
    
    if (triggers.includes('certain_foods')) {
      recommendations.push('Work with a dietitian to identify trigger foods')
      recommendations.push('Try an elimination diet to pinpoint problem foods')
    }

    return recommendations.slice(0, 6) // Return top 6 recommendations
  }

  /**
   * Get user health metrics
   */
  async getHealthMetrics(userId: string): Promise<HealthMetrics> {
    const isBackendHealthy = await this.checkBackendHealth()
    
    if (isBackendHealthy) {
      try {
        const response = await api.get(`/health-metrics/${userId}`)
        return response.data
      } catch (error: any) {
        console.warn('Backend metrics failed, using client-side calculation')
      }
    }

    // Client-side calculation from Firebase
    return this.calculateMetricsClientSide(userId)
  }

  /**
   * Calculate health metrics from client-side data
   */
  private async calculateMetricsClientSide(userId: string): Promise<HealthMetrics> {
    try {
      const { doc, getDoc } = await import('firebase/firestore')
      const { db } = await import('./firebase')
      
      if (!db) {
        return {
          average_mood: 0,
          average_energy: 0,
          average_symptom_severity: 0,
          total_logs: 0,
          days_tracked: 0,
          current_streak: 0
        }
      }

      const healthLogsDoc = await getDoc(doc(db, 'health_logs', userId))
      
      if (!healthLogsDoc.exists()) {
        return {
          average_mood: 0,
          average_energy: 0,
          average_symptom_severity: 0,
          total_logs: 0,
          days_tracked: 0,
          current_streak: 0
        }
      }

      const data = healthLogsDoc.data()
      const logs = data.logs || []

      if (logs.length === 0) {
        return {
          average_mood: 0,
          average_energy: 0,
          average_symptom_severity: 0,
          total_logs: 0,
          days_tracked: 0,
          current_streak: 0
        }
      }

      // Calculate averages
      const totalMood = logs.reduce((sum: number, log: any) => sum + (log.mood || 0), 0)
      const totalEnergy = logs.reduce((sum: number, log: any) => sum + (log.energy || 0), 0)
      const totalSeverity = logs.reduce((sum: number, log: any) => sum + (log.symptom_severity || 0), 0)

      const average_mood = Math.round((totalMood / logs.length) * 10) / 10
      const average_energy = Math.round((totalEnergy / logs.length) * 10) / 10
      const average_symptom_severity = Math.round((totalSeverity / logs.length) * 10) / 10

      // Calculate streak
      const sortedLogs = logs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      let current_streak = 0
      const today = new Date()
      
      for (let i = 0; i < sortedLogs.length; i++) {
        const logDate = new Date(sortedLogs[i].date)
        const daysDiff = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === i) {
          current_streak++
        } else {
          break
        }
      }

      return {
        average_mood,
        average_energy,
        average_symptom_severity,
        total_logs: logs.length,
        days_tracked: new Set(logs.map((log: any) => log.date)).size,
        current_streak
      }

    } catch (error) {
      console.error('Error calculating metrics:', error)
      return {
        average_mood: 0,
        average_energy: 0,
        average_symptom_severity: 0,
        total_logs: 0,
        days_tracked: 0,
        current_streak: 0
      }
    }
  }

  /**
   * Save daily health log
   */
  async saveHealthLog(userId: string, logData: any): Promise<void> {
    const isBackendHealthy = await this.checkBackendHealth()
    
    if (isBackendHealthy) {
      try {
        await api.post('/health-logs', {
          user_id: userId,
          ...logData
        })
        return
      } catch (error: any) {
        console.warn('Backend log save failed, using client-side storage')
      }
    }

    // Client-side storage in Firebase
    try {
      const { doc, getDoc, setDoc, updateDoc } = await import('firebase/firestore')
      const { db } = await import('./firebase')
      
      if (!db) throw new Error('Firebase not initialized')

      const healthLogsRef = doc(db, 'health_logs', userId)
      const healthLogsDoc = await getDoc(healthLogsRef)
      
      const newLog = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        ...logData
      }

      if (healthLogsDoc.exists()) {
        const currentData = healthLogsDoc.data()
        const updatedLogs = [...(currentData.logs || []), newLog]
        
        await updateDoc(healthLogsRef, {
          logs: updatedLogs,
          updated_at: new Date().toISOString()
        })
      } else {
        await setDoc(healthLogsRef, {
          uid: userId,
          logs: [newLog],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }

    } catch (error) {
      console.error('Error saving health log:', error)
      throw error
    }
  }

  /**
   * Get health logs
   */
  async getHealthLogs(userId: string): Promise<any[]> {
    const isBackendHealthy = await this.checkBackendHealth()
    
    if (isBackendHealthy) {
      try {
        const response = await api.get(`/health-logs/${userId}`)
        return response.data.logs || []
      } catch (error: any) {
        console.warn('Backend logs fetch failed, using client-side data')
      }
    }

    // Client-side fetch from Firebase
    try {
      const { doc, getDoc } = await import('firebase/firestore')
      const { db } = await import('./firebase')
      
      if (!db) return []

      const healthLogsDoc = await getDoc(doc(db, 'health_logs', userId))
      
      if (healthLogsDoc.exists()) {
        const data = healthLogsDoc.data()
        return data.logs || []
      }
      
      return []
    } catch (error) {
      console.error('Error fetching health logs:', error)
      return []
    }
  }
}

export const backendAPI = new BackendAPIService()
