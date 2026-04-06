# Orbital — AI Agent Manager

## What this is

Orbital is a local desktop application built with Electron + React that lets developers
orchestrate multiple AI coding agents (Claude Code, Gemini CLI, Codex CLI) from a single
clean UI. It is NOT a chat application. It is a mission control for agent execution.

## Core philosophy

- Agents do the work. The user manages and monitors.
- CLI mode only — no chat bubbles, no conversational UI anywhere.
- Every agent runs as a real child process on the user's machine.
- All data is local. No servers, no accounts, no cloud.

## Tech stack

- Electron + electron-vite (desktop shell)
- React (UI framework)
- Tailwind CSS (styling — use utility classes only, no custom CSS files)
- Zustand (global state management for agents, logs, settings)
- xterm.js (terminal output rendering inside agent cards)
- Node.js child_process (spawning and managing agent processes)

## Design system

- Background: #0d0d0f (app), #111118 (sidebar), #13131a (panels), #16161f (cards)
- Accent: #2563eb (electric blue) — used ONLY for active states, buttons, selected borders
- Status: green #22c55e (running), yellow #eab308 (idle), orange #f97316 (awaiting input),
  red #ef4444 (error), gray #94a3b8 (completed)
- Text: white #ffffff (primary), rgba(255,255,255,0.6) (secondary), rgba(255,255,255,0.35) (muted)
- Borders: rgba(255,255,255,0.07) — subtle, nearly invisible
- Font: Inter for all UI, JetBrains Mono for terminal output and code
- Border radius: 6px default, 8px for cards and inputs
- NO gradients, NO shadows, NO glow effects — flat and clean always

## App structure

src/
main/ — Electron main process, IPC handlers, process spawning
renderer/ — React app
components/
layout/ — Sidebar, TopBar, Layout wrapper
dashboard/ — Metric cards, agent list, workflow overview
agents/ — Agent card (collapsed + expanded states), permission banner
workflows/ — Mermaid.js diagram canvas
mcp/ — MCP marketplace cards, server logs
files/ — File tree, diff viewer
logs/ — Log feed, filter tabs, stack trace expander
settings/ — API keys, model config, appearance
store/ — Zustand stores (agentStore, logStore, settingsStore)
hooks/ — useAgentProcess, useFileWatcher, useMCPStatus
pages/ — One file per sidebar screen

## Sidebar screens (in order)

1. Dashboard — stats overview, active agents with progress, workflow preview
2. Agents — agent cards with terminal output, permission banners, expand state
3. Workflows — live read-only Mermaid.js node graph (agents + files they touch)
4. MCP Connections — marketplace style, connected/available tabs, server logs
5. Project Files — read-only diff view of files agents are modifying
6. Logs — global activity log, filterable by CMD/FILE/ERROR/AGENT
7. Settings — API keys (masked), model defaults, appearance

## Agent card states

Each agent card has two states:

- COLLAPSED: agent name, model, status badge, xterm.js terminal output (5-6 lines),
  files touched count, token count, Expand button
- EXPANDED: full-width card, larger terminal, progress bar, token usage bar,
  task input box (like Claude Code's > prompt), files modified link

## Permission banner

When Claude Code asks for user permission (e.g. to run a command), show an amber banner
inside the agent card with: warning icon, "Agent requesting permission to run command" text,
green Allow button, red Deny button. This is the most critical interactive element.

## Process management

- Each agent = one child_process.spawn() instance
- Pipe stdout/stderr to xterm.js terminal in real time via IPC
- Track process state in Zustand agentStore
- stdin pipe used to send Allow/Deny responses and new task inputs

## Key conventions

- Component files: PascalCase (AgentCard.jsx, LogFeed.jsx)
- Store files: camelCase (agentStore.js)
- Never use localStorage — use Electron's electron-store for persistence
- API keys stored via electron-store, never in code or env files
- Always handle process cleanup on window close (kill all child processes)
- Use IPC (ipcMain/ipcRenderer) for all communication between main and renderer

## What NOT to build

- No chat UI, no message bubbles, no conversational interface anywhere
- No cloud sync, no user accounts, no telemetry
- No drag-and-drop in the Workflows diagram — read only
- No file editing in Project Files — read only, diff view only

## Tailwind color config

In tailwind.config.js, add these exact custom colors so all components
use consistent tokens:

colors: {
orbital: {
bg: '#0d0d0f',
sidebar: '#111118',
panel: '#13131a',
card: '#16161f',
cardHover: '#1a1a24',
terminal: '#0a0a0d',
border: 'rgba(255,255,255,0.07)',
},
accent: {
DEFAULT: '#2563eb',
hover: '#1d4ed8',
muted: '#1e3a8a',
tint: '#172554',
},
status: {
running: '#22c55e',
idle: '#eab308',
waiting: '#f97316',
error: '#ef4444',
done: '#94a3b8',
}
}

## Component sizing conventions

- Top bar height: 44px
- Sidebar width collapsed: 52px
- Sidebar width expanded: 220px
- Agent card collapsed height: ~180px
- Agent card expanded: full width, ~400px
- Border radius default: 6px
- Border radius cards/inputs: 8px
- All borders: 1px solid rgba(255,255,255,0.07)

## TypeScript interfaces — use these exactly

interface Agent {
id: string
name: string
model: string
status: 'running' | 'idle' | 'awaiting_input' | 'error' | 'completed'
task: string
progress: number // 0-100
tokenCount: number
filesTouched: string[]
workingDirectory: string
pid?: number // process ID once spawned
}

interface LogEntry {
id: string
timestamp: string
type: 'CMD' | 'FILE' | 'ERROR' | 'AGENT'
agentName: string
message: string
stackTrace?: string // only for ERROR type
}

interface MCPServer {
id: string
name: string
version: string
status: 'connected' | 'disconnected'
description: string
lastPing?: string
}

## IPC channel names — use these exactly

- 'agent:spawn' — main process spawns a new agent
- 'agent:kill' — main process kills an agent by id
- 'agent:output' — main sends terminal output to renderer
- 'agent:input' — renderer sends stdin input to main
- 'agent:permission' — main alerts renderer that agent needs Allow/Deny
- 'agent:respond' — renderer sends Allow/Deny back to main
- 'files:watch' — main starts watching a directory for changes
- 'files:change' — main sends file diff to renderer
