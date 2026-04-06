/**
 * Workflows — screen 3.
 * Will show: a live read-only Mermaid.js node graph visualising
 * which agents are touching which files and in what order.
 *
 * For now: static shell with a canvas placeholder.
 */

export default function Workflows(): React.JSX.Element {
  return (
    <div className="p-6 h-full flex flex-col space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-base font-semibold text-white">Workflows</h1>
        <p className="text-xs text-white/40 mt-0.5">Live read-only diagram of agent activity</p>
      </div>

      {/* Diagram canvas placeholder */}
      <div
        className="flex-1 rounded-lg flex items-center justify-center"
        style={{
          backgroundColor: '#13131a',
          border: '1px solid rgba(255,255,255,0.07)',
          minHeight: 400,
        }}
      >
        <div className="text-center space-y-2">
          <p className="text-white/20 text-sm">Mermaid.js diagram canvas</p>
          <p className="text-white/15 text-xs">Nodes appear here as agents run tasks</p>
        </div>
      </div>
    </div>
  )
}
