import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Home,
  MessageSquare,
  Calendar,
  Brain,
  Plus,
  Heart,
  Activity,
  TrendingUp,
  BarChart3,
  Smile,
  Frown,
  Meh,
  User,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import { backendAPI } from '../lib/backend-api'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import StatCard from '../components/StatCard'
import ChartCard from '../components/ChartCard'

interface HealthStats {
  avgMood: number
  avgPain: number
  avgEnergy: number
  totalLogs: number
  daysTracked: number
  moodChange: number
  painChange: number
  energyChange: number
}

interface UserProfile {
  display_name: string
  assessment_completed: boolean
  health_metrics?: {
    total_logs: number
    average_mood: number
    average_energy: number
    average_symptom_severity: number
    days_tracked: number
    current_streak: number
    last_log_date: string | null
  }
}

const Dashboard: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const { user, loading: authLoading } = useAuth()

  const sidebarItems = [
    { name: 'Dashboard', icon: Home, href: '/dashboard', current: true },
    { name: 'AI Chat', icon: MessageSquare, href: '/chat', current: false },
    { name: 'Daily Log', icon: Calendar, href: '/logs', current: false },
    { name: 'Assessment', icon: Brain, href: '/assessment', current: false },
    { name: 'Profile', icon: User, href: '/profile', current: false }
  ]

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardData()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [user, authLoading, retryCount])

  const fetchDashboardData = async () => {
    if (!user) {
      console.log('⚠️ No user found, skipping dashboard data fetch')
      return
    }

    try {
      setLoading(true)
      setError('')

      console.log('🔄 Fetching dashboard data for authenticated user:', user.uid)

      // Fetch user profile from Firebase
      let profileData: UserProfile | null = null
      if (db) {
        try {
          const userDocRef = doc(db, 'users', user.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (userDoc.exists()) {
            const userData = userDoc.data()
            profileData = {
              display_name: userData.display_name || user.displayName || user.email?.split('@')[0] || 'User',
              assessment_completed: userData.assessment_completed || false,
              health_metrics: userData.health_metrics
            }
            console.log('📊 Profile data loaded from Firebase:', profileData)
          }
        } catch (fbError) {
          console.warn('⚠️ Failed to load profile from Firebase:', fbError)
        }
      }

      // If no profile data, use default
      if (!profileData) {
        profileData = {
          display_name: user.displayName || user.email?.split('@')[0] || 'User',
          assessment_completed: false
        }
        console.log('🔧 Using default profile:', profileData)
      }

      setUserProfile(profileData)

      // Fetch health metrics using backend API
      try {
        const healthMetrics = await backendAPI.getHealthMetrics(user.uid)
        console.log('📊 Health metrics loaded:', healthMetrics)
        
        // Update profile with fresh metrics
        setUserProfile(prev => ({
          ...prev!,
          health_metrics: {
            total_logs: healthMetrics.total_logs,
            average_mood: healthMetrics.average_mood,
            average_energy: healthMetrics.average_energy,
            average_symptom_severity: healthMetrics.average_symptom_severity,
            days_tracked: healthMetrics.days_tracked,
            current_streak: healthMetrics.current_streak,
            last_log_date: null
          }
        }))
      } catch (metricsError) {
        console.warn('⚠️ Failed to load health metrics:', metricsError)
      }

      // Fetch recent health logs
      try {
        const healthLogs = await backendAPI.getHealthLogs(user.uid)
        const recentLogs = healthLogs.slice(-30) // Last 30 logs
        setLogs(recentLogs)
        console.log(`📋 Health logs loaded: ${recentLogs.length} logs`)
      } catch (logsError) {
        console.warn('⚠️ Failed to load health logs:', logsError)
        setLogs([])
      }

      console.log(`✅ Dashboard data loaded successfully`)

    } catch (error: any) {
      console.error('❌ Failed to fetch dashboard data:', error)

      // Provide user-friendly error messages
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        setError('Permission denied. Please try signing out and signing back in.')
      } else if (error.code === 'unavailable' || error.message?.includes('network')) {
        setError('Network connection issue. Please check your internet connection.')
      } else if (error.message?.includes('quota-exceeded')) {
        setError('Service temporarily unavailable due to high usage.')
      } else {
        setError('Unable to load dashboard data. Please try again.')
      }

      // Set default values to prevent crashes
      setLogs([])
      if (!userProfile) {
        setUserProfile({
          display_name: user?.displayName || user?.email?.split('@')[0] || 'User',
          assessment_completed: false
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const retryFetch = () => {
    setRetryCount(prev => prev + 1)
  }

  const calculateStats = (): HealthStats => {
    // Use stored metrics if available
    if (userProfile?.health_metrics) {
      const metrics = userProfile.health_metrics
      
      // Calculate changes from recent logs
      let moodChange = 0, painChange = 0, energyChange = 0

      if (logs.length >= 2) {
        const current = logs[logs.length - 1]
        const previous = logs[logs.length - 2]
        
        if (current && previous) {
          moodChange = ((current.mood - previous.mood) / Math.max(previous.mood, 1)) * 100
          painChange = ((current.symptom_severity - previous.symptom_severity) / Math.max(previous.symptom_severity, 1)) * 100
          energyChange = ((current.energy - previous.energy) / Math.max(previous.energy, 1)) * 100
        }
      }

      return {
        avgMood: Math.round(metrics.average_mood * 10) / 10,
        avgPain: Math.round(metrics.average_symptom_severity * 10) / 10,
        avgEnergy: Math.round(metrics.average_energy * 10) / 10,
        totalLogs: metrics.total_logs,
        daysTracked: metrics.days_tracked,
        moodChange: Math.round(moodChange * 10) / 10,
        painChange: -Math.round(painChange * 10) / 10, // Negative because lower pain is better
        energyChange: Math.round(energyChange * 10) / 10
      }
    }

    // Fallback: calculate from logs directly
    if (!logs || logs.length === 0) {
      return {
        avgMood: 0,
        avgPain: 0,
        avgEnergy: 0,
        totalLogs: 0,
        daysTracked: 0,
        moodChange: 0,
        painChange: 0,
        energyChange: 0
      }
    }

    const recentLogs = logs.slice(-7) // Last 7 days
    const avgMood = recentLogs.reduce((sum, log) => sum + (log.mood || 0), 0) / recentLogs.length
    const avgPain = recentLogs.reduce((sum, log) => sum + (log.symptom_severity || 0), 0) / recentLogs.length
    const avgEnergy = recentLogs.reduce((sum, log) => sum + (log.energy || 0), 0) / recentLogs.length

    // Calculate change percentages
    let moodChange = 0, painChange = 0, energyChange = 0
    if (logs.length >= 2) {
      const current = logs[logs.length - 1]
      const previous = logs[logs.length - 2]
      
      if (current && previous) {
        moodChange = ((current.mood - previous.mood) / Math.max(previous.mood, 1)) * 100
        painChange = ((current.symptom_severity - previous.symptom_severity) / Math.max(previous.symptom_severity, 1)) * 100
        energyChange = ((current.energy - previous.energy) / Math.max(previous.energy, 1)) * 100
      }
    }

    // Get unique days tracked
    const uniqueDays = new Set(recentLogs.map(log => log.date)).size

    return {
      avgMood: Math.round(avgMood * 10) / 10,
      avgPain: Math.round(avgPain * 10) / 10,
      avgEnergy: Math.round(avgEnergy * 10) / 10,
      totalLogs: logs.length,
      daysTracked: uniqueDays,
      moodChange: Math.round(moodChange * 10) / 10,
      painChange: -Math.round(painChange * 10) / 10,
      energyChange: Math.round(energyChange * 10) / 10
    }
  }

  const stats = calculateStats()

  const getMoodIcon = (mood: number) => {
    if (mood >= 7) return <Smile className="h-6 w-6 text-green-500" />
    if (mood >= 4) return <Meh className="h-6 w-6 text-yellow-500" />
    return <Frown className="h-6 w-6 text-red-500" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to IBS Care AI</h2>
          <p className="text-gray-600 mb-8">Please sign in to access your health dashboard</p>
          <div className="space-x-4">
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg transition-all duration-200"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-8">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                IBS Care
              </span>
            </div>
            
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {userProfile?.display_name}! 👋
                </h1>
                <p className="text-gray-600 mt-2">
                  {logs.length > 0 
                    ? `Here's your health overview. You've tracked ${stats.daysTracked} days!`
                    : "Start tracking your health today to see personalized insights."
                  }
                </p>
              </div>
              
              {!userProfile?.assessment_completed && (
                <Link
                  to="/assessment"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg transition-all duration-200"
                >
                  <Brain className="h-5 w-5 mr-2" />
                  Take Assessment
                </Link>
              )}
            </div>

            {/* Error Alert with Retry */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={retryFetch}
                  className="inline-flex items-center px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-sm font-medium rounded transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Link to="/logs" className="group">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-3 rounded-lg">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <Plus className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Log Today's Symptoms</h3>
                  <p className="text-gray-600 text-sm">Track your daily health and mood</p>
                </div>
              </Link>
              
              <Link to="/chat" className="group">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-3 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                    </div>
                    <Plus className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Chat with AI</h3>
                  <p className="text-gray-600 text-sm">Get personalized health advice</p>
                </div>
              </Link>
              
              <Link to="/assessment" className="group">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-r from-green-100 to-green-200 p-3 rounded-lg">
                      <Brain className="h-6 w-6 text-green-600" />
                    </div>
                    <Plus className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Health Assessment</h3>
                  <p className="text-gray-600 text-sm">Understand your IBS type</p>
                </div>
              </Link>
            </div>

            {/* Health Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Average Mood"
                value={stats.avgMood}
                change={stats.moodChange}
                icon={Smile}
                color="green"
                unit="/10"
              />
              <StatCard
                title="Energy Level"
                value={stats.avgEnergy}
                change={stats.energyChange}
                icon={Activity}
                color="blue"
                unit="/10"
              />
              <StatCard
                title="Symptom Severity"
                value={stats.avgPain}
                change={stats.painChange}
                icon={TrendingUp}
                color="red"
                unit="/10"
              />
              <StatCard
                title="Days Tracked"
                value={stats.daysTracked}
                change={0}
                icon={Calendar}
                color="purple"
              />
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ChartCard
                title="Weekly Progress"
                subtitle="Your mood and energy trends over time"
              >
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {logs.length > 0 ? 'Chart visualization coming soon' : 'Start logging to see your trends'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {logs.length > 0 ? `${logs.length} entries tracked` : 'Add your first health log today'}
                    </p>
                  </div>
                </div>
              </ChartCard>
              
              <ChartCard
                title="Health Summary"
                subtitle="Your overall tracking progress"
              >
                <div className="space-y-4">
                  {logs.length > 0 ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Logs</span>
                        <span className="font-semibold text-gray-900">{stats.totalLogs}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Days Active</span>
                        <span className="font-semibold text-gray-900">{stats.daysTracked}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Current Streak</span>
                        <span className="font-semibold text-purple-600">
                          {userProfile?.health_metrics?.current_streak || 0} days
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Assessment</span>
                        <span className="font-semibold text-purple-600">
                          {userProfile?.assessment_completed ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No health data yet</p>
                      <p className="text-sm text-gray-500 mt-2">Start tracking to see your metrics</p>
                    </div>
                  )}
                </div>
              </ChartCard>
            </div>

            {/* Recent Logs */}
            {logs.length > 0 && (
              <div className="mt-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                    <Link
                      to="/logs"
                      className="text-purple-600 hover:text-purple-500 text-sm font-medium"
                    >
                      View all logs →
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {logs.slice(-3).reverse().map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          {getMoodIcon(log.mood)}
                          <div>
                            <p className="font-medium text-gray-900">
                              {formatDate(log.date)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Mood: {log.mood}/10 • Energy: {log.energy}/10 • Symptoms: {log.symptom_severity}/10
                            </p>
                          </div>
                        </div>
                        
                        {log.notes && (
                          <p className="text-sm text-gray-600 max-w-xs truncate">
                            "{log.notes}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {logs.length === 0 && !error && (
              <div className="mt-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your Health Journey</h3>
                  <p className="text-gray-600 mb-6">
                    Begin tracking your symptoms, mood, and energy to get personalized insights and recommendations.
                  </p>
                  <Link
                    to="/logs"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg transition-all duration-200"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Your First Log
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
