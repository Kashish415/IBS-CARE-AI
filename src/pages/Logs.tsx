import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Plus,
  Edit3,
  Trash2,
  Smile,
  Frown,
  Activity,
  Heart,
  Home,
  MessageSquare,
  Brain,
  Save,
  User,
  Meh,
  Zap
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import { backendAPI } from '../lib/backend-api'

interface HealthLog {
  id: string
  date: string
  mood: number
  energy: number
  symptom_severity: number
  symptoms: string[]
  triggers: string[]
  notes: string
  timestamp: string
}

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<HealthLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLog, setEditingLog] = useState<HealthLog | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user, loading: authLoading } = useAuth()

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    mood: 5,
    energy: 5,
    symptom_severity: 0,
    symptoms: '',
    triggers: '',
    notes: ''
  })

  const sidebarItems = [
    { name: 'Dashboard', icon: Home, href: '/dashboard', current: false },
    { name: 'AI Chat', icon: MessageSquare, href: '/chat', current: false },
    { name: 'Daily Log', icon: Calendar, href: '/logs', current: true },
    { name: 'Assessment', icon: Brain, href: '/assessment', current: false },
    { name: 'Profile', icon: User, href: '/profile', current: false }
  ]

  useEffect(() => {
    if (!authLoading && user) {
      fetchLogs()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [user, authLoading])

  const fetchLogs = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError('')
      
      console.log('🔄 Fetching health logs for user:', user.uid)
      const healthLogs = await backendAPI.getHealthLogs(user.uid)
      
      // Sort logs by date (newest first)
      const sortedLogs = healthLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      setLogs(sortedLogs)
      console.log(`✅ Loaded ${sortedLogs.length} health logs`)
    } catch (error: any) {
      console.error('❌ Failed to fetch logs:', error)
      setError('Failed to load logs. Please try again.')
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('You must be logged in to save logs')
      return
    }

    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const logData = {
        date: formData.date,
        mood: formData.mood,
        energy: formData.energy,
        symptom_severity: formData.symptom_severity,
        symptoms: formData.symptoms.split(',').map(s => s.trim()).filter(Boolean),
        triggers: formData.triggers.split(',').map(t => t.trim()).filter(Boolean),
        notes: formData.notes
      }

      console.log('💾 Saving health log:', logData)
      await backendAPI.saveHealthLog(user.uid, logData)
      
      setSuccess(editingLog ? 'Log updated successfully!' : 'Log saved successfully!')
      console.log('✅ Health log saved successfully')

      await fetchLogs()
      resetForm()
    } catch (error: any) {
      console.error('❌ Failed to save log:', error)
      setError('Failed to save log. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (log: HealthLog) => {
    setEditingLog(log)
    setFormData({
      date: log.date,
      mood: log.mood,
      energy: log.energy,
      symptom_severity: log.symptom_severity,
      symptoms: log.symptoms.join(', '),
      triggers: log.triggers.join(', '),
      notes: log.notes
    })
    setShowForm(true)
  }

  const handleDelete = async (logId: string) => {
    if (!window.confirm('Are you sure you want to delete this log?')) {
      return
    }

    try {
      // Note: Delete functionality would need to be implemented in backend API
      // For now, show a message that this feature is coming soon
      setError('Delete functionality coming soon. Please contact support if you need logs removed.')
    } catch (error: any) {
      console.error('❌ Failed to delete log:', error)
      setError('Failed to delete log')
    }
  }

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      mood: 5,
      energy: 5,
      symptom_severity: 0,
      symptoms: '',
      triggers: '',
      notes: ''
    })
    setEditingLog(null)
    setShowForm(false)
  }

  const getMoodIcon = (mood: number) => {
    if (mood >= 7) return <Smile className="h-5 w-5 text-green-500" />
    if (mood >= 4) return <Meh className="h-5 w-5 text-yellow-500" />
    return <Frown className="h-5 w-5 text-red-500" />
  }

  const getEnergyIcon = (energy: number) => {
    if (energy >= 7) return <Zap className="h-5 w-5 text-blue-500" />
    if (energy >= 4) return <Activity className="h-5 w-5 text-yellow-500" />
    return <Activity className="h-5 w-5 text-gray-400" />
  }

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'text-green-600 bg-green-50'
    if (severity <= 6) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-8">Please sign in to access your health logs</p>
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
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Daily Health Logs</h1>
                <p className="text-gray-600 mt-2">Track your symptoms, mood, and progress over time</p>
              </div>
              
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                {showForm ? 'Cancel' : 'Add New Log'}
              </button>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                {success}
              </div>
            )}

            {/* Log Form */}
            {showForm && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {editingLog ? 'Edit Log' : 'Add New Log'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mood (1-10): {formData.mood}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.mood}
                        onChange={(e) => setFormData({ ...formData, mood: parseInt(e.target.value) })}
                        className="w-full accent-purple-600"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Very Low</span>
                        <span>Very High</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Energy Level (1-10): {formData.energy}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.energy}
                        onChange={(e) => setFormData({ ...formData, energy: parseInt(e.target.value) })}
                        className="w-full accent-blue-600"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Very Low</span>
                        <span>Very High</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Symptom Severity (0-10): {formData.symptom_severity}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={formData.symptom_severity}
                        onChange={(e) => setFormData({ ...formData, symptom_severity: parseInt(e.target.value) })}
                        className="w-full accent-red-600"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>No Symptoms</span>
                        <span>Very Severe</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Symptoms (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.symptoms}
                      onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                      placeholder="e.g., bloating, cramping, gas, diarrhea, constipation"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Potential Triggers (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.triggers}
                      onChange={(e) => setFormData({ ...formData, triggers: e.target.value })}
                      placeholder="e.g., dairy, stress, spicy food, coffee, alcohol"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      placeholder="How are you feeling today? Any other observations about your symptoms, diet, or activities..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          {editingLog ? 'Update Log' : 'Save Log'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={submitting}
                      className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Logs List */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Your Health History</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {logs.length > 0 ? `${logs.length} logs tracked` : 'No logs yet'}
                </p>
              </div>
              
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading logs...</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No logs yet</h3>
                  <p className="text-gray-600 mb-4">Start tracking your health to see insights and patterns over time.</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Log
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <h3 className="text-lg font-medium text-gray-900">
                              {formatDate(log.date)}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {getMoodIcon(log.mood)}
                              {getEnergyIcon(log.energy)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Mood:</span>
                              <span className="font-medium text-purple-600">{log.mood}/10</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Energy:</span>
                              <span className="font-medium text-blue-600">{log.energy}/10</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Symptoms:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.symptom_severity)}`}>
                                {log.symptom_severity}/10
                              </span>
                            </div>
                          </div>
                          
                          {log.symptoms.length > 0 && (
                            <div className="mb-2">
                              <span className="text-sm text-gray-600">Symptoms: </span>
                              <span className="text-sm">{log.symptoms.join(', ')}</span>
                            </div>
                          )}
                          
                          {log.triggers.length > 0 && (
                            <div className="mb-2">
                              <span className="text-sm text-gray-600">Triggers: </span>
                              <span className="text-sm">{log.triggers.join(', ')}</span>
                            </div>
                          )}
                          
                          {log.notes && (
                            <p className="text-sm text-gray-700 mt-2 italic">"{log.notes}"</p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(log)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Edit log"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(log.id || '')}
{/*                             onClick={() => handleDelete(log.dateISO)} */}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete log"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Logs
