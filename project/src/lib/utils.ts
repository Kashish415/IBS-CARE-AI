import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getMoodEmoji(mood: string): string {
  const moodMap: Record<string, string> = {
    'great': '😊',
    'good': '🙂',
    'okay': '😐',
    'bad': '😞',
    'terrible': '😢'
  }
  return moodMap[mood] || '😐'
}

export function getEnergyColor(energy: number): string {
  if (energy >= 8) return 'text-green-600'
  if (energy >= 6) return 'text-yellow-600'
  if (energy >= 4) return 'text-orange-600'
  return 'text-red-600'
}

export function getSeverityColor(severity: number): string {
  if (severity >= 8) return 'text-red-600'
  if (severity >= 6) return 'text-orange-600'
  if (severity >= 4) return 'text-yellow-600'
  return 'text-green-600'
}