import { createContext, useContext, useState, useEffect, useRef } from 'react'
import {
  isSupabaseEnabled, supabase,
  authSignIn, authSignUp, authSignOut, authGetSession,
  getProfile, upsertProfile,
} from '@/services/supabase'

const AuthContext = createContext(null)

const FALLBACK_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@botanica.com'
const FALLBACK_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'botanica2024'
const SESSION_KEY = 'botanica_session'

function loadFallbackSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

async function fetchProfileWithRetry(userId, retries = 3, delayMs = 600) {
  for (let i = 0; i < retries; i++) {
    const profile = await getProfile(userId)
    if (profile) return profile
    if (i < retries - 1) await new Promise(r => setTimeout(r, delayMs))
  }
  return null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const suppressListener = useRef(false)

  useEffect(() => {
    if (!isSupabaseEnabled) {
      setUser(loadFallbackSession())
      setAuthLoading(false)
      return
    }

    authGetSession().then(async (session) => {
      if (session?.user) {
        const profile = await fetchProfileWithRetry(session.user.id)
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: profile?.name || session.user.user_metadata?.name || session.user.email.split('@')[0],
          role: profile?.role || 'retail',
        })
      }
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (suppressListener.current) return
      if (session?.user) {
        const profile = await fetchProfileWithRetry(session.user.id)
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: profile?.name || session.user.user_metadata?.name || session.user.email.split('@')[0],
          role: profile?.role || 'retail',
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (isSupabaseEnabled) return
    if (user) sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
    else sessionStorage.removeItem(SESSION_KEY)
  }, [user])

  const register = async (email, password, name) => {
    if (!isSupabaseEnabled) return { ok: false, error: 'Supabase no está configurado' }

    const result = await authSignUp(email, password, name)
    if (!result.ok) return result

    if (result.user?.id) {
      await upsertProfile(result.user.id, { name, role: 'retail' })
    }

    const needsConfirmation = !result.user?.email_confirmed_at && !result.user?.confirmed_at
    return { ok: true, needsConfirmation }
  }

  const loginAdmin = async (email, password) => {
    if (!isSupabaseEnabled) {
      if (email.trim() === FALLBACK_EMAIL && password === FALLBACK_PASSWORD) {
        const u = { id: 'admin-fallback', email, name: 'Administrador', role: 'admin' }
        setUser(u)
        return { ok: true }
      }
      return { ok: false, error: 'Credenciales incorrectas' }
    }

    suppressListener.current = true

    try {
      const result = await authSignIn(email, password)
      if (!result.ok) return { ok: false, error: result.error }

      const profile = await fetchProfileWithRetry(result.user.id)
      const role = profile?.role || 'retail'

      if (role !== 'admin') {
        await authSignOut()
        setUser(null)
        return { ok: false, error: 'Tu cuenta no tiene permisos de administrador' }
      }

      setUser({
        id: result.user.id,
        email: result.user.email,
        name: profile?.name || result.user.user_metadata?.name || result.user.email.split('@')[0],
        role: 'admin',
      })
      return { ok: true }

    } finally {
      setTimeout(() => { suppressListener.current = false }, 500)
    }
  }

  const logout = async () => {
    if (isSupabaseEnabled) await authSignOut()
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'
  const isLoggedIn = !!user

  return (
    <AuthContext.Provider value={{
      user, authLoading, isAdmin, isLoggedIn,
      register, loginAdmin, logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
