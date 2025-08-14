import React, { useState } from 'react'
import { Download, Filter, Search, Calendar } from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { LogCard } from '../components/LogCard'
import { useLogs } from '../hooks/useLogs'

export function History() {
  const { logs, isLoading, updateLog, deleteLog, isUpdating, isDeleting } = useLogs()
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [editingLog, setEditingLog] = useState<any>(null)

  const handleEditLog = (log: any) => {
    setEditingLog(log)
    // In a real app, you might open a modal or navigate to an edit page
    console.log('Edit log:', log)
  }

  const handleDeleteLog = (id: string) => {
    if (window.confirm('Are you sure you want to delete this log? This action cannot be undone.')) {
      deleteLog(id)
    }
  }

  const handleExportData = () => {
    const dataToExport = filteredLogs.map(log => ({
      date: log.log_date,
      mood: log.mood,
      energy: log.energy,
      symptom_severity: log.symptom_severity,
      symptoms: Array.isArray(log.symptoms) ? log.symptoms.map(s => `${s.name} (${s.severity}/10)`).join(', ') : '',
      sleep_hours: log.sleep_hours,
      water_ml: log.water_ml,
      meals: log.meals,
      notes: log.notes
    }))

    const csvContent = [
      Object.keys(dataToExport[0] || {}).join(','),
      ...dataToExport.map(row => Object.values(row).map(val => `"${val || ''}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ibs-care-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Filter logs based on search term and date filter
  const filteredLogs = logs.filter(log => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      log.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.meals?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.mood?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(log.symptoms) && log.symptoms.some((s: any) => 
        s.name?.toLowerCase().includes(searchTerm.toLowerCase())
      ))

    // Date filter
    const logDate = new Date(log.log_date)
    const now = new Date()
    let matchesDate = true

    switch (dateFilter) {
      case 'week':
        matchesDate = logDate >= subDays(now, 7)
        break
      case 'month':
        matchesDate = logDate >= startOfMonth(now) && logDate <= endOfMonth(now)
        break
      case '3months':
        matchesDate = logDate >= subDays(now, 90)
        break
      default:
        matchesDate = true
    }

    return matchesSearch && matchesDate
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health History</h1>
          <p className="text-gray-600">
            Browse and analyze your complete health tracking history.
          </p>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters & Actions
            </CardTitle>
            <CardDescription>
              Search through your logs and export your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search notes, meals, symptoms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="week">Last 7 Days</option>
                <option value="month">This Month</option>
                <option value="3months">Last 3 Months</option>
              </select>

              {/* Export Button */}
              <Button
                onClick={handleExportData}
                disabled={filteredLogs.length === 0}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing {filteredLogs.length} of {logs.length} log entries
            {searchTerm && ` matching "${searchTerm}"`}
            {dateFilter !== 'all' && ` from ${dateFilter === 'week' ? 'last 7 days' : 
              dateFilter === 'month' ? 'this month' : 'last 3 months'}`}
          </p>
        </div>

        {/* Logs Grid */}
        {filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {logs.length === 0 ? 'No logs yet' : 'No matching logs found'}
              </h3>
              <p className="text-gray-600 mb-4">
                {logs.length === 0 
                  ? 'Start tracking your daily symptoms to build your health history.'
                  : 'Try adjusting your search terms or date filter.'
                }
              </p>
              {logs.length === 0 && (
                <Button onClick={() => window.location.href = '/logs'}>
                  Add Your First Log
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredLogs.map((log) => (
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
  )
}