"use client"

import { useEffect, useRef, useState } from "react"
import { FileText, Users, User } from "lucide-react"

// ─── Add or remove options here to change the right-click menu ───────────────
// To add a new option:
//   1. Add a row below with a unique `id`, display `label`, and a Lucide `icon`
//   2. Add the matching ChatbotOption value + handler in lib/ai-chatbot.ts
//   3. No other wiring needed — the API route and display panel handle the rest
//
// The `requiresAuthor` flag causes an inline author-name input to appear before
// submitting, so the user can specify whose work to analyze.
export const FILE_CONTEXT_OPTIONS = [
  { id: "file_summary",  label: "File Summary",      icon: FileText, requiresAuthor: false },
  { id: "contributors",  label: "View Contributors",  icon: Users,    requiresAuthor: false },
  { id: "author_work",   label: "Author Analysis",    icon: User,     requiresAuthor: true  },
  // Add more options here, e.g.:
  // { id: "my_operation", label: "My Operation", icon: SomeLucideIcon, requiresAuthor: false },
] as const

export type FileContextOptionId = (typeof FILE_CONTEXT_OPTIONS)[number]["id"]

interface FileContextMenuProps {
  x: number
  y: number
  filePath: string
  nodeType: "file" | "directory"
  onClose: () => void
  onSelect: (optionId: FileContextOptionId, filePath: string, targetAuthor?: string) => void
}

export function FileContextMenu({ x, y, filePath, nodeType, onClose, onSelect }: FileContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  // When an option requiring an author is clicked, store it here and show the input
  const [pendingOption, setPendingOption] = useState<FileContextOptionId | null>(null)
  const [authorInput, setAuthorInput] = useState("")
  const authorInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  // Auto-focus the author input when it appears
  useEffect(() => {
    if (pendingOption) {
      authorInputRef.current?.focus()
    }
  }, [pendingOption])

  const handleOptionClick = (id: FileContextOptionId, requiresAuthor: boolean) => {
    if (requiresAuthor) {
      setPendingOption(id)
    } else {
      onSelect(id, filePath)
      onClose()
    }
  }

  const handleAuthorConfirm = () => {
    if (!pendingOption || !authorInput.trim()) return
    onSelect(pendingOption, filePath, authorInput.trim())
    onClose()
  }

  const displayName = filePath.split("/").pop() ?? filePath

  const style: React.CSSProperties = {
    position: "fixed",
    top: y,
    left: x,
    zIndex: 50,
  }

  return (
    <div
      ref={menuRef}
      style={style}
      className="min-w-[200px] rounded-lg border border-slate-700 bg-slate-900 shadow-xl py-1 text-sm"
    >
      {/* Header: shows the file/directory name */}
      <div className="px-3 py-1.5 flex items-center gap-1.5">
        <span className="text-xs text-slate-500 uppercase tracking-wide">
          {nodeType === "directory" ? "folder" : "file"}
        </span>
        <span className="text-xs text-slate-400 truncate max-w-[160px]" title={filePath}>
          {displayName}
        </span>
      </div>
      <div className="border-t border-slate-700 my-1" />

      {pendingOption ? (
        /* Author input sub-view */
        <div className="px-3 py-2 space-y-2">
          <p className="text-xs text-slate-400">Enter author name:</p>
          <input
            ref={authorInputRef}
            value={authorInput}
            onChange={(e) => setAuthorInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAuthorConfirm()
              if (e.key === "Escape") { setPendingOption(null); setAuthorInput("") }
            }}
            placeholder="e.g. Jane Smith"
            className="w-full rounded bg-slate-800 border border-slate-600 text-slate-200
                       placeholder:text-slate-600 px-2 py-1 text-xs outline-none
                       focus:border-cyan-500 transition-colors"
          />
          <div className="flex gap-1.5">
            <button
              onClick={handleAuthorConfirm}
              disabled={!authorInput.trim()}
              className="flex-1 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40
                         text-white text-xs py-1 transition-colors"
            >
              Analyze
            </button>
            <button
              onClick={() => { setPendingOption(null); setAuthorInput("") }}
              className="flex-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300
                         text-xs py-1 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        /* Normal options list */
        FILE_CONTEXT_OPTIONS.map(({ id, label, icon: Icon, requiresAuthor }) => (
          <button
            key={id}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200
                       hover:bg-slate-800 hover:text-white transition-colors"
            onClick={() => handleOptionClick(id, requiresAuthor)}
          >
            <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
            {label}
          </button>
        ))
      )}
    </div>
  )
}
