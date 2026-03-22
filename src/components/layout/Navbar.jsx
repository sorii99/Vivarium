import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useInventoryStore } from '@/context/InventoryContext'
import { useCart } from '@/context/CartContext'
const clsx = (...c) => c.flat().filter(Boolean).join(' ')

export default function Navbar() {
  const { user, isWholesale, isAdmin, isLoggedIn, authLoading, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const { syncMode } = useInventoryStore()
  const { totalItems, setOpen } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/productos', label: 'Catálogo' },
  ]

  const close = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 bg-botanica-50/90 dark:bg-botanica-950/90 backdrop-blur-md border-b border-botanica-200 dark:border-botanica-800 transition-colors duration-200">
      <nav className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">

        <Link to="/" onClick={close} className="flex items-center gap-1.5 shrink-0 min-w-0">
          <span className="text-xl sm:text-2xl">🌿</span>
          <span className="font-display text-base sm:text-xl font-semibold text-botanica-800 dark:text-botanica-200 truncate">
            Alta Planta
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to} end={to === '/'}
                className={({ isActive }) =>
                  clsx('btn-ghost text-sm', isActive && 'bg-botanica-100 dark:bg-botanica-800 text-botanica-800 dark:text-botanica-200 font-medium')
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1 sm:gap-2">

          {!authLoading && !user && (
            <>
              <Link to="/admin/login" className="hidden md:block btn-ghost text-xs py-1.5 px-3 text-botanica-400 hover:text-botanica-700 dark:hover:text-botanica-200">
                Iniciar sesión
              </Link>
              <button
                onClick={() => setOpen(true)}
                className="relative theme-toggle"
                aria-label="Carrito"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 bg-botanica-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none tabular-nums">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
              <button onClick={toggle} className="theme-toggle" aria-label="Cambiar tema">
                {dark ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                  </svg>
                )}
              </button>
            </>
          )}

          {!authLoading && user && !isAdmin && (
            <>
              <button
                onClick={() => setOpen(true)}
                className="relative theme-toggle"
                aria-label="Carrito"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 bg-botanica-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none tabular-nums">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
              <button onClick={toggle} className="theme-toggle" aria-label="Cambiar tema">
                {dark ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                  </svg>
                )}
              </button>
              <button
                onClick={logout}
                title="Cerrar sesión"
                className="hidden md:flex theme-toggle text-botanica-500 dark:text-botanica-400 hover:text-red-500 dark:hover:text-red-400"
                aria-label="Cerrar sesión"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </button>
            </>
          )}

          {!authLoading && isAdmin && (
            <>
              {isAdmin && (
                <span
                  title={syncMode === 'supabase' ? 'Sincronizado con Supabase' : 'Datos guardados localmente'}
                  className="hidden md:flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-full border transition-colors cursor-default"
                  style={{
                    borderColor: syncMode === 'supabase' ? 'rgb(74 163 90 / 0.4)' : 'rgb(107 114 128 / 0.3)',
                    color: syncMode === 'supabase' ? 'rgb(74 163 90)' : 'rgb(156 163 175)',
                    background: syncMode === 'supabase' ? 'rgb(74 163 90 / 0.08)' : 'transparent',
                  }}>
                  <span className={`w-1.5 h-1.5 rounded-full ${syncMode === 'supabase' ? 'bg-green-400' : 'bg-gray-400'}`} />
                  {syncMode === 'supabase' ? 'Nube' : 'Local'}
                </span>
              )}
              {isAdmin && (
                <Link to="/admin"
                  className="hidden md:inline badge-retail hover:bg-botanica-200 dark:hover:bg-botanica-700 transition-colors cursor-pointer whitespace-nowrap">
                  Administrar
                </Link>
              )}
              <button
                onClick={() => setOpen(true)}
                className="relative theme-toggle"
                aria-label="Carrito"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 bg-botanica-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none tabular-nums">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
              <button onClick={toggle} className="theme-toggle" aria-label="Cambiar tema">
                {dark ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                  </svg>
                )}
              </button>
              <button
                onClick={logout}
                title="Cerrar sesión"
                className="hidden md:flex theme-toggle text-botanica-500 dark:text-botanica-400 hover:text-red-500 dark:hover:text-red-400"
                aria-label="Cerrar sesión"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </button>
            </>
          )}

          {authLoading && (
            <>
              <button
                onClick={() => setOpen(true)}
                className="relative theme-toggle"
                aria-label="Carrito"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
              <button onClick={toggle} className="theme-toggle" aria-label="Cambiar tema">
                {dark ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                  </svg>
                )}
              </button>
            </>
          )}

          <button
            className="md:hidden btn-ghost p-2"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              }
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="md:hidden border-t border-botanica-200 dark:border-botanica-800 bg-botanica-50 dark:bg-botanica-950 px-3 py-3 flex flex-col gap-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to} to={to} end={to === '/'} onClick={close}
              className={({ isActive }) =>
                clsx('btn-ghost w-full text-left text-sm py-2.5',
                  isActive && 'bg-botanica-100 dark:bg-botanica-800 text-botanica-800 dark:text-botanica-200')
              }
            >
              {label}
            </NavLink>
          ))}
          <div className="border-t border-botanica-200 dark:border-botanica-800 mt-1 pt-2 flex flex-col gap-1">
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" onClick={close}
                    className="btn-ghost text-sm text-left py-2.5 text-botanica-700 dark:text-botanica-300">
                    Administrar
                  </Link>
                )}
                {isAdmin && (
                  <span className="flex items-center gap-2 px-4 py-2 text-xs font-mono"
                    style={{ color: syncMode === 'supabase' ? 'rgb(74 163 90)' : 'rgb(156 163 175)' }}>
                    <span className={`w-1.5 h-1.5 rounded-full ${syncMode === 'supabase' ? 'bg-green-400' : 'bg-gray-400'}`} />
                    {syncMode === 'supabase' ? 'Nube' : 'Local'}
                  </span>
                )}
                <button onClick={() => { logout(); close() }}
                  className="btn-ghost text-sm text-left py-2.5">Cerrar sesión</button>
              </>
            ) : (
              <Link to="/admin/login" onClick={close}
                className="btn-ghost text-sm text-left py-2.5 text-botanica-400">Iniciar sesión</Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
