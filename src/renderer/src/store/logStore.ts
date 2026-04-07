/**
 * logStore — global activity log feed.
 * Interface matches CLAUDE.md exactly.
 */

import { create } from 'zustand'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LogEntry {
  id: string
  timestamp: string
  type: 'CMD' | 'FILE' | 'ERROR' | 'AGENT'
  agentName: string
  message: string
  stackTrace?: string
}

interface LogStore {
  logs: LogEntry[]
  addLog: (entry: LogEntry) => void
  clearLogs: () => void
  filterByType: (type: LogEntry['type']) => LogEntry[]
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useLogStore = create<LogStore>((set, get) => ({
  logs: [],

  addLog: (entry) =>
    set((s) => ({ logs: [...s.logs, entry] })),

  clearLogs: () =>
    set({ logs: [] }),

  // Selector — reads current state without triggering a re-render subscription.
  // Consumers that need reactive filtering should derive via useLogStore(s => ...).
  filterByType: (type) =>
    get().logs.filter((l) => l.type === type),
}))
