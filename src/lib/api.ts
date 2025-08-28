import axios from 'axios'
import { auth } from './firebase'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 3000 // 3 second timeout for faster fallback when backend unavailable
})

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      if (auth && auth.currentUser) {
        const idToken = await auth.currentUser.getIdToken()
        config.headers.Authorization = `Bearer ${idToken}`
      }
    } catch (error) {
      console.error('Error getting auth token:', error)
      // Continue without token if there's an error
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized access
      window.location.href = '/login'
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.code === 'NETWORK_ERROR' || error.code === 'ENOTFOUND') {
      // Silent handling of expected network errors (backend unavailable)
      error.isNetworkError = true
    }
    return Promise.reject(error)
  }
)

export default api
