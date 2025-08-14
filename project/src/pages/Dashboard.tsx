import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, MessageCircle, History, User, TrendingUp, Calendar, Heart, Zap } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { useDashboard } from '../hooks/useDashboard'
import { useAuth } from '../hooks/useAuth'
import { formatDate, getMoodEmoji, getEnergyColor, getSeverityColor } from '../lib/utils'
import { ChartMood } from '../components/ChartMood'
import { ChartSymptoms } from '../components/ChartSymptoms'
import { DashboardStats } from '../components/DashboardStats'

export function Dashboard() {
  const { user, profile } = useAuth()
  const { stats, chartData, isLoading } = useDashboard()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {greeting()}, {profile?.full_name || user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-600">
            Here's your health overview for today. How are you feeling?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/logs">
            <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="bg-primary/10 rounded-full p-3 mr-4">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Add Daily Log</h3>
                  <p className="text-sm text-gray-600">Track today's symptoms</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/chat">
            <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="bg-green-100 rounded-full p-3 mr-4">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Chat</h3>
                  <p className="text-sm text-gray-600">Get personalized insights</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/history">
            <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="bg-blue-100 rounded-full p-3 mr-4">
                  <History className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">View History</h3>
                  <p className="text-sm text-gray-600">Browse past logs</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/profile">
            <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="bg-purple-100 rounded-full p-3 mr-4">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Profile</h3>
                  <p className="text-sm text-gray-600">Manage settings</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats stats={stats} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ChartMood data={chartData} />
          <ChartSymptoms data={chartData} />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest health tracking entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats && stats.totalLogs > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 rounded-full p-2">
                      <Heart className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Last log entry</p>
                      <p className="text-sm text-gray-600">
                        {stats.lastLogDate ? formatDate(stats.lastLogDate) : 'No recent logs'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total logs</p>
                    <p className="font-semibold">{stats.totalLogs}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl mb-2">
                      {stats.avgMood > 0 ? getMoodEmoji(
                        stats.avgMood >= 4.5 ? 'great' :
                        stats.avgMood >= 3.5 ? 'good' :
                        stats.avgMood >= 2.5 ? 'okay' :
                        stats.avgMood >= 1.5 ? 'bad' : 'terrible'
                      ) : '😐'}
                    </div>
                    <p className="font-medium">Average Mood</p>
                    <p className="text-sm text-gray-600">
                      {stats.avgMood > 0 ? `${stats.avgMood.toFixed(1)}/5` : 'No data'}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl mb-2">
                      <Zap className={`h-6 w-6 mx-auto ${getEnergyColor(stats.avgEnergy)}`} />
                    </div>
                    <p className="font-medium">Average Energy</p>
                    <p className="text-sm text-gray-600">
                      {stats.avgEnergy > 0 ? `${stats.avgEnergy.toFixed(1)}/10` : 'No data'}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl mb-2">
                      <TrendingUp className={`h-6 w-6 mx-auto ${getSeverityColor(stats.avgSymptomSeverity)}`} />
                    </div>
                    <p className="font-medium">Avg Symptoms</p>
                    <p className="text-sm text-gray-600">
                      {stats.avgSymptomSeverity > 0 ? `${stats.avgSymptomSeverity.toFixed(1)}/10` : 'No data'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No logs yet</h3>
                <p className="text-gray-600 mb-4">
                  Start tracking your symptoms to see insights and trends here.
                </p>
                <Link to="/logs">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Log
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}