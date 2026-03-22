import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { formatPrice } from '@/utils/format'

function QtyControl({ item, onUpdate, onRemove }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => item.qty <= 1 ? onRemove(item.id) : onUpdate(item.id, item.qty - 1)}
        className="w-7 h-7 rounded-full border border-botanica-200 dark:border-botanica-700 flex items-center justify-center text-botanica-600 dark:text-botanica-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
      >
        {item.qty <= 1 ? '×' : '−'}
      </button>
      <span className="font-mono text-sm font-semibold w-6 text-center text-botanica-800 dark:text-botanica-200">
        {item.qty}
      </span>
      <button
        onClick={() => onUpdate(item.id, item.qty + 1)}
        disabled={item.qty >= item.stock}
        className="w-7 h-7 rounded-full border border-botanica-200 dark:border-botanica-700 flex items-center justify-center text-botanica-600 dark:text-botanica-400 hover:bg-botanica-50 dark:hover:bg-botanica-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
      >
        +
      </button>
    </div>
  )
}

export default function CartDrawer() {
  const { items, open, setOpen, removeItem, updateQty, clearCart, subtotal } = useCart()
  const { isLoggedIn } = useAuth()

  const [km, setKm] = useState('')
  const [fuelPrice, setFuelPrice] = useState('')
  const [fuelLoading, setFuelLoading] = useState(false)
  const [shippingCost, setShippingCost] = useState(0)

  useEffect(() => {
    if (!open || fuelPrice) return
    setFuelLoading(true)
    fetch('https://api.argly.com.ar/api/combustibles/provincia/buenos-aires')
      .then(r => r.json())
      .then(data => {
        const entries = Array.isArray(data) ? data : (data.data ?? [])
        const naftaSuper = entries.filter(e =>
          (e.combustible ?? '').toLowerCase().includes('nafta') &&
          ((e.combustible ?? '').toLowerCase().includes('super') ||
            (e.combustible ?? '').toLowerCase().includes('súper'))
        )
        const precios = naftaSuper
          .map(e => parseFloat(e.precios?.['día'] ?? 0))
          .filter(p => p > 0)
        if (precios.length > 0) {
          const avg = precios.reduce((a, b) => a + b, 0) / precios.length
          setFuelPrice(String(Math.round(avg)))
        }
      })
      .catch(() => { })
      .finally(() => setFuelLoading(false))
  }, [open])

  useEffect(() => {
    const fuel = parseFloat(fuelPrice) || 0
    const kms = parseFloat(km) || 0
    setShippingCost(fuel > 0 && kms > 0 ? (fuel * kms) / 10 : 0)
  }, [fuelPrice, km])

  const total = subtotal + shippingCost

  const [visible, setVisible] = useState(false)
  const [rendered, setRendered] = useState(open)

  useEffect(() => {
    if (open) {
      setRendered(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    } else {
      setVisible(false)
      const t = setTimeout(() => setRendered(false), 300)
      return () => clearTimeout(t)
    }
  }, [open])

  if (!rendered) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={() => setOpen(false)}
      />

      <div
        className="fixed right-0 top-0 h-full z-50 w-full max-w-sm sm:max-w-md bg-white dark:bg-botanica-900 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out"
        style={{ transform: visible ? 'translateX(0)' : 'translateX(100%)' }}>

        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-botanica-100 dark:border-botanica-800">
          <div>
            <h2 className="font-display text-lg text-botanica-900 dark:text-botanica-100">Carrito</h2>
            <p className="text-xs text-botanica-500 dark:text-botanica-400 font-mono">
              {items.reduce((s, i) => s + i.qty, 0)} {items.reduce((s, i) => s + i.qty, 0) === 1 ? 'producto' : 'productos'}
            </p>
          </div>
          <button onClick={() => setOpen(false)}
            className="w-9 h-9 rounded-full hover:bg-botanica-100 dark:hover:bg-botanica-800 flex items-center justify-center text-botanica-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 space-y-3">
          {!isLoggedIn ? (
            <div className="text-center py-16 px-4">
              <span className="text-5xl block mb-4">🔐</span>
              <p className="font-display text-lg text-botanica-700 dark:text-botanica-300 mb-2">
                Iniciá sesión para comprar
              </p>
              <p className="text-botanica-400 text-sm mb-6">
                Necesitás una cuenta para agregar <br />productos al carrito y realizar compras.
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl block mb-4">🛒</span>
              <p className="font-display text-lg text-botanica-700 dark:text-botanica-300 mb-1">El carrito está vacío</p>
              <p className="text-botanica-400 text-sm mb-6">Agregá productos para continuar.</p>
            </div>
          ) : items.map(item => (
            <div key={item.id} className="flex items-center gap-3 py-2 border-b border-botanica-50 dark:border-botanica-800 last:border-0">
              {item.image
                ? <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0 bg-botanica-100 dark:bg-botanica-800" />
                : <div className="w-14 h-14 rounded-xl bg-botanica-100 dark:bg-botanica-800 shrink-0 flex items-center justify-center text-2xl opacity-30">🌿</div>
              }
              <div className="flex-1 min-w-0">
                <p className="font-body font-medium text-sm text-botanica-900 dark:text-botanica-100 truncate">{item.name}</p>
                <p className="font-mono text-xs text-botanica-500 dark:text-botanica-400">{formatPrice(item.price)} / {item.unit}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="font-mono text-sm font-semibold text-botanica-800 dark:text-botanica-200">
                  {formatPrice(item.price * item.qty)}
                </span>
                <QtyControl item={item} onUpdate={updateQty} onRemove={removeItem} />
              </div>
            </div>
          ))}
        </div>

        {isLoggedIn && items.length > 0 && (
          <div className="border-t border-botanica-100 dark:border-botanica-800 px-4 sm:px-5 py-4 space-y-4">

            <div className="bg-botanica-50 dark:bg-botanica-800/60 rounded-xl p-3 space-y-2">
              <p className="text-xs font-medium text-botanica-600 dark:text-botanica-400 uppercase tracking-wider">
                Cálcular envío
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-botanica-400 mb-1">Tarifa base</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-botanica-400 text-xs">$</span>
                    <input
                      type="number" value={fuelPrice}
                      onChange={e => setFuelPrice(e.target.value)}
                      onWheel={e => e.target.blur()}
                      placeholder={fuelLoading ? 'Cargando…' : '0'}
                      disabled={fuelLoading}
                      className="input-field pl-6 py-1.5 text-xs w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-botanica-400 mb-1">Distancia</label>
                  <input
                    type="number" value={km}
                    onChange={e => setKm(e.target.value)}
                    onWheel={e => e.target.blur()}
                    placeholder="0"
                    className="input-field py-1.5 text-xs w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs pt-1">
                <span className="text-botanica-500 dark:text-botanica-400">Costo del envío</span>
                <span className="font-mono font-medium text-botanica-700 dark:text-botanica-300">
                  {shippingCost > 0 ? formatPrice(shippingCost) : '—'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-botanica-500 dark:text-botanica-400">Subtotal</span>
                <span className="font-mono text-botanica-700 dark:text-botanica-300">{formatPrice(subtotal)}</span>
              </div>
              {shippingCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-botanica-500 dark:text-botanica-400">Envío</span>
                  <span className="font-mono text-botanica-700 dark:text-botanica-300">{formatPrice(shippingCost)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold border-t border-botanica-100 dark:border-botanica-800 pt-2">
                <span className="text-botanica-900 dark:text-botanica-100">Total</span>
                <span className="font-mono text-botanica-900 dark:text-botanica-100">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link to="/checkout" onClick={() => setOpen(false)} className="btn-primary text-center text-sm py-3">
                Finalizar compra →
              </Link>
              <button onClick={clearCart} className="btn-ghost text-xs text-botanica-400 dark:text-botanica-500">
                Vaciar carrito
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
