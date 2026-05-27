import { useState } from 'react'

const SETTINGS_KEY = 'fittrack-settings'
const DEFAULTS = {
  countdownSeconds: 3,
  restTimerEnabled: true,
  restSeconds: 90,
}

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY)
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS
    } catch {
      return DEFAULTS
    }
  })

  const updateSettings = (updates) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates }
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
      return next
    })
  }

  return { settings, updateSettings }
}
