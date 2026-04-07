/**
 * ProjectFiles — screen 5.
 * Read-only file tree (left) + diff viewer (right).
 * No file editing — view only.
 */

import React, { useState } from 'react'
import {
  FolderOpen,
  Folder,
  ChevronDown,
  ChevronRight,
  FileCode,
  FileText,
  FileJson,
  Bot,
  Info,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type DiffLineType = 'added' | 'removed' | 'context' | 'empty'

interface DiffLine {
  type: DiffLineType
  lineOld?: number
  lineNew?: number
  content: string
}

interface FileEntry {
  name: string
  path: string
  type: 'file' | 'folder'
  modified?: boolean
  modifiedBy?: string
  children?: FileEntry[]
  icon?: React.ReactNode
}

// ─── File tree data ───────────────────────────────────────────────────────────

const FILE_TREE: FileEntry[] = [
  {
    name: 'my-app',
    path: 'my-app',
    type: 'folder',
    children: [
      {
        name: 'src',
        path: 'my-app/src',
        type: 'folder',
        children: [
          { name: 'auth.ts',       path: 'my-app/src/auth.ts',       type: 'file', modified: true, modifiedBy: 'Auth System', icon: <FileCode size={12} /> },
          { name: 'middleware.ts', path: 'my-app/src/middleware.ts',  type: 'file', icon: <FileCode size={12} /> },
          { name: 'components',   path: 'my-app/src/components',     type: 'folder', children: [] },
          { name: 'tests',        path: 'my-app/src/tests',          type: 'folder', children: [] },
        ],
      },
      { name: 'old-config.js', path: 'my-app/old-config.js', type: 'file', icon: <FileCode size={12} /> },
      { name: 'package.json',  path: 'my-app/package.json',  type: 'file', icon: <FileJson size={12} /> },
      { name: 'README.md',     path: 'my-app/README.md',     type: 'file', icon: <FileText size={12} /> },
    ],
  },
]

// ─── Diff data for auth.ts ────────────────────────────────────────────────────

const AUTH_TS_DIFF: DiffLine[] = [
  { type: 'context', lineOld: 1,  lineNew: 1,  content: 'import { createAuth } from "@orbital/core";' },
  { type: 'context', lineOld: 2,  lineNew: 2,  content: 'import { database } from "./db";' },
  { type: 'empty',   content: '' },
  { type: 'removed', lineOld: 4,               content: 'const legacySecret = process.env.OLD_AUTH_SECRET;' },
  { type: 'added',              lineNew: 4,    content: 'const authConfig = {' },
  { type: 'added',              lineNew: 5,    content: '  secret: process.env.AUTH_SECRET,' },
  { type: 'added',              lineNew: 6,    content: "  algorithm: 'HS256'," },
  { type: 'added',              lineNew: 7,    content: "  expiresIn: '7d'," },
  { type: 'added',              lineNew: 8,    content: "  issuer: 'orbital-agent'," },
  { type: 'added',              lineNew: 9,    content: '};' },
  { type: 'empty',   content: '' },
  { type: 'added',              lineNew: 11,   content: 'export const auth = createAuth({' },
  { type: 'added',              lineNew: 12,   content: '  ...authConfig,' },
  { type: 'added',              lineNew: 13,   content: '  database,' },
  { type: 'added',              lineNew: 14,   content: '});' },
  { type: 'empty',   content: '' },
  { type: 'added',              lineNew: 16,   content: 'export function initSecurity() {' },
  { type: 'added',              lineNew: 17,   content: '  auth.validateConfig();' },
  { type: 'added',              lineNew: 18,   content: '  auth.connectDatabase();' },
  { type: 'added',              lineNew: 19,   content: '  return auth;' },
  { type: 'added',              lineNew: 20,   content: '}' },
]

const DIFF_MAP: Record<string, DiffLine[]> = {
  'my-app/src/auth.ts': AUTH_TS_DIFF,
}

// ─── Diff line colors ─────────────────────────────────────────────────────────

const DIFF_BG: Record<DiffLineType, string> = {
  added:   'rgba(34,197,94,0.07)',
  removed: 'rgba(239,68,68,0.07)',
  context: 'transparent',
  empty:   'transparent',
}

const DIFF_BORDER: Record<DiffLineType, string> = {
  added:   'rgba(34,197,94,0.3)',
  removed: 'rgba(239,68,68,0.3)',
  context: 'transparent',
  empty:   'transparent',
}

const DIFF_PREFIX: Record<DiffLineType, string> = {
  added:   '+',
  removed: '-',
  context: ' ',
  empty:   ' ',
}

const DIFF_TEXT: Record<DiffLineType, string> = {
  added:   '#22c55e',
  removed: '#ef4444',
  context: 'rgba(255,255,255,0.6)',
  empty:   'transparent',
}

// ─── File tree node ───────────────────────────────────────────────────────────

function TreeNode({
  entry,
  depth,
  selectedPath,
  onSelect,
}: {
  entry: FileEntry
  depth: number
  selectedPath: string
  onSelect: (path: string) => void
}): React.JSX.Element {
  const [open, setOpen] = useState(depth < 2)
  const isSelected = entry.path === selectedPath
  const isFolder = entry.type === 'folder'
  const indent = depth * 12

  return (
    <div>
      <button
        onClick={() => isFolder ? setOpen((v) => !v) : onSelect(entry.path)}
        className="w-full flex items-center gap-1.5 px-2 py-0.5 rounded text-left"
        style={{
          paddingLeft: indent + 8,
          backgroundColor: isSelected ? 'rgba(37,99,235,0.15)' : 'transparent',
          border: isSelected ? '1px solid rgba(37,99,235,0.25)' : '1px solid transparent',
          cursor: 'pointer',
        }}
      >
        {/* Expand arrow for folders */}
        {isFolder ? (
          open
            ? <ChevronDown size={10} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            : <ChevronRight size={10} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
        ) : (
          <span style={{ width: 10, flexShrink: 0 }} />
        )}

        {/* Icon */}
        <span style={{ color: isFolder ? '#eab308' : 'rgba(255,255,255,0.35)', flexShrink: 0 }}>
          {isFolder
            ? (open ? <FolderOpen size={12} /> : <Folder size={12} />)
            : (entry.icon ?? <FileText size={12} />)}
        </span>

        {/* Name */}
        <span
          className="text-xs truncate"
          style={{ color: isSelected ? 'white' : entry.modified ? 'white' : 'rgba(255,255,255,0.6)' }}
        >
          {entry.name}
        </span>

        {/* Modified dot */}
        {entry.modified && (
          <span
            className="ml-auto rounded-full shrink-0"
            style={{ width: 5, height: 5, backgroundColor: '#2563eb', display: 'inline-block' }}
          />
        )}
      </button>

      {/* Children */}
      {isFolder && open && entry.children && entry.children.map((child) => (
        <TreeNode
          key={child.path}
          entry={child}
          depth={depth + 1}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

// ─── Diff viewer ──────────────────────────────────────────────────────────────

function DiffViewer({ filePath }: { filePath: string | null }): React.JSX.Element {
  if (!filePath) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.2)' }}>Select a file to view diff</p>
      </div>
    )
  }

  const diff = DIFF_MAP[filePath]
  const parts = filePath.split('/')
  const breadcrumb = parts.join('  ›  ')

  if (!diff) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.2)' }}>No changes in this file</p>
      </div>
    )
  }

  const added   = diff.filter((l) => l.type === 'added').length
  const removed = diff.filter((l) => l.type === 'removed').length

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Diff header */}
      <div
        className="px-4 py-2.5 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', backgroundColor: '#13131a' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace' }}>
            {breadcrumb}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-xs px-2 py-0.5 rounded uppercase tracking-wider"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}
          >
            Read Only
          </span>
          <button
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md"
            style={{ backgroundColor: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', color: '#2563eb', cursor: 'pointer' }}
          >
            <Bot size={10} />
            Open in Agent
          </button>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            <span style={{ color: '#22c55e' }}>+{added}</span>
            {' / '}
            <span style={{ color: '#ef4444' }}>-{removed}</span>
            {' · 2 min ago'}
          </span>
        </div>
      </div>

      {/* Diff lines */}
      <div className="flex-1 overflow-auto" style={{ backgroundColor: '#0d0d0f' }}>
        <table className="w-full border-collapse" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
          <tbody>
            {diff.map((line, i) => (
              <tr
                key={i}
                style={{ backgroundColor: DIFF_BG[line.type] }}
              >
                {/* Old line number */}
                <td
                  className="select-none text-right pr-3 pl-4"
                  style={{
                    color: 'rgba(255,255,255,0.18)',
                    width: 40,
                    userSelect: 'none',
                    borderRight: `2px solid ${DIFF_BORDER[line.type]}`,
                    fontSize: 11,
                    paddingTop: 1,
                    paddingBottom: 1,
                  }}
                >
                  {line.lineOld ?? ''}
                </td>
                {/* New line number */}
                <td
                  className="select-none text-right pr-3 pl-2"
                  style={{
                    color: 'rgba(255,255,255,0.18)',
                    width: 40,
                    userSelect: 'none',
                    fontSize: 11,
                    paddingTop: 1,
                    paddingBottom: 1,
                  }}
                >
                  {line.lineNew ?? ''}
                </td>
                {/* Prefix */}
                <td
                  className="select-none px-2 text-center"
                  style={{ color: DIFF_TEXT[line.type], width: 16, userSelect: 'none' }}
                >
                  {DIFF_PREFIX[line.type]}
                </td>
                {/* Content */}
                <td
                  className="pr-4 whitespace-pre"
                  style={{ color: DIFF_TEXT[line.type], paddingTop: 1, paddingBottom: 1 }}
                >
                  {line.content}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer status bar */}
      <div
        className="px-4 py-1.5 flex items-center gap-4 shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', backgroundColor: '#13131a' }}
      >
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'JetBrains Mono, monospace' }}>
          LN 14, COL 12
        </span>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>UTF-8</span>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>JAVASCRIPT</span>
        <span className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          <Bot size={10} />
          Modified by Auth System · 2 min ago
        </span>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProjectFiles(): React.JSX.Element {
  const [selectedPath, setSelectedPath] = useState<string>('my-app/src/auth.ts')

  return (
    <div className="flex h-full">

      {/* File tree panel */}
      <aside
        className="flex flex-col shrink-0"
        style={{ width: 240, backgroundColor: '#13131a', borderRight: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Panel header */}
        <div
          className="px-4 py-2.5 flex items-center justify-between shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Files
          </span>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            <Info size={11} />
          </span>
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-auto py-2">
          {FILE_TREE.map((entry) => (
            <TreeNode
              key={entry.path}
              entry={entry}
              depth={0}
              selectedPath={selectedPath}
              onSelect={setSelectedPath}
            />
          ))}
        </div>

        {/* Footer note */}
        <div
          className="px-3 py-2 shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Last modified by Auth System agent
          </p>
        </div>
      </aside>

      {/* Diff viewer */}
      <main className="flex-1 flex flex-col min-w-0" style={{ backgroundColor: '#0d0d0f' }}>
        {/* Main header */}
        <div
          className="px-4 py-2.5 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', backgroundColor: '#13131a' }}
        >
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Diff Viewer
          </p>
        </div>
        <DiffViewer filePath={selectedPath} />
      </main>

    </div>
  )
}
