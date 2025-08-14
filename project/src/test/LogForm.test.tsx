import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LogForm } from '../components/LogForm'

describe('LogForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    isSubmitting: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form fields correctly', () => {
    render(<LogForm {...defaultProps} />)
    
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mood/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/energy level/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/symptom severity/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/sleep hours/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/water intake/i)).toBeInTheDocument()
  })

  it('calls onSubmit when form is submitted with valid data', async () => {
    render(<LogForm {...defaultProps} />)
    
    const submitButton = screen.getByRole('button', { name: /save log/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    })
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(<LogForm {...defaultProps} />)
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)
    
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('disables form when isSubmitting is true', () => {
    render(<LogForm {...defaultProps} isSubmitting={true} />)
    
    const submitButton = screen.getByRole('button', { name: /saving/i })
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    
    expect(submitButton).toBeDisabled()
    expect(cancelButton).toBeDisabled()
  })

  it('populates form with initial data when provided', () => {
    const initialData = {
      log_date: '2024-01-15',
      mood: 'good',
      energy: 7,
      symptom_severity: 3,
      sleep_hours: 8,
      water_ml: 2000,
      meals: 'Breakfast: oatmeal',
      notes: 'Feeling better today'
    }

    render(<LogForm {...defaultProps} initialData={initialData} />)
    
    expect(screen.getByDisplayValue('2024-01-15')).toBeInTheDocument()
    expect(screen.getByDisplayValue('8')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2000')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Breakfast: oatmeal')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Feeling better today')).toBeInTheDocument()
  })
})