/**
 * Workflows — screen 3.
 * Read-only live node graph showing agents, files they touch, and connections.
 * Rendered as a static SVG diagram (Mermaid.js placeholder layout).
 */

import React from 'react'
import { Download, Pause, Clock, GitBranch } from 'lucide-react'

// ─── Graph data ───────────────────────────────────────────────────────────────

interface AgentNode {
  id: string
  name: string
  model: string
  status: 'live' | 'completed'
  x: number
  y: number
}

interface FileNode {
  id: string
  name: string
  fileStatus: 'modified' | 'created' | 'unchanged'
  x: number
  y: number
}

interface Edge {
  from: string // agent id
  to: string   // file id
}

const AGENT_W = 184
const AGENT_H = 58
const FILE_W  = 148
const FILE_H  = 38

const AGENTS: AgentNode[] = [
  { id: 'auth',     name: 'Auth System',      model: 'Claude Sonnet 4.5', status: 'live',      x: 60,  y: 50  },
  { id: 'frontend', name: 'Frontend UI',      model: 'Gemini 2.5 Pro',   status: 'live',      x: 60,  y: 200 },
  { id: 'db',       name: 'Database Schema',  model: 'Claude Haiku',      status: 'completed', x: 60,  y: 350 },
]

const FILES: FileNode[] = [
  { id: 'auth_ts',      name: 'auth.ts',        fileStatus: 'modified',  x: 590, y: 42  },
  { id: 'jwt_ts',       name: 'jwt.ts',         fileStatus: 'created',   x: 590, y: 120 },
  { id: 'login_tsx',    name: 'LoginForm.tsx',  fileStatus: 'created',   x: 590, y: 210 },
  { id: 'button_tsx',   name: 'Button.tsx',     fileStatus: 'modified',  x: 590, y: 288 },
  { id: 'schema_sql',   name: 'schema.sql',     fileStatus: 'unchanged', x: 590, y: 362 },
]

const EDGES: Edge[] = [
  { from: 'auth',     to: 'auth_ts'    },
  { from: 'auth',     to: 'jwt_ts'     },
  { from: 'frontend', to: 'login_tsx'  },
  { from: 'frontend', to: 'button_tsx' },
  { from: 'db',       to: 'schema_sql' },
]

// ─── Color helpers ────────────────────────────────────────────────────────────

const AGENT_BORDER: Record<AgentNode['status'], string> = {
  live:      '#22c55e',
  completed: '#94a3b8',
}

const FILE_BORDER: Record<FileNode['fileStatus'], string> = {
  modified:  '#2563eb',
  created:   '#22c55e',
  unchanged: 'rgba(255,255,255,0.12)',
}

const FILE_LABEL_COLOR: Record<FileNode['fileStatus'], string> = {
  modified:  '#2563eb',
  created:   '#22c55e',
  unchanged: 'rgba(255,255,255,0.25)',
}

const FILE_STATUS_TEXT: Record<FileNode['fileStatus'], string> = {
  modified:  'Modified',
  created:   'Created',
  unchanged: 'Unchanged',
}

const LEGEND_ITEMS = [
  { label: 'Agent (Live)',      color: '#22c55e',               shape: 'rect' },
  { label: 'Agent (Completed)', color: '#94a3b8',               shape: 'rect' },
  { label: 'File (Modified)',   color: '#2563eb',               shape: 'rect' },
  { label: 'File (Created)',    color: '#22c55e',               shape: 'rect' },
  { label: 'File (Unchanged)',  color: 'rgba(255,255,255,0.2)', shape: 'rect' },
  { label: 'Dependency',        color: 'rgba(255,255,255,0.15)',shape: 'line' },
]

// ─── SVG diagram ──────────────────────────────────────────────────────────────

function WorkflowDiagram(): React.JSX.Element {
  const viewW = 880
  const viewH = 460

  // Build lookup maps for edge rendering
  const agentMap = Object.fromEntries(AGENTS.map((a) => [a.id, a]))
  const fileMap  = Object.fromEntries(FILES.map((f)  => [f.id,  f]))

  return (
    <svg
      viewBox={`0 0 ${viewW} ${viewH}`}
      width="100%"
      height="100%"
      style={{ display: 'block' }}
    >
      {/* Grid dot pattern */}
      <defs>
        <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="rgba(255,255,255,0.06)" />
        </pattern>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="rgba(255,255,255,0.15)" />
        </marker>
      </defs>
      <rect width={viewW} height={viewH} fill="url(#grid)" />

      {/* Edges */}
      {EDGES.map((edge) => {
        const a = agentMap[edge.from]
        const f = fileMap[edge.to]
        if (!a || !f) return null
        const x1 = a.x + AGENT_W
        const y1 = a.y + AGENT_H / 2
        const x2 = f.x
        const y2 = f.y + FILE_H / 2
        const cx = (x1 + x2) / 2
        return (
          <path
            key={`${edge.from}-${edge.to}`}
            d={`M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
            markerEnd="url(#arrowhead)"
          />
        )
      })}

      {/* Agent nodes */}
      {AGENTS.map((agent) => {
        const borderColor = AGENT_BORDER[agent.status]
        const isLive = agent.status === 'live'
        return (
          <g key={agent.id}>
            {/* Subtle glow for live agents */}
            {isLive && (
              <rect
                x={agent.x - 2} y={agent.y - 2}
                width={AGENT_W + 4} height={AGENT_H + 4}
                rx={9} fill="none"
                stroke={borderColor}
                strokeWidth="1"
                opacity="0.2"
              />
            )}
            <rect
              x={agent.x} y={agent.y}
              width={AGENT_W} height={AGENT_H}
              rx={7}
              fill="#16161f"
              stroke={borderColor}
              strokeWidth="1.5"
            />
            {/* Status dot */}
            <circle
              cx={agent.x + 14} cy={agent.y + AGENT_H / 2}
              r={4}
              fill={borderColor}
            />
            {/* Agent name */}
            <text
              x={agent.x + 26} y={agent.y + AGENT_H / 2 - 6}
              fill="white" fontSize="11" fontWeight="600"
              fontFamily="Inter, sans-serif"
            >
              {agent.name}
            </text>
            {/* Model */}
            <text
              x={agent.x + 26} y={agent.y + AGENT_H / 2 + 9}
              fill="rgba(255,255,255,0.35)" fontSize="9"
              fontFamily="Inter, sans-serif"
            >
              {agent.model}
            </text>
            {/* Status badge */}
            <rect
              x={agent.x + AGENT_W - 62} y={agent.y + 10}
              width={52} height={16}
              rx={4}
              fill={`${borderColor}20`}
            />
            <text
              x={agent.x + AGENT_W - 36} y={agent.y + 22}
              fill={borderColor} fontSize="8.5"
              fontFamily="Inter, sans-serif"
              textAnchor="middle"
              fontWeight="500"
            >
              {agent.status === 'live' ? 'LIVE' : 'DONE'}
            </text>
          </g>
        )
      })}

      {/* File nodes */}
      {FILES.map((file) => {
        const borderColor = FILE_BORDER[file.fileStatus]
        const labelColor  = FILE_LABEL_COLOR[file.fileStatus]
        return (
          <g key={file.id}>
            <rect
              x={file.x} y={file.y}
              width={FILE_W} height={FILE_H}
              rx={6}
              fill="#13131a"
              stroke={borderColor}
              strokeWidth="1.2"
            />
            {/* Filename */}
            <text
              x={file.x + 12} y={file.y + FILE_H / 2 - 4}
              fill="rgba(255,255,255,0.75)" fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="500"
            >
              {file.name}
            </text>
            {/* File status */}
            <text
              x={file.x + 12} y={file.y + FILE_H / 2 + 9}
              fill={labelColor} fontSize="8.5"
              fontFamily="Inter, sans-serif"
            >
              {FILE_STATUS_TEXT[file.fileStatus]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function Legend(): React.JSX.Element {
  return (
    <div
      className="rounded-lg p-3 space-y-2"
      style={{ backgroundColor: '#16161f', border: '1px solid rgba(255,255,255,0.07)', minWidth: 160 }}
    >
      <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
        Legend
      </p>
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          {item.shape === 'rect' ? (
            <span
              className="rounded shrink-0"
              style={{ width: 10, height: 10, border: `1.5px solid ${item.color}`, backgroundColor: 'transparent', display: 'inline-block' }}
            />
          ) : (
            <span
              className="shrink-0"
              style={{ width: 12, height: 2, backgroundColor: item.color, display: 'inline-block', borderRadius: 1 }}
            />
          )}
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Workflows(): React.JSX.Element {
  return (
    <div className="p-6 flex flex-col" style={{ height: '100%' }}>

      {/* Header + toolbar */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-base font-semibold text-white">Workflows</h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Live read-only diagram of agent activity
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
            Pause Live Updates
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
            <Download size={11} />
            Export Diagram
          </button>
        </div>
      </div>

      {/* Canvas + legend */}
      <div className="flex gap-3 flex-1 min-h-0">
        {/* Diagram canvas */}
        <div
          className="flex-1 rounded-lg overflow-hidden"
          style={{ backgroundColor: '#0a0a0d', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <WorkflowDiagram />
        </div>

        {/* Right panel: legend */}
        <div className="shrink-0">
          <Legend />
        </div>
      </div>

      {/* Stats bar */}
      <div
        className="mt-3 rounded-lg px-4 py-2.5 flex items-center gap-6 shrink-0"
        style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-1.5">
          <Clock size={11} style={{ color: 'rgba(255,255,255,0.2)' }} />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Last snapshot: 2 min ago</span>
        </div>
        <div className="flex items-center gap-1.5">
          <GitBranch size={11} style={{ color: 'rgba(255,255,255,0.2)' }} />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            3 agents active &nbsp;|&nbsp; 7 files modified &nbsp;|&nbsp; 2 agent connections
          </span>
        </div>
        <span className="ml-auto text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Session started 14 min ago &nbsp;·&nbsp; System Status: Operational
        </span>
      </div>

    </div>
  )
}
