"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  GitBranch,
  GitCommit,
  Users,
  Code2,
  Sparkles,
  TrendingUp,
  Activity,
  Send,
  LogOut,
  ArrowLeft,
} from "lucide-react"
import { CommitTimeline } from "@/components/commit-timeline"
import { ContributorStats } from "@/components/contributor-stats"
import { ModuleOwnership } from "@/components/module-ownership"
import { ActivityChart } from "@/components/activity-chart"
import { AIInsightsPanel } from "@/components/ai-insights-panel"
import SignOutButton from '@/components/ui/sign-out-button'

const mockStats = [
  { label: "Total Commits", value: "2,847", icon: GitCommit, trend: "+12%", color: "from-blue-500 to-cyan-500" },
  { label: "Active Contributors", value: "24", icon: Users, trend: "+3", color: "from-purple-500 to-pink-500" },
  { label: "Files Changed", value: "1,432", icon: Code2, trend: "+8%", color: "from-orange-500 to-red-500" },
  { label: "Code Quality", value: "94%", icon: TrendingUp, trend: "+2%", color: "from-green-500 to-emerald-500" },
]

export default function DashboardPage() {
  const router = useRouter()
  const params = useParams()
  const repoName = params.repo as string

  const [chatInput, setChatInput] = useState("")
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI assistant. Ask me anything about your repository activity, code patterns, or contributor insights.",
    },
  ])

  const handleSendMessage = () => {
    if (!chatInput.trim()) return

    const newMessages = [
      ...chatMessages,
      { role: "user" as const, content: chatInput },
      {
        role: "assistant" as const,
        content:
          "Based on recent commits, I can see increased activity in the authentication module. Would you like me to analyze specific contributors or code patterns?",
      },
    ]
    setChatMessages(newMessages)
    setChatInput("")
  }

  const handleSignOut = () => {
    router.push("/login")
  }

  const handleBackToRepos = () => {
    router.push("/repositories")
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
              onClick={handleBackToRepos}
              className="text-slate-400 hover:text-white hover:bg-slate-800 mr-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CodeScope</h1>
              <p className="text-xs text-slate-400">{repoName}</p>
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
            <SignOutButton>
            </SignOutButton>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {mockStats.map((stat) => (
            <Card key={stat.label} className="border-slate-800 bg-slate-900/50 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
                    {stat.trend}
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="commits" className="w-full">
              <TabsList className="bg-slate-900/50 border border-slate-800">
                <TabsTrigger value="commits">Commit Timeline</TabsTrigger>
                <TabsTrigger value="contributors">Contributors</TabsTrigger>
                <TabsTrigger value="modules">Modules</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="commits" className="mt-4">
                <CommitTimeline />
              </TabsContent>

              <TabsContent value="contributors" className="mt-4">
                <ContributorStats />
              </TabsContent>

              <TabsContent value="modules" className="mt-4">
                <ModuleOwnership />
              </TabsContent>

              <TabsContent value="activity" className="mt-4">
                <ActivityChart />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <AIInsightsPanel />

            {/* AI Chat Assistant */}
            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  AI Assistant
                </CardTitle>
                <CardDescription>Ask questions about your repository</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-64 overflow-y-auto space-y-3 mb-4 pr-2">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        {msg.role === "assistant" && (
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div
                          className={`rounded-lg p-3 max-w-[80%] text-sm ${
                            msg.role === "user" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-200"
                          }`}
                        >
                          {msg.content}
                        </div>
                        {msg.role === "user" && (
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback className="text-xs">JD</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask about commits, contributors..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
