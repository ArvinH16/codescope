'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react'

// Filler data for expertise
const EXPERTISE_AREAS = [
  'Authentication', 'API', 'Security',
  'Performance', 'Backend', 'Database',
  'UI/UX', 'Frontend', 'Design',
  'DevOps', 'Testing', 'Infrastructure',
  'Mobile', 'Accessibility', 'Analytics'
]

// Deterministic random generator
function getExpertiseForUser(username: string): string[] {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  const tempExpertise = [...EXPERTISE_AREAS];
  const numSkills = (Math.abs(hash) % 3) + 1; // 1 to 3 skills
  const skills = [];

  for (let i = 0; i < numSkills; i++) {
    const index = Math.abs((hash + i * 13) % tempExpertise.length);
    skills.push(tempExpertise[index]);
    tempExpertise.splice(index, 1);
  }

  return skills;
}

interface Contributor {
  name: string
  avatar: string
  commits: number
  additions: number
  deletions: number
  trend: 'up' | 'down' | 'stable'
  trendValue: string
  expertise: string[]
}

interface ContributorStatsProps {
  owner: string
  repo: string
}

export function ContributorStats({ owner, repo }: ContributorStatsProps) {
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContributors() {
      try {
        const res = await fetch(`/api/repos/${owner}/${repo}/contributors-stats`)
        const data = await res.json()

        if (data.contributors) {
          const processedContributors = data.contributors.map((c: any) => ({
            ...c,
            expertise: getExpertiseForUser(c.name)
          }))
          setContributors(processedContributors.slice(0, 5)) // Take top 5
        }
      } catch (error) {
        console.error('Failed to fetch contributors:', error)
      } finally {
        setLoading(false)
      }
    }

    if (owner && repo) {
      fetchContributors()
    }
  }, [owner, repo])

  if (loading) {
    return (
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur w-full h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p>Loading contributors...</p>
        </div>
      </Card>
    )
  }

  const maxCommits = Math.max(...contributors.map(c => c.commits), 1)

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
                    <AvatarImage src={contributor.avatar} />
                    <AvatarFallback>{contributor.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium">{contributor.name}</p>
                    <p className="text-sm text-slate-400">{contributor.commits} commits</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {contributor.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : contributor.trend === 'down' ? (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  ) : (
                    <span className="text-slate-400 text-xs">—</span>
                  )}
                  <span className={
                    contributor.trend === 'up' ? 'text-green-400 text-sm' :
                      contributor.trend === 'down' ? 'text-red-400 text-sm' :
                        'text-slate-400 text-sm'
                  }>
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
          {contributors.length === 0 && (
            <div className="text-center text-slate-400 py-8">
              No contributors found or data is processing.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
