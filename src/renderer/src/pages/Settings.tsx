/**
 * Settings — screen 7.
 * Will show: API key inputs (masked), model defaults per agent type,
 * and appearance toggles.
 * Keys are stored via electron-store, never in env files.
 *
 * For now: static shell with section placeholders.
 */

function SettingSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div
      className="rounded-lg p-5"
      style={{ backgroundColor: '#16161f', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-4">{title}</p>
      {children}
    </div>
  )
}

function MaskedInput({ label, placeholder }: { label: string; placeholder: string }): React.JSX.Element {
  return (
    <div className="mb-3">
      <label className="block text-xs text-white/50 mb-1">{label}</label>
      <input
        type="password"
        placeholder={placeholder}
        className="w-full rounded px-3 py-2 text-sm text-white/60 font-mono outline-none"
        style={{
          backgroundColor: '#13131a',
          border: '1px solid rgba(255,255,255,0.07)',
          caretColor: '#2563eb',
        }}
        readOnly  // read-only until real electron-store wiring is added
      />
    </div>
  )
}

export default function Settings(): React.JSX.Element {
  return (
    <div className="p-6 space-y-4 max-w-2xl">
      {/* Page header */}
      <div>
        <h1 className="text-base font-semibold text-white">Settings</h1>
        <p className="text-xs text-white/40 mt-0.5">API keys, model defaults, and appearance</p>
      </div>

      {/* API Keys */}
      <SettingSection title="API Keys">
        <MaskedInput label="Anthropic API Key" placeholder="sk-ant-••••••••••••" />
        <MaskedInput label="Google AI API Key"  placeholder="AIza••••••••••••••" />
        <MaskedInput label="OpenAI API Key"     placeholder="sk-••••••••••••••••" />
      </SettingSection>

      {/* Model defaults */}
      <SettingSection title="Model Defaults">
        <div className="space-y-3">
          {['Claude Code', 'Gemini CLI', 'Codex CLI'].map((agent) => (
            <div key={agent} className="flex items-center justify-between">
              <span className="text-sm text-white/60">{agent}</span>
              <select
                className="rounded px-2 py-1 text-xs text-white/50 outline-none"
                style={{
                  backgroundColor: '#13131a',
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: 'rgba(255,255,255,0.5)',
                }}
                defaultValue=""
              >
                <option value="" disabled>Select model</option>
                <option>claude-opus-4</option>
                <option>claude-sonnet-4</option>
                <option>gemini-2.0-pro</option>
                <option>gpt-4o</option>
              </select>
            </div>
          ))}
        </div>
      </SettingSection>

      {/* Appearance */}
      <SettingSection title="Appearance">
        <p className="text-xs text-white/20 italic">Appearance options — coming soon</p>
      </SettingSection>
    </div>
  )
}
