import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Login } from '../../pages/Login'
import React from 'react'

// Mock useAuth hook
const mockSignIn = vi.fn()
const mockUseAuth = vi.fn(() => ({
  signIn: mockSignIn,
  signInWithGoogle: vi.fn(),
  user: null,
  loading: false
}))

vi.mock('../../hooks/useAuth', () => ({
  useAuth: mockUseAuth
}))

// Mock react-router-dom navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient },
      React.createElement(BrowserRouter, {}, children)
    )
  )
}

describe('Auth Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle successful login flow', async () => {
    mockSignIn.mockResolvedValue({ error: null })
    
    render(<Login />, { wrapper: createWrapper() })
    
    // Fill in the form
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
    })
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should handle login error', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid credentials' } })
    
    render(<Login />, { wrapper: createWrapper() })
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
    
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('should validate form inputs', async () => {
    render(<Login />, { wrapper: createWrapper() })
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
    })
    
    expect(mockSignIn).not.toHaveBeenCalled()
  })
})