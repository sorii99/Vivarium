import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '@/hooks/useProducts'
import ProductCard from '@/components/product/ProductCard'
import { CATEGORIES } from '@/services/productService'
const clsx = (...c) => c.flat().filter(Boolean).join(' ')

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const category = searchParams.get('cat') || 'all'

  const setCategory = (cat) => {
    if (cat === 'all') searchParams.delete('cat')
    else searchParams.set('cat', cat)
    setSearchParams(searchParams)
  }

  const { data, isLoading } = useProducts({ category, search })
  const products = data?.products || []

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">

      <div className="mb-6 sm:mb-8">
        <h1 className="section-title text-2xl sm:text-3xl md:text-4xl mb-1">Catálogo</h1>
        <p className="text-botanica-500 dark:text-botanica-400 text-sm font-body">
          {data?.total ?? '—'} productos disponibles
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-6 sm:mb-8">
        <div className="relative w-full sm:max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-botanica-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input type="text" placeholder="Buscar..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 text-sm" />
        </div>

        <div className="flex flex-wrap gap-1 bg-botanica-100 dark:bg-botanica-800 rounded-2xl p-1">
          {CATEGORIES.map(({ id, label }) => (
            <button key={id} onClick={() => setCategory(id)}
              className={clsx(
                'px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-body transition-all duration-200 whitespace-nowrap',
                category === id
                  ? 'bg-white dark:bg-botanica-700 shadow-sm text-botanica-800 dark:text-botanica-100 font-medium'
                  : 'text-botanica-600 dark:text-botanica-400 hover:text-botanica-800 dark:hover:text-botanica-200'
              )}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card h-56 sm:h-72 animate-pulse bg-botanica-100 dark:bg-botanica-800" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 sm:py-20">
          <span className="text-4xl sm:text-5xl block mb-4">🔍</span>
          <p className="font-display text-lg sm:text-xl text-botanica-700 dark:text-botanica-300">Sin resultados</p>
          <p className="text-botanica-400 text-sm mt-1">No encontramos lo que buscabas</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
