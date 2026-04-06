/**
 * Logs — screen 6.
 * Will show: a global activity log filterable by CMD / FILE / ERROR / AGENT,
 * with expandable stack trace rows for ERROR entries.
 *
 * For now: static shell with filter tabs and an empty feed.
 */

import { useState } from 'react'

type LogFilter = 'ALL' | 'CMD' | 'FILE' | 'ERROR' | 'AGENT'

const FILTERS: LogFilter[] = ['ALL', 'CMD', 'FILE', 'ERROR', 'AGENT']

// Filter pill accent colours
const FILTER_COLORS: Record<LogFilter, string> = {
  ALL:   '#2563eb',
  CMD:   '#94a3b8',
  FILE:  '#22c55e',
  ERROR: '#ef4444',
  AGENT: '#f97316',
}

export default function Logs(): React.JSX.Element {
  const [activeFilter, setActiveFilter] = useState<LogFilter>('ALL')

  return (
    <div className="p-6 h-full flex flex-col space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-base font-semibold text-white">Logs</h1>
        <p className="text-xs text-white/40 mt-0.5">Global activity feed across all agents</p>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2">
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

      {/* Log feed */}
      <div
        className="flex-1 rounded-lg overflow-auto font-mono text-xs"
        style={{
          backgroundColor: '#13131a',
          border: '1px solid rgba(255,255,255,0.07)',
          padding: '12px 16px',
        }}
      >
        <p className="text-white/20 italic">No log entries yet</p>
      </div>
    </div>
  )
}
