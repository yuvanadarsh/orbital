/**
 * Dashboard — screen 1.
 * Stats overview, active agents table, workflow preview, recent activity, system status.
 */

import React from 'react'
import {
  Bot,
  Play,
  Clock,
  Zap,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Pause,
  Activity,
  GitBranch,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type AgentStatus = 'running' | 'idle' | 'awaiting_input' | 'error' | 'completed'

interface AgentRow {
  name: string
  model: string
  progress: number
  status: AgentStatus
  description: string
}

interface ActivityEntry {
  time: string
  type: 'CMD' | 'FILE' | 'ERROR' | 'AGENT'
  message: string
}

// ─── Static mock data (matches Stitch design) ────────────────────────────────

const AGENTS: AgentRow[] = [
  {
    name: 'Lead_Gen_Scraper',
    model: 'GPT-4o',
    progress: 82,
    status: 'running',
    description: 'Executing deep-crawl on target domains...',
  },
  {
    name: 'Doc_Refactorer',
    model: 'Claude 3.5 Sonnet',
    progress: 45,
    status: 'running',
    description: 'Applying functional updates to legacy controllers',
  },
  {
    name: 'Security_Audit_Bot',
    model: 'Llama-3-70b',
    progress: 100,
    status: 'idle',
    description: 'Audit complete. Generating final report.',
  },
  {
    name: 'Deployment_Orchestrator',
    model: 'GPT-4o-mini',
    progress: 12,
    status: 'awaiting_input',
    description: 'Waiting for production environment access token...',
  },
]

const ACTIVITY: ActivityEntry[] = [
  { time: '14:32:01', type: 'CMD',   message: 'Lead_Gen_Scraper executed: curl -s https://target.io/sitemap.xml' },
  { time: '14:31:48', type: 'FILE',  message: 'Doc_Refactorer modified: src/controllers/UserController.ts' },
  { time: '14:31:22', type: 'AGENT', message: 'Security_Audit_Bot completed audit pass — 0 critical findings' },
  { time: '14:30:55', type: 'ERROR', message: 'Deployment_Orchestrator: permission denied — awaiting user response' },
  { time: '14:30:10', type: 'FILE',  message: 'Doc_Refactorer modified: src/controllers/AuthController.ts' },
]

const WORKFLOW_STAGES = ['Plan', 'Build', 'Test']

// ─── Sub-components ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AgentStatus, { label: string; color: string; dot: string }> = {
  running:       { label: 'Running',        color: 'text-status-running', dot: '#22c55e' },
  idle:          { label: 'Idle',           color: 'text-status-idle',    dot: '#eab308' },
  awaiting_input:{ label: 'Awaiting Input', color: 'text-status-waiting', dot: '#f97316' },
  error:         { label: 'Error',          color: 'text-status-error',   dot: '#ef4444' },
  completed:     { label: 'Completed',      color: 'text-status-done',    dot: '#94a3b8' },
}

const TYPE_COLOR: Record<ActivityEntry['type'], string> = {
  CMD:   '#2563eb',
  FILE:  '#94a3b8',
  ERROR: '#ef4444',
  AGENT: '#22c55e',
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
}): React.JSX.Element {
  return (
    <div
      className="rounded-lg p-4 flex flex-col gap-3"
      style={{ backgroundColor: '#16161f', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40">{label}</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-semibold text-white leading-none">{value}</p>
        <p className="text-xs text-white/35 mt-1">{sub}</p>
      </div>
    </div>
  )
}

function ProgressBar({ value, status }: { value: number; status: AgentStatus }): React.JSX.Element {
  const color = STATUS_CONFIG[status].dot
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.07)' }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-white/40 w-7 text-right">{value}%</span>
    </div>
  )
}

function StatusBadge({ status }: { status: AgentStatus }): React.JSX.Element {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block rounded-full"
        style={{ width: 6, height: 6, backgroundColor: cfg.dot, flexShrink: 0 }}
      />
      <span className="text-xs" style={{ color: cfg.dot }}>
        {cfg.label}
      </span>
    </span>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Dashboard(): React.JSX.Element {
  return (
    <div className="p-6 space-y-5">

      {/* Page header */}
      <div>
        <h1 className="text-base font-semibold text-white">Dashboard</h1>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Overview of active agents and recent activity
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          icon={<Bot size={14} />}
          label="Total Agents"
          value="12"
          sub="+2 this week"
        />
        <StatCard
          icon={<Play size={14} />}
          label="Running Now"
          value="3"
          sub="Active processes"
        />
        <StatCard
          icon={<Clock size={14} />}
          label="Awaiting Input"
          value="2"
          sub="Paused for permission"
        />
        <StatCard
          icon={<Zap size={14} />}
          label="Token Usage Today"
          value="284k"
          sub="28% of monthly limit"
        />
      </div>

      {/* Active agents table */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ backgroundColor: '#16161f', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <Bot size={13} style={{ color: 'rgba(255,255,255,0.4)' }} />
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Active Agents
          </span>
        </div>

        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['Name', 'Model', 'Progress', 'Status', 'Description'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left font-medium"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AGENTS.map((agent, i) => (
              <tr
                key={agent.name}
                style={{
                  borderBottom: i < AGENTS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
              >
                <td className="px-4 py-3 font-medium text-white">{agent.name}</td>
                <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{agent.model}</td>
                <td className="px-4 py-3">
                  <ProgressBar value={agent.progress} status={agent.status} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={agent.status} />
                </td>
                <td className="px-4 py-3 max-w-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {agent.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom row: Workflow preview + Recent activity */}
      <div className="grid grid-cols-2 gap-3">

        {/* Workflow overview */}
        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: '#16161f', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <GitBranch size={13} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Workflow Overview
            </span>
          </div>

          <div className="flex items-center gap-2">
            {WORKFLOW_STAGES.map((stage, i) => (
              <React.Fragment key={stage}>
                <div
                  className="flex-1 rounded px-3 py-2 text-center"
                  style={{
                    backgroundColor: i === 0 ? '#172554' : i === 1 ? '#13131a' : '#13131a',
                    border: `1px solid ${i === 0 ? '#2563eb' : 'rgba(255,255,255,0.07)'}`,
                  }}
                >
                  <p className="text-xs font-medium" style={{ color: i === 0 ? '#2563eb' : 'rgba(255,255,255,0.6)' }}>
                    {stage}
                  </p>
                  {i === 0 && (
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Active</p>
                  )}
                </div>
                {i < WORKFLOW_STAGES.length - 1 && (
                  <ArrowRight size={12} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                )}
              </React.Fragment>
            ))}
          </div>

          <p className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.25)' }}>
            3 agents active across pipeline stages
          </p>
        </div>

        {/* Recent activity */}
        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: '#16161f', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Activity size={13} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Recent Activity
            </span>
          </div>

          <div className="space-y-2">
            {ACTIVITY.map((entry, i) => (
              <div key={i} className="flex items-start gap-2">
                <span
                  className="text-xs font-mono shrink-0 mt-px"
                  style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {entry.time}
                </span>
                <span
                  className="text-xs font-mono shrink-0 mt-px uppercase"
                  style={{ color: TYPE_COLOR[entry.type], minWidth: 36, fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {entry.type}
                </span>
                <span className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {entry.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System status bar */}
      <div
        className="rounded-lg px-4 py-3 flex items-center gap-6"
        style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-1.5">
          <CheckCircle size={12} style={{ color: '#22c55e' }} />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>All systems operational</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle size={12} style={{ color: 'rgba(255,255,255,0.2)' }} />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Latency: 12ms</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Pause size={12} style={{ color: 'rgba(255,255,255,0.2)' }} />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Uptime: 99.9%</span>
        </div>
      </div>

    </div>
  )
}
