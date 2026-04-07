"use client"

import { useState, useEffect, useCallback } from "react"
import { Folder, FolderOpen, FileIcon, ChevronRight, GitBranch, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileContextMenu, FileContextOptionId, FILE_CONTEXT_OPTIONS } from "@/components/file-context-menu"

// ─── Types ────────────────────────────────────────────────────────────────────

interface FileEntry {
  path: string
  is_file: boolean
}

interface TreeNode {
  name: string
  path: string
  isFile: boolean
  children: TreeNode[]
}

interface ContextMenuState {
  x: number
  y: number
  filePath: string
  nodeType: "file" | "directory"
}

// ─── Tree builder ─────────────────────────────────────────────────────────────

function buildTree(files: FileEntry[]): TreeNode[] {
  const root: TreeNode[] = []

  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean)
    let level = root

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i]
      const currentPath = parts.slice(0, i + 1).join("/")
      const isLeaf = i === parts.length - 1

      let node = level.find((n) => n.name === name)
      if (!node) {
        node = {
          name,
          path: currentPath,
          isFile: isLeaf ? file.is_file : false,
          children: [],
        }
        level.push(node)
      }
      level = node.children
    }
  }

  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.isFile !== b.isFile) return a.isFile ? 1 : -1
      return a.name.localeCompare(b.name)
    })
    nodes.forEach((n) => sortNodes(n.children))
  }
  sortNodes(root)

  return root
}

// ─── File content dropdown ────────────────────────────────────────────────────

function FileContentDropdown({
  content,
  loading,
  depth,
}: {
  content: string | null
  loading: boolean
  depth: number
}) {
  return (
    <div
      className="mx-2 mb-1 rounded border border-slate-700 bg-slate-950/80"
      style={{ marginLeft: `${depth * 16 + 8}px` }}
    >
      {loading ? (
        <div className="flex items-center gap-2 px-3 py-3 text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          <span className="text-xs">Loading file content…</span>
        </div>
      ) : (
        <pre className="text-xs text-slate-300 p-3 overflow-x-auto max-h-64 whitespace-pre-wrap break-all leading-relaxed">
          {content ?? "No content available."}
        </pre>
      )}
    </div>
  )
}

// ─── Tree row ─────────────────────────────────────────────────────────────────

function TreeRow({
  node,
  depth,
  expanded,
  onToggle,
  onContextMenu,
  selectedFile,
  fileContent,
  fileContentLoading,
  onFileClick,
}: {
  node: TreeNode
  depth: number
  expanded: Set<string>
  onToggle: (path: string) => void
  onContextMenu: (e: React.MouseEvent, path: string, nodeType: "file" | "directory") => void
  selectedFile: string | null
  fileContent: string | null
  fileContentLoading: boolean
  onFileClick: (path: string) => void
}) {
  const isOpen = expanded.has(node.path)
  const isSelected = node.isFile && node.path === selectedFile

  return (
    <>
      <div
        className={`flex items-center gap-1.5 px-2 py-[3px] rounded cursor-pointer select-none
          hover:bg-slate-800 transition-colors group
          ${node.isFile ? "text-slate-300" : "text-slate-200 font-medium"}
          ${isSelected ? "bg-slate-800" : ""}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          if (node.isFile) {
            onFileClick(node.path)
          } else {
            onToggle(node.path)
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault()
          onContextMenu(e, node.path, node.isFile ? "file" : "directory")
        }}
      >
        {!node.isFile && (
          <ChevronRight
            className={`w-3.5 h-3.5 text-slate-500 flex-shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
          />
        )}
        {node.isFile ? (
          <FileIcon className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
        ) : isOpen ? (
          <FolderOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
        ) : (
          <Folder className="w-4 h-4 text-blue-400 flex-shrink-0" />
        )}
        <span className="text-sm truncate">{node.name}</span>
        {node.isFile && (
          <ChevronRight
            className={`w-3 h-3 text-slate-600 flex-shrink-0 ml-auto transition-transform ${isSelected ? "rotate-90" : ""}`}
          />
        )}
      </div>

      {isSelected && (
        <FileContentDropdown
          content={fileContent}
          loading={fileContentLoading}
          depth={depth + 1}
        />
      )}

      {!node.isFile && isOpen &&
        node.children.map((child) => (
          <TreeRow
            key={child.path}
            node={child}
            depth={depth + 1}
            expanded={expanded}
            onToggle={onToggle}
            onContextMenu={onContextMenu}
            selectedFile={selectedFile}
            fileContent={fileContent}
            fileContentLoading={fileContentLoading}
            onFileClick={onFileClick}
          />
        ))}
    </>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface GitTreeProps {
  owner: string
  repo: string
  onAiResult: (text: string, label: string) => void
  onProcessedChange?: (processed: boolean) => void
  refreshKey?: number
}

export function GitTree({ owner, repo, onAiResult, onProcessedChange, refreshKey }: GitTreeProps) {
  const [loading, setLoading] = useState(true)
  const [processed, setProcessed] = useState(false)
  const [tree, setTree] = useState<TreeNode[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [fileContentLoading, setFileContentLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/repos/${owner}/${repo}/file-tree`)
        const json = await res.json()
        if (json.processed) {
          setProcessed(true)
          setTree(buildTree(json.files as FileEntry[]))
          onProcessedChange?.(true)
        } else {
          setProcessed(false)
          onProcessedChange?.(false)
        }
      } catch {
        setProcessed(false)
        onProcessedChange?.(false)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [owner, repo, refreshKey])

  const toggleExpand = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(path) ? next.delete(path) : next.add(path)
      return next
    })
  }, [])

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, path: string, nodeType: "file" | "directory") => {
      setContextMenu({ x: e.clientX, y: e.clientY, filePath: path, nodeType })
    },
    []
  )

  const handleFileClick = useCallback(
    async (path: string) => {
      // Toggle off if same file clicked again
      if (selectedFile === path) {
        setSelectedFile(null)
        setFileContent(null)
        return
      }
      setSelectedFile(path)
      setFileContent(null)
      setFileContentLoading(true)
      try {
        const res = await fetch(
          `/api/repos/${owner}/${repo}/file-content?path=${encodeURIComponent(path)}`
        )
        const json = await res.json()
        setFileContent(res.ok ? (json.content ?? "") : `Error: ${json.error ?? "Failed to load"}`)
      } catch (err: any) {
        setFileContent(`Error: ${err.message ?? "Network error"}`)
      } finally {
        setFileContentLoading(false)
      }
    },
    [owner, repo, selectedFile]
  )

  const handleOptionSelect = useCallback(
    async (optionId: FileContextOptionId, filePath: string, targetAuthor?: string) => {
      const option = FILE_CONTEXT_OPTIONS.find((o) => o.id === optionId)
      const filename = filePath.split("/").pop() ?? filePath
      const label = `${option?.label ?? optionId} — ${filename}`

      setAiLoading(true)
      onAiResult("", label) // immediately show label with loading state in parent

      try {
        const res = await fetch(`/api/repos/${owner}/${repo}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ path: filePath, option: optionId, targetAuthor }),
        })
        const json = await res.json()
        if (!res.ok) {
          onAiResult(`Error: ${json.error ?? "Request failed"}`, label)
        } else {
          onAiResult(json.result, label)
        }
      } catch (err: any) {
        onAiResult(`Error: ${err.message ?? "Network error"}`, label)
      } finally {
        setAiLoading(false)
      }
    },
    [owner, repo, onAiResult]
  )

  if (loading) {
    return (
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (!processed) {
    return (
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <GitBranch className="w-10 h-10 text-slate-600" />
          <p className="text-slate-300 font-medium">Repository not yet processed</p>
          <p className="text-sm text-slate-500 max-w-xs">
            Click the <span className="text-cyan-400">Process Repository</span> button to index this
            repo's files and enable the Git Tree view.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur relative">
        {/* Loading overlay while AI request is in flight */}
        {aiLoading && (
          <div className="absolute inset-0 bg-slate-950/60 rounded-lg flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-cyan-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Analyzing…</span>
            </div>
          </div>
        )}
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            File Tree
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-slate-500 mb-3">
            Click directories to expand · Left-click files to view content · Right-click files or folders for options
          </p>
          <div className="font-mono text-sm">
            {tree.map((node) => (
              <TreeRow
                key={node.path}
                node={node}
                depth={0}
                expanded={expanded}
                onToggle={toggleExpand}
                onContextMenu={handleContextMenu}
                selectedFile={selectedFile}
                fileContent={fileContent}
                fileContentLoading={fileContentLoading}
                onFileClick={handleFileClick}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {contextMenu && (
        <FileContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          filePath={contextMenu.filePath}
          nodeType={contextMenu.nodeType}
          onClose={() => setContextMenu(null)}
          onSelect={handleOptionSelect}
        />
      )}
    </>
  )
}
