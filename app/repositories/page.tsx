"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GitBranch, Search, Star, GitFork, Clock, LogOut, TrendingUp } from "lucide-react"
import SignOutButton from '@/components/ui/sign-out-button'
import { useEffect } from "react"
import { getStableGradient } from "@/utils/frontend/gradient-colors"



export default function RepositoriesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [repos, setRepos] = useState<any[]>([]);
  useEffect(() => {
    const fetchRepos = async () => {
      const res = await fetch("/api/user-data"); // 👈 relative API route
      const data = await res.json(); // 👈 parse JSON
      setRepos(data); // 👈 store in state
    };

    fetchRepos();
  }, []);

  repos.map((repo) => (
  <Card key={repo.id} onClick={() => handleSelectRepo(repo.name)}>
    <CardHeader>
      <CardTitle>{repo.name}</CardTitle>
      <CardDescription>{repo.description}</CardDescription>
    </CardHeader>
    <CardContent>
      <p>{repo.language}</p>
      <p>⭐ {repo.stargazers_count}</p>
      <p>🍴 {repo.forks_count}</p>
      <p>Updated {new Date(repo.updated_at).toLocaleString()}</p>
    </CardContent>
  </Card>
))

  const filteredRepos = repos
  .filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  )
  .map((repo) => ({
    ...repo,
    color: getStableGradient(repo.name),
  }));

  const handleSelectRepo = (repoName: string) => {
    router.push(`/dashboard/${repoName}`)
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CodeScope</h1>
              <p className="text-xs text-slate-400">Select a repository</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <SignOutButton> 
            </SignOutButton>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Your Repositories</h2>
          <p className="text-slate-400 text-lg mb-8">Select a repository to view detailed analytics and insights</p>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Repository Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepos.map((repo) => (
            <Card
              key={repo.id}
              className="border-slate-800 bg-slate-900/50 backdrop-blur hover:bg-slate-900/80 transition-all cursor-pointer group"
              onClick={() => handleSelectRepo(repo.name)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${repo.color} flex items-center justify-center`}
                  >
                    <GitBranch className="w-6 h-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-white group-hover:text-cyan-400 transition-colors">{repo.name}</CardTitle>
                <CardDescription className="text-slate-400">{repo.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>{repo.language}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>{repo.stars}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="w-4 h-4" />
                    <span>{repo.forks}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>Updated {repo.lastUpdated}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRepos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No repositories found</p>
          </div>
        )}
      </div>
    </div>
  )
}
