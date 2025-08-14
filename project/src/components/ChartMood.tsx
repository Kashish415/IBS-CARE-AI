import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'

interface ChartMoodProps {
  data: any[]
}

export function ChartMood({ data }: ChartMoodProps) {
  const chartData = data.filter(item => item.mood !== null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tick={{ fill: '#6B7280' }}
              />
              <YAxis 
                domain={[1, 5]}
                fontSize={12}
                tick={{ fill: '#6B7280' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => {
                  const moodLabels = {
                    1: 'Terrible',
                    2: 'Bad', 
                    3: 'Okay',
                    4: 'Good',
                    5: 'Great'
                  }
                  return [moodLabels[value as keyof typeof moodLabels] || value, 'Mood']
                }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {chartData.length === 0 && (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            <p>No mood data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}