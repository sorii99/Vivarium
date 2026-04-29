import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { formatPrice } from '@/utils/format'

const FIXED_KM = 18
const FREE_PICKUP_MIN_ITEMS = 3
const FREE_PICKUP_MIN_AMOUNT = 10000

let _fuelCache = ''
const _fuelPromise = fetch('https://api.argly.com.ar/api/combustibles/provincia/buenos-aires')
  .then(r => r.json())
  .then(data => {
    const entries = Array.isArray(data) ? data : (data.data ?? [])
    const naftaPremium = entries.filter(e =>
      (e.combustible ?? '').toLowerCase().includes('nafta') &&
      ((e.combustible ?? '').toLowerCase().includes('premium') || (e.combustible ?? '').toLowerCase().includes('premium'))
    )
    const precios = naftaPremium.map(e => parseFloat(e.precios?.['día'] ?? 0)).filter(p => p > 0)
    if (precios.length > 0) {
      _fuelCache = String(Math.round(precios.reduce((a, b) => a + b, 0) / precios.length))
    }
    return _fuelCache
  })
  .catch(() => '')


function QtyControl({ item, onUpdate, onRemove }) {
  return (
    <div className="flex items-center gap-1.5">
      <button onClick={() => item.qty <= 1 ? onRemove(item.id) : onUpdate(item.id, item.qty - 1)}
        className="w-7 h-7 rounded-full border border-botanica-200 dark:border-botanica-700 flex items-center justify-center text-botanica-600 dark:text-botanica-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm">
        {item.qty <= 1 ? '×' : '−'}
      </button>
      <span className="font-mono text-sm font-semibold w-6 text-center text-botanica-800 dark:text-botanica-200">{item.qty}</span>
      <button onClick={() => onUpdate(item.id, item.qty + 1)} disabled={item.qty >= item.stock}
        className="w-7 h-7 rounded-full border border-botanica-200 dark:border-botanica-700 flex items-center justify-center text-botanica-600 dark:text-botanica-400 hover:bg-botanica-50 dark:hover:bg-botanica-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm">
        +
      </button>
    </div>
  )
}

function Popup({ children, onClose }) {
  const overlayRef = useRef()
  useEffect(() => {
    const t = setTimeout(onClose, 40000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div ref={overlayRef} className="absolute inset-0 z-10 flex items-end justify-center p-4 bg-black/30 backdrop-blur-[2px]"
      onClick={e => { if (e.target === overlayRef.current) onClose() }}>
      <div className="w-full bg-white dark:bg-botanica-900 rounded-2xl shadow-2xl p-4 border border-botanica-100 dark:border-botanica-800 animate-slide-up">
        {children}
        <button onClick={onClose} className="mt-3 w-full btn-ghost text-xs text-botanica-400">Entendido</button>
      </div>
    </div>
  )
}

export default function CartDrawer() {
  const { items, open, setOpen, removeItem, updateQty, clearCart, subtotal } = useCart()
  const { isLoggedIn } = useAuth()

  const [deliveryType, setDeliveryType] = useState('pickup')
  const [fuelPrice, setFuelPrice] = useState(_fuelCache)
  const [fuelLoading, setFuelLoading] = useState(!_fuelCache)
  const [shippingCost, setShippingCost] = useState(0)
  const [showCartPopup, setShowCartPopup] = useState(false)
  const popupDismissedRef = useRef(false)

  const [visible, setVisible] = useState(false)
  const [rendered, setRendered] = useState(open)

  const totalItems = items.reduce((s, i) => s + i.qty, 0)
  const freePickupEligible = totalItems >= FREE_PICKUP_MIN_ITEMS && subtotal >= FREE_PICKUP_MIN_AMOUNT

  useEffect(() => {
    if (!freePickupEligible && deliveryType === 'pickup') setDeliveryType('delivery')
  }, [freePickupEligible])

  useEffect(() => {
    if (open) {
      setRendered(true)
      const t1 = setTimeout(() => setVisible(true), 16)
      if (isLoggedIn && items.length > 0 && !popupDismissedRef.current) {
        const t2 = setTimeout(() => setShowCartPopup(true), 400)
        return () => { clearTimeout(t1); clearTimeout(t2) }
      }
      return () => clearTimeout(t1)
    } else {
      setVisible(false)
      const t = setTimeout(() => setRendered(false), 320)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    if (fuelPrice) return
    setFuelLoading(true)
    fetch('https://api.argly.com.ar/api/combustibles/provincia/buenos-aires')
      .then(r => r.json())
      .then(data => {
        const entries = Array.isArray(data) ? data : (data.data ?? [])
        const naftaPremium = entries.filter(e =>
          (e.combustible ?? '').toLowerCase().includes('nafta') &&
          ((e.combustible ?? '').toLowerCase().includes('premium') || (e.combustible ?? '').toLowerCase().includes('premium'))
        )
        const precios = naftaPremium.map(e => parseFloat(e.precios?.['día'] ?? 0)).filter(p => p > 0)
        if (precios.length > 0) setFuelPrice(String(Math.round(precios.reduce((a, b) => a + b, 0) / precios.length)))
      })
      .catch(() => { })
      .finally(() => setFuelLoading(false))
  }, [open])

  useEffect(() => {
    if (deliveryType === 'pickup') { setShippingCost(0); return }
    const fuel = parseFloat(fuelPrice) || 0
    setShippingCost((fuel > 0 ? (fuel * FIXED_KM) / 100 : 0) * 2)
  }, [fuelPrice, deliveryType])

  const total = subtotal + shippingCost
  if (!rendered) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }} onClick={() => setOpen(false)} />

      <div className="fixed right-0 top-0 h-full z-50 w-full max-w-sm sm:max-w-md bg-white dark:bg-botanica-900 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out"
        style={{ transform: visible ? 'translateX(0)' : 'translateX(100%)' }}>

        {showCartPopup && (
          <Popup onClose={() => { setShowCartPopup(false); popupDismissedRef.current = true }}>
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">📍</span>
              <div>
                <p className="text-sm font-semibold text-botanica-800 dark:text-botanica-200 mb-1">
                  Entrega gratuita en punto de encuentro
                </p>
                <p className="text-xs text-botanica-500 dark:text-botanica-400 leading-relaxed">
                  <span>*</span> El retiro es <strong>gratis</strong> cuando tu pedido incluya
                  <strong> {FREE_PICKUP_MIN_ITEMS} productos o más</strong>, y supere los{' '}
                  <strong>{formatPrice(FREE_PICKUP_MIN_AMOUNT)}</strong>. De lo contrario, se aplicara tarifa de envío.
                  <br /><span>*</span> Aplica para productos de un <strong>tamaño no superior a 30 cm., salvo que sea flexible, y de un peso no superior a los 3kg</strong>.
                </p>
              </div>
            </div>
          </Popup>
        )}

        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-botanica-100 dark:border-botanica-800">
          <div>
            <h2 className="font-display text-lg text-botanica-900 dark:text-botanica-100">Carrito</h2>
            <p className="text-xs text-botanica-500 dark:text-botanica-400 font-mono">
              {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
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
              <p className="font-display text-lg text-botanica-700 dark:text-botanica-300 mb-2">Iniciá sesión para comprar</p>
              <p className="text-botanica-400 text-sm mb-6">Necesitás una cuenta para agregar <br />productos al carrito y realizar compras.</p>
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
                : <div className="w-14 h-14 rounded-xl bg-botanica-100 dark:bg-botanica-800 shrink-0 flex items-center justify-center text-2xl opacity-30">🌿</div>}
              <div className="flex-1 min-w-0">
                <p className="font-body font-medium text-sm text-botanica-900 dark:text-botanica-100 truncate">{item.name}</p>
                <p className="font-mono text-xs text-botanica-500 dark:text-botanica-400">{formatPrice(item.price)} / {item.unit}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="font-mono text-sm font-semibold text-botanica-800 dark:text-botanica-200">{formatPrice(item.price * item.qty)}</span>
                <QtyControl item={item} onUpdate={updateQty} onRemove={removeItem} />
              </div>
            </div>
          ))}
        </div>

        {isLoggedIn && items.length > 0 && (
          <div className="border-t border-botanica-100 dark:border-botanica-800 px-4 sm:px-5 py-4 space-y-4">

            {!freePickupEligible && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl px-3 py-2 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                <span className="shrink-0 mt-0.5">ℹ️</span>
                <span>
                  {totalItems < FREE_PICKUP_MIN_ITEMS
                    ? <>Agregá <strong>{FREE_PICKUP_MIN_ITEMS - totalItems}</strong> producto{FREE_PICKUP_MIN_ITEMS - totalItems !== 1 ? 's' : ''} más para llegar al retiro gratis.</>
                    : <>Alcanzá los <strong>{formatPrice(FREE_PICKUP_MIN_AMOUNT)}</strong> en tu pedido para llegar al retiro gratis.</>
                  }
                </span>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-medium text-botanica-600 dark:text-botanica-400 uppercase tracking-wider">Modalidad de entrega</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => freePickupEligible && setDeliveryType('pickup')}
                  disabled={!freePickupEligible}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs transition-all ${!freePickupEligible
                    ? 'border-botanica-200 dark:border-botanica-700 text-botanica-300 dark:text-botanica-600 opacity-50 cursor-not-allowed'
                    : deliveryType === 'pickup'
                      ? 'border-botanica-500 bg-botanica-50 dark:bg-botanica-800 text-botanica-800 dark:text-botanica-200'
                      : 'border-botanica-200 dark:border-botanica-700 text-botanica-500 dark:text-botanica-400'
                    }`}>
                  <span className="text-xl">📍</span>
                  <span className="font-medium">Punto de entrega</span>
                  {freePickupEligible
                    ? <span className="text-green-600 dark:text-green-400 font-mono font-semibold">Gratis</span>
                    : <span className="font-mono text-[10px]">No disponible</span>}
                </button>
                <button onClick={() => setDeliveryType('delivery')}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs transition-all ${deliveryType === 'delivery'
                    ? 'border-botanica-500 bg-botanica-50 dark:bg-botanica-800 text-botanica-800 dark:text-botanica-200'
                    : 'border-botanica-200 dark:border-botanica-700 text-botanica-500 dark:text-botanica-400'
                    }`}>
                  <span className="text-xl">🚚</span>
                  <span className="font-medium">Envío a domicilio</span>
                  <span className="font-mono font-semibold text-botanica-600 dark:text-botanica-400">
                    {fuelLoading ? 'Cargando…' : shippingCost > 0 ? formatPrice(shippingCost) : 'Ver tarifa'}
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-botanica-500 dark:text-botanica-400">Subtotal</span>
                <span className="font-mono text-botanica-700 dark:text-botanica-300">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-botanica-500 dark:text-botanica-400">Envío</span>
                <span className={`font-mono ${deliveryType === 'pickup' && freePickupEligible ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-botanica-700 dark:text-botanica-300'}`}>
                  {deliveryType === 'pickup'
                    ? freePickupEligible ? 'Gratis' : 'A confirmar'
                    : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold border-t border-botanica-100 dark:border-botanica-800 pt-2">
                <span className="text-botanica-900 dark:text-botanica-100">Total</span>
                <span className="font-mono text-botanica-900 dark:text-botanica-100">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link to={`/checkout?delivery=${deliveryType}&shipping=${deliveryType === 'pickup' && freePickupEligible ? 0 : shippingCost}`}
                onClick={() => setOpen(false)} className="btn-primary text-center text-sm py-3">
                Continuar →
              </Link>
              <button onClick={clearCart} className="btn-ghost text-xs text-botanica-400 dark:text-botanica-500">Vaciar carrito</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
