import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Home,
  MessageSquare,
  Calendar,
  Brain,
  User,
  Heart,
  Mail,
  Shield,
  Settings,
  LogOut,
  Edit3,
  Save,
  Camera,
  Download,
  Loader,
  ExternalLink,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import { backendAPI } from '../lib/backend-api'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { aiService } from '../lib/ai-service'

const Profile: React.FC = () => {
  const { user, logout, updateUserProfile, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userStats, setUserStats] = useState({
    totalLogs: 0,
    assessmentStatus: 'Not Completed',
    daysActive: 0,
    avgMood: 0,
    avgEnergy: 0,
    avgSymptoms: 0
  })
  const [formData, setFormData] = useState({
    displayName: user?.displayName || user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    notifications: true,
    emailUpdates: false
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const sidebarItems = [
    { name: 'Dashboard', icon: Home, href: '/dashboard', current: false },
    { name: 'AI Chat', icon: MessageSquare, href: '/chat', current: false },
    { name: 'Daily Log', icon: Calendar, href: '/logs', current: false },
    { name: 'Assessment', icon: Brain, href: '/assessment', current: false },
    { name: 'Profile', icon: User, href: '/profile', current: true }
  ]

  useEffect(() => {
    if (!authLoading && user) {
      fetchUserData()
    }
  }, [user, authLoading])

  const fetchUserData = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError('')

      console.log('🔄 Fetching user profile data')

      // Fetch user profile from Firebase
      let userProfile = null
      if (db) {
        try {
          const userDocRef = doc(db, 'users', user.uid)
          const userDoc = await getDoc(userDocRef)
          if (userDoc.exists()) {
            userProfile = userDoc.data()
          }
        } catch (fbError) {
          console.warn('⚠️ Failed to load profile from Firebase:', fbError)
        }
      }

      // Update form data with real profile data
      if (userProfile) {
        setFormData({
          displayName: userProfile.display_name || user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          notifications: userProfile.settings?.notifications ?? true,
          emailUpdates: userProfile.settings?.email_updates ?? false
        })
      }

      // Fetch health metrics and logs
      try {
        const [healthMetrics, healthLogs] = await Promise.all([
          backendAPI.getHealthMetrics(user.uid),
          backendAPI.getHealthLogs(user.uid)
        ])

        // Calculate additional stats from logs
        const uniqueDays = new Set(healthLogs.map(log => log.date)).size
        
        // Check assessment status
        let assessmentStatus = 'Not Completed'
        if (userProfile?.assessment_completed) {
          assessmentStatus = 'Completed'
        }

        setUserStats({
          totalLogs: healthMetrics.total_logs || healthLogs.length,
          assessmentStatus,
          daysActive: healthMetrics.days_tracked || uniqueDays,
          avgMood: healthMetrics.average_mood || 0,
          avgEnergy: healthMetrics.average_energy || 0,
          avgSymptoms: healthMetrics.average_symptom_severity || 0
        })

        console.log('✅ Profile data loaded successfully')
      } catch (metricsError) {
        console.warn('⚠️ Failed to load health metrics:', metricsError)
        // Set default stats
        setUserStats({
          totalLogs: 0,
          assessmentStatus: 'Not Completed',
          daysActive: 0,
          avgMood: 0,
          avgEnergy: 0,
          avgSymptoms: 0
        })
      }

    } catch (error: any) {
      console.error('❌ Failed to fetch user data:', error)
      setError('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleSave = async () => {
    if (!user || !db) return

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      console.log('💾 Updating user profile')

      // Update user profile in Firebase
      const userDocRef = doc(db, 'users', user.uid)
      await updateDoc(userDocRef, {
        display_name: formData.displayName,
        'settings.notifications': formData.notifications,
        'settings.email_updates': formData.emailUpdates,
        updated_at: new Date().toISOString()
      })

      setIsEditing(false)
      setSuccess('Profile updated successfully!')
      console.log('✅ Profile updated successfully')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)

    } catch (error: any) {
      console.error('❌ Failed to save profile:', error)
      setError('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDataExport = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError('')

      console.log('📤 Exporting user data')

      // Fetch all user data in parallel
      const [userProfile, healthLogs, chatHistory] = await Promise.allSettled([
        db ? getDoc(doc(db, 'users', user.uid)).then(doc => doc.exists() ? doc.data() : null) : Promise.resolve(null),
        backendAPI.getHealthLogs(user.uid),
        aiService.getChatHistory(user.uid)
      ])

      // Process results
      const profile = userProfile.status === 'fulfilled' ? userProfile.value : null
      const logs = healthLogs.status === 'fulfilled' ? healthLogs.value : []
      const chats = chatHistory.status === 'fulfilled' ? chatHistory.value : []

      // Prepare export data
      const exportData = {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: formData.displayName,
          exportDate: new Date().toISOString(),
          memberSince: profile?.created_at || 'Unknown'
        },
        profile: profile,
        healthLogs: logs.map(log => ({
          date: log.date,
          mood: log.mood,
          energy: log.energy,
          symptom_severity: log.symptom_severity,
          symptoms: log.symptoms,
          triggers: log.triggers,
          notes: log.notes,
          timestamp: log.timestamp
        })),
        chatHistory: chats.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp
        })),
        summary: {
          ...userStats,
          exportGenerated: new Date().toISOString()
        },
        metadata: {
          exportVersion: '1.0',
          format: 'JSON',
          totalRecords: logs.length + chats.length,
          dataTypes: ['profile', 'healthLogs', 'chatHistory', 'summary']
        }
      }

      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

      const exportFileDefaultName = `ibs-care-data-${user.uid}-${new Date().toISOString().split('T')[0]}.json`

      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()

      setSuccess('Your data has been exported successfully!')
      console.log('✅ Data export completed')
      setTimeout(() => setSuccess(''), 5000)

    } catch (error: any) {
      console.error('❌ Failed to export data:', error)
      setError('Failed to export data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = () => {
    // For Firebase Auth users, redirect to password reset
    const resetUrl = `https://accounts.google.com/signin/recovery?email=${encodeURIComponent(user?.email || '')}`
    window.open(resetUrl, '_blank')
  }

  const handleTwoFactorAuth = () => {
    // Redirect to Google account security page for 2FA
    window.open('https://myaccount.google.com/security', '_blank')
  }

  const handleViewSessions = () => {
    // Redirect to Google account device activity page
    window.open('https://myaccount.google.com/device-activity', '_blank')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-8">Please sign in to access your profile</p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg transition-all duration-200"
          >
            Sign In
          </Link>
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

            {/* Sign Out Button */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
              </div>
              
              <button
                onClick={() => setIsEditing(!isEditing)}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 shadow-lg transition-all duration-200"
              >
                <Edit3 className="h-5 w-5 mr-2" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                {success}
              </div>
            )}

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
              <div className="flex items-center space-x-6 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {formData.displayName.charAt(0).toUpperCase()}
                  </div>
                  {isEditing && (
                    <button className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50">
                      <Camera className="h-4 w-4 text-gray-600" />
                    </button>
                  )}
                </div>
                
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={formData.displayName}
                          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Enter your display name"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{formData.displayName}</h2>
                      <p className="text-gray-600 flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {formData.email}
                      </p>
                      <div className="mt-3 flex items-center space-x-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Active
                        </span>
                        <span className="text-sm text-gray-500">
                          {userStats.totalLogs} health logs • {userStats.daysActive} days tracked
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 transition-all"
                  >
                    {loading ? (
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {/* Account Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Account Security */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Account Security</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Password</p>
                      <p className="text-sm text-gray-600">Reset your account password</p>
                    </div>
                    <button
                      onClick={handlePasswordChange}
                      className="inline-flex items-center text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      Reset
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Two-Factor Auth</p>
                      <p className="text-sm text-gray-600">Enhanced account security</p>
                    </div>
                    <button
                      onClick={handleTwoFactorAuth}
                      className="inline-flex items-center text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      Setup
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <div>
                      <p className="font-medium text-gray-900">Login Activity</p>
                      <p className="text-sm text-gray-600">View recent sign-ins</p>
                    </div>
                    <button
                      onClick={handleViewSessions}
                      className="inline-flex items-center text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      View
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Preferences & Data Export */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Settings className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Preferences & Data</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Push Notifications</p>
                      <p className="text-sm text-gray-600">Daily reminders and tips</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.notifications}
                        onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                        className="sr-only peer"
                        disabled={!isEditing}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 peer-disabled:opacity-50"></div>
                    </label>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Email Updates</p>
                      <p className="text-sm text-gray-600">Weekly health summaries</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.emailUpdates}
                        onChange={(e) => setFormData({ ...formData, emailUpdates: e.target.checked })}
                        className="sr-only peer"
                        disabled={!isEditing}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 peer-disabled:opacity-50"></div>
                    </label>
                  </div>
                  
                  <div className="flex justify-between items-center py-3">
                    <div>
                      <p className="font-medium text-gray-900">Data Export</p>
                      <p className="text-sm text-gray-600">Download all your health data</p>
                    </div>
                    <button
                      onClick={handleDataExport}
                      disabled={loading}
                      className="inline-flex items-center text-purple-600 hover:text-purple-700 text-sm font-medium disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-1" />
                      )}
                      Export
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Summary */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Health Summary</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600 mb-1">
                    {loading ? '...' : userStats.totalLogs}
                  </p>
                  <p className="text-xs text-gray-600">Total Logs</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600 mb-1">
                    {loading ? '...' : userStats.daysActive}
                  </p>
                  <p className="text-xs text-gray-600">Days Active</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600 mb-1">
                    {loading ? '...' : `${userStats.avgMood.toFixed(1)}/10`}
                  </p>
                  <p className="text-xs text-gray-600">Avg Mood</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600 mb-1">
                    {loading ? '...' : `${userStats.avgEnergy.toFixed(1)}/10`}
                  </p>
                  <p className="text-xs text-gray-600">Avg Energy</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600 mb-1">
                    {loading ? '...' : `${userStats.avgSymptoms.toFixed(1)}/10`}
                  </p>
                  <p className="text-xs text-gray-600">Avg Symptoms</p>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm font-bold text-indigo-600 mb-1">
                    {loading ? '...' : userStats.assessmentStatus}
                  </p>
                  <p className="text-xs text-gray-600">Assessment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
