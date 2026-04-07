import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { formatPrice } from '@/utils/format'
import { supabase } from '@/services/supabase'
import { getSetting, getSettingRemote } from '@/services/settings'

const MP_ACCESS_TOKEN = import.meta.env.VITE_MP_ACCESS_TOKEN || ''
const FORM_KEY = 'botanica_checkout_form'

const PICKUP_LOCATIONS = [
  { id: 'loc1', label: 'Temperley', address: 'Dirección a confirmar' },
  { id: 'loc2', label: 'Adrogue', address: 'Dirección a confirmar' },
  { id: 'loc3', label: 'Lanús', address: 'Dirección a confirmar' },
  { id: 'loc4', label: 'Almirante Brown', address: 'Dirección a confirmar' },
  { id: 'loc5', label: 'Calzada', address: 'Dirección a confirmar' },
]

function loadForm() {
  try {
    const raw = sessionStorage.getItem(FORM_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveForm(form) {
  try { sessionStorage.setItem(FORM_KEY, JSON.stringify(form)) } catch { }
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const deliveryType = searchParams.get('delivery') || 'pickup'
  const shippingCost = parseFloat(searchParams.get('shipping') || '0')
  const total = subtotal + shippingCost

  const [loading, setLoading] = useState(false)
  const [reservaLoading, setReservaLoading] = useState(false)
  const [error, setError] = useState('')
  const [mpEnabled, setMpEnabled] = useState(() => getSetting('mpEnabled') !== false)

  useEffect(() => {
    getSettingRemote('mpEnabled').then(val => {
      if (val !== null) setMpEnabled(val !== false)
    })
  }, [])
  const [pickupLocation, setPickupLocation] = useState(PICKUP_LOCATIONS[0].id)

  const [form, setForm] = useState(() => {
    const saved = loadForm()
    return saved || {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      address: '',
      notes: '',
    }
  })

  useEffect(() => { saveForm(form) }, [form])

  const setField = (f) => (e) => setForm(prev => ({ ...prev, [f]: e.target.value }))

  const getPickupLabel = () => {
    const loc = PICKUP_LOCATIONS.find(l => l.id === pickupLocation)
    return loc ? `${loc.label} — ${loc.address}` : ''
  }

  const buildOrder = (status, reference) => ({
    reference,
    customer_name: form.name,
    customer_email: form.email,
    customer_phone: form.phone,
    address: deliveryType === 'delivery' ? form.address : getPickupLabel(),
    notes: form.notes,
    items: items.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
    subtotal,
    shipping_cost: shippingCost,
    delivery_type: deliveryType,
    pickup_location: deliveryType === 'pickup' ? pickupLocation : null,
    total,
    status,
  })

  const handleReserva = async () => {
    if (!form.name || !form.email) return setError('Nombre y email son obligatorios')
    setReservaLoading(true)
    setError('')
    try {
      const order = buildOrder('pending', `reserva-${Date.now()}`)
      if (supabase) {
        const { error: dbErr } = await supabase.from('orders').insert([order])
        if (dbErr) throw new Error(dbErr.message)
      }
      clearCart()
      sessionStorage.removeItem(FORM_KEY)
      navigate('/checkout/reserva-success')
    } catch (err) {
      console.error('Reserva error:', err)
      setError(`No se pudo registrar la reserva: ${err.message}`)
    } finally {
      setReservaLoading(false)
    }
  }

  const handleCheckout = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email) return setError('Nombre y email son obligatorios')
    setLoading(true)
    setError('')
    try {
      const preference = {
        items: [
          ...items.map(item => ({
            id: item.id, title: item.name,
            quantity: item.qty, unit_price: item.price, currency_id: 'ARS',
          })),
          ...(shippingCost > 0 ? [{
            id: 'envio', title: 'Envío a domicilio',
            quantity: 1, unit_price: Math.round(shippingCost), currency_id: 'ARS',
          }] : []),
        ],
        payer: { name: form.name, email: form.email, phone: { number: form.phone } },
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
        body: JSON.stringify(preference),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || `Error ${res.status}`) }
      const data = await res.json()

      if (supabase) {
        const order = buildOrder('pending', preference.external_reference)
        await supabase.from('orders').insert([order])
      }

      window.location.href = data.init_point
    } catch {
      setError('No se pudo iniciar el pago. Verificá tu conexión o las credenciales de Mercado Pago.')
      setLoading(false)
    }
  }

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <span className="text-5xl block mb-4">🛒</span>
      <p className="font-display text-xl text-botanica-700 dark:text-botanica-300 mb-4">El carrito está vacío</p>
      <Link to="/productos" className="btn-primary">Ver catálogo</Link>
    </div>
  )

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
                <div><label className={labelCls}>Nombre completo*</label>
                  <input type="text" value={form.name} onChange={setField('name')} placeholder="Ingresa tu nombre" required className={inputCls} /></div>
                <div><label className={labelCls}>Email*</label>
                  <input type="email" value={form.email} onChange={setField('email')} placeholder="Ingresa tu correo" required className={inputCls} /></div>
                <div><label className={labelCls}>Teléfono*</label>
                  <input type="tel" value={form.phone} onChange={setField('phone')} placeholder="Ingresa tu numero de teléfono" required className={inputCls} /></div>
                {deliveryType === 'delivery' && (
                  <div><label className={labelCls}>Dirección de entrega*</label>
                    <input type="text" value={form.address} onChange={setField('address')} placeholder="Calle, número y ciudad" required className={inputCls} /></div>
                )}
                <div><label className={labelCls}>Notas</label>
                  <textarea value={form.notes} onChange={setField('notes')} placeholder="Instrucciones de entrega, horarios…" rows={2} className={`${inputCls} resize-none`} /></div>
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <h2 className="font-display text-base sm:text-lg text-botanica-800 dark:text-botanica-200 mb-3">Entrega</h2>

              {deliveryType === 'pickup' ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 rounded-xl p-3 mb-3">
                    <span className="text-2xl shrink-0">📍</span>
                    <div>
                      <p className="text-sm font-medium text-botanica-800 dark:text-botanica-200">Punto de entrega — Gratis</p>
                      <p className="text-xs text-botanica-500 dark:text-botanica-400 mt-0.5">
                        Seleccioná el punto de retiro más cercano.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {PICKUP_LOCATIONS.map(loc => (
                      <label key={loc.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${pickupLocation === loc.id
                          ? 'border-botanica-500 bg-botanica-50 dark:bg-botanica-800'
                          : 'border-botanica-200 dark:border-botanica-700 hover:border-botanica-400'
                          }`}>
                        <input
                          type="radio"
                          name="pickup"
                          value={loc.id}
                          checked={pickupLocation === loc.id}
                          onChange={() => setPickupLocation(loc.id)}
                          className="mt-0.5 accent-botanica-600"
                        />
                        <div>
                          <p className="text-sm font-medium text-botanica-800 dark:text-botanica-200">{loc.label}</p>
                          <p className="text-xs text-botanica-500 dark:text-botanica-400">{loc.address}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 bg-botanica-50 dark:bg-botanica-800/60 rounded-xl p-3">
                  <span className="text-2xl shrink-0">🚚</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-botanica-800 dark:text-botanica-200">Envío a domicilio</p>
                    {shippingCost > 0 && (
                      <p className="text-xs font-mono font-semibold text-botanica-700 dark:text-botanica-300 mt-1.5">
                        Valor estimado: {formatPrice(shippingCost)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="card p-4 sm:p-6">
              <h2 className="font-display text-base sm:text-lg text-botanica-800 dark:text-botanica-200 mb-4">Resumen</h2>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0 bg-botanica-100 dark:bg-botanica-800" />
                      : <div className="w-10 h-10 rounded-lg bg-botanica-100 dark:bg-botanica-800 shrink-0 flex items-center justify-center text-sm opacity-30">🌿</div>}
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
                  <span className="text-botanica-500 dark:text-botanica-400">Entrega</span>
                  <span className={`font-mono ${deliveryType === 'pickup' ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-botanica-700 dark:text-botanica-300'}`}>
                    {deliveryType === 'pickup' ? 'Gratis' : shippingCost > 0 ? formatPrice(shippingCost) : '—'}
                  </span>
                </div>
                {deliveryType === 'pickup' && (
                  <div className="flex justify-between text-xs text-botanica-400 dark:text-botanica-500">
                    <span>Punto de retiro</span>
                    <span className="text-right max-w-[180px]">
                      {PICKUP_LOCATIONS.find(l => l.id === pickupLocation)?.label || '—'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold border-t border-botanica-100 dark:border-botanica-800 pt-2">
                  <span className="text-botanica-900 dark:text-botanica-100">Total</span>
                  <span className="font-mono text-botanica-900 dark:text-botanica-100">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {mpEnabled && MP_ACCESS_TOKEN && (
              <>
                <button type="submit" disabled={loading || !form.name || !form.email}
                  className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading
                    ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Redirigiendo…</>
                    : 'Pagar con Mercado Pago →'}
                </button>
                <p className="text-center text-[10px] text-botanica-400 dark:text-botanica-500">
                  Serás redirigido a Mercado Pago para completar el pago de forma segura.
                </p>
                <div className="relative flex items-center gap-3">
                  <div className="flex-1 border-t border-botanica-100 dark:border-botanica-800" />
                  <span className="text-[10px] text-botanica-400 dark:text-botanica-500 whitespace-nowrap">tambien podés</span>
                  <div className="flex-1 border-t border-botanica-100 dark:border-botanica-800" />
                </div>
              </>
            )}

            <button type="button" onClick={handleReserva}
              disabled={reservaLoading || !form.name || !form.email}
              className="w-full btn-outline border-botanica-400 dark:border-botanica-600 text-botanica-700 dark:text-botanica-300 py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {reservaLoading
                ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Guardando reserva…</>
                : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>Reservar</>
              }
            </button>

            <div className="bg-botanica-800/50 border border-botanica-700/50 rounded-xl px-4 py-3">
              <p className="text-botanica-400 text-xs leading-relaxed">
                <span className="text-botanica-300 font-medium">ℹ️ Información importante:</span>{' '}
                <br />Coordinaremos el pago y la entrega por Whatsapp.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
