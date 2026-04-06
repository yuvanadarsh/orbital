/**
 * ProjectFiles — screen 5.
 * Will show: a read-only file tree on the left and a diff viewer on the right,
 * displaying changes agents are making in real time.
 *
 * For now: static shell with a two-column layout.
 */

export default function ProjectFiles(): React.JSX.Element {
  return (
    <div className="flex h-full">
      {/* File tree panel */}
      <aside
        className="flex flex-col shrink-0"
        style={{
          width: 240,
          backgroundColor: '#13131a',
          borderRight: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div
          className="px-4 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider">Files</p>
        </div>
        <div className="flex-1 p-3">
          <p className="text-xs text-white/20 italic">No project open</p>
        </div>
      </aside>

      {/* Diff viewer panel */}
      <main className="flex-1 flex flex-col" style={{ backgroundColor: '#0d0d0f' }}>
        <div
          className="px-4 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider">Diff Viewer</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-white/20 italic">Select a file to view diff</p>
        </div>
      </main>
    </div>
  )
}
