import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/utils/format'

export default function CartDrawer() {
  const { items, total, isOpen, dispatch } = useCart()

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-botanica-950/40 backdrop-blur-sm z-40"
        onClick={() => dispatch({ type: 'CLOSE_CART' })}
      />

      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-botanica-100">
          <h2 className="font-display text-xl text-botanica-900">Tu carrito</h2>
          <button
            onClick={() => dispatch({ type: 'CLOSE_CART' })}
            className="btn-ghost p-2 text-botanica-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center pb-16">
              <span className="text-5xl mb-4">🛒</span>
              <p className="font-display text-lg text-botanica-700">Tu carrito está vacío</p>
              <p className="text-sm text-botanica-400 mt-1">Agregá plantas o insumos para comenzar</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-4 items-start">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover bg-botanica-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-body font-medium text-botanica-900 text-sm truncate">{item.name}</p>
                  <p className="text-xs text-botanica-500 font-mono mt-0.5">{formatPrice(item.price)} c/u</p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity - 1 } })}
                      className="w-6 h-6 rounded-full border border-botanica-200 flex items-center justify-center text-botanica-600 hover:bg-botanica-100 transition-colors"
                    >−</button>
                    <span className="text-sm font-mono w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity + 1 } })}
                      className="w-6 h-6 rounded-full border border-botanica-200 flex items-center justify-center text-botanica-600 hover:bg-botanica-100 transition-colors"
                    >+</button>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-mono font-semibold text-botanica-800 text-sm">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                    className="text-xs text-red-400 hover:text-red-600 mt-1 transition-colors"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-botanica-100 px-6 py-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-botanica-600 text-sm">Total</span>
              <span className="font-mono font-semibold text-botanica-900 text-xl">{formatPrice(total)}</span>
            </div>
            <button className="btn-primary w-full justify-center">
              Continuar al pedido
            </button>
            <button
              onClick={() => dispatch({ type: 'CLEAR_CART' })}
              className="btn-ghost w-full text-center text-xs text-botanica-400"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  )
}
