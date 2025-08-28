import { auth, db } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

export class FirebaseDebugger {
  static async checkAuthStatus(): Promise<void> {
    if (!auth) {
      return
    }

    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          // User authenticated successfully
        } else {
          // User not authenticated
        }
        unsubscribe()
        resolve()
      })
    })
  }

  static async checkFirestoreConnection(userAuthenticated: boolean = false): Promise<boolean> {
    if (!db) {
      return false
    }

    if (!userAuthenticated) {
      return true
    }

    try {
      // Test Firestore connection
      const testDoc = doc(db, '_test', 'connection')
      await getDoc(testDoc)
      return true
    } catch (error: any) {
      return false
    }
  }

  static async runDiagnostics(): Promise<void> {
    // Silent diagnostics for production
    await this.checkAuthStatus()
    const userAuthenticated = auth?.currentUser !== null
    await this.checkFirestoreConnection(userAuthenticated)
  }

  // Method to test Firestore after successful authentication
  static async testFirestoreAfterAuth(): Promise<void> {
    if (auth?.currentUser) {
      await this.checkFirestoreConnection(true)
    }
  }
}

// Run diagnostics silently in development mode only
if (import.meta.env.DEV && import.meta.env.VITE_DEBUG === 'true') {
  // Only run if explicitly enabled
  setTimeout(() => {
    FirebaseDebugger.runDiagnostics()
  }, 1000)
}
