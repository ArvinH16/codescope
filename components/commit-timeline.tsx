'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { GitCommit, Sparkles } from 'lucide-react'

const mockCommits = [
  {
    id: '1',
    message: 'Add user authentication with JWT tokens',
    author: 'Sarah Chen',
    avatar: 'SC',
    time: '2 hours ago',
    files: 8,
    additions: 245,
    deletions: 12,
    aiSummary: 'Implemented secure JWT-based authentication with refresh token support and rate limiting.',
    impact: 'high'
  },
  {
    id: '2',
    message: 'Fix memory leak in data processing pipeline',
    author: 'Mike Johnson',
    avatar: 'MJ',
    time: '5 hours ago',
    files: 3,
    additions: 42,
    deletions: 38,
    aiSummary: 'Resolved memory leak by properly disposing event listeners and clearing cache on unmount.',
    impact: 'critical'
  },
  {
    id: '3',
    message: 'Update dashboard UI components',
    author: 'Emily Rodriguez',
    avatar: 'ER',
    time: '1 day ago',
    files: 12,
    additions: 156,
    deletions: 89,
    aiSummary: 'Modernized UI with new design system, improved accessibility, and responsive layouts.',
    impact: 'medium'
  },
  {
    id: '4',
    message: 'Optimize database queries for performance',
    author: 'David Kim',
    avatar: 'DK',
    time: '1 day ago',
    files: 5,
    additions: 67,
    deletions: 23,
    aiSummary: 'Added indexes and query optimization reducing average response time by 40%.',
    impact: 'high'
  },
  {
    id: '5',
    message: 'Add unit tests for payment module',
    author: 'Sarah Chen',
    avatar: 'SC',
    time: '2 days ago',
    files: 6,
    additions: 312,
    deletions: 5,
    aiSummary: 'Comprehensive test coverage for payment processing with edge case handling.',
    impact: 'medium'
  },
]

const impactColors = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  low: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
}

export function CommitTimeline() {
  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white">Recent Commits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockCommits.map((commit, idx) => (
            <div key={commit.id} className="relative">
              {idx !== mockCommits.length - 1 && (
                <div className="absolute left-5 top-12 bottom-0 w-px bg-slate-800" />
              )}
              <div className="flex gap-4">
                <Avatar className="w-10 h-10 border-2 border-slate-800 relative z-10">
                  <AvatarFallback className="text-xs">{commit.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white font-medium">{commit.message}</p>
                      <p className="text-sm text-slate-400">
                        {commit.author} • {commit.time}
                      </p>
                    </div>
                    <Badge variant="outline" className={impactColors[commit.impact as keyof typeof impactColors]}>
                      {commit.impact}
                    </Badge>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                    <div className="flex items-start gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-300">{commit.aiSummary}</p>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-400">
                      <span>{commit.files} files</span>
                      <span className="text-green-400">+{commit.additions}</span>
                      <span className="text-red-400">-{commit.deletions}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
