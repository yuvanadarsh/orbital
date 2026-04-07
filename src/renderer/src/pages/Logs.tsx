/**
 * Logs — screen 6.
 * Global activity feed filterable by CMD / FILE / ERROR / AGENT,
 * with expandable stack traces for ERROR entries.
 */

import React, { useState, useMemo } from 'react'
import { Search, Trash2, Download, ChevronDown, ChevronUp, Copy, ChevronRight } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type LogFilter = 'ALL' | 'CMD' | 'FILE' | 'ERROR' | 'AGENT'

interface LogEntry {
  id: string
  timestamp: string
  type: 'CMD' | 'FILE' | 'ERROR' | 'AGENT'
  agentName: string
  message: string
  stackTrace?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTERS: LogFilter[] = ['ALL', 'CMD', 'FILE', 'ERROR', 'AGENT']

const FILTER_COLORS: Record<LogFilter, string> = {
  ALL:   '#2563eb',
  CMD:   '#94a3b8',
  FILE:  '#22c55e',
  ERROR: '#ef4444',
  AGENT: '#f97316',
}

const TYPE_COLOR: Record<LogEntry['type'], string> = {
  CMD:   '#94a3b8',
  FILE:  '#22c55e',
  ERROR: '#ef4444',
  AGENT: '#f97316',
}

// ─── Log data ─────────────────────────────────────────────────────────────────

const LOG_ENTRIES: LogEntry[] = [
  { id: '1',  timestamp: '14:22:01', type: 'AGENT', agentName: 'System-Orch',     message: 'Agent initialized and connection established' },
  { id: '2',  timestamp: '14:22:05', type: 'CMD',   agentName: 'Auth System',     message: 'npm install jose @auth/core --save-exact' },
  { id: '3',  timestamp: '14:22:12', type: 'FILE',  agentName: 'FileWatcher',     message: 'Modified /src/lib/auth.ts' },
  { id: '4',  timestamp: '14:22:15', type: 'AGENT', agentName: 'CodeGen v2',      message: 'Agent awaiting user input for database schema approval' },
  { id: '5',  timestamp: '14:22:18', type: 'CMD',   agentName: 'Auth System',     message: 'npx prisma generate --schema=./prisma/schema.prisma' },
  {
    id: '6',
    timestamp: '14:23:01',
    type: 'ERROR',
    agentName: 'Database-Sync',
    message: 'Connection timeout while connecting to postgre://orbit-cluster-01.internal:5432',
    stackTrace: `Error: ConnectionTimeout [SequelizeConnectionError]: connect ETIMEDOUT 10.0.42.12:5432
    at /usr/src/app/node_modules/sequelize/lib/dialects/postgres/connection-manager.js:142:24
    at /usr/src/app/node_modules/pg-pool/index.js:462:11
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async Pool.query (/usr/src/app/node_modules/pg-pool/index.js:342:12)
    at async DatabaseService.syncInternal (file:///usr/src/app/dist/services/database.service.js:84:22)
    at async AgentExec.run (file:///usr/src/app/dist/core/agent.executor.js:201:13)`,
  },
  { id: '7',  timestamp: '14:23:45', type: 'FILE',  agentName: 'CodeGen v2',      message: 'Created /src/components/ui/LogViewer.tsx' },
  { id: '8',  timestamp: '14:24:02', type: 'CMD',   agentName: 'Tester',          message: 'vitest run src/tests/auth.test.ts' },
  {
    id: '9',
    timestamp: '14:24:10',
    type: 'ERROR',
    agentName: 'System-Orch',
    message: "Module not found: Can't resolve 'framer-motion' in '/src/components'",
    stackTrace: `Error: Module not found: Can't resolve 'framer-motion'
    at Resolver.resolve (/usr/src/app/node_modules/webpack/lib/Resolver.js:402:17)
    at /usr/src/app/node_modules/webpack/lib/ResolverFactory.js:88:14
    at processTicksAndRejections (node:internal/process/task_queues:95:5)`,
  },
  { id: '10', timestamp: '14:24:22', type: 'CMD',   agentName: 'RepairBot',       message: 'npm install framer-motion' },
  { id: '11', timestamp: '14:24:35', type: 'FILE',  agentName: 'Auth System',     message: 'Deleted /src/lib/temp-auth.js' },
  { id: '12', timestamp: '14:24:40', type: 'AGENT', agentName: 'Tester',          message: 'Agent completed task with status [PASS]' },
  { id: '13', timestamp: '14:25:01', type: 'CMD',   agentName: 'System-Orch',     message: 'git add . && git commit -m "feat: integrate mcp connection auth"' },
  { id: '14', timestamp: '14:25:15', type: 'FILE',  agentName: 'Git-Sync',        message: 'Pushed to branch origin/main' },
  { id: '15', timestamp: '14:25:20', type: 'CMD',   agentName: 'Deployment-Bot',  message: 'vercel --prod' },
]

// ─── Log row ──────────────────────────────────────────────────────────────────

function LogRow({ entry }: { entry: LogEntry }): React.JSX.Element {
  const [expanded, setExpanded] = useState(false)
  const hasTrace = !!entry.stackTrace
  const isError = entry.type === 'ERROR'

  return (
    <div
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        backgroundColor: isError && expanded ? 'rgba(239,68,68,0.04)' : 'transparent',
      }}
    >
      {/* Main row */}
      <div
        className="flex items-center gap-3 px-4 py-1.5"
        style={{ cursor: hasTrace ? 'pointer' : 'default' }}
        onClick={() => hasTrace && setExpanded((v) => !v)}
      >
        {/* Timestamp */}
        <span
          className="text-xs shrink-0 tabular-nums"
          style={{ color: 'rgba(255,255,255,0.22)', fontFamily: 'JetBrains Mono, monospace', minWidth: 60 }}
        >
          {entry.timestamp}
        </span>

        {/* Type badge */}
        <span
          className="text-xs font-medium shrink-0 uppercase"
          style={{
            color: TYPE_COLOR[entry.type],
            fontFamily: 'JetBrains Mono, monospace',
            minWidth: 40,
          }}
        >
          {entry.type}
        </span>

        {/* Agent name */}
        <span
          className="text-xs shrink-0"
          style={{ color: 'rgba(255,255,255,0.35)', minWidth: 120, fontFamily: 'JetBrains Mono, monospace' }}
        >
          {entry.agentName}
        </span>

        {/* Message */}
        <span
          className="text-xs flex-1 truncate"
          style={{ color: isError ? '#ef4444' : 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono, monospace' }}
        >
          {entry.message}
        </span>

        {/* Expand / copy controls */}
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(entry.message) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.15)', padding: 2 }}
            title="Copy"
          >
            <Copy size={10} />
          </button>
          {hasTrace && (
            expanded
              ? <ChevronUp size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
              : <ChevronDown size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
          )}
        </div>
      </div>

      {/* Stack trace */}
      {expanded && entry.stackTrace && (
        <div
          className="mx-4 mb-2 rounded p-3"
          style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider" style={{ color: 'rgba(239,68,68,0.7)' }}>Stack Trace</span>
            <button
              onClick={() => navigator.clipboard?.writeText(entry.stackTrace ?? '')}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer' }}
            >
              <Copy size={9} />
              Copy Stack Trace
            </button>
          </div>
          <pre
            className="text-xs leading-5 whitespace-pre-wrap break-all"
            style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono, monospace', margin: 0 }}
          >
            {entry.stackTrace}
          </pre>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Logs(): React.JSX.Element {
  const [activeFilter, setActiveFilter] = useState<LogFilter>('ALL')
  const [search, setSearch] = useState('')
  const [agentFilter, setAgentFilter] = useState('All Agents')

  const filtered = useMemo(() => {
    return LOG_ENTRIES.filter((entry) => {
      const matchesType   = activeFilter === 'ALL' || entry.type === activeFilter
      const matchesSearch = search === '' ||
        entry.message.toLowerCase().includes(search.toLowerCase()) ||
        entry.agentName.toLowerCase().includes(search.toLowerCase())
      const matchesAgent  = agentFilter === 'All Agents' || entry.agentName === agentFilter
      return matchesType && matchesSearch && matchesAgent
    })
  }, [activeFilter, search, agentFilter])

  const errorCount = LOG_ENTRIES.filter((e) => e.type === 'ERROR').length
  const uniqueAgents = ['All Agents', ...Array.from(new Set(LOG_ENTRIES.map((e) => e.agentName)))]

  return (
    <div className="p-6 h-full flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-base font-semibold text-white">Logs</h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Global activity feed across all agents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
            }}
          >
            <Download size={11} />
            Export Logs
          </button>
          <button
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={11} />
            Clear Logs
          </button>
        </div>
      </div>

      {/* Filter pills + search + agent dropdown */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Type filters */}
        <div className="flex items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={{
                backgroundColor: activeFilter === f ? FILTER_COLORS[f] : 'rgba(255,255,255,0.05)',
                color: activeFilter === f ? '#fff' : 'rgba(255,255,255,0.4)',
                border: `1px solid ${activeFilter === f ? FILTER_COLORS[f] : 'rgba(255,255,255,0.07)'}`,
                cursor: 'pointer',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Agent dropdown */}
        <div className="relative">
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="text-xs pl-3 pr-7 py-1.5 rounded-md appearance-none"
            style={{
              backgroundColor: '#13131a',
              border: '1px solid rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {uniqueAgents.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <ChevronRight
            size={10}
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none rotate-90"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          />
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-2 rounded-md px-3"
          style={{
            backgroundColor: '#13131a',
            border: '1px solid rgba(255,255,255,0.07)',
            height: 30,
            width: 200,
          }}
        >
          <Search size={11} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="flex-1 bg-transparent text-xs outline-none"
            style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'JetBrains Mono, monospace' }}
          />
        </div>
      </div>

      {/* Log feed */}
      <div
        className="flex-1 rounded-lg overflow-auto min-h-0"
        style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Feed header */}
        <div
          className="flex items-center gap-3 px-4 py-2 sticky top-0"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            backgroundColor: '#13131a',
          }}
        >
          {['Time', 'Type', 'Agent', 'Message'].map((h, i) => (
            <span
              key={h}
              className="text-xs uppercase tracking-wider"
              style={{
                color: 'rgba(255,255,255,0.25)',
                fontFamily: 'JetBrains Mono, monospace',
                minWidth: i === 0 ? 60 : i === 1 ? 40 : i === 2 ? 120 : undefined,
                flex: i === 3 ? 1 : undefined,
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <p className="px-4 py-6 text-xs italic" style={{ color: 'rgba(255,255,255,0.2)' }}>
            No log entries match the current filter.
          </p>
        ) : (
          filtered.map((entry) => <LogRow key={entry.id} entry={entry} />)
        )}
      </div>

      {/* Stats bar */}
      <div
        className="rounded-lg px-4 py-2.5 flex items-center gap-5 shrink-0"
        style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <span className="text-white">{LOG_ENTRIES.length}</span> entries
        </span>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <span style={{ color: '#ef4444' }}>{errorCount}</span> errors
        </span>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Session: 14 min</span>
        <span className="ml-auto text-xs font-mono uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.18)', fontFamily: 'JetBrains Mono, monospace' }}>
          LATENCY: 24MS &nbsp;|&nbsp; UPTIME: 99.99%
        </span>
      </div>

    </div>
  )
}
