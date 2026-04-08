/**
 * NewAgentModal — overlay form for spawning a new agent process.
 * Calls window.electronAPI.spawnAgent() and adds the agent to agentStore.
 */

import React, { useState } from 'react'
import { X, FolderOpen, ChevronRight, Loader } from 'lucide-react'
import { useAgentStore } from '../store/agentStore'
import type { Agent } from '../store/agentStore'

// ─── Model options ────────────────────────────────────────────────────────────

const MODELS: { label: string; value: string; cli: string }[] = [
  { label: 'Claude Sonnet (claude code)', value: 'claude-sonnet',  cli: 'claude' },
  { label: 'Claude Opus (claude code)',   value: 'claude-opus',    cli: 'claude' },
  { label: 'Gemini 2.5 Flash (gemini cli)', value: 'gemini-2.5-flash', cli: 'gemini' },
  { label: 'o3 (codex cli)',              value: 'o3',             cli: 'codex'  },
  { label: 'o4-mini (codex cli)',         value: 'o4-mini',        cli: 'codex'  },
]

// ─── Shared field styles ──────────────────────────────────────────────────────

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#13131a',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 6,
  color: 'rgba(255,255,255,0.85)',
  fontSize: 12,
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  padding: '8px 12px',
  caretColor: '#2563eb',
}

// ─── Component ────────────────────────────────────────────────────────────────

interface NewAgentModalProps {
  onClose: () => void
}

export default function NewAgentModal({ onClose }: NewAgentModalProps): React.JSX.Element {
  const addAgent = useAgentStore((s) => s.addAgent)

  const [name,    setName]    = useState('')
  const [model,   setModel]   = useState(MODELS[0].value)
  const [workDir, setWorkDir] = useState('')
  const [task,    setTask]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  // ── Browse for working directory ──────────────────────────────────────────
  const handleBrowse = async (): Promise<void> => {
    const dirPath = await window.electron.ipcRenderer.invoke('dialog:openDirectory')
    if (dirPath) setWorkDir(dirPath)
  }

  // ── Launch ────────────────────────────────────────────────────────────────
  const handleLaunch = async (): Promise<void> => {
    if (!name.trim())    return setError('Agent name is required.')
    if (!workDir.trim()) return setError('Working directory is required.')
    if (!task.trim())    return setError('Initial task is required.')

    setError(null)
    setLoading(true)

    const id = crypto.randomUUID()

    try {
      console.log('[NewAgentModal] calling spawnAgent', { id, model, workingDirectory: workDir.trim() })
      const result = await window.electronAPI.spawnAgent({
        id,
        name: name.trim(),
        model,
        workingDirectory: workDir.trim(),
        task: task.trim(),
      })
      console.log('[NewAgentModal] spawnAgent result', result)

      if (!result.success) {
        setError(result.error ?? 'Failed to spawn agent.')
        setLoading(false)
        return
      }

      // Add to store immediately so the UI reflects the new agent
      const newAgent: Agent = {
        id,
        name: name.trim(),
        model,
        status: 'running',
        task: task.trim(),
        progress: 0,
        tokenCount: 0,
        filesTouched: [],
        workingDirectory: workDir.trim(),
        pid: result.pid,
      }
      addAgent(newAgent)
      onClose()
    } catch (err) {
      setError(String(err))
      setLoading(false)
    }
  }

  // ── Keyboard shortcut: Escape closes ─────────────────────────────────────
  const handleBackdropKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Escape') onClose()
  }

  return (
    /* Backdrop */
    <div
      role="dialog"
      aria-modal="true"
      onKeyDown={handleBackdropKeyDown}
      onClick={onClose}
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 50 }}
    >
      {/* Modal card — stop click propagation so clicking inside doesn't close */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-lg p-5 flex flex-col gap-4"
        style={{
          width: 480,
          backgroundColor: '#16161f',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">New Agent</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 2 }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Agent name */}
        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Agent name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Auth Refactor"
            style={INPUT_STYLE}
            autoFocus
          />
        </div>

        {/* Model */}
        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Model
          </label>
          <div className="relative">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{ ...INPUT_STYLE, paddingRight: 28, appearance: 'none', cursor: 'pointer' }}
            >
              {MODELS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <ChevronRight
              size={11}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none rotate-90"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            />
          </div>
        </div>

        {/* Working directory */}
        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Working directory
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={workDir}
              onChange={(e) => setWorkDir(e.target.value)}
              placeholder="/path/to/project"
              style={{ ...INPUT_STYLE, flex: 1, fontFamily: 'JetBrains Mono, monospace' }}
            />
            <button
              onClick={handleBrowse}
              className="flex items-center gap-1.5 text-xs px-3 rounded-md shrink-0"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                color: 'rgba(255,255,255,0.55)',
                cursor: 'pointer',
                height: 34,
              }}
            >
              <FolderOpen size={12} />
              Browse
            </button>
          </div>
        </div>

        {/* Initial task */}
        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Initial task
          </label>
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Describe what the agent should do..."
            rows={3}
            style={{
              ...INPUT_STYLE,
              resize: 'vertical',
              lineHeight: '20px',
              minHeight: 60,
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 mt-1">
          <button
            onClick={onClose}
            className="text-xs px-4 py-2 rounded-md"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.55)',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleLaunch}
            disabled={loading}
            className="flex items-center gap-2 text-xs px-4 py-2 rounded-md font-medium text-white"
            style={{
              backgroundColor: loading ? '#1d4ed8' : '#2563eb',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading && <Loader size={11} className="animate-spin" />}
            {loading ? 'Launching...' : 'Launch Agent'}
          </button>
        </div>
      </div>
    </div>
  )
}
