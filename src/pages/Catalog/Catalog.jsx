import { useState, useRef, useEffect, useCallback } from 'react'
const dropdownRegistry = new Set()
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '@/hooks/useProducts'
import ProductCard from '@/components/product/ProductCard'
import { CATEGORIES } from '@/services/productService'
const clsx = (...c) => c.flat().filter(Boolean).join(' ')

function CategoryDropdown({ cat, active, onSelect }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef()
  const dropRef = useRef()
  const isActive = active === cat.id || cat.children?.some(sc => sc.id === active)

  useEffect(() => {
    dropdownRegistry.add(setOpen)
    return () => dropdownRegistry.delete(setOpen)
  }, [])

  const closeOthers = useCallback(() => {
    dropdownRegistry.forEach(s => { if (s !== setOpen) s(false) })
  }, [])

  const reposition = useCallback(() => {
    if (!btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX })
  }, [])

  const closeTimer = useRef(null)

  const openDropdown = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeOthers()
    reposition()
    setOpen(true)
  }

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (
        dropRef.current && !dropRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    window.addEventListener('scroll', () => setOpen(false), { passive: true })
    return () => {
      document.removeEventListener('mousedown', close)
      window.removeEventListener('scroll', () => setOpen(false))
    }
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => { onSelect(cat.id); if (open) setOpen(false); else openDropdown() }}
        onMouseEnter={openDropdown}
        onMouseLeave={scheduleClose}
        className={clsx(
          'flex items-center gap-1 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-body transition-all duration-200 whitespace-nowrap shrink-0',
          isActive
            ? 'bg-white dark:bg-botanica-700 shadow-sm text-botanica-800 dark:text-botanica-100 font-medium'
            : 'text-botanica-600 dark:text-botanica-400 hover:text-botanica-800 dark:hover:text-botanica-200'
        )}
      >
        {cat.label}
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && createPortal(
        <div
          ref={dropRef}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 9999 }}
          className="bg-white dark:bg-botanica-900 border border-botanica-200 dark:border-botanica-700 rounded-xl shadow-xl min-w-[160px] py-1 overflow-hidden"
        >
          <button
            onClick={() => { onSelect(cat.id); setOpen(false) }}
            className={clsx(
              'w-full text-left px-3 py-1.5 text-xs font-body transition-colors',
              active === cat.id
                ? 'bg-botanica-100 dark:bg-botanica-800 text-botanica-800 dark:text-botanica-100 font-medium'
                : 'text-botanica-600 dark:text-botanica-400 hover:bg-botanica-50 dark:hover:bg-botanica-800'
            )}
          >
            Ver todas
          </button>
          <div className="border-t border-botanica-100 dark:border-botanica-800 my-1" />
          {cat.children.map(sub => (
            <button
              key={sub.id}
              onClick={() => { onSelect(sub.id); setOpen(false) }}
              className={clsx(
                'w-full text-left px-3 py-1.5 text-xs font-body transition-colors',
                active === sub.id
                  ? 'bg-botanica-100 dark:bg-botanica-800 text-botanica-800 dark:text-botanica-100 font-medium'
                  : 'text-botanica-600 dark:text-botanica-400 hover:bg-botanica-50 dark:hover:bg-botanica-800'
              )}
            >
              {sub.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}

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
          <input type="text" placeholder="Buscar plantas, insumos…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 text-sm" />
        </div>

        <div
          className="flex gap-1.5 bg-botanica-100 dark:bg-botanica-800 rounded-2xl p-1.5 overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <button
            onClick={() => setCategory('all')}
            className={clsx(
              'px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-body transition-all duration-200 whitespace-nowrap shrink-0',
              category === 'all'
                ? 'bg-white dark:bg-botanica-700 shadow-sm text-botanica-800 dark:text-botanica-100 font-medium'
                : 'text-botanica-600 dark:text-botanica-400 hover:text-botanica-800 dark:hover:text-botanica-200'
            )}
          >
            Todos
          </button>

          {CATEGORIES.filter(c => c.id !== 'all').map(cat =>
            cat.children ? (
              <CategoryDropdown key={cat.id} cat={cat} active={category} onSelect={setCategory} />
            ) : (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={clsx(
                  'px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-body transition-all duration-200 whitespace-nowrap shrink-0',
                  category === cat.id
                    ? 'bg-white dark:bg-botanica-700 shadow-sm text-botanica-800 dark:text-botanica-100 font-medium'
                    : 'text-botanica-600 dark:text-botanica-400 hover:text-botanica-800 dark:hover:text-botanica-200'
                )}
              >
                {cat.label}
              </button>
            )
          )}
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
