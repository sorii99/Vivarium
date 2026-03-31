import { supabase, isSupabaseEnabled } from '@/services/supabase'

const LS_KEY = 'botanica_settings'
const DEFAULTS = { mpEnabled: true }

function lsGet(key) {
  try {
    const raw = localStorage.getItem(LS_KEY)
    const obj = raw ? JSON.parse(raw) : {}
    return key in obj ? obj[key] : DEFAULTS[key] ?? null
  } catch { return DEFAULTS[key] ?? null }
}

function lsSet(key, value) {
  try {
    const raw = localStorage.getItem(LS_KEY)
    const obj = raw ? JSON.parse(raw) : {}
    obj[key] = value
    localStorage.setItem(LS_KEY, JSON.stringify(obj))
  } catch { }
}

async function dbGet(key) {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .maybeSingle()
    if (error || !data) return null
    return JSON.parse(data.value)
  } catch { return null }
}

async function dbSet(key, value) {
  if (!supabase) return
  try {
    await supabase
      .from('settings')
      .upsert({ key, value: JSON.stringify(value) }, { onConflict: 'key' })
  } catch { }
}

export function getSetting(key) {
  return lsGet(key)
}

export async function getSettingRemote(key) {
  if (!isSupabaseEnabled) return lsGet(key)
  const remote = await dbGet(key)
  if (remote !== null) {
    lsSet(key, remote)
    return remote
  }
  return lsGet(key)
}

export async function setSetting(key, value) {
  lsSet(key, value)
  if (isSupabaseEnabled) await dbSet(key, value)
}
