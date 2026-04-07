/**
 * settingsStore — API keys and app appearance settings.
 * No persistence yet — electron-store wiring is Day 9.
 */

import { create } from 'zustand'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Appearance {
  theme: 'dark'
}

interface SettingsStore {
  apiKeys: Record<string, string>
  appearance: Appearance
  setApiKey: (service: string, key: string) => void
  getApiKey: (service: string) => string
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  apiKeys: {},
  appearance: { theme: 'dark' },

  setApiKey: (service, key) =>
    set((s) => ({ apiKeys: { ...s.apiKeys, [service]: key } })),

  // Returns empty string if key hasn't been set yet.
  getApiKey: (service) =>
    get().apiKeys[service] ?? '',
}))
