/**
 * Sidebar — collapsible vertical nav rail.
 *
 * Collapsed (default): 52px wide — icons only, centered.
 * Expanded:           220px wide — icons + labels.
 *
 * expanded state is owned by Layout so it persists across page changes.
 * Active item: 2px left accent border + blue tint background.
 * Inactive item: muted text, hover brightens slightly.
 */

import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Bot,
  GitBranch,
  Network,
  FolderOpen,
  Terminal,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

// ─── Nav items ────────────────────────────────────────────────────────────────

const MAIN_NAV = [
  { to: '/',          label: 'Dashboard',    icon: LayoutDashboard, end: true  },
  { to: '/agents',    label: 'Agents',       icon: Bot,             end: false },
  { to: '/workflows', label: 'Workflows',    icon: GitBranch,       end: false },
  { to: '/mcp',       label: 'MCP',          icon: Network,         end: false },
  { to: '/files',     label: 'Project Files',icon: FolderOpen,      end: false },
  { to: '/logs',      label: 'Logs',         icon: Terminal,        end: false },
]

const BOTTOM_NAV = [
  { to: '/settings',  label: 'Settings',     icon: Settings,        end: false },
]

// ─── Single nav item ──────────────────────────────────────────────────────────

function NavItem({
  to,
  label,
  icon: Icon,
  end,
  expanded,
  onNavigate,
}: {
  to: string
  label: string
  icon: React.ElementType
  end: boolean
  expanded: boolean
  onNavigate: (label: string) => void
}): React.JSX.Element {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={() => onNavigate(label)}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: expanded ? 10 : 0,
        justifyContent: expanded ? 'flex-start' : 'center',
        height: 38,
        paddingLeft: expanded ? 14 : 0,
        paddingRight: expanded ? 12 : 0,
        width: '100%',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'background-color 150ms ease, color 150ms ease',
        // Left border indicator via box-shadow (doesn't affect layout)
        boxShadow: isActive ? 'inset 2px 0 0 0 #2563eb' : 'inset 2px 0 0 0 transparent',
        backgroundColor: isActive ? 'rgba(37,99,235,0.1)' : 'transparent',
        color: isActive ? '#ffffff' : 'rgba(255,255,255,0.4)',
      })}
      className="sidebar-nav-item"
    >
      {({ isActive }) => (
        <>
          <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', color: isActive ? '#2563eb' : 'inherit' }}>
            <Icon size={17} strokeWidth={1.75} />
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: isActive ? 500 : 400,
              opacity: expanded ? 1 : 0,
              // Width collapses so no text layout shift
              maxWidth: expanded ? 160 : 0,
              transition: 'opacity 150ms ease, max-width 200ms ease',
              overflow: 'hidden',
            }}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SidebarProps {
  expanded: boolean
  onToggle: () => void
  onNavigate: (label: string) => void
}

export default function Sidebar({ expanded, onToggle, onNavigate }: SidebarProps): React.JSX.Element {
  return (
    <>
      {/* Hover brightening for inactive items — injected once */}
      <style>{`
        .sidebar-nav-item:hover {
          background-color: rgba(255,255,255,0.04) !important;
          color: rgba(255,255,255,0.75) !important;
        }
      `}</style>

      <aside
        style={{
          width: expanded ? 220 : 52,
          minWidth: expanded ? 220 : 52,
          backgroundColor: '#111118',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          transition: 'width 220ms cubic-bezier(0.4,0,0.2,1), min-width 220ms cubic-bezier(0.4,0,0.2,1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Main nav */}
        <nav
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            paddingTop: 8,
            gap: 1,
          }}
        >
          {MAIN_NAV.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              expanded={expanded}
              onNavigate={onNavigate}
            />
          ))}
        </nav>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

        {/* Bottom nav (Settings) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, paddingBottom: 4 }}>
          {BOTTOM_NAV.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              expanded={expanded}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        {/* Expand / collapse toggle */}
        <button
          onClick={onToggle}
          title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: expanded ? 'flex-start' : 'center',
            gap: 8,
            height: 36,
            paddingLeft: expanded ? 16 : 0,
            paddingRight: expanded ? 12 : 0,
            width: '100%',
            border: 'none',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            backgroundColor: 'transparent',
            color: 'rgba(255,255,255,0.25)',
            cursor: 'pointer',
            transition: 'color 150ms ease, background-color 150ms ease',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.25)'
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          {expanded ? <ChevronLeft size={14} strokeWidth={2} /> : <ChevronRight size={14} strokeWidth={2} />}
          <span
            style={{
              fontSize: 11,
              opacity: expanded ? 1 : 0,
              maxWidth: expanded ? 100 : 0,
              transition: 'opacity 150ms ease, max-width 200ms ease',
              overflow: 'hidden',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Collapse
          </span>
        </button>
      </aside>
    </>
  )
}
