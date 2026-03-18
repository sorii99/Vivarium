import { createContext, useContext, useState, useEffect } from 'react'
import {
  isSupabaseEnabled, supabase,
  authSignIn, authSignUp, authSignOut,
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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseEnabled) {
      setUser(loadFallbackSession())
      setAuthLoading(false)
      return
    }

    let mounted = true

    async function restoreSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return

        if (session?.user) {
          const profile = await getProfile(session.user.id)
          if (!mounted) return
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: profile?.name || session.user.user_metadata?.name || session.user.email.split('@')[0],
            role: profile?.role || 'retail',
          })
        }
      } catch (e) {
        console.warn('[Auth] restoreSession error:', e)
      } finally {
        if (mounted) setAuthLoading(false)
      }
    }

    restoreSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
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
    if (result.user?.id) await upsertProfile(result.user.id, { name, role: 'retail' })
    const needsConfirmation = !result.user?.email_confirmed_at && !result.user?.confirmed_at
    return { ok: true, needsConfirmation }
  }

  const loginAdmin = async (email, password) => {
    if (!isSupabaseEnabled) {
      if (email.trim() === FALLBACK_EMAIL && password === FALLBACK_PASSWORD) {
        setUser({ id: 'admin-fallback', email, name: 'Administrador', role: 'admin' })
        return { ok: true }
      }
      return { ok: false, error: 'Credenciales incorrectas' }
    }

    const result = await authSignIn(email, password)
    if (!result.ok) return { ok: false, error: result.error }

    let profile = await getProfile(result.user.id)
    if (!profile) {
      await new Promise(r => setTimeout(r, 800))
      profile = await getProfile(result.user.id)
    }

    if ((profile?.role || 'retail') !== 'admin') {
      await authSignOut()
      return { ok: false, error: 'Tu cuenta no tiene permisos de administrador' }
    }

    setUser({
      id: result.user.id,
      email: result.user.email,
      name: profile.name || result.user.user_metadata?.name || result.user.email.split('@')[0],
      role: 'admin',
    })
    return { ok: true }
  }

  const logout = async () => {
    setUser(null)
    if (isSupabaseEnabled) await authSignOut()
  }

  const isWholesale = user?.role === 'wholesale'
  const isAdmin = user?.role === 'admin'
  const isLoggedIn = !!user

  return (
    <AuthContext.Provider value={{
      user, authLoading, isAdmin, isWholesale, isLoggedIn,
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
