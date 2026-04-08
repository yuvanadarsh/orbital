/**
 * Renderer entry point.
 * Imports global CSS (Tailwind + Orbital design tokens) before mounting React.
 */

import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { useAgentStore } from './store/agentStore'

// ─── Global IPC subscription (set up once, never duplicated) ─────────────────
// Route every agent:output event into the store so AgentCard and AgentDetail
// both see real-time output regardless of which page is currently mounted.
if (window.electronAPI) {
  window.electronAPI.onAgentOutput((agentId: string, line: string) => {
    console.log('[RENDERER] agent:output received', agentId, line.slice(0, 80))
    useAgentStore.getState().appendOutput(agentId, line)
  })

  window.electronAPI.onAgentSessionId((agentId: string, sessionId: string) => {
    console.log('[RENDERER] agent:sessionId received', agentId, sessionId)
    useAgentStore.getState().setSessionId(agentId, sessionId)
  })
} else {
  console.error('[RENDERER] window.electronAPI is not available — preload may have failed')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
