import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'

interface ChartSymptomsProps {
  data: any[]
}

export function ChartSymptoms({ data }: ChartSymptomsProps) {
  const chartData = data.filter(item => 
    item.symptom_severity !== null || item.energy !== null
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Symptoms & Energy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tick={{ fill: '#6B7280' }}
              />
              <YAxis 
                domain={[0, 10]}
                fontSize={12}
                tick={{ fill: '#6B7280' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
                formatter={(value: any, name: string) => [
                  `${value}/10`,
                  name === 'symptom_severity' ? 'Symptom Severity' : 'Energy Level'
                ]}
              />
              <Area
                type="monotone"
                dataKey="symptom_severity"
                stackId="1"
                stroke="#EF4444"
                fill="#FEE2E2"
                name="symptom_severity"
              />
              <Area
                type="monotone"
                dataKey="energy"
                stackId="2"
                stroke="#10B981"
                fill="#D1FAE5"
                name="energy"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {chartData.length === 0 && (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            <p>No symptom or energy data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}