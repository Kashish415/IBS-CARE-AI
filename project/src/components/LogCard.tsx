import { Edit, Trash2, Calendar, Heart, Zap, Activity } from 'lucide-react'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { formatDate, getMoodEmoji, getEnergyColor, getSeverityColor } from '../lib/utils'
import type { DailyLog } from '../types/database'

interface LogCardProps {
  log: DailyLog
  onEdit: () => void
  onDelete: () => void
  isDeleting: boolean
}

export function LogCard({ log, onEdit, onDelete, isDeleting }: LogCardProps) {
  const symptoms = Array.isArray(log.symptoms) ? log.symptoms : []

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(log.log_date)}
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          {log.mood && (
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-1">{getMoodEmoji(log.mood)}</div>
              <p className="text-sm font-medium capitalize">{log.mood}</p>
              <p className="text-xs text-gray-600">Mood</p>
            </div>
          )}
          
          {log.energy !== null && (
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Zap className={`h-5 w-5 ${getEnergyColor(log.energy)}`} />
              </div>
              <p className="text-sm font-medium">{log.energy}/10</p>
              <p className="text-xs text-gray-600">Energy</p>
            </div>
          )}
          
          {log.symptom_severity !== null && (
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Activity className={`h-5 w-5 ${getSeverityColor(log.symptom_severity)}`} />
              </div>
              <p className="text-sm font-medium">{log.symptom_severity}/10</p>
              <p className="text-xs text-gray-600">Symptoms</p>
            </div>
          )}
        </div>

        {/* Symptoms */}
        {symptoms.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Specific Symptoms</h4>
            <div className="flex flex-wrap gap-2">
              {symptoms.map((symptom: any, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800"
                >
                  {symptom.name}
                  {symptom.severity && (
                    <span className="ml-1 text-red-600">({symptom.severity}/10)</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Health Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {log.sleep_hours && (
            <div>
              <span className="text-gray-600">Sleep:</span>
              <span className="ml-1 font-medium">{log.sleep_hours}h</span>
            </div>
          )}
          
          {log.water_ml && (
            <div>
              <span className="text-gray-600">Water:</span>
              <span className="ml-1 font-medium">{log.water_ml}ml</span>
            </div>
          )}
        </div>

        {/* Meals */}
        {log.meals && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Meals</h4>
            <p className="text-sm text-gray-600 line-clamp-2">{log.meals}</p>
          </div>
        )}

        {/* Notes */}
        {log.notes && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Notes</h4>
            <p className="text-sm text-gray-600 line-clamp-3">{log.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}