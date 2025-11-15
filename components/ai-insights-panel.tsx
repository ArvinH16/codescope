'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react'

const insights = [
  {
    type: 'trend',
    icon: TrendingUp,
    title: 'Increased Activity',
    description: 'Authentication module saw 40% more commits this week',
    severity: 'info',
    color: 'text-blue-400'
  },
  {
    type: 'alert',
    icon: AlertCircle,
    title: 'Code Complexity',
    description: 'API gateway module complexity increased by 15%',
    severity: 'warning',
    color: 'text-orange-400'
  },
  {
    type: 'suggestion',
    icon: Lightbulb,
    title: 'Refactor Opportunity',
    description: 'Consider splitting large database utility file',
    severity: 'suggestion',
    color: 'text-cyan-400'
  },
]

const severityColors = {
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  warning: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  suggestion: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
}

export function AIInsightsPanel() {
  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, idx) => (
            <div key={idx} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <insight.icon className={`w-4 h-4 ${insight.color}`} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white font-medium text-sm">{insight.title}</p>
                    <Badge variant="outline" className={`${severityColors[insight.severity]} text-xs`}>
                      {insight.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
