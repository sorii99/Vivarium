import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { useInventoryStore } from '@/context/InventoryContext'
import { supabase } from '@/services/supabase'

export default function CheckoutSuccess() {
  const { items, clearCart } = useCart()
  const { updateProduct, products } = useInventoryStore()
  const [params] = useSearchParams()
  const status = params.get('status') || 'approved'
  const processed = useRef(false)

  useEffect(() => {
    if (status !== 'approved' || processed.current) return
    processed.current = true

    items.forEach(item => {
      const product = products.find(p => p.id === item.id)
      if (!product) return
      const newStock = Math.max(0, product.stock - item.qty)
      updateProduct(item.id, { stock: newStock })
    })

    const ref = new URLSearchParams(window.location.search).get('external_reference')
    if (ref && supabase) {
      supabase.from('orders')
        .update({ status: 'approved' })
        .eq('reference', ref)
        .then(({ error }) => { if (error) console.warn('Order status update error:', error) })
    }

    clearCart()
  }, [status])

  return (
    <div className="max-w-lg mx-auto px-4 py-16 sm:py-24 text-center">
      <div className="text-6xl mb-6">
        {status === 'approved' ? '✅' : status === 'pending' ? '⏳' : '❌'}
      </div>
      <h1 className="font-display text-2xl sm:text-3xl text-botanica-900 dark:text-botanica-100 mb-3">
        {status === 'approved'
          ? '¡Pago exitoso!'
          : status === 'pending'
            ? 'Pago pendiente'
            : 'Pago no completado'}
      </h1>
      <p className="text-botanica-500 dark:text-botanica-400 font-body mb-2 text-sm sm:text-base">
        {status === 'approved'
          ? 'Tu pedido fue confirmado. Te enviamos un email con los detalles.'
          : status === 'pending'
            ? 'Tu pago está siendo procesado. Te avisaremos cuando se confirme.'
            : 'No se pudo procesar el pago. Podés intentarlo de nuevo.'}
      </p>
      {params.get('external_reference') && (
        <p className="font-mono text-xs text-botanica-400 dark:text-botanica-500 mb-8">
          Ref: {params.get('external_reference')}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/productos" className="btn-primary">Ver más productos</Link>
        <Link to="/" className="btn-outline border-botanica-300 dark:border-botanica-600 text-botanica-600 dark:text-botanica-300">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
