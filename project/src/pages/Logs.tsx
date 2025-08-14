import React, { useState } from 'react'
import { Plus, Calendar, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { LogForm } from '../components/LogForm'
import { LogCard } from '../components/LogCard'
import { useLogs } from '../hooks/useLogs'
import { formatDate } from '../lib/utils'

export function Logs() {
  const { logs, isLoading, createLog, updateLog, deleteLog, isCreating, isUpdating, isDeleting } = useLogs()
  const [showForm, setShowForm] = useState(false)
  const [editingLog, setEditingLog] = useState<any>(null)

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayLog = logs.find(log => log.log_date === today)

  const handleCreateLog = (logData: any) => {
    createLog(logData)
    setShowForm(false)
  }

  const handleUpdateLog = (logData: any) => {
    if (editingLog) {
      updateLog({ id: editingLog.id, ...logData })
      setEditingLog(null)
    }
  }

  const handleDeleteLog = (id: string) => {
    if (window.confirm('Are you sure you want to delete this log? This action cannot be undone.')) {
      deleteLog(id)
    }
  }

  const handleEditLog = (log: any) => {
    setEditingLog(log)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingLog(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Logs</h1>
              <p className="text-gray-600">
                Track your daily symptoms, mood, and health metrics to identify patterns and trends.
              </p>
            </div>
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {todayLog ? 'Update Today' : 'Add Today\'s Log'}
              </Button>
            )}
          </div>
        </div>

        {/* Today's Status */}
        {!showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Today's Status
              </CardTitle>
              <CardDescription>
                {formatDate(today)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayLog ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 font-medium">✓ Log completed for today</p>
                    <p className="text-sm text-gray-600">
                      You can update your log throughout the day as needed.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleEditLog(todayLog)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Today's Log
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 font-medium">No log for today yet</p>
                    <p className="text-sm text-gray-600">
                      Add your first log entry to start tracking your health patterns.
                    </p>
                  </div>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Today's Log
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Log Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingLog ? 'Update Log Entry' : 'Add New Log Entry'}
              </CardTitle>
              <CardDescription>
                {editingLog 
                  ? `Editing log for ${formatDate(editingLog.log_date)}`
                  : `Adding log for ${formatDate(today)}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogForm
                initialData={editingLog}
                onSubmit={editingLog ? handleUpdateLog : handleCreateLog}
                onCancel={handleCancelForm}
                isSubmitting={isCreating || isUpdating}
              />
            </CardContent>
          </Card>
        )}

        {/* Recent Logs */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Logs</h2>
            <p className="text-sm text-gray-600">
              {logs.length} {logs.length === 1 ? 'entry' : 'entries'} total
            </p>
          </div>

          {logs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No logs yet</h3>
                <p className="text-gray-600 mb-4">
                  Start tracking your daily symptoms and health metrics to see patterns and get personalized insights.
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Log
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <LogCard
                  key={log.id}
                  log={log}
                  onEdit={() => handleEditLog(log)}
                  onDelete={() => handleDeleteLog(log.id)}
                  isDeleting={isDeleting}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}