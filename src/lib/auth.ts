import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  AuthError,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signup: (email: string, password: string, displayName?: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkOnboardingStatus: () => Promise<boolean>
  updateUserProfile: (data: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

// Enhanced error handling for Firebase auth errors
const getAuthErrorMessage = (error: AuthError) => {
  switch (error.code) {
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection and try again.'
    case 'auth/invalid-api-key':
      return 'Invalid Firebase API key. Please contact support.'
    case 'auth/user-not-found':
    case 'auth/invalid-login-credentials':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials and try again.'
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.'
    case 'auth/email-already-in-use':
    case 'auth/email-already-exists':
      return 'This email is already registered. Try signing in instead or use a different email.'
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger password (at least 6 characters).'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.'
    case 'auth/operation-not-allowed':
      return 'Email/password authentication is not enabled. Please contact support.'
    default:
      return `Authentication error: ${error.message}`
  }
}

// Helper function to create default user data
const createDefaultUserData = (user: User, displayName?: string) => ({
  uid: user.uid,
  email: user.email,
  display_name: displayName || user.displayName || user.email?.split('@')[0] || 'User',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_login: new Date().toISOString(),
  assessment_completed: false,
  profile: {
    age: null,
    gender: null,
    weight: null,
    height: null,
    medical_history: [],
    medications: [],
    allergies: [],
    emergency_contact: null
  },
  settings: {
    notifications: true,
    email_updates: true,
    data_sharing: false,
    privacy_level: 'standard'
  },
  health_metrics: {
    total_logs: 0,
    average_mood: 0,
    average_energy: 0,
    average_symptom_severity: 0,
    days_tracked: 0,
    last_log_date: null,
    current_streak: 0,
    longest_streak: 0
  },
  preferences: {
    theme: 'light',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }
})

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      console.error('Firebase Auth not initialized')
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth,
      (user) => {
        setUser(user)
        setLoading(false)
      },
      (error) => {
        console.error('Auth state change error:', error)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [])

  const signup = async (email: string, password: string, displayName?: string) => {
    if (!auth || !db) {
      throw new Error('Firebase is not properly configured.')
    }

    try {
      console.log('Creating new user account:', email)

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update the user's display name in Firebase Auth
      if (displayName) {
        await updateProfile(user, { displayName })
      }

      // Create comprehensive user document in Firestore
      const userData = createDefaultUserData(user, displayName)
      await setDoc(doc(db, 'users', user.uid), userData)
      
      // Create user's health logs collection
      await setDoc(doc(db, 'health_logs', user.uid), {
        uid: user.uid,
        logs: [],
        created_at: new Date().toISOString()
      })

      // Create user's chat history collection
      await setDoc(doc(db, 'chat_history', user.uid), {
        uid: user.uid,
        messages: [],
        created_at: new Date().toISOString()
      })

      console.log('User account created successfully')

    } catch (error: any) {
      console.error('Signup failed:', error)
      throw new Error(getAuthErrorMessage(error))
    }
  }

  const login = async (email: string, password: string) => {
    if (!auth || !db) {
      throw new Error('Firebase is not properly configured.')
    }

    try {
      console.log('Attempting login for:', email)

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      console.log('User logged in successfully:', user.uid)

      // Check if user document exists
      const userDocRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        // Update last login timestamp
        await updateDoc(userDocRef, {
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        console.log('Updated last login timestamp')
      } else {
        // Create user document if it doesn't exist (for existing users)
        console.log('User document not found, creating one...')
        const userData = createDefaultUserData(user)
        await setDoc(userDocRef, userData)
        
        // Create user's health logs collection
        await setDoc(doc(db, 'health_logs', user.uid), {
          uid: user.uid,
          logs: [],
          created_at: new Date().toISOString()
        })

        // Create user's chat history collection
        await setDoc(doc(db, 'chat_history', user.uid), {
          uid: user.uid,
          messages: [],
          created_at: new Date().toISOString()
        })
        
        console.log('Created missing user document')
      }

    } catch (error: any) {
      console.error('Login failed:', error)
      throw new Error(getAuthErrorMessage(error))
    }
  }

  const logout = async () => {
    if (!auth) {
      setUser(null)
      return
    }

    try {
      await signOut(auth)
      console.log('User logged out successfully')
    } catch (error: any) {
      console.error('Logout failed:', error)
      // Clear local state even if Firebase logout fails
      setUser(null)
    }
  }

  const checkOnboardingStatus = async (): Promise<boolean> => {
    if (!user || !db) return false

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists()) {
        return userDoc.data()?.assessment_completed || false
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    }
    return false
  }

  const updateUserProfile = async (data: any) => {
    if (!user) throw new Error('No user logged in')
    if (!db) {
      throw new Error('Firebase is not properly configured.')
    }

    try {
      const userDocRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        await updateDoc(userDocRef, {
          ...data,
          updated_at: new Date().toISOString()
        })
        console.log('User profile updated successfully')
      } else {
        // Create user document if it doesn't exist
        const userData = createDefaultUserData(user)
        await setDoc(userDocRef, { ...userData, ...data })
        console.log('Created user document with updated profile')
      }
    } catch (error) {
      console.error('Failed to update user profile:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    checkOnboardingStatus,
    updateUserProfile
  }

  return React.createElement(AuthContext.Provider, { value }, children)
}
