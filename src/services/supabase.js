import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = (url && key)
  ? createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
  : null
export const isSupabaseEnabled = !!supabase

function toRow(p) {
  return {
    id: p.id,
    slug: p.slug || p.id,
    name: p.name,
    category: p.category,
    description: p.description || '',
    tags: p.tags || [],
    price_retail: Number(p.priceRetail) || 0,
    price_wholesale: Number(p.priceWholesale) || 0,
    min_wholesale_qty: Number(p.minWholesaleQty) || 1,
    stock: Number(p.stock) || 0,
    unit: p.unit || 'planta',
    images: p.images || [],
    featured: p.featured || false,
  }
}

export function fromRow(r) {
  return {
    id: r.id,
    slug: r.slug || r.id,
    name: r.name,
    category: r.category,
    description: r.description || '',
    tags: r.tags || [],
    priceRetail: r.price_retail,
    priceWholesale: r.price_wholesale,
    minWholesaleQty: r.min_wholesale_qty,
    stock: r.stock,
    unit: r.unit,
    images: r.images || [],
    featured: r.featured || false,
  }
}

export async function authSignUp(email, password, name) {
  if (!supabase) return { ok: false, error: 'Supabase no configurado' }
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { name } },
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true, user: data.user }
}

export async function authSignIn(email, password) {
  if (!supabase) return { ok: false, error: 'Supabase no configurado' }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { ok: false, error: error.message }
  return { ok: true, session: data.session, user: data.user }
}

export async function authSignOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function getProfile(userId) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('role, name')
    .eq('id', userId)
    .maybeSingle()
  if (error) {
    console.warn('getProfile error:', error.message)
    return null
  }
  return data
}

export async function upsertProfile(userId, fields) {
  if (!supabase) return false
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...fields, updated_at: new Date().toISOString() })
  return !error
}

export async function dbLoadAll() {
  if (!supabase) return null
  const { data, error } = await supabase.from('products').select('*').order('created_at')
  if (error) { console.error('Supabase load error:', error); return null }
  return data.map(fromRow)
}

export async function dbInsert(product) {
  if (!supabase) return false
  const { error } = await supabase.from('products').insert(toRow(product))
  if (error) { console.error('Supabase insert error:', error); return false }
  return true
}

export async function dbUpdate(id, changes) {
  if (!supabase) return false
  const row = toRow({ id, ...changes })
  const { error } = await supabase
    .from('products')
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) { console.error('Supabase update error:', error); return false }
  return true
}

export async function dbDelete(id) {
  if (!supabase) return false
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) { console.error('Supabase delete error:', error); return false }
  return true
}

export async function dbDeleteAll() {
  if (!supabase) return false
  const { error } = await supabase.from('products').delete().neq('id', '')
  if (error) { console.error('Supabase deleteAll error:', error); return false }
  return true
}

export async function dbLoadBanners() {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('position')
  if (error) { console.error('Banners load error:', error); return null }
  return data
}

export async function dbInsertBanner(banner) {
  if (!supabase) return false
  const { error } = await supabase.from('banners').insert(banner)
  if (error) { console.error('Banner insert error:', error); return false }
  return true
}

export async function dbUpdateBanner(id, changes) {
  if (!supabase) return false
  const { error } = await supabase
    .from('banners')
    .update({ ...changes, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) { console.error('Banner update error:', error); return false }
  return true
}

export async function dbDeleteBanner(id) {
  if (!supabase) return false
  const { error } = await supabase.from('banners').delete().eq('id', id)
  if (error) { console.error('Banner delete error:', error); return false }
  return true
}
