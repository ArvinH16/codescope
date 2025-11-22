'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown } from 'lucide-react'

const contributors = [
  {
    name: 'Sarah Chen',
    avatar: 'SC',
    commits: 487,
    additions: 12453,
    deletions: 3421,
    trend: 'up',
    trendValue: '+15%',
    expertise: ['Authentication', 'API', 'Security']
  },
  {
    name: 'Mike Johnson',
    avatar: 'MJ',
    commits: 392,
    additions: 9834,
    deletions: 4102,
    trend: 'up',
    trendValue: '+8%',
    expertise: ['Performance', 'Backend', 'Database']
  },
  {
    name: 'Emily Rodriguez',
    avatar: 'ER',
    commits: 345,
    additions: 11234,
    deletions: 2876,
    trend: 'up',
    trendValue: '+12%',
    expertise: ['UI/UX', 'Frontend', 'Design']
  },
  {
    name: 'David Kim',
    avatar: 'DK',
    commits: 298,
    additions: 7654,
    deletions: 3210,
    trend: 'down',
    trendValue: '-3%',
    expertise: ['Database', 'DevOps', 'Testing']
  },
]

export function ContributorStats() {
  const maxCommits = Math.max(...contributors.map(c => c.commits))

  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white">Top Contributors</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {contributors.map((contributor) => (
            <div key={contributor.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>{contributor.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium">{contributor.name}</p>
                    <p className="text-sm text-slate-400">{contributor.commits} commits</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {contributor.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className={contributor.trend === 'up' ? 'text-green-400 text-sm' : 'text-red-400 text-sm'}>
                    {contributor.trendValue}
                  </span>
                </div>
              </div>
              
              <Progress 
                value={(contributor.commits / maxCommits) * 100} 
                className="h-2 bg-slate-800"
              />
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex gap-3 text-slate-400">
                  <span className="text-green-400">+{contributor.additions.toLocaleString()}</span>
                  <span className="text-red-400">-{contributor.deletions.toLocaleString()}</span>
                </div>
                <div className="flex gap-1 flex-wrap justify-end">
                  {contributor.expertise.map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-slate-800 text-slate-300 text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
