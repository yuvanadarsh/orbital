/**
 * Settings — screen 7.
 * API keys (masked + visibility toggle), model defaults, appearance, working directory, about.
 * Keys stored via electron-store — inputs are wired for future IPC integration.
 */

import React, { useState } from 'react'
import {
  KeyRound,
  Eye,
  EyeOff,
  Trash2,
  PlusCircle,
  Lock,
  Moon,
  Sun,
  FolderOpen,
  Info,
  ChevronRight,
  Sliders,
  Check,
} from 'lucide-react'

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ backgroundColor: '#16161f', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {title}
        </span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider(): React.JSX.Element {
  return <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)', margin: '16px 0' }} />
}

// ─── API key row ──────────────────────────────────────────────────────────────

interface ApiKeyRowProps {
  provider: string
  connected: boolean
  usedBy?: string
  maskedValue?: string
}

function ApiKeyRow({ provider, connected, usedBy, maskedValue }: ApiKeyRowProps): React.JSX.Element {
  const [visible, setVisible] = useState(false)
  const [inputVal, setInputVal] = useState('')

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{provider}</span>
          {connected ? (
            <span
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded"
              style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e' }}
            >
              <span
                className="rounded-full inline-block"
                style={{ width: 5, height: 5, backgroundColor: '#22c55e' }}
              />
              Connected
            </span>
          ) : (
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}
            >
              Not configured
            </span>
          )}
        </div>
        {connected && (
          <button
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md"
            style={{
              backgroundColor: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.15)',
              color: '#ef4444',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={10} />
            Remove
          </button>
        )}
      </div>

      {/* Key input */}
      <div
        className="flex items-center gap-2 rounded-md px-3"
        style={{
          backgroundColor: '#13131a',
          border: '1px solid rgba(255,255,255,0.07)',
          height: 36,
        }}
      >
        <KeyRound size={12} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
        <input
          type={visible ? 'text' : 'password'}
          value={connected ? (maskedValue ?? '') : inputVal}
          onChange={(e) => !connected && setInputVal(e.target.value)}
          placeholder={connected ? undefined : 'Paste API key...'}
          readOnly={connected}
          className="flex-1 bg-transparent text-xs outline-none"
          style={{
            color: connected ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.7)',
            fontFamily: 'JetBrains Mono, monospace',
            caretColor: '#2563eb',
          }}
        />
        <button
          onClick={() => setVisible((v) => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', padding: 2 }}
        >
          {visible ? <EyeOff size={12} /> : <Eye size={12} />}
        </button>
        {!connected && (
          <button
            className="text-xs px-2.5 py-1 rounded font-medium text-white shrink-0"
            style={{ backgroundColor: '#2563eb', border: 'none', cursor: 'pointer' }}
          >
            Save Key
          </button>
        )}
      </div>

      {/* Used by */}
      {usedBy && (
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Used by: <span style={{ color: 'rgba(255,255,255,0.4)' }}>{usedBy}</span>
        </p>
      )}
    </div>
  )
}

// ─── Model select row ─────────────────────────────────────────────────────────

function ModelRow({ label, options, defaultVal }: { label: string; options: string[]; defaultVal: string }): React.JSX.Element {
  const [value, setValue] = useState(defaultVal)
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="text-xs pl-3 pr-7 py-1.5 rounded-md appearance-none"
          style={{
            backgroundColor: '#13131a',
            border: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            outline: 'none',
            minWidth: 180,
          }}
        >
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
        <ChevronRight
          size={10}
          className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none rotate-90"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        />
      </div>
    </div>
  )
}

// ─── Toggle row ───────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description?: string
  value: boolean
  onChange: (v: boolean) => void
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-white">{label}</p>
        {description && (
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="rounded-full transition-colors"
        style={{
          width: 36,
          height: 20,
          backgroundColor: value ? '#2563eb' : 'rgba(255,255,255,0.1)',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <span
          className="absolute top-0.5 rounded-full transition-all"
          style={{
            width: 16,
            height: 16,
            backgroundColor: 'white',
            left: value ? 18 : 2,
          }}
        />
      </button>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Settings(): React.JSX.Element {
  const [theme, setTheme]           = useState<'dark' | 'light'>('dark')
  const [fontSize, setFontSize]     = useState(14)
  const [autoSave, setAutoSave]     = useState(true)
  const [telemetry, setTelemetry]   = useState(false)
  const [workDir, setWorkDir]       = useState('/Users/user/projects')
  const [savedWorkDir, setSavedWorkDir] = useState(false)

  const fontSizes = [12, 14, 16, 18]

  return (
    <div className="p-6 space-y-4" style={{ maxWidth: 680 }}>

      {/* Header */}
      <div>
        <h1 className="text-base font-semibold text-white">Settings</h1>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
          API keys, model defaults, and appearance
        </p>
      </div>

      {/* ── API Keys ── */}
      <Section title="API Keys" icon={<KeyRound size={13} />}>
        <div className="space-y-5">
          <ApiKeyRow
            provider="Anthropic (Claude)"
            connected={true}
            maskedValue="sk-ant-api03-••••••••••••••••••••••••••••"
            usedBy="Auth System, Database Schema"
          />
          <Divider />
          <ApiKeyRow
            provider="Google (Gemini)"
            connected={true}
            maskedValue="AIzaSy••••••••••••••••••••••••"
            usedBy="Frontend UI"
          />
          <Divider />
          <ApiKeyRow
            provider="OpenAI (Codex)"
            connected={false}
          />
          <Divider />
          <button
            className="flex items-center gap-2 text-xs"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', padding: 0 }}
          >
            <PlusCircle size={13} />
            Add Custom API Endpoint
          </button>
        </div>

        {/* Security notice */}
        <div
          className="mt-4 flex items-start gap-2 rounded-md px-3 py-2.5"
          style={{ backgroundColor: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)' }}
        >
          <Lock size={12} style={{ color: 'rgba(37,99,235,0.6)', marginTop: 1, flexShrink: 0 }} />
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            API keys are stored locally on your machine and never sent to Orbital servers.
          </p>
        </div>
      </Section>

      {/* ── Model Defaults ── */}
      <Section title="Model Defaults" icon={<Sliders size={13} />}>
        <div className="space-y-4">
          <ModelRow
            label="Default Claude Model"
            options={['claude-sonnet-4-5', 'claude-opus-3', 'claude-haiku-3']}
            defaultVal="claude-sonnet-4-5"
          />
          <ModelRow
            label="Default Gemini Model"
            options={['gemini-2.5-pro', 'gemini-flash-1.5']}
            defaultVal="gemini-2.5-pro"
          />
          <ModelRow
            label="Default OpenAI Model"
            options={['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo']}
            defaultVal="gpt-4o"
          />
        </div>
        <button
          className="flex items-center gap-1 text-xs mt-4"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', padding: 0 }}
        >
          See all model settings
          <ChevronRight size={11} />
        </button>
      </Section>

      {/* ── Appearance ── */}
      <Section title="Appearance" icon={<Sun size={13} />}>
        {/* Theme toggle */}
        <div className="mb-4">
          <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Interface Theme</p>
          <div className="flex gap-2">
            {(['dark', 'light'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium"
                style={{
                  backgroundColor: theme === t ? 'rgba(37,99,235,0.15)' : '#13131a',
                  border: `1px solid ${theme === t ? '#2563eb' : 'rgba(255,255,255,0.07)'}`,
                  color: theme === t ? 'white' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                }}
              >
                {t === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
                {t === 'dark' ? 'Dark' : 'Light'}
                {theme === t && <Check size={10} style={{ color: '#2563eb' }} />}
              </button>
            ))}
          </div>
        </div>

        <Divider />

        {/* Font size */}
        <div>
          <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>System Font Size</p>
          <div className="flex gap-2">
            {fontSizes.map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className="px-3 py-1.5 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: fontSize === size ? 'rgba(37,99,235,0.15)' : '#13131a',
                  border: `1px solid ${fontSize === size ? '#2563eb' : 'rgba(255,255,255,0.07)'}`,
                  color: fontSize === size ? 'white' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                }}
              >
                {size}px
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Working Directory ── */}
      <Section title="Working Directory" icon={<FolderOpen size={13} />}>
        <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Default directory agents use as their working root.
        </p>
        <div className="flex items-center gap-2">
          <div
            className="flex-1 flex items-center gap-2 rounded-md px-3"
            style={{
              backgroundColor: '#13131a',
              border: '1px solid rgba(255,255,255,0.07)',
              height: 36,
            }}
          >
            <FolderOpen size={12} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
            <input
              type="text"
              value={workDir}
              onChange={(e) => { setWorkDir(e.target.value); setSavedWorkDir(false) }}
              className="flex-1 bg-transparent text-xs outline-none"
              style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono, monospace', caretColor: '#2563eb' }}
            />
          </div>
          <button
            onClick={() => setSavedWorkDir(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-md font-medium"
            style={{
              backgroundColor: savedWorkDir ? 'rgba(34,197,94,0.1)' : '#2563eb',
              border: savedWorkDir ? '1px solid rgba(34,197,94,0.3)' : 'none',
              color: savedWorkDir ? '#22c55e' : 'white',
              cursor: 'pointer',
            }}
          >
            {savedWorkDir ? <><Check size={11} /> Saved</> : 'Save'}
          </button>
        </div>

        <Divider />

        <ToggleRow
          label="Auto-save agent outputs"
          description="Write terminal output to disk after each session"
          value={autoSave}
          onChange={setAutoSave}
        />
      </Section>

      {/* ── Agent Defaults ── */}
      <Section title="Agent Defaults" icon={<Sliders size={13} />}>
        <div className="space-y-4">
          <ToggleRow
            label="Require permission for file writes"
            description="Agents must ask before modifying any file"
            value={true}
            onChange={() => {}}
          />
          <Divider />
          <ToggleRow
            label="Require permission for shell commands"
            description="Agents must ask before running any terminal command"
            value={true}
            onChange={() => {}}
          />
          <Divider />
          <ToggleRow
            label="Send anonymous usage telemetry"
            description="Helps improve Orbital — no code or keys are sent"
            value={telemetry}
            onChange={setTelemetry}
          />
        </div>
      </Section>

      {/* ── About ── */}
      <Section title="About" icon={<Info size={13} />}>
        <div className="space-y-2">
          {[
            ['Version',   'v1.0.4-stable'],
            ['Runtime',   'Electron + React + Vite'],
            ['Platform',  'macOS (darwin)'],
            ['Node',      'v22.0.0'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
              <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'JetBrains Mono, monospace' }}>{value}</span>
            </div>
          ))}
        </div>
        <Divider />
        <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Orbital v1.0.4-stable · Built with Electron + React · Open source on GitHub
        </p>
      </Section>

    </div>
  )
}
