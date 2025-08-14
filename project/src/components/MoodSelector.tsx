import React from 'react'
import { cn } from '../lib/utils'

interface MoodSelectorProps {
  value: string
  onChange: (mood: string) => void
}

const moods = [
  { value: 'terrible', emoji: '😢', label: 'Terrible' },
  { value: 'bad', emoji: '😞', label: 'Bad' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'good', emoji: '🙂', label: 'Good' },
  { value: 'great', emoji: '😊', label: 'Great' }
]

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="flex space-x-2">
      {moods.map((mood) => (
        <button
          key={mood.value}
          type="button"
          onClick={() => onChange(mood.value)}
          className={cn(
            'flex flex-col items-center p-3 rounded-lg border-2 transition-all hover:scale-105',
            value === mood.value
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-gray-200 hover:border-gray-300'
          )}
          aria-label={`Select ${mood.label} mood`}
        >
          <span className="text-2xl mb-1">{mood.emoji}</span>
          <span className="text-xs font-medium">{mood.label}</span>
        </button>
      ))}
    </div>
  )
}