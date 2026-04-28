import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { useProduct } from '@/hooks/useProducts'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { formatPrice, CATEGORY_LABELS } from '@/utils/format'

export default function ProductDetail() {
  const { id } = useParams()
  const { data: product, isLoading, isError } = useProduct(id)
  const { isWholesale, isLoggedIn } = useAuth()
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

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

        {(() => {
          const imgs = (product.images || []).slice(0, 3)
          const [idx, setIdx] = useState(0)
          const cur = idx < imgs.length ? idx : 0
          return (
            <div className="flex flex-col gap-3">
              <div className="relative rounded-2xl overflow-hidden aspect-square bg-botanica-100 dark:bg-botanica-800 group">
                {imgs.length > 0 ? (
                  <img src={imgs[cur]} alt={`${product.name} ${cur + 1}`} className="w-full h-full object-cover transition-opacity duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl opacity-20">🌿</div>
                )}
                {imgs.length > 1 && (
                  <>
                    <button
                      onClick={() => setIdx((cur - 1 + imgs.length) % imgs.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-botanica-900/60 hover:bg-botanica-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setIdx((cur + 1) % imgs.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-botanica-900/60 hover:bg-botanica-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {imgs.map((_, i) => (
                        <button key={i} onClick={() => setIdx(i)}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${i === cur ? 'bg-white w-3' : 'bg-white/50'}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {imgs.length > 1 && (
                <div className="flex gap-2">
                  {imgs.map((src, i) => (
                    <button key={i} onClick={() => setIdx(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === cur ? 'border-botanica-500' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })()}

        <div>
          <span className="badge-retail mb-2 sm:mb-3 inline-block">{CATEGORY_LABELS[product.category] || product.category}</span>

          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-botanica-900 dark:text-botanica-50 mb-2 sm:mb-3 leading-tight">
            {product.name}
          </h1>

          <p className="text-botanica-600 dark:text-botanica-400 font-body leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
            {product.description}
          </p>

          {(product.riego || product.sustrato || product.cuidado) && (
            <div className="flex flex-col gap-3 mt-4 mb-4">
              {product.riego && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
                  <p className="text-[10px] text-blue-500 dark:text-blue-400 font-medium uppercase tracking-wider mb-1">💧 Riego</p>
                  <p className="text-sm text-botanica-800 dark:text-botanica-200">{product.riego}</p>
                </div>
              )}
              {product.sustrato && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-100 dark:border-amber-800">
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium uppercase tracking-wider mb-1">🪨 Sustrato</p>
                  <p className="text-sm text-botanica-800 dark:text-botanica-200">{product.sustrato}</p>
                </div>
              )}
              {product.cuidado && (
                <div className="bg-botanica-50 dark:bg-botanica-800/60 rounded-xl p-3 border border-botanica-200 dark:border-botanica-700">
                  <p className="text-[10px] text-botanica-500 dark:text-botanica-400 font-medium uppercase tracking-wider mb-1">🌿 Cuidado</p>
                  <p className="text-sm text-botanica-800 dark:text-botanica-200">{product.cuidado}</p>
                </div>
              )}
            </div>
          )}

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

          <p className="text-xs sm:text-sm text-botanica-500 dark:text-botanica-400 font-mono mb-4 sm:mb-6">
            Stock:{' '}
            <span className={product.stock <= 5 ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-botanica-700 dark:text-botanica-300'}>
              {product.stock} disponibles
            </span>
          </p>

          <div className="flex flex-col gap-3">
            <div className="font-mono font-semibold text-botanica-800 dark:text-botanica-200 text-2xl sm:text-3xl">
              {formatPrice(price)}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || !isLoggedIn}
              title={!isLoggedIn ? 'Iniciá sesión para comprar' : undefined}
              className="btn-primary self-start flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {added ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Agregado
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {isLoggedIn ? 'Agregar al carrito' : 'Iniciá sesión para comprar'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
