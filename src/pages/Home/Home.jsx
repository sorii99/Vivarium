import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useFeaturedProducts } from '@/hooks/useProducts'
import { useInventoryStore } from '@/context/InventoryContext'
import { useBanners } from '@/context/BannerContext'
import ProductCard from '@/components/product/ProductCard'

export default function Home() {
  const { data: featured, isLoading } = useFeaturedProducts()
  const { stats } = useInventoryStore()

  const { banners, ready } = useBanners()
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const goTo = useCallback((idx) => {
    setLeaving(true)
    setTimeout(() => {
      setActive(idx)
      setLeaving(false)
    }, 280)
  }, [])

  useEffect(() => {
    if (paused || banners.length === 0) return
    const t = setInterval(() => {
      goTo((active + 1) % banners.length)
    }, 5000)
    return () => clearInterval(t)
  }, [active, paused, goTo, banners.length])

  const safeActive = banners.length > 0 ? Math.min(active, banners.length - 1) : 0
  const banner = banners[safeActive] ?? null

  return (
    <div>
      {ready && banners.length > 0 && banner && (
        <div
          className="bg-botanica-900 dark:bg-botanica-950 pb-3 sm:pb-4"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #4a8539 0%, transparent 60%), radial-gradient(circle at 80% 20%, #386a2b 0%, transparent 50%)' }}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div
              className="relative overflow-hidden rounded-b-2xl sm:rounded-b-3xl bg-botanica-50/90 dark:bg-botanica-950/90 backdrop-blur-md border border-botanica-200 dark:border-botanica-800 transition-colors duration-200"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 10% 50%, ${banner.accent}20 0%, transparent 60%)` }} />

              <div
                className="relative"
                style={{ opacity: leaving ? 0 : 1, transform: leaving ? 'translateY(4px)' : 'translateY(0)', transition: 'opacity 0.25s ease, transform 0.25s ease' }}
              >
                <div className="flex items-stretch">
                  <div className="flex-1 min-w-0 px-5 sm:px-8 py-5 sm:py-6 flex flex-col justify-center">
                    {banner.tag && (
                      <span className="inline-block self-start text-[10px] sm:text-xs font-body px-2.5 py-0.5 rounded-full mb-2"
                        style={{ background: `${banner.accent}20`, color: banner.accent, border: `1px solid ${banner.accent}40` }}>
                        {banner.tag}
                      </span>
                    )}

                    <h2 className="font-display text-lg sm:text-2xl md:text-3xl text-botanica-900 dark:text-white leading-tight mb-0.5">
                      {banner.title}
                    </h2>
                    {banner.subtitle && (
                      <p className="font-body text-xs sm:text-sm mb-2 sm:mb-3" style={{ color: banner.accent }}>
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.desc && (
                      <p className="font-body text-botanica-600 dark:text-botanica-400 text-xs sm:text-sm max-w-sm leading-relaxed mb-3 sm:mb-4 hidden sm:block">
                        {banner.desc}
                      </p>
                    )}

                    {banner.cta && (
                      <Link to={banner.to}
                        className="inline-flex self-start items-center gap-1.5 text-xs sm:text-sm font-body font-medium px-4 py-1.5 sm:px-5 sm:py-2 rounded-full transition-all duration-200 active:scale-95"
                        style={{ background: banner.accent, color: '#fff' }}>
                        {banner.cta} →
                      </Link>
                    )}
                  </div>

                  {banner.image && (
                    <div className="hidden sm:block w-40 md:w-56 shrink-0 relative overflow-hidden">
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="absolute inset-0 w-full h-full object-cover object-center"
                      />
                      <div className="absolute inset-y-0 left-0 w-12 pointer-events-none"
                        style={{ background: 'linear-gradient(to right, #0f1f0d, transparent)' }} />
                    </div>
                  )}

                  <div className="flex flex-col items-center justify-center gap-1.5 px-3 sm:px-4 shrink-0">
                    {banners.map((b, i) => (
                      <button
                        key={b.id}
                        onClick={() => goTo(i)}
                        aria-label={`Banner ${i + 1}`}
                        className="rounded-full focus:outline-none transition-all duration-300"
                        style={{
                          width: '6px',
                          height: i === safeActive ? '20px' : '6px',
                          background: i === safeActive ? banner?.accent : `${banner?.accent}50`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3">
            {[
              { emoji: '🪴', label: 'Interior', cat: 'interior', count: stats.interior },
              { emoji: '🌳', label: 'Exterior', cat: 'exterior', count: stats.exterior },
              { emoji: '🌱', label: 'Insumos', cat: 'insumos', count: stats.insumos },
              { emoji: '🧪', label: 'Químicos', cat: 'quimicos', count: stats.quimicos },
              { emoji: '🌿', label: 'Fertilizantes', cat: 'fertilizantes', count: stats.fertilizantes },
              { emoji: '🏺', label: 'Macetas', cat: 'macetas', count: stats.macetas },
            ].map(({ emoji, label, cat, count }) => (
              <Link key={cat} to={`/productos?cat=${cat}`}
                className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-2 sm:p-4 text-center transition-all duration-300 hover:-translate-y-1">
                <div className="text-xl sm:text-3xl mb-1">{emoji}</div>
                <div className="font-display text-white text-[10px] sm:text-sm leading-tight">{label}</div>
                <div className="text-botanica-400 text-[9px] sm:text-xs font-mono mt-0.5">{count}</div>
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
            <h2 className="section-title text-2xl sm:text-3xl md:text-4xl">Más buscados</h2>
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
