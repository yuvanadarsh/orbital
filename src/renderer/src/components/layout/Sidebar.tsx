/**
 * Sidebar — collapsible vertical nav rail.
 *
 * Collapsed (default): 52px wide — shows only icons.
 * Expanded:           220px wide — shows icons + labels.
 *
 * Uses React Router's NavLink so the active item is automatically
 * highlighted in the electric-blue accent color (#2563eb).
 */

import { useState } from 'react'
import { NavLink } from 'react-router-dom'

// ── Inline SVG icons ────────────────────────────────────────────────────────
// Each returns a 18×18 SVG so they stay crisp at the sidebar's scale.

function IconDashboard(): React.JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function IconAgents(): React.JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  )
}

function IconWorkflows(): React.JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="6" r="2" />
      <circle cx="19" cy="6" r="2" />
      <circle cx="12" cy="18" r="2" />
      <path d="M7 6h10" />
      <path d="M5 8v6a1 1 0 0 0 1 1h5" />
      <path d="M19 8v6a1 1 0 0 1-1 1h-5" />
    </svg>
  )
}

function IconMCP(): React.JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  )
}

function IconFiles(): React.JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function IconLogs(): React.JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function IconSettings(): React.JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function IconChevron({ expanded }: { expanded: boolean }): React.JSX.Element {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

// ── Nav item definitions ────────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: '/',         label: 'Dashboard',    Icon: IconDashboard },
  { to: '/agents',   label: 'Agents',       Icon: IconAgents    },
  { to: '/workflows',label: 'Workflows',    Icon: IconWorkflows  },
  { to: '/mcp',      label: 'MCP',          Icon: IconMCP        },
  { to: '/files',    label: 'Project Files',Icon: IconFiles      },
  { to: '/logs',     label: 'Logs',         Icon: IconLogs       },
  { to: '/settings', label: 'Settings',     Icon: IconSettings   },
]

// ── Component ───────────────────────────────────────────────────────────────
interface SidebarProps {
  onNavigate: (label: string) => void
}

export default function Sidebar({ onNavigate }: SidebarProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(false)

  const width = expanded ? 220 : 52

  return (
    <aside
      style={{
        width,
        minWidth: width,
        backgroundColor: '#111118',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        transition: 'width 200ms ease',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 pt-2 flex-1">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            // React Router sets aria-current="page" on the active link;
            // we use the className callback to apply active styles.
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3.5 py-2.5 mx-1.5 rounded-md text-sm font-medium transition-colors duration-150 cursor-pointer',
                isActive
                  ? 'bg-accent text-white'           // active: electric blue fill
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5', // inactive
              ].join(' ')
            }
            // Exact match for the root route so Dashboard isn't always active
            end={to === '/'}
            onClick={() => onNavigate(label)}
            style={{ textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden' }}
          >
            <span className="shrink-0"><Icon /></span>
            {/* Label only visible when expanded; opacity handles the fade */}
            <span
              style={{
                opacity: expanded ? 1 : 0,
                transition: 'opacity 150ms ease',
                fontSize: 13,
              }}
            >
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Expand / collapse toggle at the bottom */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center justify-center gap-2 mx-1.5 mb-3 px-3 py-2 rounded-md text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors duration-150 cursor-pointer"
        style={{ border: 'none', background: 'none', whiteSpace: 'nowrap', overflow: 'hidden' }}
        title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <IconChevron expanded={expanded} />
        {expanded && <span style={{ fontSize: 12 }}>Collapse</span>}
      </button>
    </aside>
  )
}
