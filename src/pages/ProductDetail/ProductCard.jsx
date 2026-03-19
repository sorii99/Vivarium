import { Link } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { formatPrice } from '@/utils/format'
import { CATEGORY_ICONS } from '@/utils/format'
import clsx from 'clsx'

export default function ProductCard({ product, compact = false }) {
  const { dispatch } = useCart()
  const { isWholesale } = useAuth()

  const price = isWholesale ? product.priceWholesale : product.priceRetail

  const addToCart = (e) => {
    e.preventDefault()
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price,
        image: product.images[0],
        unit: product.unit,
      }
    })
  }

  return (
    <Link to={`/productos/${product.id}`} className="card group block overflow-hidden">
      <div className={clsx('relative overflow-hidden bg-botanica-100', compact ? 'h-40' : 'h-56')}>
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm text-botanica-700 text-xs px-2 py-1 rounded-full">
          {CATEGORY_ICONS[product.category]} {product.category}
        </span>
        {product.stock <= 5 && (
          <span className="absolute top-3 right-3 bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
            Últimas {product.stock}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-display text-botanica-900 font-semibold text-lg leading-tight mb-1">
          {product.name}
        </h3>

        {!compact && (
          <p className="text-botanica-600 text-sm line-clamp-2 mb-3 font-body">
            {product.description}
          </p>
        )}

        <div className="flex items-end justify-between gap-2 mt-2">
          <div>
            <div className="font-mono font-semibold text-botanica-800 text-lg">
              {formatPrice(price)}
            </div>
            {isWholesale && (
              <div className="text-xs text-soil-500 font-mono">
                precio mayorista · mín. {product.minWholesaleQty}
              </div>
            )}
          </div>

          <button
            onClick={addToCart}
            disabled={product.stock === 0}
            className={clsx(
              'shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200',
              product.stock > 0
                ? 'bg-botanica-600 hover:bg-botanica-700 text-white active:scale-90'
                : 'bg-botanica-100 text-botanica-300 cursor-not-allowed'
            )}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  )
}
