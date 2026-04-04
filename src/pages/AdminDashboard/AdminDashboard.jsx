import { useState, useEffect } from 'react'
import BannerManager from './BannerManager'
import { Link } from 'react-router-dom'
import { getSetting, getSettingRemote, setSetting } from '@/services/settings'
import { useAuth } from '@/context/AuthContext'
import { useInventoryStore } from '@/context/InventoryContext'
import { formatPrice } from '@/utils/format'
const clsx = (...c) => c.flat().filter(Boolean).join(' ')

function PackagingRow({ item, onChange, onRemove }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={item.label}
        onChange={e => onChange({ ...item, label: e.target.value })}
        placeholder="Caja, Bolsa, Cinta…"
        className="input-field py-1.5 text-xs flex-1"
      />
      <span className="text-botanica-400 text-xs shrink-0">$</span>
      <input
        type="number"
        onWheel={e => e.target.blur()}
        value={item.cost}
        min={0}
        onChange={e => onChange({ ...item, cost: e.target.value })}
        placeholder="0"
        className="input-field py-1.5 text-xs w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        onClick={onRemove}
        className="text-red-400 hover:text-red-600 dark:hover:text-red-400 text-sm px-1 transition-colors shrink-0"
        title="Eliminar">
        ×
      </button>
    </div>
  )
}

function PriceCalculator() {
  const WHOLESALE_MULT = 18

  const [fuelPrice, setFuelPrice] = useState('')
  const [km, setKm] = useState('')
  const [productCost, setProductCost] = useState('')
  const [packaging, setPackaging] = useState([])
  const [nextId, setNextId] = useState(2)
  const [fuelLoading, setFuelLoading] = useState(false)
  const [fuelError, setFuelError] = useState('')

  useEffect(() => {
    async function fetchFuel() {
      setFuelLoading(true)
      setFuelError('')
      try {
        const res = await fetch(
          'https://api.argly.com.ar/api/combustibles/provincia/buenos-aires'
        )
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        const entries = Array.isArray(data) ? data : (data.data ?? [])
        const naftaPremium = entries.filter(e => {
          const tipo = (e.combustible ?? '').toLowerCase()
          return tipo.includes('nafta') && (tipo.includes('premium') || tipo.includes('premium'))
        })

        if (naftaPremium.length === 0) {
          setFuelError('No se encontraron datos')
          return
        }

        const precios = naftaPremium
          .map(e => parseFloat(e.precios?.['día'] ?? e.precios?.dia ?? e.precios?.day ?? 0))
          .filter(p => p > 0)

        if (precios.length === 0) {
          setFuelError('No se encontró el campo de precio')
          return
        }

        const promedio = precios.reduce((a, b) => a + b, 0) / precios.length
        setFuelPrice(String(Math.round(promedio)))
      } catch (e) {
        setFuelError('No se pudo obtener el precio del combustible')
        console.warn('Fuel fetch error:', e)
      } finally {
        setFuelLoading(false)
      }
    }
    fetchFuel()
  }, [])

  const fuel = parseFloat(fuelPrice) || 0
  const kms = parseFloat(km) || 0

  const logisticRetail = fuel > 0 && kms > 0 ? (fuel * kms) / 100 : 0
  const logisticWholesale = fuel > 0 ? (fuel * WHOLESALE_MULT) / 100 : 0

  const packagingTotal = packaging.reduce((sum, p) => sum + (parseFloat(p.cost) || 0), 0)

  const base = parseFloat(productCost) || 0
  const unitPrice = base + logisticRetail + packagingTotal
  const mayPrice = base + logisticWholesale + packagingTotal

  const addPackaging = () => {
    setPackaging(prev => [...prev, { id: nextId, label: '', cost: '' }])
    setNextId(n => n + 1)
  }

  const updatePackaging = (id, updated) =>
    setPackaging(prev => prev.map(p => p.id === id ? updated : p))

  const removePackaging = (id) =>
    setPackaging(prev => prev.filter(p => p.id !== id))

  const hasResult = base > 0

  return (
    <div className="mt-8 sm:mt-12">
      <h2 className="font-display text-lg sm:text-xl text-botanica-800 dark:text-botanica-200 mb-4">
        Calcular precio
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="card p-4 sm:p-6 space-y-4">

          <div>
            <label className="block text-xs text-botanica-500 dark:text-botanica-400 font-medium mb-1.5 uppercase tracking-wider">
              Costo
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-botanica-400 text-sm">$</span>
              <input
                type="number"
                onWheel={e => e.target.blur()}
                min={0}
                value={productCost}
                onChange={e => setProductCost(e.target.value)}
                placeholder="0"
                className="input-field pl-7 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-botanica-500 dark:text-botanica-400 font-medium mb-1.5 uppercase tracking-wider">
              Envío
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] text-botanica-400 dark:text-botanica-500">
                    Precio combustible por litro
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-botanica-400 text-xs">$</span>
                  <input
                    type="number"
                    onWheel={e => e.target.blur()}
                    min={0}
                    value={fuelPrice}
                    onChange={e => setFuelPrice(e.target.value)}
                    placeholder={fuelLoading ? 'Cargando…' : '0'}
                    disabled={fuelLoading}
                    className="input-field pl-7 pr-8 text-xs py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-60"
                  />
                  {fuelLoading && (
                    <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-botanica-400"
                      fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                </div>
                {fuelError && (
                  <p className="text-[9px] text-amber-500 dark:text-amber-400 mt-1">{fuelError} — ingresalo manualmente</p>
                )}
              </div>
              <div>
                <label className="block text-[10px] text-botanica-400 dark:text-botanica-500 mb-1">
                  Distancia a recorrer
                </label>
                <input
                  type="number"
                  onWheel={e => e.target.blur()}
                  min={0}
                  value={km}
                  onChange={e => setKm(e.target.value)}
                  placeholder="0"
                  className="input-field text-xs py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
            {(logisticRetail > 0 || logisticWholesale > 0) && (
              <div className="mt-2 flex gap-4 text-[10px] font-mono text-botanica-500 dark:text-botanica-400">
                <span>Minorista ({kms}km): <span className="text-botanica-700 dark:text-botanica-300">{formatPrice(logisticRetail)}</span></span>
                <span>Mayorista (×{WHOLESALE_MULT}km): <span className="text-botanica-700 dark:text-botanica-300">{formatPrice(logisticWholesale)}</span></span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs text-botanica-500 dark:text-botanica-400 font-medium uppercase tracking-wider">
                Packaging
              </label>
              <button
                onClick={addPackaging}
                className="text-[10px] btn-ghost py-1 px-2 text-botanica-500">
                + Agregar
              </button>
            </div>
            <div className="space-y-2">
              {packaging.map(item => (
                <PackagingRow
                  key={item.id}
                  item={item}
                  onChange={updated => updatePackaging(item.id, updated)}
                  onRemove={() => removePackaging(item.id)}
                />
              ))}
            </div>
            {packagingTotal > 0 && (
              <p className="mt-2 text-[10px] font-mono text-botanica-500 dark:text-botanica-400">
                Total packaging: <span className="text-botanica-700 dark:text-botanica-300">{formatPrice(packagingTotal)}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">

          <div className={clsx(
            'card p-4 sm:p-6 flex-1',
            !hasResult && 'opacity-40'
          )}>
            <p className="text-[10px] sm:text-xs text-botanica-500 dark:text-botanica-400 uppercase tracking-wider mb-3">
              Precio minorista sugerido
            </p>
            <p className="font-mono text-2xl sm:text-3xl font-semibold text-botanica-900 dark:text-botanica-100 mb-3">
              {formatPrice(unitPrice)}
            </p>
            <div className="space-y-1 text-[10px] sm:text-xs text-botanica-400 dark:text-botanica-500 font-mono border-t border-botanica-100 dark:border-botanica-800 pt-3">
              <div className="flex justify-between">
                <span>Producto</span>
                <span>{formatPrice(base)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío ({kms || '?'}km)</span>
                <span>{formatPrice(logisticRetail)}</span>
              </div>
              <div className="flex justify-between">
                <span>Packaging</span>
                <span>{formatPrice(packagingTotal)}</span>
              </div>
            </div>
          </div>

          <div className={clsx(
            'rounded-xl sm:rounded-2xl p-4 sm:p-6 flex-1',
            'bg-botanica-600 text-white',
            !hasResult && 'opacity-40'
          )}>
            <p className="text-[10px] sm:text-xs text-botanica-200 uppercase tracking-wider mb-3">
              Precio mayorista sugerido
            </p>
            <p className="font-mono text-2xl sm:text-3xl font-semibold text-white mb-3">
              {formatPrice(mayPrice)}
            </p>
            <div className="space-y-1 text-[10px] sm:text-xs text-botanica-300 font-mono border-t border-botanica-500 pt-3">
              <div className="flex justify-between">
                <span>Producto</span>
                <span>{formatPrice(base)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío (×{WHOLESALE_MULT}km)</span>
                <span>{formatPrice(logisticWholesale)}</span>
              </div>
              <div className="flex justify-between">
                <span>Packaging</span>
                <span>{formatPrice(packagingTotal)}</span>
              </div>
            </div>
          </div>

          {hasResult && (
            <button
              onClick={() => {
                setKm(''); setProductCost('')
                setPackaging([])
                setNextId(n => n + 1)
              }}
              className="btn-ghost text-xs text-botanica-400 dark:text-botanica-500 self-start">
              Limpiar calculadora
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function AppSettings() {
  const [mpEnabled, setMpEnabled] = useState(() => getSetting('mpEnabled') !== false)
  const [settingLoading, setSettingLoading] = useState(true)

  useEffect(() => {
    getSettingRemote('mpEnabled').then(val => {
      if (val !== null) setMpEnabled(val !== false)
      setSettingLoading(false)
    })
  }, [])

  const toggle = async () => {
    const next = !mpEnabled
    setMpEnabled(next)
    await setSetting('mpEnabled', next)
  }

  return (
    <div className="mt-8 sm:mt-12">
      <h2 className="font-display text-lg sm:text-xl text-botanica-800 dark:text-botanica-200 mb-4">
        Configuración
      </h2>
      <div className="card p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-botanica-800 dark:text-botanica-200">
              Mercado Pago
            </p>
            <p className="text-xs text-botanica-500 dark:text-botanica-400 mt-0.5">
              {settingLoading ? 'Cargando configuración…' : mpEnabled
                ? 'El botón de Mercado Pago se muestra como opción de pago.'
                : 'El botón de Mercado Pago está oculto, no sera mostrado como opción de pago.'}
            </p>
          </div>
          <button
            type="button"
            onClick={toggle}
            className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${mpEnabled ? 'bg-botanica-600' : 'bg-botanica-200 dark:bg-botanica-700'}`}
          >
            <span
              className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${mpEnabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}

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
    { icon: '👥', title: 'Clientes', desc: 'Listado de clientes', link: '/clientes', label: 'Ver clientes', primary: false },
    { icon: '🧾', title: 'Ventas', desc: 'Historial de órdenes y pagos', link: '/ventas', label: 'Ver ventas', primary: false },
    { icon: '🛍️', title: 'Catálogo', desc: 'Consultar disponibilidad', link: '/productos', label: 'Ver catálogo', primary: false },
    { icon: '🏠', title: 'Inicio', desc: 'Volver al inicio', link: '/', label: 'Ver tienda', primary: false },
  ]

  return (
    <div className="min-h-screen bg-botanica-50 dark:bg-botanica-950">

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
              Resumen en tiempo real del negocio
            </p>
          </div>
          <button
            onClick={() => { if (window.confirm('¿Eliminar todos los productos y limpiar el inventario? Esta acción no se puede deshacer.')) resetToDefaults() }}
            className="btn-ghost text-xs text-botanica-400 dark:text-botanica-500 self-start sm:self-auto shrink-0">
            Limpiar inventario
          </button>
        </div>

        <h2 className="font-display text-lg sm:text-xl text-botanica-800 dark:text-botanica-200 mb-3 sm:mb-4">Accesos rápidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12">
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="col-span-2">
            <StatCard label="Total productos" value={stats.total} sub="en catálogo" accent />
          </div>
          <StatCard label="Valor" value={formatPrice(stats.totalStockValueWholesale)} sub="de compra" />
          <StatCard label="Valor" value={formatPrice(stats.totalStockValue)} sub="del stock" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">

          <div className="card p-4 sm:p-6">
            <h2 className="font-display text-base sm:text-lg text-botanica-800 dark:text-botanica-200 mb-4 sm:mb-5">
              Por categoría
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <CategoryBar label="Interior" icon="🪴" count={stats.interior} total={stats.total} color="bg-botanica-500" />
              <CategoryBar label="Exterior" icon="🌳" count={stats.exterior} total={stats.total} color="bg-botanica-400" />
              <CategoryBar label="Insumos" icon="🌱" count={stats.insumos} total={stats.total} color="bg-soil-400" />
              <CategoryBar label="Químicos" icon="🧪" count={stats.quimicos} total={stats.total} color="bg-purple-400" />
              <CategoryBar label="Fertilizantes" icon="🌿" count={stats.fertilizantes} total={stats.total} color="bg-emerald-400" />
              <CategoryBar label="Macetas" icon="🏺" count={stats.macetas} total={stats.total} color="bg-amber-400" />
            </div>
          </div>

          <div className="card p-4 sm:p-6">
            <h2 className="font-display text-base sm:text-lg text-botanica-800 dark:text-botanica-200 mb-4 sm:mb-5">
              Valor por categoría
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {[
                { label: 'Interior', icon: '🪴', cat: 'interior' },
                { label: 'Exterior', icon: '🌳', cat: 'exterior' },
                { label: 'Insumos', icon: '🌱', cat: 'insumos' },
                { label: 'Químicos', icon: '🧪', cat: 'quimicos' },
                { label: 'Fertilizantes', icon: '🌿', cat: 'fertilizantes' },
                { label: 'Macetas', icon: '🏺', cat: 'macetas' },
              ].map(({ label, icon, cat }) => {
                const cp = products.filter(p => (['macetas', 'interior', 'exterior'].includes(cat) ? p.category?.startsWith(cat) : p.category === cat))
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

        <BannerManager />

        <AppSettings />

        <PriceCalculator />

      </div>
    </div>
  )
}
