/**
 * Preload — bridges main ↔ renderer over context-isolated IPC.
 *
 * Exposes window.electronAPI with typed methods the renderer can call.
 * The existing window.electron (@electron-toolkit) is kept alongside it.
 */

import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// ─── Orbital API ──────────────────────────────────────────────────────────────

const orbitalAPI = {
  // ── Outbound (renderer → main) ───────────────────────────────────────────

  /** Spawn a new agent process. */
  spawnAgent: (config: unknown): Promise<void> =>
    ipcRenderer.invoke('agent:spawn', config),

  /** Kill a running agent by id. */
  killAgent: (id: string): Promise<void> =>
    ipcRenderer.invoke('agent:kill', id),

  /** Send a follow-up task to an agent; main process re-spawns with --resume if a session ID exists. */
  sendInput: (agentId: string, text: string): void =>
    ipcRenderer.send('agent:input', agentId, text),

  /** Respond to an agent permission request (Allow / Deny). */
  respondToPermission: (agentId: string, allow: boolean): void =>
    ipcRenderer.send('agent:respond', agentId, allow),

  /** Ask the main process to start watching a directory for file changes. */
  watchDirectory: (path: string): Promise<void> =>
    ipcRenderer.invoke('files:watch', path),

  /** Open the native OS directory picker and return the chosen path (or null if cancelled). */
  browsePath: (): Promise<string | null> =>
    ipcRenderer.invoke('dialog:browse'),

  // ── Inbound listeners (main → renderer) ─────────────────────────────────

  /** Subscribe to stdout/stderr chunks from a running agent. */
  onAgentOutput: (callback: (agentId: string, data: string) => void): void => {
    ipcRenderer.on('agent:output', (_event, agentId: string, data: string) =>
      callback(agentId, data)
    )
  },

  /** Subscribe to permission-request events from a running agent. */
  onAgentPermission: (callback: (agentId: string, command: string) => void): void => {
    ipcRenderer.on('agent:permission', (_event, agentId: string, command: string) =>
      callback(agentId, command)
    )
  },

  /** Subscribe to file-change diffs emitted by the file watcher. */
  onFileChange: (callback: (path: string, diff: string) => void): void => {
    ipcRenderer.on('files:change', (_event, path: string, diff: string) =>
      callback(path, diff)
    )
  },

  /** Subscribe to session ID events — fired when Claude Code outputs its session ID. */
  onAgentSessionId: (callback: (agentId: string, sessionId: string) => void): void => {
    ipcRenderer.on('agent:sessionId', (_event, agentId: string, sessionId: string) =>
      callback(agentId, sessionId)
    )
  },
}

// ─── Expose to renderer ───────────────────────────────────────────────────────

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('electronAPI', orbitalAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.electronAPI = orbitalAPI
}
