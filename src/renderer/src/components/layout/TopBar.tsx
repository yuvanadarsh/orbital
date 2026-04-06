/**
 * TopBar — fixed 44px header across the top of the app.
 * Shows the Orbital wordmark on the left and the current page title on the right.
 * Receives the active page label as a prop so it stays in sync with the sidebar.
 */

interface TopBarProps {
  pageTitle: string
}

export default function TopBar({ pageTitle }: TopBarProps): React.JSX.Element {
  return (
    <header
      className="flex items-center justify-between px-4 shrink-0"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style={{
        height: 44,
        backgroundColor: '#111118',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        // Allow the Electron window to be dragged by clicking the top bar
        WebkitAppRegion: 'drag',
      } as React.CSSProperties}
    >
      {/* Wordmark */}
      <span className="text-sm font-semibold tracking-widest uppercase text-white/80">
        Orbital
      </span>

      {/* Current page label */}
      <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
        {pageTitle}
      </span>
    </header>
  )
}
