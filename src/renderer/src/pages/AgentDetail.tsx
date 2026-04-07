/**
 * AgentDetail — full-page view for a single agent at /agents/:id.
 * Top bar → full terminal output → task input.
 */

import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileCode, Zap } from 'lucide-react'
import { STATUS_DOT, STATUS_LABEL, fmtTokens } from './Agents'
import type { AgentStatus } from './Agents'
import { useAgentStore } from '../store/agentStore'

// ─── Extended mock terminal history ──────────────────────────────────────────
// Real output will come via IPC agent:output events.

const EXTRA_HISTORY: Record<string, string[]> = {
  '1': [
    '[14:21:50] Initializing agent: Auth System',
    '[14:21:51] Loading project context from ./src...',
    '[14:21:55] Resolved 14 source files',
    '[14:21:58] Running static analysis pass...',
    '[14:22:01] Checking dependencies...',
    '[14:22:04] Scanning ./src/middleware/auth.ts',
    '[14:22:05] Success: Found 2 vulnerable patterns.',
    '[14:22:08] Preparing patch for JWT validation...',
    '[14:22:09] Awaiting permission to apply patch.'
  ],
  '2': [
    '[14:09:00] Initializing agent: Frontend UI',
    '[14:09:03] Scanning component tree...',
    '[14:09:30] Found 47 components across 12 files',
    '[14:09:45] Running accessibility audit...',
    '[14:09:58] Audit complete — 3 contrast warnings',
    '[14:10:05] Applying Button.tsx contrast fix...',
    '[14:10:08] ✓ Button.tsx updated',
    '[14:10:10] Applying LoginForm.tsx layout fix...',
    '[14:10:11] Component scan finished.',
    '[14:10:12] Standing by for next task...'
  ],
  '3': [
    '[13:44:30] Initializing agent: Database Schema',
    '[13:44:31] Connecting to local Postgres instance...',
    '[13:44:33] ✓ Connected to orbit-dev:5432',
    '[13:44:40] Loading schema diff from migration file...',
    '[13:44:50] Planning migration: add columns to users table',
    '[13:45:01] Executing SQL migrations...',
    '[13:45:03] ALTER TABLE users ADD COLUMN last_login TIMESTAMP',
    '[13:45:04] ALTER TABLE users ADD COLUMN login_count INTEGER DEFAULT 0',
    "[13:45:05] Table 'users' updated.",
    '[13:45:06] Running post-migration validation...',
    '[13:45:07] ✓ Row count intact: 2,847 records',
    '[13:45:08] Task successfully completed.'
  ],
  '4': [
    '[14:27:00] Initializing agent: System Architect',
    '[14:27:01] Loading task: Build auth middleware',
    '[14:27:05] Analyzing existing auth patterns in ./src/auth...',
    '[14:27:15] Planning middleware architecture...',
    '[14:27:30] Scaffolding src/auth/middleware.ts',
    '[14:28:00] $ mcp run filesystem-read --path "src/auth/config.ts"',
    '[14:28:02] [INFO] Read 38 lines',
    '[14:28:10] Generating TypeScript from architecture plan...',
    '[14:28:40] $ mcp run filesystem-write --path "src/auth/middleware.ts"',
    '[14:28:41] [INFO] Writing 142 lines of TypeScript...',
    '[14:28:43] Applying rate-limiter logic using Redis...',
    '[14:28:45] ✓ File written successfully.',
    '[14:28:50] $ npm test src/auth/middleware.test.ts',
    '[14:28:52] Running 12 test suites...',
    '[14:28:55] Test Pass: Session verification',
    '[14:28:56] Test Pass: Token expiration handling',
    '[14:28:57] Test Pass: Header injection protection',
    '[14:29:00] Awaiting next instruction...'
  ]
}

// ─── Task input ───────────────────────────────────────────────────────────────

const LINE_HEIGHT = 20
const MAX_HEIGHT = LINE_HEIGHT * 5

function TaskInput(): React.JSX.Element {
  const [value, setValue] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim()) {
        // TODO: wire to IPC agent:input
        setValue('')
      }
    }
  }

  return (
    <div>
      <div
        className="flex items-start gap-2 rounded-md px-3 py-2"
        style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.09)' }}
      >
        <span
          style={{
            color: 'rgba(255,255,255,0.2)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            lineHeight: `${LINE_HEIGHT}px`,
            marginTop: 1,
            flexShrink: 0,
            userSelect: 'none'
          }}
        >
          {'>'}
        </span>
        <textarea
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="> Send a message or task..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            overflow: 'auto',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            lineHeight: `${LINE_HEIGHT}px`,
            color: value ? 'rgba(255,255,255,0.85)' : undefined,
            minHeight: LINE_HEIGHT,
            maxHeight: MAX_HEIGHT
          }}
          className="bg-transparent text-xs placeholder-white/20"
        />
      </div>
      <p
        className="text-xs mt-1.5 select-none"
        style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono, monospace' }}
      >
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AgentStatus }): React.JSX.Element {
  return (
    <span
      className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded"
      style={{
        backgroundColor: `${STATUS_DOT[status]}18`,
        color: STATUS_DOT[status]
      }}
    >
      <span
        className="rounded-full inline-block shrink-0"
        style={{ width: 5, height: 5, backgroundColor: STATUS_DOT[status] }}
      />
      {STATUS_LABEL[status]}
    </span>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AgentDetail(): React.JSX.Element {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const bottomRef = useRef<HTMLDivElement>(null)

  const agent = useAgentStore((s) => s.agents.find((a) => a.id === id))
  const lines = id ? (EXTRA_HISTORY[id] ?? []) : []

  // Auto-scroll terminal to bottom whenever lines change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Agent not found.{' '}
          <button
            onClick={() => navigate('/agents')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}
          >
            Go back
          </button>
        </p>
      </div>
    )
  }

  // tokenLimit is not in the CLAUDE.md Agent interface; token bar shown as progress-based instead
  const tokenPct = agent.progress > 0 ? agent.progress : null

  return (
    <div className="flex flex-col" style={{ height: '100%', backgroundColor: '#0d0d0f' }}>
      {/* ── Top bar ── */}
      <div
        className="flex items-center gap-3 px-4 shrink-0"
        style={{
          height: 52,
          backgroundColor: '#13131a',
          borderBottom: '1px solid rgba(255,255,255,0.07)'
        }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate('/agents')}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md shrink-0"
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.55)',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={13} />
          Back
        </button>

        {/* Divider */}
        <span
          style={{ width: 1, height: 18, backgroundColor: 'rgba(255,255,255,0.08)', flexShrink: 0 }}
        />

        {/* Status dot */}
        <span
          className="rounded-full shrink-0"
          style={{
            width: 7,
            height: 7,
            backgroundColor: STATUS_DOT[agent.status],
            display: 'inline-block'
          }}
        />

        {/* Agent name */}
        <span className="text-sm font-semibold text-white shrink-0">{agent.name}</span>

        {/* Model */}
        <span className="text-xs shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {agent.model}
        </span>

        {/* Status badge */}
        <StatusBadge status={agent.status} />

        {/* Task (if any) */}
        {agent.task && (
          <>
            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>·</span>
            <span className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {agent.task}
            </span>
          </>
        )}

        {/* Right side meta */}
        <div className="ml-auto flex items-center gap-4 shrink-0">
          {/* Token usage */}
          <div className="flex items-center gap-1.5">
            <Zap size={11} style={{ color: 'rgba(255,255,255,0.25)' }} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {fmtTokens(agent.tokenCount)}
            </span>
            {/* Token bar */}
            {tokenPct !== null && (
              <div
                className="rounded-full overflow-hidden"
                style={{ width: 48, height: 3, backgroundColor: 'rgba(255,255,255,0.07)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${tokenPct}%`,
                    backgroundColor: tokenPct > 80 ? '#f97316' : '#2563eb'
                  }}
                />
              </div>
            )}
          </div>

          {/* Files touched */}
          <div className="flex items-center gap-1.5">
            <FileCode size={11} style={{ color: 'rgba(255,255,255,0.25)' }} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {agent.filesTouched} files
            </span>
          </div>
        </div>
      </div>

      {/* ── Terminal output (~70% of remaining height) ── */}
      <div
        className="flex-1 overflow-auto min-h-0 px-5 py-4"
        style={{ backgroundColor: '#0a0a0d', fontFamily: 'JetBrains Mono, monospace' }}
      >
        {lines.map((line, i) => {
          // Parse optional "[HH:MM:SS]" prefix for dim timestamp rendering
          const tsMatch = line.match(/^(\[?\d{2}:\d{2}:\d{2}\]?)\s(.*)$/)
          return (
            <div key={i} className="flex items-start gap-3 leading-6">
              {tsMatch ? (
                <>
                  <span
                    className="text-xs shrink-0 tabular-nums select-none"
                    style={{ color: 'rgba(255,255,255,0.2)', minWidth: 72, paddingTop: 1 }}
                  >
                    {tsMatch[1].replace(/[\[\]]/g, '')}
                  </span>
                  <span
                    className="text-xs break-all"
                    style={{
                      color: tsMatch[2].startsWith('✓')
                        ? '#22c55e'
                        : tsMatch[2].startsWith('[INFO]')
                          ? 'rgba(255,255,255,0.5)'
                          : tsMatch[2].startsWith('Test Pass')
                            ? '#22c55e'
                            : 'rgba(255,255,255,0.7)'
                    }}
                  >
                    {tsMatch[2]}
                  </span>
                </>
              ) : (
                <span
                  className="text-xs break-all"
                  style={{
                    color:
                      line.startsWith('✓') || line.startsWith('Test Pass')
                        ? '#22c55e'
                        : line.startsWith('$')
                          ? '#2563eb'
                          : line.startsWith('[INFO]')
                            ? 'rgba(255,255,255,0.5)'
                            : 'rgba(255,255,255,0.7)',
                    paddingLeft: 84 // align with timestamp column
                  }}
                >
                  {line}
                </span>
              )}
            </div>
          )
        })}
        {/* Auto-scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* ── Input area (~30% / fixed) ── */}
      <div
        className="shrink-0 px-5 py-4"
        style={{
          backgroundColor: '#111118',
          borderTop: '1px solid rgba(255,255,255,0.07)'
        }}
      >
        <TaskInput />
      </div>
    </div>
  )
}
