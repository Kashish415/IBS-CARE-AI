import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Textarea } from './ui/Textarea'
import { MoodSelector } from './MoodSelector'

const logSchema = z.object({
  log_date: z.string(),
  mood: z.string().optional(),
  energy: z.number().min(0).max(10).optional(),
  symptom_severity: z.number().min(0).max(10).optional(),
  symptoms: z.array(z.object({
    name: z.string(),
    severity: z.number().min(0).max(10)
  })).optional(),
  sleep_hours: z.number().min(0).max(24).optional(),
  water_ml: z.number().min(0).optional(),
  meals: z.string().optional(),
  notes: z.string().optional()
})

type LogFormData = z.infer<typeof logSchema>

interface LogFormProps {
  initialData?: any
  onSubmit: (data: LogFormData) => void
  onCancel: () => void
  isSubmitting: boolean
}

const commonSymptoms = [
  'Abdominal pain', 'Bloating', 'Gas', 'Diarrhea', 'Constipation',
  'Nausea', 'Cramping', 'Urgency', 'Incomplete evacuation', 'Mucus in stool'
]

export function LogForm({ initialData, onSubmit, onCancel, isSubmitting }: LogFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<LogFormData>({
    resolver: zodResolver(logSchema),
    defaultValues: {
      log_date: initialData?.log_date || format(new Date(), 'yyyy-MM-dd'),
      mood: initialData?.mood || '',
      energy: initialData?.energy || undefined,
      symptom_severity: initialData?.symptom_severity || undefined,
      symptoms: initialData?.symptoms || [],
      sleep_hours: initialData?.sleep_hours || undefined,
      water_ml: initialData?.water_ml || undefined,
      meals: initialData?.meals || '',
      notes: initialData?.notes || ''
    }
  })

  const watchedSymptoms = watch('symptoms') || []
  const watchedMood = watch('mood')
  const watchedEnergy = watch('energy')
  const watchedSeverity = watch('symptom_severity')

  const handleMoodChange = (mood: string) => {
    setValue('mood', mood)
  }

  const handleSymptomToggle = (symptomName: string) => {
    const currentSymptoms = watchedSymptoms
    const existingIndex = currentSymptoms.findIndex(s => s.name === symptomName)
    
    if (existingIndex >= 0) {
      // Remove symptom
      const newSymptoms = currentSymptoms.filter((_, index) => index !== existingIndex)
      setValue('symptoms', newSymptoms)
    } else {
      // Add symptom
      const newSymptoms = [...currentSymptoms, { name: symptomName, severity: 5 }]
      setValue('symptoms', newSymptoms)
    }
  }

  const handleSymptomSeverityChange = (symptomName: string, severity: number) => {
    const currentSymptoms = watchedSymptoms
    const updatedSymptoms = currentSymptoms.map(s => 
      s.name === symptomName ? { ...s, severity } : s
    )
    setValue('symptoms', updatedSymptoms)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="log_date">Date</Label>
        <Input
          id="log_date"
          type="date"
          {...register('log_date')}
          max={format(new Date(), 'yyyy-MM-dd')}
        />
        {errors.log_date && (
          <p className="text-sm text-red-600">{errors.log_date.message}</p>
        )}
      </div>

      {/* Mood */}
      <div className="space-y-2">
        <Label>Mood</Label>
        <MoodSelector
          value={watchedMood}
          onChange={handleMoodChange}
        />
      </div>

      {/* Energy Level */}
      <div className="space-y-2">
        <Label htmlFor="energy">Energy Level (0-10)</Label>
        <div className="flex items-center space-x-4">
          <Input
            id="energy"
            type="range"
            min="0"
            max="10"
            step="1"
            {...register('energy', { valueAsNumber: true })}
            className="flex-1"
          />
          <span className="text-sm font-medium w-8 text-center">
            {watchedEnergy || 0}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Very Low</span>
          <span>Very High</span>
        </div>
      </div>

      {/* Symptom Severity */}
      <div className="space-y-2">
        <Label htmlFor="symptom_severity">Overall Symptom Severity (0-10)</Label>
        <div className="flex items-center space-x-4">
          <Input
            id="symptom_severity"
            type="range"
            min="0"
            max="10"
            step="1"
            {...register('symptom_severity', { valueAsNumber: true })}
            className="flex-1"
          />
          <span className="text-sm font-medium w-8 text-center">
            {watchedSeverity || 0}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>None</span>
          <span>Severe</span>
        </div>
      </div>

      {/* Symptoms */}
      <div className="space-y-2">
        <Label>Specific Symptoms</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {commonSymptoms.map((symptom) => {
            const isSelected = watchedSymptoms.some(s => s.name === symptom)
            const selectedSymptom = watchedSymptoms.find(s => s.name === symptom)
            
            return (
              <div key={symptom} className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleSymptomToggle(symptom)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {symptom}
                </button>
                {isSelected && (
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={selectedSymptom?.severity || 5}
                    onChange={(e) => handleSymptomSeverityChange(symptom, parseInt(e.target.value))}
                    className="w-full h-1"
                    title={`Severity: ${selectedSymptom?.severity || 5}/10`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Sleep Hours */}
      <div className="space-y-2">
        <Label htmlFor="sleep_hours">Sleep Hours</Label>
        <Input
          id="sleep_hours"
          type="number"
          step="0.5"
          min="0"
          max="24"
          placeholder="e.g., 7.5"
          {...register('sleep_hours', { valueAsNumber: true })}
        />
      </div>

      {/* Water Intake */}
      <div className="space-y-2">
        <Label htmlFor="water_ml">Water Intake (ml)</Label>
        <Input
          id="water_ml"
          type="number"
          min="0"
          placeholder="e.g., 2000"
          {...register('water_ml', { valueAsNumber: true })}
        />
        <p className="text-xs text-gray-500">
          Tip: 1 glass ≈ 250ml, 1 bottle ≈ 500ml
        </p>
      </div>

      {/* Meals */}
      <div className="space-y-2">
        <Label htmlFor="meals">Meals & Foods</Label>
        <Textarea
          id="meals"
          placeholder="Describe what you ate today..."
          {...register('meals')}
          rows={3}
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any other observations, triggers, or notes..."
          {...register('notes')}
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex space-x-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Saving...' : (initialData ? 'Update Log' : 'Save Log')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}