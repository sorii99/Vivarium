const SETTINGS_KEY = 'botanica_settings'

const DEFAULTS = {
  mpEnabled: true,
}

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
  } catch { return { ...DEFAULTS } }
}

export function saveSettings(settings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)) } catch { }
}

export function getSetting(key) {
  return getSettings()[key]
}

export function setSetting(key, value) {
  const current = getSettings()
  saveSettings({ ...current, [key]: value })
}
