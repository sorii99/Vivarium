import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/services/supabase'
import { formatPrice } from '@/utils/format'

const clsx = (...c) => c.flat().filter(Boolean).join(' ')

const STATUS_LABEL = {
  approved: 'Aprobado',
  pending: 'Pendiente',
  rejected: 'Rechazado',
  refunded: 'Reembolsado',
}
const STATUS_COLOR = {
  approved: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  pending: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
  rejected: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300',
  refunded: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
}

function StatusBadge({ status }) {
  return (
    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${STATUS_COLOR[status] || STATUS_COLOR.pending}`}>
      {STATUS_LABEL[status] || status}
    </span>
  )
}

function generatePDF(orders, totalRevenue) {
  const date = new Date().toLocaleDateString('es-AR')
  const rows = orders.map(o => `
    <tr>
      <td>${o.customer_name || '—'}</td>
      <td>${o.reference || '—'}</td>
      <td>${o.delivery_type === 'pickup' ? 'Punto de entrega' : 'Envío'}</td>
      <td>${formatPrice(o.total || 0)}</td>
      <td>${STATUS_LABEL[o.status] || o.status}</td>
      <td>${o.created_at ? new Date(o.created_at).toLocaleDateString('es-AR') : '—'}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a1a; margin: 32px; }
    h1 { font-size: 22px; color: #386a2b; margin-bottom: 4px; }
    .sub { color: #666; margin-bottom: 24px; font-size: 11px; }
    .summary { display: flex; gap: 24px; margin-bottom: 24px; }
    .stat { background: #f4faf0; border-radius: 8px; padding: 12px 20px; }
    .stat-val { font-size: 20px; font-weight: bold; color: #386a2b; }
    .stat-lbl { font-size: 10px; color: #666; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #386a2b; color: white; text-align: left; padding: 8px 10px; font-size: 11px; }
    td { padding: 7px 10px; border-bottom: 1px solid #e8f0e4; font-size: 11px; }
    tr:nth-child(even) td { background: #f9fdf7; }
    .footer { margin-top: 32px; font-size: 10px; color: #999; text-align: center; }
  </style>
</head>
<body>
  <h1>🌿 Botánica — Reporte de Ventas</h1>
  <p class="sub">Generado el ${date}</p>
  <div class="summary">
    <div class="stat">
      <div class="stat-val">${orders.length}</div>
      <div class="stat-lbl">Órdenes totales</div>
    </div>
    <div class="stat">
      <div class="stat-val">${orders.filter(o => o.status === 'approved').length}</div>
      <div class="stat-lbl">Aprobadas</div>
    </div>
    <div class="stat">
      <div class="stat-val">${orders.filter(o => o.status === 'pending').length}</div>
      <div class="stat-lbl">Pendientes</div>
    </div>
    <div class="stat">
      <div class="stat-val">${formatPrice(totalRevenue)}</div>
      <div class="stat-lbl">Total aprobado</div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Cliente</th><th>Referencia</th><th>Entrega</th>
        <th>Total</th><th>Estado</th><th>Fecha</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">Botánica · ${date}</div>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (win) {
    win.onload = () => {
      win.print()
      setTimeout(() => URL.revokeObjectURL(url), 2000)
    }
  }
}

export default function Ventas() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const confirmRef = useRef()

  useEffect(() => { fetchOrders() }, [])

  useEffect(() => {
    const handler = (e) => {
      if (confirmRef.current && !confirmRef.current.contains(e.target)) setConfirmClear(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function fetchOrders() {
    setLoading(true)
    if (!supabase) { setOrders([]); setLoading(false); return }
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setOrders(data || [])
    setLoading(false)
  }

  async function approveOrder(id) {
    setUpdatingId(id)
    if (supabase) {
      await supabase.from('orders').update({ status: 'approved' }).eq('id', id)
    }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'approved' } : o))
    setUpdatingId(null)
  }

  async function deleteAllOrders() {
    if (!supabase) return
    await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    setOrders([])
    setConfirmClear(false)
  }

  const filtered = orders.filter(o => {
    const matchSearch =
      (o.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.customer_email || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.reference || '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || o.status === filter
    return matchSearch && matchFilter
  })

  const totalRevenue = orders
    .filter(o => o.status === 'approved')
    .reduce((s, o) => s + (o.total || 0), 0)

  const isPickupPending = (o) =>
    o.status === 'pending' && (o.delivery_type === 'pickup' || !o.reference?.startsWith('botanica-'))

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">

      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="section-title text-2xl sm:text-3xl mb-1">Ventas</h1>
          <p className="text-botanica-500 dark:text-botanica-400 text-sm">
            {orders.length} {orders.length === 1 ? 'orden' : 'órdenes'} · Total aprobado:{' '}
            <span className="font-mono font-semibold text-botanica-700 dark:text-botanica-300">{formatPrice(totalRevenue)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={fetchOrders} className="btn-ghost text-xs">↻ Actualizar</button>

          <button
            onClick={() => generatePDF(filtered.length ? filtered : orders, totalRevenue)}
            className="btn-ghost text-xs flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Descargar resumen (PDF)
          </button>

          <div className="relative" ref={confirmRef}>
            <button
              onClick={() => setConfirmClear(true)}
              className="btn-ghost text-xs text-red-400 hover:text-red-600 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Borrar todo
            </button>
            {confirmClear && (
              <div className="absolute right-0 top-full mt-1 z-10 bg-white dark:bg-botanica-900 border border-red-200 dark:border-red-800 rounded-xl shadow-lg p-3 w-52">
                <p className="text-xs text-botanica-700 dark:text-botanica-300 mb-3">
                  ¿Eliminar todas las órdenes? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-2">
                  <button onClick={deleteAllOrders}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-1.5 rounded-lg transition-colors">
                    Eliminar
                  </button>
                  <button onClick={() => setConfirmClear(false)}
                    className="flex-1 btn-ghost text-xs py-1.5">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Aprobadas', status: 'approved', color: 'text-green-600 dark:text-green-400' },
          { label: 'Pendientes', status: 'pending', color: 'text-yellow-600 dark:text-yellow-400' },
          { label: 'Rechazadas', status: 'rejected', color: 'text-red-600 dark:text-red-400' },
          { label: 'Reembolsadas', status: 'refunded', color: 'text-blue-600 dark:text-blue-400' },
        ].map(({ label, status, color }) => (
          <div key={status} className="card p-3 sm:p-4 text-center">
            <p className={`font-mono text-xl sm:text-2xl font-semibold ${color}`}>
              {orders.filter(o => o.status === status).length}
            </p>
            <p className="text-[10px] sm:text-xs text-botanica-500 dark:text-botanica-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-botanica-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input type="text" placeholder="Buscar por cliente o referencia…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 text-sm" />
        </div>
        <div className="flex gap-1 bg-botanica-100 dark:bg-botanica-800 rounded-full p-1">
          {['all', 'approved', 'pending', 'rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-body transition-all whitespace-nowrap',
                filter === s
                  ? 'bg-white dark:bg-botanica-700 shadow-sm text-botanica-800 dark:text-botanica-100 font-medium'
                  : 'text-botanica-600 dark:text-botanica-400'
              )}>
              {s === 'all' ? 'Todas' : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {!supabase ? (
        <div className="card p-8 text-center">
          <p className="text-botanica-400 text-sm">Supabase no configurado.</p>
        </div>
      ) : loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="card h-14 animate-pulse bg-botanica-100 dark:bg-botanica-800" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-4xl block mb-3">🧾</span>
          <p className="text-botanica-500 dark:text-botanica-400 text-sm">
            {search || filter !== 'all' ? 'Sin resultados' : 'No hay ventas registradas aún'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-botanica-50 dark:bg-botanica-800 border-b border-botanica-100 dark:border-botanica-700">
                  <th className="text-left px-4 py-3 font-body font-medium text-botanica-600 dark:text-botanica-400">Cliente</th>
                  <th className="text-left px-4 py-3 font-body font-medium text-botanica-600 dark:text-botanica-400 hidden sm:table-cell">Referencia</th>
                  <th className="text-right px-4 py-3 font-body font-medium text-botanica-600 dark:text-botanica-400">Total</th>
                  <th className="text-center px-4 py-3 font-body font-medium text-botanica-600 dark:text-botanica-400">Estado</th>
                  <th className="text-left px-4 py-3 font-body font-medium text-botanica-600 dark:text-botanica-400 hidden md:table-cell">Fecha</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <>
                    <tr key={order.id}
                      className="border-b border-botanica-50 dark:border-botanica-800 last:border-0 hover:bg-botanica-50/50 dark:hover:bg-botanica-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-body font-medium text-botanica-900 dark:text-botanica-100 truncate max-w-[140px]">
                          {order.customer_name || '—'}
                        </p>
                        <p className="text-[10px] text-botanica-400 dark:text-botanica-500 truncate">{order.customer_email}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="font-mono text-[10px] text-botanica-400 dark:text-botanica-500">{order.reference || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono font-semibold text-botanica-800 dark:text-botanica-200">
                          {formatPrice(order.total || 0)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isPickupPending(order) ? (
                          <button
                            onClick={() => approveOrder(order.id)}
                            disabled={updatingId === order.id}
                            className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-700 dark:hover:text-green-300 transition-colors disabled:opacity-50"
                            title="Marcar como aprobado"
                          >
                            {updatingId === order.id ? '…' : <>Pendiente ✓</>}
                          </button>
                        ) : (
                          <StatusBadge status={order.status} />
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-botanica-400 dark:text-botanica-500">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('es-AR') : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                          className="btn-ghost text-xs py-1"
                        >
                          {expanded === order.id ? 'Cerrar' : 'Ver'}
                        </button>
                      </td>
                    </tr>

                    {expanded === order.id && (
                      <tr key={`${order.id}-detail`} className="bg-botanica-50/50 dark:bg-botanica-800/30">
                        <td colSpan={6} className="px-4 py-3">
                          <div className="text-xs space-y-1.5">
                            {order.items && Array.isArray(order.items) ? (
                              <div className="space-y-1">
                                <p className="font-medium text-botanica-700 dark:text-botanica-300 mb-1">Productos:</p>
                                {order.items.map((item, i) => (
                                  <div key={i} className="flex justify-between text-botanica-600 dark:text-botanica-400">
                                    <span>{item.name} × {item.qty}</span>
                                    <span className="font-mono">{formatPrice(item.price * item.qty)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-botanica-400">Sin detalle de productos</p>
                            )}
                            {order.shipping_cost > 0 && (
                              <div className="flex justify-between text-botanica-500 border-t border-botanica-100 dark:border-botanica-800 pt-1 mt-1">
                                <span>Envío</span>
                                <span className="font-mono">{formatPrice(order.shipping_cost)}</span>
                              </div>
                            )}
                            {order.delivery_type && (
                              <p className="text-botanica-500 pt-0.5">
                                {order.delivery_type === 'pickup' ? '📍 Punto de entrega' : '🚚 Envío a domicilio'}
                              </p>
                            )}
                            {order.pickup_location && (
                              <p className="text-botanica-400 text-[10px] font-mono">{order.pickup_location}</p>
                            )}
                            {order.address && order.delivery_type !== 'pickup' && (
                              <p className="text-botanica-400">📍 {order.address}</p>
                            )}
                            {order.notes && (
                              <p className="text-botanica-400 italic">"{order.notes}"</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
