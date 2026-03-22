import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { formatPrice } from '@/utils/format'

const MP_ACCESS_TOKEN = import.meta.env.VITE_MP_ACCESS_TOKEN || ''

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()

  const [km, setKm] = useState('')
  const [fuelPrice, setFuelPrice] = useState('')
  const [fuelLoading, setFuelLoading] = useState(false)
  const [shippingCost, setShippingCost] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    notes: '',
  })

  useEffect(() => {
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
        const precios = naftaSuper.map(e => parseFloat(e.precios?.['día'] ?? 0)).filter(p => p > 0)
        if (precios.length > 0) {
          setFuelPrice(String(Math.round(precios.reduce((a, b) => a + b, 0) / precios.length)))
        }
      })
      .catch(() => { })
      .finally(() => setFuelLoading(false))
  }, [])

  useEffect(() => {
    const fuel = parseFloat(fuelPrice) || 0
    const kms = parseFloat(km) || 0
    setShippingCost(fuel > 0 && kms > 0 ? (fuel * kms) / 10 : 0)
  }, [fuelPrice, km])

  const total = subtotal + shippingCost
  const setField = (f) => (e) => setForm(prev => ({ ...prev, [f]: e.target.value }))

  const handleCheckout = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email) return setError('Nombre y email son obligatorios')
    setLoading(true)
    setError('')

    try {
      const preference = {
        items: [
          ...items.map(item => ({
            id: item.id,
            title: item.name,
            quantity: item.qty,
            unit_price: item.price,
            currency_id: 'ARS',
          })),
          ...(shippingCost > 0 ? [{
            id: 'envio',
            title: 'Envío',
            quantity: 1,
            unit_price: Math.round(shippingCost),
            currency_id: 'ARS',
          }] : []),
        ],
        payer: {
          name: form.name,
          email: form.email,
          phone: { number: form.phone },
        },
        back_urls: {
          success: `${window.location.origin}/checkout/success`,
          failure: `${window.location.origin}/checkout`,
          pending: `${window.location.origin}/checkout`,
        },
        auto_return: 'approved',
        statement_descriptor: 'Botánica',
        external_reference: `botanica-${Date.now()}`,
      }

      const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(preference),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || `Error ${res.status}`)
      }

      const data = await res.json()
      window.location.href = data.init_point
    } catch (err) {
      setError('No se pudo iniciar el pago. Verificá tu conexión o las credenciales de Mercado Pago.')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <span className="text-5xl block mb-4">🛒</span>
        <p className="font-display text-xl text-botanica-700 dark:text-botanica-300 mb-4">El carrito está vacío</p>
        <Link to="/productos" className="btn-primary">Ver catálogo</Link>
      </div>
    )
  }

  const inputCls = 'input-field text-sm py-2.5'
  const labelCls = 'block text-xs text-botanica-500 dark:text-botanica-400 font-medium mb-1.5 uppercase tracking-wider'

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link to="/productos" className="btn-ghost text-sm mb-6 inline-flex items-center gap-1">← Seguir comprando</Link>
      <h1 className="font-display text-2xl sm:text-3xl text-botanica-900 dark:text-botanica-100 mb-6 sm:mb-8">Resumen</h1>

      <form onSubmit={handleCheckout} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">

          <div className="space-y-5">

            <div className="card p-4 sm:p-6">
              <h2 className="font-display text-base sm:text-lg text-botanica-800 dark:text-botanica-200 mb-4">Datos de contacto</h2>
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Nombre completo*</label>
                  <input type="text" value={form.name} onChange={setField('name')} placeholder="Tu nombre" required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Email*</label>
                  <input type="email" value={form.email} onChange={setField('email')} placeholder="tu@email.com" required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Teléfono*</label>
                  <input type="tel" value={form.phone} onChange={setField('phone')} placeholder="+54 11 1234-5678" required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Dirección de entrega*</label>
                  <input type="text" value={form.address} onChange={setField('address')} placeholder="Calle, número, ciudad" required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Notas</label>
                  <textarea value={form.notes} onChange={setField('notes')} placeholder="Instrucciones de entrega, horarios…" rows={2} className={`${inputCls} resize-none`} />
                </div>
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <h2 className="font-display text-base sm:text-lg text-botanica-800 dark:text-botanica-200 mb-4">Cálculo de envío</h2>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className={labelCls}>Kilómetros</label>
                  <input
                    type="number" value={km}
                    onChange={e => setKm(e.target.value)}
                    onWheel={e => e.target.blur()}
                    placeholder="0"
                    className={`${inputCls} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm bg-botanica-50 dark:bg-botanica-800/60 rounded-lg px-3 py-2">
                <span className="text-botanica-500 dark:text-botanica-400">Costo estimado</span>
                <span className="font-mono font-semibold text-botanica-800 dark:text-botanica-200">
                  {shippingCost > 0 ? formatPrice(shippingCost) : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: summary */}
          <div className="space-y-4">
            <div className="card p-4 sm:p-6">
              <h2 className="font-display text-base sm:text-lg text-botanica-800 dark:text-botanica-200 mb-4">Resumen</h2>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0 bg-botanica-100 dark:bg-botanica-800" />
                      : <div className="w-10 h-10 rounded-lg bg-botanica-100 dark:bg-botanica-800 shrink-0 flex items-center justify-center text-sm opacity-30">🌿</div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-botanica-900 dark:text-botanica-100 truncate">{item.name}</p>
                      <p className="text-xs text-botanica-500 dark:text-botanica-400 font-mono">{item.qty} × {formatPrice(item.price)}</p>
                    </div>
                    <span className="font-mono text-sm font-semibold text-botanica-800 dark:text-botanica-200 shrink-0">
                      {formatPrice(item.price * item.qty)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-botanica-100 dark:border-botanica-800 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-botanica-500 dark:text-botanica-400">Subtotal</span>
                  <span className="font-mono text-botanica-700 dark:text-botanica-300">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-botanica-500 dark:text-botanica-400">Envío</span>
                  <span className="font-mono text-botanica-700 dark:text-botanica-300">
                    {shippingCost > 0 ? formatPrice(shippingCost) : 'A calcular'}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold border-t border-botanica-100 dark:border-botanica-800 pt-2">
                  <span className="text-botanica-900 dark:text-botanica-100">Total</span>
                  <span className="font-mono text-botanica-900 dark:text-botanica-100">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {!MP_ACCESS_TOKEN && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <span className="font-medium">⚠️ Modo demo:</span> Agregá <span className="font-mono">VITE_MP_ACCESS_TOKEN</span> al <span className="font-mono">.env</span> para activar el pago.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !form.name || !form.email}
              className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Redirigiendo…
                </>
              ) : (
                'Pagar con Mercado Pago →'
              )}
            </button>
            <p className="text-center text-[10px] text-botanica-400 dark:text-botanica-500">
              Serás redirigido a Mercado Pago para completar el pago de forma segura.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
