/**
 * MCPConnections — screen 4.
 * Will show: a marketplace-style grid of MCP servers with connected/available
 * tabs, server status badges, and expandable log panels.
 *
 * For now: static shell with tab bar and placeholder cards.
 */

import { useState } from 'react'

type Tab = 'connected' | 'available'

export default function MCPConnections(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>('connected')

  return (
    <div className="p-6 space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-base font-semibold text-white">MCP Connections</h1>
        <p className="text-xs text-white/40 mt-0.5">Model Context Protocol server marketplace</p>
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
            {tab}
          </button>
        ))}
      </div>

      {/* Server cards grid placeholder */}
      <div className="grid grid-cols-2 gap-3">
        {activeTab === 'connected' ? (
          <div
            className="rounded-lg p-4 col-span-2"
            style={{ backgroundColor: '#16161f', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-xs text-white/30 italic">No connected MCP servers</p>
          </div>
        ) : (
          // Placeholder "available" cards
          ['filesystem', 'brave-search', 'github', 'postgres'].map((name) => (
            <div
              key={name}
              className="rounded-lg p-4"
              style={{ backgroundColor: '#16161f', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{name}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}
                >
                  v1.0.0
                </span>
              </div>
              <p className="text-xs text-white/30 mb-3">MCP server description placeholder</p>
              <button
                className="text-xs px-2 py-1 rounded text-white"
                style={{ backgroundColor: '#2563eb', border: 'none', cursor: 'pointer' }}
              >
                Connect
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
