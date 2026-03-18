import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { isSupabaseEnabled } from '@/services/supabase'

const clsx = (...c) => c.flat().filter(Boolean).join(' ')

const EyeOpen = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const EyeOff = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
)

const inputClass = `w-full bg-botanica-800 border border-botanica-600 rounded-xl px-4 py-3
  text-white placeholder:text-botanica-600 text-sm
  focus:outline-none focus:ring-2 focus:ring-botanica-400 focus:border-transparent
  transition-all`

const labelClass = "block text-botanica-300 text-xs font-body font-medium mb-1.5 uppercase tracking-wider"

const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

const ErrorBox = ({ message, attempts }) => (
  <div className="flex items-center gap-2 bg-red-950/60 border border-red-800/50 rounded-xl px-4 py-3">
    <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
    <span className="text-red-300 text-sm">{message}</span>
    {attempts > 1 && <span className="text-red-500 text-xs ml-auto">{attempts}/5</span>}
  </div>
)

export default function AdminLogin() {
  const { loginAdmin, register, isAdmin, authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/admin'

  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    if (!authLoading && isAdmin) navigate(from, { replace: true })
  }, [isAdmin, authLoading])

  const switchTab = (t) => {
    setTab(t)
    setError('')
    setSuccess('')
  }

  const blocked = attempts >= 5

  const handleLogin = async (e) => {
    e.preventDefault()
    if (blocked) return
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const result = await loginAdmin(email, password)
    setLoading(false)
    if (result.ok) {
      navigate(from, { replace: true })
    } else {
      setAttempts(a => a + 1)
      setError(result.error)
      setPassword('')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) return setError('El nombre es obligatorio')
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres')
    if (password !== confirmPassword) return setError('Las contraseñas no coinciden')
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const result = await register(email, password, name)
    setLoading(false)
    if (!result.ok) return setError(result.error)
    setSuccess(
      result.needsConfirmation
        ? 'Registro exitoso. Revisá tu email para confirmar la cuenta. Un administrador deberá asignarte el rol admin.'
        : 'Cuenta creada. Un administrador debe asignarte el rol admin antes de que puedas acceder al panel.'
    )
    setEmail(''); setPassword(''); setConfirmPassword(''); setName('')
  }

  return (
    <div className="min-h-screen bg-botanica-950 flex items-center justify-center px-4 relative overflow-hidden">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-botanica-800 rounded-full opacity-20 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-botanica-700 rounded-full opacity-15 blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative w-full max-w-sm">

        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-5 opacity-70 hover:opacity-100 transition-opacity">
            <span className="text-xl">🌿</span>
            <span className="font-display text-lg text-botanica-200">Alta Planta</span>
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl text-white mb-1">Iniciar Sesión</h1>
        </div>

        <div className="bg-botanica-900 border border-botanica-700/50 rounded-2xl shadow-2xl overflow-hidden">

          {isSupabaseEnabled && (
            <div className="flex border-b border-botanica-800">
              {[{ id: 'login', label: 'Ingresar' }, { id: 'register', label: 'Registrarse' }].map(t => (
                <button key={t.id} type="button" onClick={() => switchTab(t.id)}
                  className={clsx(
                    'flex-1 py-3 text-sm font-body font-medium transition-colors',
                    tab === t.id
                      ? 'text-white border-b-2 border-botanica-400 bg-botanica-800/40'
                      : 'text-botanica-500 hover:text-botanica-300'
                  )}>
                  {t.label}
                </button>
              ))}
            </div>
          )}

          <div className="p-5 sm:p-8">

            {success && (
              <div className="mb-5 flex items-start gap-2.5 bg-green-950/60 border border-green-800/50 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-green-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-300 text-sm">{success}</p>
              </div>
            )}

            {blocked && tab === 'login' ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">🔒</div>
                <p className="text-white font-display text-lg mb-2">Cuenta bloqueada</p>
                <p className="text-botanica-400 text-sm mb-4">Demasiados intentos fallidos.</p>
                <button type="button" onClick={() => setAttempts(0)}
                  className="btn-outline border-botanica-600 text-botanica-300 text-sm">
                  Reintentar
                </button>
              </div>

            ) : tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4" noValidate>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ejemplo@email.com"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={`${inputClass} pr-10`}
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-botanica-500 hover:text-botanica-300 transition-colors p-1">
                      {showPass ? <EyeOff /> : <EyeOpen />}
                    </button>
                  </div>
                </div>

                {error && <ErrorBox message={error} attempts={attempts} />}

                <button type="submit" disabled={loading || !email || !password}
                  className="w-full bg-botanica-600 hover:bg-botanica-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-body font-medium py-3 rounded-xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  {loading ? <><Spinner />Verificando…</> : 'Ingresar'}
                </button>
              </form>

            ) : (
              <form onSubmit={handleRegister} className="space-y-4" noValidate>
                <div>
                  <label className={labelClass}>Nombre</label>
                  <input
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Tu nombre"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      className={`${inputClass} pr-10`}
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-botanica-500 hover:text-botanica-300 transition-colors p-1">
                      {showPass ? <EyeOff /> : <EyeOpen />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Confirmar contraseña</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repetir contraseña"
                      required
                      className={`${inputClass} pr-10`}
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-botanica-500 hover:text-botanica-300 transition-colors p-1">
                      {showPass ? <EyeOff /> : <EyeOpen />}
                    </button>
                  </div>
                </div>

                {error && <ErrorBox message={error} />}

                <div className="bg-botanica-800/50 border border-botanica-700/50 rounded-xl px-4 py-3">
                  <p className="text-botanica-400 text-xs leading-relaxed">
                    <span className="text-botanica-300 font-medium">ℹ️ Permisos:</span>{' '}
                    Las cuentas nuevas tienen el rol <span className="font-mono text-botanica-300">retail</span>.
                    Para acceder al panel, un administrador debe asignarte el rol de <span className="font-mono text-botanica-300">admin</span>.
                  </p>
                </div>

                <button type="submit" disabled={loading || !email || !password || !name}
                  className="w-full bg-botanica-600 hover:bg-botanica-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-body font-medium py-3 rounded-xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  {loading ? <><Spinner />Registrando…</> : 'Crear cuenta'}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center mt-5 text-botanica-600 text-sm">
          <Link to="/" className="hover:text-botanica-400 transition-colors">← Volver</Link>
        </p>
      </div>
    </div>
  )
}
