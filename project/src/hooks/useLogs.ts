import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { DailyLog } from '../types/database'
import { useAuth } from './useAuth'

export function useLogs() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const logsQuery = useQuery({
    queryKey: ['logs', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user')
      
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('log_date', { ascending: false })

      if (error) throw error
      return data as DailyLog[]
    },
    enabled: !!user
  })

  const createLogMutation = useMutation({
    mutationFn: async (log: Omit<DailyLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('No user')

      const { data, error } = await supabase
        .from('daily_logs')
        .insert({
          ...log,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id] })
    }
  })

  const updateLogMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DailyLog> & { id: string }) => {
      const { data, error } = await supabase
        .from('daily_logs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id] })
    }
  })

  const deleteLogMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('daily_logs')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id] })
    }
  })

  const getLogByDate = (date: string) => {
    return logsQuery.data?.find(log => log.log_date === date)
  }

  return {
    logs: logsQuery.data || [],
    isLoading: logsQuery.isLoading,
    error: logsQuery.error,
    createLog: createLogMutation.mutate,
    updateLog: updateLogMutation.mutate,
    deleteLog: deleteLogMutation.mutate,
    isCreating: createLogMutation.isPending,
    isUpdating: updateLogMutation.isPending,
    isDeleting: deleteLogMutation.isPending,
    getLogByDate
  }
}