"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  GitBranch,
  GitCommit,
  Users,
  Star,
  Sparkles,
  TrendingUp,
  Activity,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { CommitTimeline } from "@/components/commit-timeline"
import { ContributorStats } from "@/components/contributor-stats"
import { ModuleOwnership } from "@/components/module-ownership"
import { ActivityChart } from "@/components/activity-chart"
import { AIInsightsPanel } from "@/components/ai-insights-panel"
import { GitTree } from "@/components/git-tree"
import SignOutButton from "@/components/ui/sign-out-button"

const MIN_PANEL_WIDTH = 200
const MAX_PANEL_WIDTH = 620
const DEFAULT_PANEL_WIDTH = 320

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [isProcessed, setIsProcessed] = useState(false)
  const [gitTreeRefreshKey, setGitTreeRefreshKey] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processError, setProcessError] = useState(false)

  // AI output panel state
  const [aiEntries, setAiEntries] = useState<{ label: string; text: string }[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiLoadingLabel, setAiLoadingLabel] = useState("")

  // Resizable panel state
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH)
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const dragStartWidth = useRef(0)

  const params = useParams()
  const router = useRouter()
  const owner = params.owner as string
  const repo = params.repo as string

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/repos/${owner}/${repo}/general-statistics`)
      const data = await res.json()
      setData(data)
    }
    fetchData()
  }, [owner, repo])

  // ─── Drag-to-resize logic ──────────────────────────────────────────────────
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    dragStartX.current = e.clientX
    dragStartWidth.current = panelWidth

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      // Dragging left = wider panel, dragging right = narrower
      const delta = dragStartX.current - e.clientX
      const next = Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, dragStartWidth.current + delta))
      setPanelWidth(next)
    }

    const onMouseUp = () => {
      isDragging.current = false
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }, [panelWidth])

  // ─── AI result callback (passed down to GitTree) ───────────────────────────
  const handleAiResult = useCallback((text: string, label: string) => {
    if (text === "") {
      setAiLoading(true)
      setAiLoadingLabel(label)
    } else {
      setAiLoading(false)
      setAiLoadingLabel("")
      setAiEntries((prev) => [{ label, text }, ...prev])
    }
  }, [])

  if (!data) return null

  const { totalCommits, weeklyCommits, contributors, starGazers } = data as any
  const stats = [
    { label: "Total Commits",       value: totalCommits,  icon: GitCommit,  color: "from-blue-500 to-cyan-500"    },
    { label: "Last Week's Commits", value: weeklyCommits, icon: TrendingUp, color: "from-green-500 to-emerald-500" },
    { label: "Active Contributors", value: contributors,  icon: Users,      color: "from-purple-500 to-pink-500"  },
    { label: "Stargazers",          value: starGazers,    icon: Star,       color: "from-yellow-400 to-orange-500" },
  ]

  const processRepo = async () => {
    setIsProcessing(true)
    setProcessError(false)
    try {
      const res = await fetch(`/api/repos/${owner}/${repo}/process-repo`, {
        method: "POST",
        credentials: "include",
      })
      if (res.ok) {
        setGitTreeRefreshKey((k) => k + 1)
        router.refresh()
      } else {
        setProcessError(true)
      }
    } catch {
      setProcessError(true)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/repositories")}
              className="text-slate-400 hover:text-white hover:bg-slate-800 mr-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CodeScope</h1>
              <p className="text-xs text-slate-400">{repo}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
              <Activity className="w-3 h-3 mr-1" />
              Live
            </Badge>
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-slate-800 bg-slate-900/50 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main layout: flex row with draggable divider */}
        <div className="flex items-start">
          {/* Left: tabs content */}
          <div className="flex-1 min-w-0 space-y-6 mr-2">
            <Tabs defaultValue="git-tree" className="w-full">
              <TabsList className="bg-slate-900/50 border border-slate-800">
              <TabsTrigger value="git-tree"     className="data-[state=inactive]:text-white">Git Tree</TabsTrigger> 
                <TabsTrigger value="commits"      className="data-[state=inactive]:text-white">Commit Timeline</TabsTrigger>
                <TabsTrigger value="contributors" className="data-[state=inactive]:text-white">Contributors</TabsTrigger>
                <TabsTrigger value="modules"      className="data-[state=inactive]:text-white">Modules</TabsTrigger>
                <TabsTrigger value="activity"     className="data-[state=inactive]:text-white">Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="git-tree"     className="mt-4">
                <GitTree owner={owner} repo={repo} onAiResult={handleAiResult} onProcessedChange={setIsProcessed} refreshKey={gitTreeRefreshKey} />
              </TabsContent>
              <TabsContent value="commits"      className="mt-4"><CommitTimeline /></TabsContent>
              <TabsContent value="contributors" className="mt-4"><ContributorStats owner={owner} repo={repo} /></TabsContent>
              <TabsContent value="modules"      className="mt-4"><ModuleOwnership /></TabsContent>
              <TabsContent value="activity"     className="mt-4"><ActivityChart /></TabsContent>

            </Tabs>
          </div>

          {/* Drag handle */}
          <div
            className="w-1.5 self-stretch flex-shrink-0 cursor-col-resize rounded
                       bg-slate-800 hover:bg-cyan-600 active:bg-cyan-500 transition-colors"
            onMouseDown={handleDragStart}
            title="Drag to resize panel"
          />

          {/* Right: resizable AI output panel */}
          <div
            className="flex-shrink-0 space-y-6 ml-2"
            style={{ width: panelWidth }}
          >
            <Button
              onClick={processRepo}
              disabled={isProcessing}
              className={`w-full ${processError ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700" : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"}`}
            >
              {isProcessing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : processError ? (
                <><AlertCircle className="w-4 h-4" /> Error — Try Again</>
              ) : (
                isProcessed ? "Update Repository" : "Process Repository"
              )}
            </Button>

            {/* AI Output Panel */}
            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  AI Output
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 overflow-y-auto max-h-[600px] pr-1">
                  {aiLoading && (
                    <div className="border border-slate-700 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-2 truncate" title={aiLoadingLabel}>{aiLoadingLabel}</p>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                        <span className="text-sm">Analyzing…</span>
                      </div>
                    </div>
                  )}
                  {aiEntries.map((entry, i) => (
                    <div key={i} className="border border-slate-700 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-2 truncate" title={entry.label}>{entry.label}</p>
                      <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{entry.text}</p>
                    </div>
                  ))}
                  {!aiLoading && aiEntries.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-8">
                      No results yet. Right-click a file or folder in the Git Tree tab to run an analysis.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
