import { doc, setDoc, getDoc, collection, addDoc, query, orderBy, limit, getDocs, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface AIResponse {
  reply: string
  tokens_used: number
  context_used: boolean
}

class AIService {
  private apiKey: string
  private apiUrl: string

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyAp2x45enUqVzk3ZxBMyEiuZuuLb2-GCjI'
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'
  }

  /**
   * Get user's health context for personalized responses
   */
  private async getUserContext(userId: string): Promise<string> {
    if (!db) return ''

    try {
      // Get user profile
      const userDoc = await getDoc(doc(db, 'users', userId))
      let context = ''

      if (userDoc.exists()) {
        const userData = userDoc.data()
        context += `User Profile: ${userData.display_name || 'Unknown'}\n`
        
        if (userData.profile) {
          if (userData.profile.age) context += `Age: ${userData.profile.age}\n`
          if (userData.profile.gender) context += `Gender: ${userData.profile.gender}\n`
          if (userData.profile.medical_history?.length > 0) {
            context += `Medical History: ${userData.profile.medical_history.join(', ')}\n`
          }
          if (userData.profile.medications?.length > 0) {
            context += `Current Medications: ${userData.profile.medications.join(', ')}\n`
          }
          if (userData.profile.allergies?.length > 0) {
            context += `Allergies: ${userData.profile.allergies.join(', ')}\n`
          }
        }

        if (userData.health_metrics) {
          context += `Health Metrics:\n`
          context += `- Average Mood: ${userData.health_metrics.average_mood || 'N/A'}\n`
          context += `- Average Energy: ${userData.health_metrics.average_energy || 'N/A'}\n`
          context += `- Average Symptom Severity: ${userData.health_metrics.average_symptom_severity || 'N/A'}\n`
          context += `- Days Tracked: ${userData.health_metrics.days_tracked || 0}\n`
        }
      }

      // Get recent health logs
      const healthLogsDoc = await getDoc(doc(db, 'health_logs', userId))
      if (healthLogsDoc.exists()) {
        const logsData = healthLogsDoc.data()
        if (logsData.logs && logsData.logs.length > 0) {
          const recentLogs = logsData.logs.slice(-5) // Last 5 logs
          context += `\nRecent Health Logs:\n`
          recentLogs.forEach((log: any, index: number) => {
            context += `${index + 1}. Date: ${log.date}, Mood: ${log.mood}, Energy: ${log.energy}, Symptoms: ${log.symptoms?.join(', ') || 'None'}\n`
          })
        }
      }

      // Get recent chat history for context
      const chatDoc = await getDoc(doc(db, 'chat_history', userId))
      if (chatDoc.exists()) {
        const chatData = chatDoc.data()
        if (chatData.messages && chatData.messages.length > 0) {
          const recentMessages = chatData.messages.slice(-6) // Last 3 conversations
          context += `\nRecent Conversation Context:\n`
          recentMessages.forEach((msg: any) => {
            context += `${msg.role}: ${msg.content.substring(0, 100)}...\n`
          })
        }
      }

      return context
    } catch (error) {
      console.error('Error fetching user context:', error)
      return ''
    }
  }

  /**
   * Send message to Gemini AI with user context
   */
  async sendMessage(userId: string, message: string): Promise<AIResponse> {
    try {
      // Get user context for personalized response
      const userContext = await this.getUserContext(userId)

      const systemPrompt = `You are a friendly, knowledgeable IBS health assistant. Provide personalized, concise advice.

RESPONSE STYLE:
- Use the user's name from their profile
- Keep responses under 200 words (unless complex medical explanation needed)
- Use simple, clear formatting with short paragraphs
- Be conversational and supportive, not clinical
- Reference their recent health data specifically
- Avoid overwhelming lists - give 3-4 key points maximum

FORMATTING RULES:
- Use short paragraphs (2-3 sentences max)
- Use simple bullet points (•) for lists, not complex markdown
- Bold only the most important 1-2 words per response
- No lengthy introductions or conclusions

PERSONALIZATION:
- Always address them by name
- Reference their recent logs, mood, or symptoms when relevant
- Connect advice to their specific situation
- Mention their progress or patterns if applicable

CONTENT GUIDELINES:
- Give actionable, specific advice
- Prioritize the most helpful 2-3 suggestions
- Encourage professional consultation for serious concerns
- Keep medical explanations simple and brief

USER CONTEXT:
${userContext}

Respond naturally and personally, as if talking to a friend who trusts your health knowledge.`

      const payload = {
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nUser Message: ${message}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 500, // Reduced for more concise responses
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      }

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini AI')
      }

      const reply = data.candidates[0].content.parts[0].text
      const tokensUsed = data.usageMetadata?.totalTokenCount || 0

      return {
        reply,
        tokens_used: tokensUsed,
        context_used: userContext.length > 0
      }

    } catch (error: any) {
      console.error('AI service error:', error)
      throw new Error(`Failed to get AI response: ${error.message}`)
    }
  }

  /**
   * Save chat message to Firebase
   */
  async saveChatMessage(userId: string, userMessage: string, aiResponse: string): Promise<void> {
    if (!db) return

    try {
      const chatDocRef = doc(db, 'chat_history', userId)
      const chatDoc = await getDoc(chatDocRef)
      
      const timestamp = new Date().toISOString()
      const userMsg = {
        id: `user_${Date.now()}`,
        role: 'user' as const,
        content: userMessage,
        timestamp
      }
      
      const aiMsg = {
        id: `ai_${Date.now() + 1}`,
        role: 'assistant' as const,
        content: aiResponse,
        timestamp
      }

      if (chatDoc.exists()) {
        const currentData = chatDoc.data()
        const updatedMessages = [...(currentData.messages || []), userMsg, aiMsg]
        
        // Keep only last 100 messages to prevent document size issues
        const trimmedMessages = updatedMessages.slice(-100)
        
        await updateDoc(chatDocRef, {
          messages: trimmedMessages,
          updated_at: timestamp
        })
      } else {
        await setDoc(chatDocRef, {
          uid: userId,
          messages: [userMsg, aiMsg],
          created_at: timestamp,
          updated_at: timestamp
        })
      }

    } catch (error) {
      console.error('Error saving chat message:', error)
      throw error
    }
  }

  /**
   * Get chat history from Firebase
   */
  async getChatHistory(userId: string): Promise<ChatMessage[]> {
    if (!db) return []

    try {
      const chatDoc = await getDoc(doc(db, 'chat_history', userId))
      if (chatDoc.exists()) {
        const data = chatDoc.data()
        return data.messages || []
      }
      return []
    } catch (error) {
      console.error('Error fetching chat history:', error)
      return []
    }
  }

  /**
   * Get personalized intro message based on user data
   */
  async getPersonalizedIntro(userId: string): Promise<string> {
    try {
      const userContext = await this.getUserContext(userId)
      
      if (userContext.trim()) {
        return `Hello! I'm your personalized IBS care assistant. I can see you've been tracking your health journey with us. How are you feeling today? I'm here to provide personalized advice based on your health history and current needs.`
      } else {
        return `Hello! I'm your IBS care assistant. I'm here to help you manage your symptoms and provide personalized advice. To get started, you might want to complete your health assessment or log your first daily symptoms. How can I help you today?`
      }
    } catch (error) {
      return `Hello! I'm your IBS care assistant. I'm here to help you manage your symptoms and provide personalized advice. How are you feeling today?`
    }
  }
}

export const aiService = new AIService()
