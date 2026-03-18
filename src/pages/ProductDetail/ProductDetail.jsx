import { useParams, Link } from 'react-router-dom'
import { useProduct } from '@/hooks/useProducts'
import { useAuth } from '@/context/AuthContext'
import { formatPrice } from '@/utils/format'

export default function ProductDetail() {
  const { id } = useParams()
  const { data: product, isLoading, isError } = useProduct(id)
  const { isWholesale } = useAuth()

  if (isLoading) return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-8 sm:py-12 grid sm:grid-cols-2 gap-6 sm:gap-10">
      <div className="rounded-2xl bg-botanica-100 dark:bg-botanica-800 aspect-square animate-pulse" />
      <div className="space-y-3 sm:space-y-4">
        <div className="h-7 sm:h-8 bg-botanica-100 dark:bg-botanica-800 rounded animate-pulse w-2/3" />
        <div className="h-4 bg-botanica-100 dark:bg-botanica-800 rounded animate-pulse" />
        <div className="h-4 bg-botanica-100 dark:bg-botanica-800 rounded animate-pulse w-3/4" />
      </div>
    </div>
  )

  if (isError || !product) return (
    <div className="text-center py-16 sm:py-24 px-4">
      <p className="font-display text-xl sm:text-2xl text-botanica-700 dark:text-botanica-300 mb-6">
        Producto no encontrado
      </p>
      <Link to="/productos" className="btn-primary">Ver catálogo</Link>
    </div>
  )

  const price = isWholesale ? product.priceWholesale : product.priceRetail

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">

      <Link to="/productos" className="btn-ghost text-xs sm:text-sm mb-4 sm:mb-6 inline-flex items-center gap-1">
        ← Volver al catálogo
      </Link>

      <div className="grid sm:grid-cols-2 gap-6 sm:gap-10 items-start">

        <div className="rounded-2xl overflow-hidden aspect-square bg-botanica-100 dark:bg-botanica-800">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl opacity-20">🌿</div>
          )}
        </div>

        <div>
          <span className="badge-retail mb-2 sm:mb-3 inline-block">{product.category}</span>

          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-botanica-900 dark:text-botanica-50 mb-2 sm:mb-3 leading-tight">
            {product.name}
          </h1>

          <p className="text-botanica-600 dark:text-botanica-400 font-body leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
            {product.description}
          </p>

          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
              {product.tags.map(tag => (
                <span key={tag}
                  className="bg-botanica-50 dark:bg-botanica-800 border border-botanica-200 dark:border-botanica-700
                             text-botanica-600 dark:text-botanica-400 text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="bg-botanica-50 dark:bg-botanica-800/60 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-botanica-600 dark:text-botanica-400">Precio minorista</span>
              <span className={`font-mono font-semibold text-base sm:text-xl ${!isWholesale ? 'text-botanica-900 dark:text-botanica-100' : 'text-botanica-400 line-through'}`}>
                {formatPrice(product.priceRetail)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-soil-600 dark:text-soil-400">
                Precio mayorista{' '}
                <span className="text-[10px] sm:text-xs opacity-70">(mín. {product.minWholesaleQty}u)</span>
              </span>
              <span className={`font-mono font-semibold text-base sm:text-xl ${isWholesale ? 'text-botanica-900 dark:text-botanica-100' : 'text-botanica-400 dark:text-botanica-500'}`}>
                {formatPrice(product.priceWholesale)}
              </span>
            </div>
            {!isWholesale && (
              <p className="text-[10px] sm:text-xs text-soil-500 dark:text-soil-400 pt-1">
                🌿 <Link to="/registro-mayorista" className="underline">Registrate como mayorista</Link> para ver el precio especial
              </p>
            )}
          </div>

          <p className="text-xs sm:text-sm text-botanica-500 dark:text-botanica-400 font-mono mb-4 sm:mb-6">
            Stock:{' '}
            <span className={product.stock <= 5 ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-botanica-700 dark:text-botanica-300'}>
              {product.stock} {product.unit}s disponibles
            </span>
          </p>

          <div className="font-mono font-semibold text-botanica-800 dark:text-botanica-200 text-2xl sm:text-3xl">
            {formatPrice(price)}
          </div>
        </div>
      </div>
    </div>
  )
}
