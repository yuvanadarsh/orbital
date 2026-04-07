/**
 * App — root component.
 *
 * Uses HashRouter (best for Electron — no web server needed for history API).
 * All navigation is declared here; Layout provides the persistent shell,
 * and each <Route> renders into Layout's <Outlet />.
 */

import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard      from './pages/Dashboard'
import Agents         from './pages/Agents'
import AgentDetail    from './pages/AgentDetail'
import Workflows      from './pages/Workflows'
import MCPConnections from './pages/MCPConnections'
import ProjectFiles   from './pages/ProjectFiles'
import Logs           from './pages/Logs'
import Settings       from './pages/Settings'

export default function App(): React.JSX.Element {
  return (
    <HashRouter>
      <Routes>
        {/*
          All pages share the Layout wrapper (TopBar + Sidebar).
          Nested routes render into Layout's <Outlet />.
        */}
        <Route path="/" element={<Layout />}>
          <Route index            element={<Dashboard />}      />
          <Route path="agents"    element={<Agents />}         />
          <Route path="agents/:id" element={<AgentDetail />}  />
          <Route path="workflows" element={<Workflows />}      />
          <Route path="mcp"       element={<MCPConnections />} />
          <Route path="files"     element={<ProjectFiles />}   />
          <Route path="logs"      element={<Logs />}           />
          <Route path="settings"  element={<Settings />}       />

          {/* Catch-all: redirect unknown paths back to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
