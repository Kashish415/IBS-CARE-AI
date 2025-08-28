import { collection, doc, addDoc, getDocs, getDoc, updateDoc, query, where, orderBy, limit, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase'

export interface HealthLog {
  id?: string
  userId: string
  date: string
  mood: number
  energy: number
  symptomSeverity: number
  symptoms: string[]
  triggers: string[]
  notes: string
  createdAt: string
  updatedAt: string
}

export interface AssessmentResult {
  id?: string
  userId: string
  type: 'IBS-D' | 'IBS-C' | 'IBS-M' | 'IBS-U'
  severity: 'Mild' | 'Moderate' | 'Severe'
  score: number
  recommendations: string[]
  answersData: any
  createdAt: string
}

export interface ChatMessage {
  id?: string
  userId: string
  message: string
  response: string
  context: any
  timestamp: string
}

class HealthDataService {
  // Health Logs
  async addHealthLog(userId: string, logData: Omit<HealthLog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!db || !isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials.')
    }

    try {
      const log: Omit<HealthLog, 'id'> = {
        ...logData,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const docRef = await addDoc(collection(db, 'health_logs'), log)

      // Update user health metrics
      await this.updateUserHealthMetrics(userId)

      console.log('✅ Health log added successfully:', docRef.id)
      return docRef.id
    } catch (error) {
      console.error('❌ Failed to add health log:', error)
      throw error
    }
  }

  async getUserHealthLogs(userId: string, limitCount: number = 50): Promise<HealthLog[]> {
    if (!db || !isFirebaseConfigured) {
      console.warn('⚠️ Firebase not configured - returning empty health logs')
      return []
    }

    try {
      if (!userId) {
        console.warn('⚠️ No userId provided to getUserHealthLogs')
        return []
      }

      console.log(`🔄 Fetching health logs for user: ${userId}`)

      const q = query(
        collection(db, 'health_logs'),
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(limitCount)
      )

      const querySnapshot = await getDocs(q)
      const logs: HealthLog[] = []

      querySnapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() } as HealthLog)
      })

      console.log(`✅ Retrieved ${logs.length} health logs for user ${userId}`)
      return logs
    } catch (error: any) {
      console.error('❌ Failed to get health logs:', error)

      // Log specific error details
      if (error.code === 'permission-denied') {
        console.error('🚫 Permission denied - user may not be authenticated properly')
      } else if (error.code === 'failed-precondition') {
        console.error('📋 Missing index - check Firestore console for required indexes')
      }

      // Return empty array instead of throwing to prevent app crashes
      return []
    }
  }

  async updateUserHealthMetrics(userId: string): Promise<void> {
    if (!db || !isFirebaseConfigured) {
      console.warn('⚠️ Firebase not configured - skipping metrics update')
      return
    }

    try {
      const logs = await this.getUserHealthLogs(userId)

      if (logs.length === 0) {
        console.log('ℹ️ No logs found, skipping metrics update')
        return
      }

      const totalLogs = logs.length
      const averageMood = logs.reduce((sum, log) => sum + log.mood, 0) / totalLogs
      const averageEnergy = logs.reduce((sum, log) => sum + log.energy, 0) / totalLogs
      const averageSymptomSeverity = logs.reduce((sum, log) => sum + log.symptomSeverity, 0) / totalLogs

      // Calculate days tracked (unique dates)
      const uniqueDates = new Set(logs.map(log => log.date))
      const daysTracked = uniqueDates.size

      const lastLogDate = logs[0]?.date || null

      // Try to update, create if doesn't exist
      const userDocRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userDocRef)

      const healthMetrics = {
        'health_metrics.total_logs': totalLogs,
        'health_metrics.average_mood': Math.round(averageMood * 10) / 10,
        'health_metrics.average_energy': Math.round(averageEnergy * 10) / 10,
        'health_metrics.average_symptom_severity': Math.round(averageSymptomSeverity * 10) / 10,
        'health_metrics.days_tracked': daysTracked,
        'health_metrics.last_log_date': lastLogDate,
        updated_at: new Date().toISOString()
      }

      if (userDoc.exists()) {
        await updateDoc(userDocRef, healthMetrics)
      } else {
        // Create basic user document with health metrics
        await setDoc(userDocRef, {
          uid: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          assessment_completed: false,
          health_metrics: {
            total_logs: totalLogs,
            average_mood: Math.round(averageMood * 10) / 10,
            average_energy: Math.round(averageEnergy * 10) / 10,
            average_symptom_severity: Math.round(averageSymptomSeverity * 10) / 10,
            days_tracked: daysTracked,
            last_log_date: lastLogDate
          }
        })
      }

      console.log('✅ User health metrics updated successfully')
    } catch (error) {
      console.error('❌ Failed to update health metrics:', error)
      // Don't throw, just log the error
    }
  }

  // Assessment
  async saveAssessmentResult(userId: string, result: Omit<AssessmentResult, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    if (!db || !isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials.')
    }

    try {
      const assessment: Omit<AssessmentResult, 'id'> = {
        ...result,
        userId,
        createdAt: new Date().toISOString()
      }

      const docRef = await addDoc(collection(db, 'assessments'), assessment)

      // Update user assessment status
      try {
        const userDocRef = doc(db, 'users', userId)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          await updateDoc(userDocRef, {
            assessment_completed: true,
            updated_at: new Date().toISOString()
          })
        } else {
          // Create user document if it doesn't exist
          await setDoc(userDocRef, {
            uid: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            assessment_completed: true
          })
        }
      } catch (error) {
        console.warn('⚠️ Could not update user assessment status:', error)
        // Continue anyway
      }

      console.log('✅ Assessment result saved successfully:', docRef.id)
      return docRef.id
    } catch (error) {
      console.error('❌ Failed to save assessment result:', error)
      throw error
    }
  }

  async getUserAssessment(userId: string): Promise<AssessmentResult | null> {
    if (!db || !isFirebaseConfigured) {
      console.warn('⚠️ Firebase not configured - returning null for assessment')
      return null
    }

    try {
      if (!userId) {
        console.warn('⚠️ No userId provided to getUserAssessment')
        return null
      }

      console.log(`🔄 Fetching assessment for user: ${userId}`)

      const q = query(
        collection(db, 'assessments'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(1)
      )

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        console.log(`ℹ️ No assessment found for user ${userId}`)
        return null
      }

      const doc = querySnapshot.docs[0]
      console.log(`✅ Retrieved assessment for user ${userId}`)
      return { id: doc.id, ...doc.data() } as AssessmentResult
    } catch (error: any) {
      console.error('❌ Failed to get user assessment:', error)

      // Log specific error details
      if (error.code === 'permission-denied') {
        console.error('🚫 Permission denied - user may not be authenticated properly')
      } else if (error.code === 'failed-precondition') {
        console.error('📋 Missing index - check Firestore console for required indexes')
      }

      return null
    }
  }

  // Chat History
  async saveChatMessage(userId: string, message: string, response: string, context: any = {}): Promise<string> {
    if (!db || !isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials.')
    }

    try {
      const chatMessage: Omit<ChatMessage, 'id'> = {
        userId,
        message,
        response,
        context,
        timestamp: new Date().toISOString()
      }

      const docRef = await addDoc(collection(db, 'chat_history'), chatMessage)
      console.log('✅ Chat message saved successfully:', docRef.id)
      return docRef.id
    } catch (error) {
      console.error('❌ Failed to save chat message:', error)
      throw error
    }
  }

  async getUserChatHistory(userId: string, limitCount: number = 20): Promise<ChatMessage[]> {
    if (!db || !isFirebaseConfigured) {
      console.warn('⚠️ Firebase not configured - returning empty chat history')
      return []
    }

    try {
      const q = query(
        collection(db, 'chat_history'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      )

      const querySnapshot = await getDocs(q)
      const messages: ChatMessage[] = []

      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as ChatMessage)
      })

      console.log(`✅ Retrieved ${messages.length} chat messages for user ${userId}`)
      return messages.reverse() // Return in chronological order
    } catch (error) {
      console.error('❌ Failed to get chat history:', error)
      return []
    }
  }

  // User Profile
  async getUserProfile(userId: string): Promise<any> {
    if (!db || !isFirebaseConfigured) {
      console.warn('⚠️ Firebase not configured - returning null for user profile')
      return null
    }

    try {
      const docRef = doc(db, 'users', userId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return docSnap.data()
      } else {
        console.log('ℹ️ User profile not found, returning null')
        return null
      }
    } catch (error) {
      console.error('❌ Failed to get user profile:', error)
      return null
    }
  }

  async updateUserProfile(userId: string, profileData: any): Promise<void> {
    if (!db || !isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials.')
    }

    try {
      const userDocRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        await updateDoc(userDocRef, {
          ...profileData,
          updated_at: new Date().toISOString()
        })
      } else {
        // Create user document if it doesn't exist
        await setDoc(userDocRef, {
          uid: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...profileData
        })
      }
      console.log('✅ User profile updated successfully')
    } catch (error) {
      console.error('❌ Failed to update user profile:', error)
      throw error
    }
  }
}

export const healthDataService = new HealthDataService()
