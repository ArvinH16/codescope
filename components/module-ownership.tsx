'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Folder, Code2 } from 'lucide-react'

const modules = [
  {
    name: 'Authentication',
    path: 'src/auth',
    files: 24,
    lines: 3421,
    owner: { name: 'Sarah Chen', avatar: 'SC' },
    contributors: [
      { avatar: 'MJ', percentage: 25 },
      { avatar: 'ER', percentage: 15 },
    ],
    activity: 92,
    lastUpdate: '2 hours ago'
  },
  {
    name: 'Dashboard',
    path: 'src/dashboard',
    files: 42,
    lines: 5678,
    owner: { name: 'Emily Rodriguez', avatar: 'ER' },
    contributors: [
      { avatar: 'SC', percentage: 20 },
      { avatar: 'DK', percentage: 10 },
    ],
    activity: 85,
    lastUpdate: '5 hours ago'
  },
  {
    name: 'API Gateway',
    path: 'src/api',
    files: 18,
    lines: 2890,
    owner: { name: 'Mike Johnson', avatar: 'MJ' },
    contributors: [
      { avatar: 'DK', percentage: 30 },
      { avatar: 'SC', percentage: 15 },
    ],
    activity: 78,
    lastUpdate: '1 day ago'
  },
  {
    name: 'Database Layer',
    path: 'src/db',
    files: 15,
    lines: 2134,
    owner: { name: 'David Kim', avatar: 'DK' },
    contributors: [
      { avatar: 'MJ', percentage: 35 },
      { avatar: 'SC', percentage: 10 },
    ],
    activity: 65,
    lastUpdate: '1 day ago'
  },
]

export function ModuleOwnership() {
  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white">Module Ownership</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {modules.map((module) => (
            <div key={module.path} className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <Folder className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{module.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{module.path}</p>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <p>{module.files} files</p>
                  <p>{module.lines.toLocaleString()} lines</p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">{module.owner.avatar}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-slate-300">Primary Owner</span>
                  </div>
                  <span className="text-xs text-slate-400">{module.lastUpdate}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Contributors:</span>
                  <div className="flex -space-x-2">
                    {module.contributors.map((contributor, idx) => (
                      <Avatar key={idx} className="w-6 h-6 border-2 border-slate-900">
                        <AvatarFallback className="text-xs">{contributor.avatar}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Activity Level</span>
                    <span className="text-cyan-400">{module.activity}%</span>
                  </div>
                  <Progress value={module.activity} className="h-1.5 bg-slate-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
