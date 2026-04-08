/**
 * Workflows — screen 3.
 * Live read-only Mermaid.js graph: one node per agent, one node per file touched,
 * edges connecting agents to the files they modified.
 * Re-renders automatically whenever agentStore changes.
 */

import React, { useEffect, useRef } from 'react'
import mermaid from 'mermaid'
import { GitBranch, Clock } from 'lucide-react'
import { useAgentStore } from '../store/agentStore'
import type { Agent } from '../store/agentStore'

// ─── Status colours (matches CLAUDE.md design system) ────────────────────────

const STATUS_COLOR: Record<Agent['status'], string> = {
  running:        '#22c55e',
  idle:           '#eab308',
  awaiting_input: '#f97316',
  error:          '#ef4444',
  completed:      '#94a3b8',
}

// Mermaid style string per status
const STATUS_STYLE: Record<Agent['status'], string> = {
  running:        'fill:#16161f,stroke:#22c55e,stroke-width:2px,color:#fff',
  idle:           'fill:#16161f,stroke:#eab308,stroke-width:2px,color:#fff',
  awaiting_input: 'fill:#16161f,stroke:#f97316,stroke-width:2px,color:#fff',
  error:          'fill:#16161f,stroke:#ef4444,stroke-width:2px,color:#fff',
  completed:      'fill:#16161f,stroke:#94a3b8,stroke-width:1.5px,color:rgba(255,255,255,0.5)',
}

// ─── Diagram builder ──────────────────────────────────────────────────────────

function buildDefinition(agents: Agent[]): string {
  const lines: string[] = ['graph LR']
  const fileNodeIds = new Map<string, string>() // filepath → safe node id
  const agentStyles: string[] = []

  agents.forEach((agent, ai) => {
    const agentNodeId = `agent_${ai}`
    const label = `${agent.name}\\n${agent.status}`
    lines.push(`  ${agentNodeId}["${label}"]`)
    agentStyles.push(`style ${agentNodeId} ${STATUS_STYLE[agent.status]}`)

    agent.filesTouched.forEach((filepath, fi) => {
      const filename = filepath.split('/').pop() ?? filepath
      // Deduplicate file nodes across agents by full path
      let fileNodeId = fileNodeIds.get(filepath)
      if (!fileNodeId) {
        fileNodeId = `file_${ai}_${fi}`
        fileNodeIds.set(filepath, fileNodeId)
        lines.push(`  ${fileNodeId}(["${filename}"])`)
        lines.push(`  style ${fileNodeId} fill:#13131a,stroke:#2563eb,stroke-width:1.2px,color:rgba(255,255,255,0.7)`)
      }
      lines.push(`  ${agentNodeId} --> ${fileNodeId}`)
    })
  })

  // Append agent styles after all nodes are declared
  agentStyles.forEach((s) => lines.push(`  ${s}`))

  return lines.join('\n')
}

// ─── Mermaid canvas ───────────────────────────────────────────────────────────

let mermaidInitialised = false

function MermaidDiagram({ definition }: { definition: string }): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    if (!mermaidInitialised) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
          background: '#0a0a0d',
          mainBkg: '#16161f',
          nodeBorder: 'rgba(255,255,255,0.07)',
          lineColor: 'rgba(255,255,255,0.2)',
          textColor: '#ffffff',
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
        },
        flowchart: {
          curve: 'basis',
          useMaxWidth: true,
        },
      })
      mermaidInitialised = true
    }

    let cancelled = false
    const id = `mermaid-${Date.now()}`

    mermaid.render(id, definition).then(({ svg }) => {
      if (!cancelled && ref.current) {
        ref.current.innerHTML = svg
        // Make the SVG fill the container
        const svgEl = ref.current.querySelector('svg')
        if (svgEl) {
          svgEl.style.width = '100%'
          svgEl.style.height = '100%'
          svgEl.removeAttribute('width')
          svgEl.removeAttribute('height')
        }
      }
    }).catch((err) => {
      if (!cancelled && ref.current) {
        ref.current.innerHTML = `<p style="color:#ef4444;padding:16px;font-size:12px">[Diagram error] ${String(err)}</p>`
      }
    })

    return () => { cancelled = true }
  }, [definition])

  return (
    <div
      ref={ref}
      style={{ width: '100%', height: '100%', overflow: 'auto' }}
    />
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <GitBranch size={28} style={{ color: 'rgba(255,255,255,0.12)' }} />
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
        No active agents. Start an agent to see the workflow.
      </p>
    </div>
  )
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar({ agents }: { agents: Agent[] }): React.JSX.Element {
  const activeCount = agents.filter((a) => a.status === 'running' || a.status === 'awaiting_input').length
  const fileCount   = new Set(agents.flatMap((a) => a.filesTouched)).size

  return (
    <div
      className="mt-3 rounded-lg px-4 py-2.5 flex items-center gap-6 shrink-0"
      style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center gap-1.5">
        <Clock size={11} style={{ color: 'rgba(255,255,255,0.2)' }} />
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Live</span>
      </div>
      <div className="flex items-center gap-1.5">
        <GitBranch size={11} style={{ color: 'rgba(255,255,255,0.2)' }} />
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {activeCount} agent{activeCount !== 1 ? 's' : ''} active
          &nbsp;|&nbsp;
          {fileCount} file{fileCount !== 1 ? 's' : ''} touched
          &nbsp;|&nbsp;
          {agents.length} total agent{agents.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}

// ─── Legend ───────────────────────────────────────────────────────────────────

const LEGEND_ITEMS: { label: string; color: string }[] = [
  { label: 'Running',        color: STATUS_COLOR.running        },
  { label: 'Idle',           color: STATUS_COLOR.idle           },
  { label: 'Awaiting input', color: STATUS_COLOR.awaiting_input },
  { label: 'Error',          color: STATUS_COLOR.error          },
  { label: 'Completed',      color: STATUS_COLOR.completed      },
  { label: 'File touched',   color: '#2563eb'                   },
]

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
          <span
            className="rounded shrink-0"
            style={{ width: 10, height: 10, border: `1.5px solid ${item.color}`, backgroundColor: 'transparent', display: 'inline-block' }}
          />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Workflows(): React.JSX.Element {
  const agents = useAgentStore((s) => s.agents)
  const hasAgents = agents.length > 0

  // Build diagram definition string; re-computed whenever agents array changes.
  const definition = hasAgents ? buildDefinition(agents) : ''

  return (
    <div className="p-6 flex flex-col" style={{ height: '100%' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-base font-semibold text-white">Workflows</h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Live read-only diagram of agent activity
          </p>
        </div>
      </div>

      {/* Canvas + legend */}
      <div className="flex gap-3 flex-1 min-h-0">
        <div
          className="flex-1 rounded-lg overflow-hidden"
          style={{ backgroundColor: '#0a0a0d', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {hasAgents
            ? <MermaidDiagram definition={definition} />
            : <EmptyState />}
        </div>
        <div className="shrink-0">
          <Legend />
        </div>
      </div>

      <StatsBar agents={agents} />
    </div>
  )
}
