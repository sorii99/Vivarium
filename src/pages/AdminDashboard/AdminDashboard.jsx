import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useInventoryStore } from '@/context/InventoryContext'
import { formatPrice } from '@/utils/format'
const clsx = (...c) => c.flat().filter(Boolean).join(' ')

function StatCard({ label, value, sub, accent = false }) {
  return (
    <div className={clsx(
      'rounded-xl sm:rounded-2xl p-4 sm:p-5',
      accent
        ? 'bg-botanica-600 text-white'
        : 'bg-white dark:bg-botanica-900 border border-botanica-100 dark:border-botanica-800'
    )}>
      <p className={clsx('text-[10px] sm:text-xs font-body uppercase tracking-wider mb-1',
        accent ? 'text-botanica-200' : 'text-botanica-500 dark:text-botanica-400')}>
        {label}
      </p>
      <p className={clsx('font-mono text-xl sm:text-2xl font-semibold',
        accent ? 'text-white' : 'text-botanica-900 dark:text-botanica-100')}>
        {value}
      </p>
      {sub && (
        <p className={clsx('text-[10px] sm:text-xs mt-1',
          accent ? 'text-botanica-300' : 'text-botanica-400 dark:text-botanica-500')}>
          {sub}
        </p>
      )}
    </div>
  )
}

function CategoryBar({ label, count, total, color, icon }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className="flex items-center gap-1.5 text-botanica-700 dark:text-botanica-300 font-body">
          <span>{icon}</span> {label}
        </span>
        <span className="font-mono text-botanica-900 dark:text-botanica-100 font-semibold">{count}</span>
      </div>
      <div className="h-2 bg-botanica-100 dark:bg-botanica-800 rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full transition-all duration-700', color)}
          style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] sm:text-xs text-botanica-400 dark:text-botanica-500 text-right">{pct}% del total</p>
    </div>
  )
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const { products, stats, resetToDefaults } = useInventoryStore()

  const sections = [
    { icon: '📦', title: 'Inventario', desc: 'Gestioná stock y precios', link: '/inventario', label: 'Ir al inventario', primary: true },
    { icon: '🛍️', title: 'Catálogo', desc: 'Revisár catalogo', link: '/productos', label: 'Ver catálogo', primary: false },
    { icon: '🏠', title: 'Inicio', desc: 'Volver al inicio', link: '/', label: 'Volver al inicio', primary: false },
  ]

  return (
    <div className="min-h-screen bg-botanica-50 dark:bg-botanica-950">

      {/* Topbar */}
      <header className="bg-botanica-950 dark:bg-black text-white px-3 sm:px-6 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="text-base sm:text-lg shrink-0">🌿</span>
          <span className="font-display text-sm sm:text-base text-botanica-200 hidden xs:block">Alta Planta</span>
          <span className="text-botanica-700 mx-0.5 hidden sm:block">›</span>
          <span className="text-xs sm:text-sm text-botanica-300 font-body truncate">Panel principal</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <span className="text-botanica-400 text-xs sm:text-sm hidden lg:block truncate max-w-[200px]">{user?.email}</span>
          <button onClick={logout}
            className="text-botanica-400 hover:text-white text-xs sm:text-sm transition-colors flex items-center gap-1 sm:gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">

        <div className="mb-6 sm:mb-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-4xl text-botanica-900 dark:text-botanica-50 mb-1 sm:mb-2">
              Hola, {user?.name} 👋
            </h1>
            <p className="text-botanica-500 dark:text-botanica-400 font-body text-sm">
              Resumen del vivero
            </p>
          </div>
          <button
            onClick={() => { if (window.confirm('¿Eliminar todos los productos y limpiar el inventario? Esta acción no se puede deshacer.')) resetToDefaults() }}
            className="btn-ghost text-xs text-botanica-400 dark:text-botanica-500 self-start sm:self-auto shrink-0">
            Limpiar inventario
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="col-span-2">
            <StatCard label="Total productos" value={stats.total} sub="en catálogo" accent />
          </div>
          <StatCard label="Valor (min.)" value={formatPrice(stats.totalStockValue)} sub="Stock minorista" />
          <StatCard label="Valor (may.)" value={formatPrice(stats.totalStockValueWholesale)} sub="Stock mayorista" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">

          <div className="card p-4 sm:p-6">
            <h2 className="font-display text-base sm:text-lg text-botanica-800 dark:text-botanica-200 mb-4 sm:mb-5">
              Por categoría
            </h2>
            <div className="space-y-4 sm:space-y-5">
              <CategoryBar label="Interior" icon="🪴" count={stats.interior} total={stats.total} color="bg-botanica-500" />
              <CategoryBar label="Exterior" icon="🌳" count={stats.exterior} total={stats.total} color="bg-botanica-400" />
              <CategoryBar label="Insumos" icon="🌱" count={stats.insumos} total={stats.total} color="bg-soil-400" />
            </div>
          </div>

          <div className="card p-4 sm:p-6">
            <h2 className="font-display text-base sm:text-lg text-botanica-800 dark:text-botanica-200 mb-4 sm:mb-5">
              Valor por categoría <span className="text-[10px] sm:text-xs text-botanica-400 font-body font-normal">(precio min.)</span>
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {[
                { label: 'Interior', icon: '🪴', cat: 'interior' },
                { label: 'Exterior', icon: '🌳', cat: 'exterior' },
                { label: 'Insumos', icon: '🌱', cat: 'insumos' },
              ].map(({ label, icon, cat }) => {
                const cp = products.filter(p => p.category === cat)
                const val = cp.reduce((s, p) => s + p.priceRetail * p.stock, 0)
                return (
                  <div key={cat} className="flex items-center justify-between py-2 sm:py-2.5 border-b border-botanica-50 dark:border-botanica-800 last:border-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      <span className="text-sm sm:text-base shrink-0">{icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-body font-medium text-botanica-800 dark:text-botanica-200 truncate">{label}</p>
                        <p className="text-[10px] sm:text-xs text-botanica-400 dark:text-botanica-500">
                          {cp.length} prod. · {cp.reduce((s, p) => s + p.stock, 0)} u.
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-botanica-900 dark:text-botanica-100 text-xs sm:text-sm shrink-0 ml-2">
                      {formatPrice(val)}
                    </span>
                  </div>
                )
              })}
              <div className="flex items-center justify-between pt-1 sm:pt-2">
                <span className="text-[10px] sm:text-xs text-botanica-500 dark:text-botanica-400 uppercase tracking-wide">Total</span>
                <span className="font-mono font-semibold text-botanica-900 dark:text-botanica-100 text-xs sm:text-sm">
                  {formatPrice(stats.totalStockValue)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {(stats.outOfStock > 0 || stats.lowStock > 0) && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {stats.outOfStock > 0 && (
              <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-red-400 mb-1">Sin stock</p>
                <p className="font-mono text-xl sm:text-2xl font-semibold text-red-600 dark:text-red-400">{stats.outOfStock}</p>
                <p className="text-[10px] sm:text-xs text-red-400 mt-1">productos agotados</p>
              </div>
            )}
            {stats.lowStock > 0 && (
              <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-amber-500 mb-1">Stock bajo</p>
                <p className="font-mono text-xl sm:text-2xl font-semibold text-amber-600 dark:text-amber-400">{stats.lowStock}</p>
                <p className="text-[10px] sm:text-xs text-amber-500 mt-1">con ≤5 unidades</p>
              </div>
            )}
          </div>
        )}

        {(stats.lowStock > 0 || stats.outOfStock > 0) && (
          <div>
            <h2 className="font-display text-base sm:text-xl text-botanica-800 dark:text-botanica-200 mb-3 sm:mb-4">
              ⚠️ Necesitan atención
            </h2>
            <div className="card overflow-hidden min-w-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-botanica-50 dark:bg-botanica-800 border-b border-botanica-100 dark:border-botanica-700">
                      <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3 font-body font-medium text-botanica-600 dark:text-botanica-400">Producto</th>
                      <th className="text-center px-3 sm:px-4 py-2.5 sm:py-3 font-body font-medium text-botanica-600 dark:text-botanica-400">Stock</th>
                      <th className="text-right px-3 sm:px-5 py-2.5 sm:py-3 font-body font-medium text-botanica-600 dark:text-botanica-400">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock).map(product => (
                      <tr key={product.id} className="border-b border-botanica-50 dark:border-botanica-800 last:border-0 hover:bg-botanica-50/50 dark:hover:bg-botanica-800/30 transition-colors">
                        <td className="px-3 sm:px-5 py-2.5 sm:py-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            {product.images?.[0]
                              ? <img src={product.images[0]} alt={product.name} className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover bg-botanica-100 dark:bg-botanica-800 shrink-0" />
                              : <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-botanica-100 dark:bg-botanica-800 shrink-0 flex items-center justify-center text-xs">🌿</div>
                            }
                            <span className="font-body font-medium text-botanica-900 dark:text-botanica-100 truncate max-w-[120px] sm:max-w-none">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-center">
                          <span className={`font-mono font-semibold ${product.stock === 0 ? 'text-red-500 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {product.stock === 0 ? 'Sin stock' : `${product.stock} u.`}
                          </span>
                        </td>
                        <td className="px-3 sm:px-5 py-2.5 sm:py-3 text-right">
                          <Link to="/inventario" className="btn-ghost text-xs py-1">Ver →</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <h2 className="font-display text-lg sm:text-xl text-botanica-800 dark:text-botanica-200 mb-3 sm:mb-4">Accesos rápidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12">
          {sections.map(({ icon, title, desc, link, label, primary }) => (
            <div key={title} className="card p-4 sm:p-6 flex sm:flex-col gap-4 items-center sm:items-start">
              <span className="text-2xl sm:text-3xl shrink-0">{icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-base sm:text-lg text-botanica-900 dark:text-botanica-100 mb-0.5 sm:mb-1">{title}</h3>
                <p className="text-botanica-500 dark:text-botanica-400 text-xs sm:text-sm leading-relaxed hidden sm:block">{desc}</p>
              </div>
              <Link to={link}
                className={clsx(
                  'shrink-0 sm:w-full text-center text-xs sm:text-sm',
                  primary ? 'btn-primary' : 'btn-outline'
                )}>
                {label}
              </Link>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
