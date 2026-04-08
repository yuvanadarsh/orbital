import { ElectronAPI } from '@electron-toolkit/preload'

interface SpawnResult {
  success: boolean
  pid?: number
  error?: string
}

interface OrbitalAPI {
  // Outbound
  spawnAgent: (config: unknown) => Promise<SpawnResult>
  killAgent: (id: string) => Promise<void>
  sendInput: (agentId: string, text: string) => void
  respondToPermission: (agentId: string, allow: boolean) => void
  watchDirectory: (path: string) => Promise<void>
  browsePath: () => Promise<string | null>
  // Inbound listeners
  onAgentOutput: (callback: (agentId: string, data: string) => void) => void
  onAgentPermission: (callback: (agentId: string, command: string) => void) => void
  onFileChange: (callback: (path: string, diff: string) => void) => void
  onAgentSessionId: (callback: (agentId: string, sessionId: string) => void) => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    electronAPI: OrbitalAPI
  }
}
