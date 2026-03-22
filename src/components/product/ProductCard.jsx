import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { formatPrice, CATEGORY_ICONS } from '@/utils/format'
const clsx = (...c) => c.flat().filter(Boolean).join(' ')

export default function ProductCard({ product, compact = false }) {
  const { isWholesale, isLoggedIn } = useAuth()
  const { addItem } = useCart()
  const price = isWholesale ? product.priceWholesale : product.priceRetail

  return (
    <div className="card group block overflow-hidden relative">
      <Link to={`/productos/${product.id}`}>
        <div className={clsx(
          'relative overflow-hidden bg-botanica-100 dark:bg-botanica-800',
          compact ? 'h-32 sm:h-40' : 'h-40 sm:h-52 md:h-56'
        )}>
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl sm:text-5xl opacity-30">
              🌿
            </div>
          )}

          <span className="absolute top-2 left-2 bg-white/80 dark:bg-botanica-900/80 backdrop-blur-sm text-botanica-700 dark:text-botanica-300 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
            {CATEGORY_ICONS[product.category]} {product.category}
          </span>

          {product.stock > 0 && product.stock <= 5 && (
            <span className="absolute top-2 right-2 bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
              Últimas {product.stock}
            </span>
          )}
          {product.stock === 0 && (
            <span className="absolute top-2 right-2 bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
              Sin stock
            </span>
          )}
        </div>
      </Link>

      <div className="p-3 sm:p-4">
        <h3 className="font-display text-botanica-900 dark:text-botanica-100 font-semibold text-sm sm:text-lg leading-tight mb-1 line-clamp-2">
          {product.name}
        </h3>

        {!compact && (
          <p className="text-botanica-600 dark:text-botanica-400 text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3 font-body hidden sm:block">
            {product.description}
          </p>
        )}

        <div className="flex items-end justify-between gap-1 mt-1 sm:mt-2">
          <div>
            <Link to={`/productos/${product.id}`} className="block">
              <div className="font-mono font-semibold text-botanica-800 dark:text-botanica-200 text-sm sm:text-lg">
                {formatPrice(price)}
              </div>
              {isWholesale && (
                <div className="text-[10px] sm:text-xs text-soil-500 dark:text-soil-400 font-mono">
                  may. · mín. {product.minWholesaleQty}
                </div>
              )}
            </Link>
          </div>
          <button
            onClick={e => {
              e.preventDefault()
              if (isLoggedIn && product.stock > 0) addItem(product)
            }}
            disabled={product.stock === 0 || !isLoggedIn}
            title={isLoggedIn && product.stock > 0 ? 'Agregar al carrito' : !isLoggedIn ? 'Iniciá sesión para comprar' : 'Sin stock'}
            className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full text-white flex items-center justify-center transition-all
              ${isLoggedIn && product.stock > 0
                ? 'bg-botanica-600 hover:bg-botanica-700 active:scale-95'
                : 'bg-botanica-300 dark:bg-botanica-700 cursor-not-allowed opacity-60'
              }`}
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
