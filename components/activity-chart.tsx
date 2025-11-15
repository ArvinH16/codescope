'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const activityData = [
  { date: 'Mon', commits: 12, additions: 245, deletions: 67 },
  { date: 'Tue', commits: 19, additions: 387, deletions: 123 },
  { date: 'Wed', commits: 15, additions: 298, deletions: 89 },
  { date: 'Thu', commits: 22, additions: 512, deletions: 156 },
  { date: 'Fri', commits: 28, additions: 634, deletions: 201 },
  { date: 'Sat', commits: 8, additions: 156, deletions: 45 },
  { date: 'Sun', commits: 5, additions: 98, deletions: 23 },
]

export function ActivityChart() {
  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white">Weekly Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            commits: {
              label: 'Commits',
              color: 'hsl(200, 100%, 50%)',
            },
            additions: {
              label: 'Additions',
              color: 'hsl(142, 76%, 36%)',
            },
            deletions: {
              label: 'Deletions',
              color: 'hsl(0, 84%, 60%)',
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="commitsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(59, 130, 246)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="rgb(59, 130, 246)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area 
                type="monotone" 
                dataKey="commits" 
                stroke="rgb(59, 130, 246)" 
                fill="url(#commitsGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Total Commits</p>
            <p className="text-xl font-bold text-white">109</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Lines Added</p>
            <p className="text-xl font-bold text-green-400">2,330</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Lines Removed</p>
            <p className="text-xl font-bold text-red-400">704</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
