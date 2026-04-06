/**
 * Layout — root shell that composes TopBar + Sidebar + main content area.
 *
 * Structure (flex-row, full viewport):
 *   ┌──────────────────────────────────────────────────┐
 *   │ TopBar (44px, full width, above sidebar+content) │
 *   ├────────────┬─────────────────────────────────────┤
 *   │  Sidebar   │  <Outlet /> — page content          │
 *   │  52/220px  │  fills remaining space              │
 *   └────────────┴─────────────────────────────────────┘
 */

import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import Sidebar from './Sidebar'

export default function Layout(): React.JSX.Element {
  // Track the active page label so TopBar can display it
  const [pageTitle, setPageTitle] = useState('Dashboard')

  return (
    <div
      className="flex flex-col"
      style={{ height: '100vh', backgroundColor: '#0d0d0f', overflow: 'hidden' }}
    >
      {/* Fixed top bar */}
      <TopBar pageTitle={pageTitle} />

      {/* Body: sidebar + page content side by side */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onNavigate={setPageTitle} />

        {/* Main content area — each page component renders here via <Outlet /> */}
        <main
          className="flex-1 overflow-auto"
          style={{ backgroundColor: '#0d0d0f' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
