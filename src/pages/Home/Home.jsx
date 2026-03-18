import { Link } from 'react-router-dom'
import { useFeaturedProducts } from '@/hooks/useProducts'
import { useInventoryStore } from '@/context/InventoryContext'
import ProductCard from '@/components/product/ProductCard'

export default function Home() {
  const { data: featured, isLoading } = useFeaturedProducts()
  const { stats } = useInventoryStore()

  return (
    <div>
      <section className="relative bg-botanica-900 dark:bg-botanica-950 text-white overflow-hidden min-h-[60vh] sm:min-h-[70vh] flex items-center">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #4a8539 0%, transparent 60%), radial-gradient(circle at 80% 20%, #386a2b 0%, transparent 50%)'
        }} />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="animate-fade-up">
            <span className="inline-block bg-botanica-600/30 text-botanica-200 text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5 rounded-full mb-4 sm:mb-6 font-body">
              🌿 Plantas y Jardinería
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-tight mb-4 sm:mb-6">
              Tu espacio,<br />
              <em className="text-botanica-300 not-italic">vivo</em> y verde
            </h1>
            <p className="text-botanica-300 text-base sm:text-lg mb-6 sm:mb-8 max-w-lg font-body leading-relaxed">
              Plantas de interior, exterior <br />e insumos de jardinería.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {[
              { emoji: '🪴', label: 'Interior', count: stats.interior },
              { emoji: '🌳', label: 'Exterior', count: stats.exterior },
              { emoji: '🌱', label: 'Insumos', count: stats.insumos },
            ].map(({ emoji, label, count }) => (
              <Link key={label} to={`/productos?cat=${label.toLowerCase()}`}
                className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center transition-all duration-300 hover:-translate-y-1">
                <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">{emoji}</div>
                <div className="font-display text-white text-xs sm:text-lg leading-tight">{label}</div>
                <div className="text-botanica-400 text-[10px] sm:text-sm font-mono mt-0.5">{count}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="flex items-end justify-between mb-6 sm:mb-10">
          <div>
            <p className="text-botanica-500 dark:text-botanica-400 text-xs sm:text-sm mb-1 font-body tracking-wide uppercase">
              Destacados
            </p>
          </div>
          <Link to="/productos" className="btn-ghost text-xs sm:text-sm shrink-0">Ver todos →</Link>
        </div>

        {featured?.length === 0 && !isLoading ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">🌱</span>
            <p className="font-display text-xl text-botanica-700 dark:text-botanica-300 mb-2">El catálogo está vacío</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card h-56 sm:h-72 animate-pulse bg-botanica-100 dark:bg-botanica-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {(featured || []).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
