/**
 * Agents — screen 2.
 * Agent cards in collapsed/expanded states, permission banners, terminal output,
 * token usage, files touched.
 */

import React, { useState } from 'react'
import {
  Plus,
  Pause,
  Square,
  ChevronsUpDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  X,
  Bot,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentStatus = 'running' | 'idle' | 'awaiting_input' | 'error' | 'completed'

interface Agent {
  id: string
  name: string
  model: string
  status: AgentStatus
  task?: string
  progress?: number
  tokenCount: number
  tokenLimit?: number
  filesTouched: number
  terminalLines: string[]
  needsPermission?: boolean
  permissionCommand?: string
  startExpanded?: boolean
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const AGENTS: Agent[] = [
  {
    id: '1',
    name: 'Auth System',
    model: 'Claude Sonnet 4.5',
    status: 'running',
    tokenCount: 12400,
    filesTouched: 3,
    terminalLines: [
      '[14:22:01] Checking dependencies...',
      '[14:22:04] Scanning ./src/middleware/auth.ts',
      '[14:22:05] Success: Found 2 vulnerable patterns.',
      '[14:22:08] Preparing patch for JWT validation...',
    ],
    needsPermission: true,
    permissionCommand: 'patch src/middleware/auth.ts',
  },
  {
    id: '2',
    name: 'Frontend UI',
    model: 'Gemini 2.5 Pro',
    status: 'idle',
    tokenCount: 8100,
    filesTouched: 12,
    terminalLines: [
      '[14:10:11] Component scan finished.',
      '[14:10:12] Standing by for next task...',
    ],
  },
  {
    id: '3',
    name: 'Database Schema',
    model: 'Claude Sonnet 4.5',
    status: 'completed',
    tokenCount: 2300,
    filesTouched: 1,
    terminalLines: [
      "[13:45:01] Executing SQL migrations...",
      "[13:45:05] Table 'users' updated.",
      '[13:45:08] Task successfully completed.',
    ],
  },
  {
    id: '4',
    name: 'System Architect',
    model: 'Claude Sonnet 3.5',
    status: 'running',
    task: 'Building auth middleware',
    progress: 67,
    tokenCount: 34200,
    tokenLimit: 50000,
    filesTouched: 7,
    startExpanded: true,
    terminalLines: [
      '14:28:40 $ mcp run filesystem-write --path "src/auth/middleware.ts"',
      '[INFO] Writing 142 lines of TypeScript...',
      'Applying rate-limiter logic using Redis...',
      '✓ File written successfully.',
      '$ npm test src/auth/middleware.test.ts',
      'Running 12 test suites...',
      'Test Pass: Session verification',
      'Test Pass: Token expiration handling',
      'Test Pass: Header injection protection',
      'Awaiting next instruction...',
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_DOT: Record<AgentStatus, string> = {
  running:        '#22c55e',
  idle:           '#eab308',
  awaiting_input: '#f97316',
  error:          '#ef4444',
  completed:      '#94a3b8',
}

const STATUS_LABEL: Record<AgentStatus, string> = {
  running:        'Running',
  idle:           'Idle',
  awaiting_input: 'Awaiting Input',
  error:          'Error',
  completed:      'Completed',
}

function fmtTokens(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

// ─── Permission Banner ────────────────────────────────────────────────────────

function PermissionBanner({ command }: { command: string }): React.JSX.Element {
  return (
    <div
      className="rounded-md px-3 py-2.5 flex items-center justify-between gap-3 mb-3"
      style={{ backgroundColor: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)' }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <AlertTriangle size={13} style={{ color: '#f97316', flexShrink: 0 }} />
        <span className="text-xs text-white/80 truncate">
          Agent requesting permission to run:{' '}
          <span className="font-mono" style={{ color: '#f97316' }}>{command}</span>
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          className="text-xs px-2.5 py-1 rounded font-medium text-white"
          style={{ backgroundColor: '#22c55e', border: 'none', cursor: 'pointer' }}
        >
          Allow
        </button>
        <button
          className="text-xs px-2.5 py-1 rounded font-medium text-white"
          style={{ backgroundColor: '#ef4444', border: 'none', cursor: 'pointer' }}
        >
          Deny
        </button>
      </div>
    </div>
  )
}

// ─── Terminal block ───────────────────────────────────────────────────────────

function Terminal({ lines, expanded }: { lines: string[]; expanded: boolean }): React.JSX.Element {
  const visible = expanded ? lines : lines.slice(-5)
  return (
    <div
      className="rounded p-3 overflow-hidden"
      style={{
        backgroundColor: '#0a0a0d',
        border: '1px solid rgba(255,255,255,0.05)',
        minHeight: expanded ? 160 : 88,
        maxHeight: expanded ? 220 : 88,
        fontFamily: 'JetBrains Mono, monospace',
      }}
    >
      {visible.map((line, i) => (
        <p key={i} className="text-xs leading-5 whitespace-nowrap overflow-hidden text-ellipsis"
          style={{ color: line.startsWith('✓') ? '#22c55e' : 'rgba(255,255,255,0.45)' }}
        >
          {line}
        </p>
      ))}
    </div>
  )
}

// ─── Collapsed agent card ─────────────────────────────────────────────────────

function CollapsedCard({
  agent,
  onExpand,
}: {
  agent: Agent
  onExpand: () => void
}): React.JSX.Element {
  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: '#16161f', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="rounded-full shrink-0"
            style={{ width: 7, height: 7, backgroundColor: STATUS_DOT[agent.status], display: 'inline-block' }}
          />
          <span className="text-sm font-medium text-white">{agent.name}</span>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{agent.model}</span>
        </div>
        <div className="flex items-center gap-2">
          {agent.status === 'completed' && (
            <CheckCircle2 size={13} style={{ color: '#94a3b8' }} />
          )}
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{
              backgroundColor: `${STATUS_DOT[agent.status]}18`,
              color: STATUS_DOT[agent.status],
            }}
          >
            {STATUS_LABEL[agent.status]}
          </span>
        </div>
      </div>

      {/* Permission banner */}
      {agent.needsPermission && agent.permissionCommand && (
        <PermissionBanner command={agent.permissionCommand} />
      )}

      {/* Terminal */}
      <Terminal lines={agent.terminalLines} expanded={false} />

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-4 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <span>{agent.filesTouched} files touched</span>
          <span>{fmtTokens(agent.tokenCount)} tokens</span>
        </div>
        <button
          onClick={onExpand}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors"
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.5)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <ChevronsUpDown size={12} />
          Expand
        </button>
      </div>
    </div>
  )
}

// ─── Expanded agent card ──────────────────────────────────────────────────────

function ExpandedCard({
  agent,
  onCollapse,
}: {
  agent: Agent
  onCollapse: () => void
}): React.JSX.Element {
  const [input, setInput] = useState('')
  const tokenPct = agent.tokenLimit
    ? Math.round((agent.tokenCount / agent.tokenLimit) * 100)
    : null

  return (
    <div
      className="rounded-lg p-4"
      style={{
        backgroundColor: '#16161f',
        border: '1px solid rgba(37,99,235,0.4)',
        minHeight: 400,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className="rounded-full shrink-0"
            style={{ width: 7, height: 7, backgroundColor: STATUS_DOT[agent.status], display: 'inline-block' }}
          />
          <span className="text-sm font-medium text-white">{agent.name}</span>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{agent.model}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{
              backgroundColor: `${STATUS_DOT[agent.status]}18`,
              color: STATUS_DOT[agent.status],
            }}
          >
            {STATUS_LABEL[agent.status]}
          </span>
          <button
            onClick={onCollapse}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.5)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <ChevronUp size={12} />
            Collapse
          </button>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 2 }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Active task */}
      {agent.task && (
        <div className="mb-3">
          <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Active Task</p>
          <p className="text-sm text-white">{agent.task}</p>
        </div>
      )}

      {/* Progress bar */}
      {agent.progress !== undefined && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Progress</span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{agent.progress}%</span>
          </div>
          <div className="rounded-full overflow-hidden" style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.07)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${agent.progress}%`, backgroundColor: '#2563eb' }}
            />
          </div>
        </div>
      )}

      {/* Terminal */}
      <Terminal lines={agent.terminalLines} expanded={true} />

      {/* Token usage */}
      {tokenPct !== null && agent.tokenLimit && (
        <div className="mt-3 mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Token Usage</span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {fmtTokens(agent.tokenCount)} / {fmtTokens(agent.tokenLimit)}
            </span>
          </div>
          <div className="rounded-full overflow-hidden" style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.07)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${tokenPct}%`,
                backgroundColor: tokenPct > 80 ? '#f97316' : '#2563eb',
              }}
            />
          </div>
        </div>
      )}

      {/* Files modified */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Files modified: <span className="text-white">{agent.filesTouched}</span>
        </span>
        <button
          className="flex items-center gap-1 text-xs"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}
        >
          View files <ExternalLink size={11} />
        </button>
      </div>

      {/* Task input */}
      <div
        className="flex items-center gap-2 rounded-md px-3"
        style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.07)', height: 36 }}
      >
        <span style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{'>'}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Send a message or task..."
          className="flex-1 bg-transparent text-xs text-white outline-none"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.8)' }}
        />
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Agents(): React.JSX.Element {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(AGENTS.filter((a) => a.startExpanded).map((a) => a.id))
  )

  const toggle = (id: string): void => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="p-6 space-y-4">

      {/* Header + toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">Agents</h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Spawn and manage AI coding agents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
            }}
          >
            <Pause size={11} />
            Pause All
          </button>
          <button
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
            }}
          >
            <Square size={11} />
            Stop All
          </button>
          <button
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium text-white"
            style={{ backgroundColor: '#2563eb', border: 'none', cursor: 'pointer' }}
          >
            <Plus size={12} />
            New Agent
          </button>
        </div>
      </div>

      {/* Agent cards */}
      {AGENTS.map((agent) =>
        expanded.has(agent.id) ? (
          <ExpandedCard key={agent.id} agent={agent} onCollapse={() => toggle(agent.id)} />
        ) : (
          <CollapsedCard key={agent.id} agent={agent} onExpand={() => toggle(agent.id)} />
        )
      )}

      {/* System status bar */}
      <div
        className="rounded-lg px-4 py-2.5 flex items-center gap-2"
        style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <Bot size={11} style={{ color: 'rgba(255,255,255,0.2)' }} />
        <span className="text-xs font-mono uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono, monospace' }}>
          SYSTEM STATUS: OPERATIONAL&nbsp;&nbsp;|&nbsp;&nbsp;LATENCY: 24MS&nbsp;&nbsp;|&nbsp;&nbsp;UPTIME: 99.99%&nbsp;&nbsp;|&nbsp;&nbsp;4 AGENTS ACTIVE
        </span>
      </div>

    </div>
  )
}
