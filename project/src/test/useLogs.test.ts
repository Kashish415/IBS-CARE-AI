import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useLogs } from '../hooks/useLogs'
import React from 'react'

// Mock useAuth
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' }
  })
}))

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'test-log-id' },
            error: null
          })
        })
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'test-log-id' },
              error: null
            })
          })
        })
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: null
        })
      })
    })
  }
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  )
}

describe('useLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with empty logs array', () => {
    const { result } = renderHook(() => useLogs(), {
      wrapper: createWrapper()
    })
    
    expect(result.current.logs).toEqual([])
    expect(result.current.isLoading).toBe(true)
  })

  it('should provide CRUD methods', () => {
    const { result } = renderHook(() => useLogs(), {
      wrapper: createWrapper()
    })
    
    expect(typeof result.current.createLog).toBe('function')
    expect(typeof result.current.updateLog).toBe('function')
    expect(typeof result.current.deleteLog).toBe('function')
    expect(typeof result.current.getLogByDate).toBe('function')
  })
})