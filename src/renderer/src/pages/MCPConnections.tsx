/**
 * MCPConnections — screen 4.
 * Marketplace-style MCP server management with Connected/Available tabs,
 * status badges, and runtime log panel.
 */

import React, { useState } from 'react'
import {
  Terminal,
  Database,
  Folder,
  Search,
  MessageSquare,
  GitPullRequest,
  FileText,
  Cloud,
  Settings2,
  Unplug,
  Plus,
  Star,
  Activity,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'connected' | 'available'

interface ConnectedServer {
  id: string
  name: string
  version: string
  description: string
  lastPing: string
  icon: React.ReactNode
}

interface AvailableServer {
  id: string
  name: string
  version: string
  description: string
  category: string
  rating: number
  installs: string
  icon: React.ReactNode
}

interface LogEntry {
  time: string
  level: 'INFO' | 'OK' | 'WARN' | 'ERR'
  message: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CONNECTED: ConnectedServer[] = [
  {
    id: 'github',
    name: 'GitHub MCP',
    version: 'v2.4.0',
    description: 'Access repositories, issues, and pull requests directly within your agent',
    lastPing: '12ms ago',
    icon: <GitPullRequest size={14} />,
  },
  {
    id: 'supabase',
    name: 'Supabase MCP',
    version: 'v1.1.2',
    description: 'Query PostgreSQL databases and manage auth users via MCP transport',
    lastPing: '45ms ago',
    icon: <Database size={14} />,
  },
  {
    id: 'filesystem',
    name: 'Filesystem MCP',
    version: 'v1.0.0-local',
    description: 'Read and write access to specific local directories for agent context',
    lastPing: '1ms ago',
    icon: <Folder size={14} />,
  },
]

const AVAILABLE: AvailableServer[] = [
  {
    id: 'brave',
    name: 'Brave Search',
    version: 'v1.3.0',
    description: 'Web search via Brave API with structured result extraction for agents',
    category: 'Search',
    rating: 4.8,
    installs: '12.4k',
    icon: <Search size={14} />,
  },
  {
    id: 'postgres',
    name: 'Postgres',
    version: 'v2.0.1',
    description: 'Direct PostgreSQL query execution with schema inspection support',
    category: 'Database',
    rating: 4.9,
    installs: '9.1k',
    icon: <Database size={14} />,
  },
  {
    id: 'slack',
    name: 'Slack',
    version: 'v1.0.4',
    description: 'Read and post messages to Slack channels from within agent tasks',
    category: 'Messaging',
    rating: 4.5,
    installs: '7.8k',
    icon: <MessageSquare size={14} />,
  },
  {
    id: 'linear',
    name: 'Linear',
    version: 'v1.2.0',
    description: 'Create and update Linear issues and project tracking from agents',
    category: 'Project Management',
    rating: 4.7,
    installs: '5.3k',
    icon: <GitPullRequest size={14} />,
  },
  {
    id: 'notion',
    name: 'Notion',
    version: 'v1.1.0',
    description: 'Read and write Notion pages and databases as agent context',
    category: 'Docs',
    rating: 4.6,
    installs: '6.2k',
    icon: <FileText size={14} />,
  },
  {
    id: 'aws-s3',
    name: 'AWS S3',
    version: 'v1.0.2',
    description: 'Upload, download, and list objects in S3 buckets during agent runs',
    category: 'Storage',
    rating: 4.5,
    installs: '3.9k',
    icon: <Cloud size={14} />,
  },
]

const LOGS: LogEntry[] = [
  { time: '14:32:01', level: 'INFO', message: 'github-mcp: initialized transport layer' },
  { time: '14:32:02', level: 'OK',   message: 'github-mcp: authenticated via personal access token' },
  { time: '14:32:04', level: 'INFO', message: 'supabase-mcp: connected to db — 14 active tables' },
  { time: '14:32:05', level: 'OK',   message: 'filesystem-mcp: health check passed' },
  { time: '14:32:08', level: 'INFO', message: 'github-mcp: Auth_System fetching open PRs for org/repo' },
]

const LOG_COLOR: Record<LogEntry['level'], string> = {
  INFO: 'rgba(255,255,255,0.35)',
  OK:   '#22c55e',
  WARN: '#f97316',
  ERR:  '#ef4444',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ConnectedCard({ server }: { server: ConnectedServer }): React.JSX.Element {
  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: '#16161f', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Icon + info */}
        <div className="flex items-start gap-3">
          <div
            className="rounded-md flex items-center justify-center shrink-0"
            style={{
              width: 34,
              height: 34,
              backgroundColor: 'rgba(37,99,235,0.12)',
              border: '1px solid rgba(37,99,235,0.2)',
              color: '#2563eb',
            }}
          >
            {server.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-medium text-white">{server.name}</span>
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}
              >
                {server.version}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{server.description}</p>
          </div>
        </div>

        {/* Status + actions */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="rounded-full" style={{ width: 6, height: 6, backgroundColor: '#22c55e', display: 'inline-block' }} />
            <span className="text-xs" style={{ color: '#22c55e' }}>Connected</span>
          </div>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Ping: {server.lastPing}</span>
          <div className="flex items-center gap-1.5 mt-1">
            <button
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
              }}
            >
              <Settings2 size={10} />
              Configure
            </button>
            <button
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md"
              style={{
                backgroundColor: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#ef4444',
                cursor: 'pointer',
              }}
            >
              <Unplug size={10} />
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AvailableCard({ server }: { server: AvailableServer }): React.JSX.Element {
  return (
    <div
      className="rounded-lg p-4 flex flex-col gap-3"
      style={{ backgroundColor: '#16161f', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="rounded-md flex items-center justify-center shrink-0"
            style={{
              width: 30,
              height: 30,
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            {server.icon}
          </div>
          <div>
            <p className="text-sm font-medium text-white leading-tight">{server.name}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{server.version}</p>
          </div>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {server.category}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
        {server.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star size={10} style={{ color: '#eab308', fill: '#eab308' }} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{server.rating}</span>
          </div>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{server.installs} installs</span>
        </div>
        <button
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-medium text-white"
          style={{ backgroundColor: '#2563eb', border: 'none', cursor: 'pointer' }}
        >
          <Plus size={10} />
          Connect
        </button>
      </div>
    </div>
  )
}

function LogPanel(): React.JSX.Element {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ backgroundColor: '#16161f', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div
        className="px-4 py-2.5 flex items-center gap-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Activity size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
          MCP Runtime Logs
        </span>
      </div>
      <div className="p-3 space-y-1.5">
        {LOGS.map((entry, i) => (
          <div key={i} className="flex items-start gap-2">
            <span
              className="text-xs shrink-0"
              style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono, monospace' }}
            >
              {entry.time}
            </span>
            <span
              className="text-xs font-mono shrink-0 uppercase"
              style={{ color: LOG_COLOR[entry.level], minWidth: 30, fontFamily: 'JetBrains Mono, monospace' }}
            >
              {entry.level}
            </span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'JetBrains Mono, monospace' }}>
              {entry.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MCPConnections(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>('connected')

  return (
    <div className="p-6 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">MCP Connections</h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Model Context Protocol server marketplace
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Terminal icon badge showing active count */}
          <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md"
            style={{ backgroundColor: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', color: '#2563eb' }}
          >
            <Terminal size={11} />
            <span>{CONNECTED.length} connected</span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-1 p-1 rounded-lg w-fit"
        style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {(['connected', 'available'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize"
            style={{
              backgroundColor: activeTab === tab ? '#2563eb' : 'transparent',
              color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.4)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {tab === 'connected' ? `Connected (${CONNECTED.length})` : `Available (${AVAILABLE.length})`}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'connected' ? (
        <div className="space-y-3">
          {CONNECTED.map((server) => (
            <ConnectedCard key={server.id} server={server} />
          ))}
          <LogPanel />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {AVAILABLE.map((server) => (
            <AvailableCard key={server.id} server={server} />
          ))}
        </div>
      )}

      {/* Status bar */}
      <div
        className="rounded-lg px-4 py-2.5 flex items-center gap-4"
        style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'JetBrains Mono, monospace' }}>
          LATENCY: 24MS
        </span>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'JetBrains Mono, monospace' }}>
          UPTIME: 99.99%
        </span>
      </div>

    </div>
  )
}
