/**
 * AgentDetail — full-page view for a single agent at /agents/:id.
 * Top bar → full terminal output → task input.
 */

import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileCode, Zap } from 'lucide-react'
import { STATUS_DOT, STATUS_LABEL, fmtTokens, PermissionBanner } from './Agents'
import type { AgentStatus } from './Agents'
import { useAgentStore } from '../store/agentStore'

// Stable empty-array constant — same reason as in Agents.tsx.
const EMPTY_LINES: string[] = []

// ─── Task input ───────────────────────────────────────────────────────────────

const LINE_HEIGHT = 20
const MAX_HEIGHT = LINE_HEIGHT * 5

function TaskInput({ agentId }: { agentId: string }): React.JSX.Element {
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
        window.electronAPI.sendInput(agentId, value.trim())
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
  // Stable empty-array constants for the Zustand selector — avoids useSyncExternalStore
  // detecting an "unstable snapshot" (new [] reference on every call).
  const lines = useAgentStore((s) => s.outputLines[id ?? ''] ?? EMPTY_LINES)

  const [permissionMsg, setPermissionMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const handlePermission = (agentId: string, message: string): void => {
      if (agentId !== id) return
      setPermissionMsg(message)
    }
    window.electronAPI.onAgentPermission(handlePermission)
  }, [id])

  // Auto-scroll terminal to bottom whenever lines change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  const handleAllow = (): void => {
    if (id) window.electronAPI.respondToPermission(id, true)
    setPermissionMsg(null)
  }

  const handleDeny = (): void => {
    if (id) window.electronAPI.respondToPermission(id, false)
    setPermissionMsg(null)
  }

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
              {agent.filesTouched.length} files
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
        {/* Permission banner — shown when agent pauses for approval */}
        {permissionMsg && (
          <PermissionBanner
            command={permissionMsg}
            onAllow={handleAllow}
            onDeny={handleDeny}
          />
        )}
        <TaskInput agentId={id ?? ''} />
      </div>
    </div>
  )
}
