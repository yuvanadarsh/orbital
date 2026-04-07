/**
 * Agents — screen 2.
 * Agent cards sourced from agentStore. Clicking Expand navigates to /agents/:id.
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Pause,
  Square,
  ChevronsUpDown,
  AlertTriangle,
  CheckCircle2,
  Bot,
} from 'lucide-react'
import { useAgentStore } from '../store/agentStore'
import type { Agent } from '../store/agentStore'
import NewAgentModal from '../components/NewAgentModal'

// ─── Re-exported types and UI helpers (used by AgentDetail) ──────────────────

export type { Agent }
export type AgentStatus = Agent['status']

export const STATUS_DOT: Record<AgentStatus, string> = {
  running:        '#22c55e',
  idle:           '#eab308',
  awaiting_input: '#f97316',
  error:          '#ef4444',
  completed:      '#94a3b8',
}

export const STATUS_LABEL: Record<AgentStatus, string> = {
  running:        'Running',
  idle:           'Idle',
  awaiting_input: 'Awaiting Input',
  error:          'Error',
  completed:      'Completed',
}

export function fmtTokens(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

// ─── Permission Banner ────────────────────────────────────────────────────────
// Rendered when main process fires agent:permission over IPC.

export function PermissionBanner({
  command,
  onAllow,
  onDeny,
}: {
  command: string
  onAllow: () => void
  onDeny: () => void
}): React.JSX.Element {
  return (
    <div
      className="rounded-md px-3 py-2.5 flex items-center justify-between gap-3 mb-3"
      style={{ backgroundColor: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)' }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <AlertTriangle size={13} style={{ color: '#f97316', flexShrink: 0 }} />
        <span className="text-xs text-white/80 truncate">
          Agent requesting permission:{' '}
          <span className="font-mono" style={{ color: '#f97316' }}>{command}</span>
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          className="text-xs px-2.5 py-1 rounded font-medium text-white"
          style={{ backgroundColor: '#22c55e', border: 'none', cursor: 'pointer' }}
          onClick={onAllow}
        >
          Allow
        </button>
        <button
          className="text-xs px-2.5 py-1 rounded font-medium text-white"
          style={{ backgroundColor: '#ef4444', border: 'none', cursor: 'pointer' }}
          onClick={onDeny}
        >
          Deny
        </button>
      </div>
    </div>
  )
}

// Stable empty array — returned by the Zustand selector when an agent has no
// output yet.  Using a module-level constant ensures the same reference is
// returned every call, satisfying React useSyncExternalStore's requirement
// that getSnapshot() never returns a new object for the same underlying state.
const EMPTY_LINES: string[] = []

// ─── Terminal preview ─────────────────────────────────────────────────────────

function TerminalPreview({ lines }: { lines: string[] }): React.JSX.Element {
  const visible = lines.slice(-5)
  return (
    <div
      className="rounded p-3 mb-3"
      style={{
        backgroundColor: '#0a0a0d',
        border: '1px solid rgba(255,255,255,0.05)',
        height: 88,
        overflow: 'hidden',
        fontFamily: 'JetBrains Mono, monospace',
      }}
    >
      {visible.length === 0 ? (
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Waiting for output...
        </span>
      ) : (
        visible.map((line, i) => (
          <p
            key={i}
            className="text-xs leading-5 whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ color: line.startsWith('✓') ? '#22c55e' : 'rgba(255,255,255,0.45)' }}
          >
            {line}
          </p>
        ))
      )}
    </div>
  )
}

// ─── Agent card ───────────────────────────────────────────────────────────────

function AgentCard({ agent }: { agent: Agent }): React.JSX.Element {
  const navigate = useNavigate()
  const lines = useAgentStore((s) => s.outputLines[agent.id] ?? EMPTY_LINES)

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

      {/* Terminal preview — live output from IPC */}
      <TerminalPreview lines={lines} />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <span>{agent.filesTouched.length} files touched</span>
          <span>{fmtTokens(agent.tokenCount)} tokens</span>
        </div>
        <button
          onClick={() => navigate(`/agents/${agent.id}`)}
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Agents(): React.JSX.Element {
  const agents = useAgentStore((s) => s.agents)
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="p-6 space-y-4">
      {showModal && <NewAgentModal onClose={() => setShowModal(false)} />}

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
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium text-white"
            style={{ backgroundColor: '#2563eb', border: 'none', cursor: 'pointer' }}
          >
            <Plus size={12} />
            New Agent
          </button>
        </div>
      </div>

      {/* Agent cards */}
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}

      {/* System status bar */}
      <div
        className="rounded-lg px-4 py-2.5 flex items-center gap-2"
        style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <Bot size={11} style={{ color: 'rgba(255,255,255,0.2)' }} />
        <span
          className="text-xs font-mono uppercase tracking-wider"
          style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono, monospace' }}
        >
          SYSTEM STATUS: OPERATIONAL&nbsp;&nbsp;|&nbsp;&nbsp;LATENCY: 24MS&nbsp;&nbsp;|&nbsp;&nbsp;UPTIME: 99.99%&nbsp;&nbsp;|&nbsp;&nbsp;{agents.length} AGENTS ACTIVE
        </span>
      </div>

    </div>
  )
}
