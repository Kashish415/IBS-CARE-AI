import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { DashboardStats } from '../types/database'
import { useAuth } from './useAuth'
import { subDays, format } from 'date-fns'

export function useDashboard() {
  const { user } = useAuth()

  const dashboardQuery = useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user')

      // Get all logs for the user
      const { data: logs, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('log_date', { ascending: false })

      if (error) throw error

      // Calculate stats
      const totalLogs = logs.length
      const daysTracked = new Set(logs.map(log => log.log_date)).size
      
      const moodValues = logs.filter(log => log.mood).map(log => {
        const moodMap: Record<string, number> = {
          'terrible': 1,
          'bad': 2,
          'okay': 3,
          'good': 4,
          'great': 5
        }
        return moodMap[log.mood!] || 3
      })

      const energyValues = logs.filter(log => log.energy !== null).map(log => log.energy!)
      const severityValues = logs.filter(log => log.symptom_severity !== null).map(log => log.symptom_severity!)

      const avgMood = moodValues.length > 0 ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length : 0
      const avgEnergy = energyValues.length > 0 ? energyValues.reduce((a, b) => a + b, 0) / energyValues.length : 0
      const avgSymptomSeverity = severityValues.length > 0 ? severityValues.reduce((a, b) => a + b, 0) / severityValues.length : 0

      const stats: DashboardStats = {
        totalLogs,
        avgMood,
        avgEnergy,
        avgSymptomSeverity,
        daysTracked,
        lastLogDate: logs.length > 0 ? logs[0].log_date : null
      }

      // Get last 30 days of data for charts
      const thirtyDaysAgo = subDays(new Date(), 30)
      const recentLogs = logs.filter(log => new Date(log.log_date) >= thirtyDaysAgo)

      // Prepare chart data
      const chartData = []
      for (let i = 29; i >= 0; i--) {
        const date = subDays(new Date(), i)
        const dateStr = format(date, 'yyyy-MM-dd')
        const dayLog = recentLogs.find(log => log.log_date === dateStr)

        const moodMap: Record<string, number> = {
          'terrible': 1,
          'bad': 2,
          'okay': 3,
          'good': 4,
          'great': 5
        }

        chartData.push({
          date: format(date, 'MMM dd'),
          mood: dayLog?.mood ? moodMap[dayLog.mood] || 3 : null,
          energy: dayLog?.energy || null,
          symptom_severity: dayLog?.symptom_severity || null,
          sleep_hours: dayLog?.sleep_hours || null,
          water_ml: dayLog?.water_ml || null
        })
      }

      return { stats, chartData, recentLogs }
    },
    enabled: !!user,
    refetchInterval: 30000 // Refetch every 30 seconds for real-time updates
  })

  return {
    stats: dashboardQuery.data?.stats,
    chartData: dashboardQuery.data?.chartData || [],
    recentLogs: dashboardQuery.data?.recentLogs || [],
    isLoading: dashboardQuery.isLoading,
    error: dashboardQuery.error
  }
}