/**
 * agentStore — global state for all running/completed agents.
 * Interface matches CLAUDE.md exactly.
 */

import { create } from 'zustand'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Agent {
  id: string
  name: string
  model: string
  status: 'running' | 'idle' | 'awaiting_input' | 'error' | 'completed'
  task: string
  progress: number
  tokenCount: number
  filesTouched: string[]
  workingDirectory: string
  pid?: number
  sessionId?: string // captured from Claude Code stdout; used for --resume on follow-ups
}

interface AgentStore {
  agents: Agent[]
  addAgent: (agent: Agent) => void
  removeAgent: (id: string) => void
  updateAgent: (id: string, patch: Partial<Agent>) => void
  setAgentStatus: (id: string, status: Agent['status']) => void
  appendFileTouched: (id: string, file: string) => void
  setSessionId: (id: string, sessionId: string) => void
  // Terminal output keyed by agent id — populated by the global IPC subscription in main.tsx
  outputLines: Record<string, string[]>
  appendOutput: (id: string, line: string) => void
}

// ─── Initial mock data ────────────────────────────────────────────────────────

const INITIAL_AGENTS: Agent[] = [
  {
    id: '1',
    name: 'Auth System',
    model: 'Claude Sonnet 4.5',
    status: 'running',
    task: 'Patching JWT validation vulnerabilities',
    progress: 65,
    tokenCount: 12400,
    filesTouched: ['src/middleware/auth.ts', 'src/lib/jwt.ts', 'src/config/auth.config.ts'],
    workingDirectory: '/Users/user/projects/my-app',
  },
  {
    id: '2',
    name: 'Frontend UI',
    model: 'Gemini 2.5 Pro',
    status: 'idle',
    task: 'Accessibility audit and component fixes',
    progress: 100,
    tokenCount: 8100,
    filesTouched: [
      'src/components/Button.tsx',
      'src/components/LoginForm.tsx',
      'src/components/Modal.tsx',
      'src/components/Input.tsx',
      'src/components/Card.tsx',
      'src/components/Badge.tsx',
      'src/components/Tooltip.tsx',
      'src/components/Dropdown.tsx',
      'src/components/Avatar.tsx',
      'src/components/Table.tsx',
      'src/components/Tabs.tsx',
      'src/components/Sidebar.tsx',
    ],
    workingDirectory: '/Users/user/projects/my-app',
  },
  {
    id: '3',
    name: 'Database Schema',
    model: 'Claude Sonnet 4.5',
    status: 'completed',
    task: 'Run schema migration for users table',
    progress: 100,
    tokenCount: 2300,
    filesTouched: ['prisma/migrations/20260407_add_login_fields.sql'],
    workingDirectory: '/Users/user/projects/my-app',
  },
  {
    id: '4',
    name: 'System Architect',
    model: 'Claude Sonnet 3.5',
    status: 'running',
    task: 'Building auth middleware',
    progress: 67,
    tokenCount: 34200,
    filesTouched: [
      'src/auth/middleware.ts',
      'src/auth/config.ts',
      'src/auth/middleware.test.ts',
      'src/auth/types.ts',
      'src/auth/utils.ts',
      'src/auth/index.ts',
      'src/auth/redis.ts',
    ],
    workingDirectory: '/Users/user/projects/my-app',
    pid: 91234,
  },
]

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAgentStore = create<AgentStore>((set) => ({
  agents: INITIAL_AGENTS,

  addAgent: (agent) =>
    set((s) => ({ agents: [...s.agents, agent] })),

  removeAgent: (id) =>
    set((s) => ({ agents: s.agents.filter((a) => a.id !== id) })),

  updateAgent: (id, patch) =>
    set((s) => ({
      agents: s.agents.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    })),

  setAgentStatus: (id, status) =>
    set((s) => ({
      agents: s.agents.map((a) => (a.id === id ? { ...a, status } : a)),
    })),

  appendFileTouched: (id, file) =>
    set((s) => ({
      agents: s.agents.map((a) =>
        a.id === id ? { ...a, filesTouched: [...a.filesTouched, file] } : a
      ),
    })),

  setSessionId: (id, sessionId) =>
    set((s) => ({
      agents: s.agents.map((a) => (a.id === id ? { ...a, sessionId } : a)),
    })),

  outputLines: {},

  appendOutput: (id, line) =>
    set((s) => ({
      outputLines: {
        ...s.outputLines,
        [id]: [...(s.outputLines[id] ?? []), line],
      },
    })),
}))
