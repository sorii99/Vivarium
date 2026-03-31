import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  isSupabaseEnabled,
  dbLoadBanners, dbInsertBanner, dbUpdateBanner, dbDeleteBanner,
} from '@/services/supabase'

const BannerContext = createContext(null)
const LS_KEY = 'botanica_banners'
const LS_INIT_KEY = 'botanica_banners_initialized'

function lsLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw !== null ? JSON.parse(raw) : null
  } catch { return null }
}

function lsSave(banners) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(banners))
    localStorage.setItem(LS_INIT_KEY, '1')
  } catch { }
}

function lsIsInitialized() {
  return localStorage.getItem(LS_INIT_KEY) === '1'
}

const DEFAULT_BANNERS = [
  {
    id: '1',
    position: 0,
    tag: '🌿 Novedad',
    title: 'Plantas de temporada',
    subtitle: 'Interior · Exterior · Insumos',
    desc: 'Renovamos el stock cada semana con las mejores variedades seleccionadas.',
    cta: 'Ver catálogo',
    to: '/productos',
    accent: '#6ba35a',
    image: '',
  },
  {
    id: '2',
    position: 1,
    tag: '💰 Precios mayoristas',
    title: 'Comprá en volumen',
    subtitle: 'Precios especiales para revendedores',
    desc: 'Mínimos por categoría, atención personalizada y entregas programadas.',
    cta: 'Registrarme',
    to: '/registro-mayorista',
    accent: '#97c188',
    image: '',
  },
  {
    id: '3',
    position: 2,
    tag: '🌱 Insumos',
    title: 'Todo para tu jardín',
    subtitle: 'Sustratos · Fertilizantes · Macetas',
    desc: 'Los mejores insumos para que tus plantas crezcan sanas.',
    cta: 'Ver insumos',
    to: '/productos?cat=insumos',
    accent: '#4a8539',
    image: '',
  },
]

export function BannerProvider({ children }) {
  const [banners, setBanners] = useState(() => {
    if (isSupabaseEnabled) return []
    try {
      if (lsIsInitialized()) {
        const saved = lsLoad()
        if (saved !== null) return saved
      }
    } catch { }
    return DEFAULT_BANNERS
  })

  const [ready, setReady] = useState(false)
  const [syncMode, setSyncMode] = useState('local')

  useEffect(() => {
    async function init() {
      if (isSupabaseEnabled) {
        const remote = await dbLoadBanners()

        if (remote !== null) {
          setSyncMode('supabase')

          if (remote.length > 0) {
            setBanners(remote)
            localStorage.setItem('botanica_banners_seeded', '1')
            setReady(true)
            return
          }

          const alreadySeeded = localStorage.getItem('botanica_banners_seeded') === '1'
          if (alreadySeeded) {
            setBanners([])
            setReady(true)
            return
          }

          const localBanners = (lsIsInitialized() && lsLoad()?.length > 0)
            ? lsLoad()
            : DEFAULT_BANNERS

          for (const b of localBanners) {
            await dbInsertBanner(b)
          }
          localStorage.setItem('botanica_banners_seeded', '1')
          setBanners(localBanners)
          setReady(true)
          return
        }
      }

      if (lsIsInitialized()) {
        setBanners(lsLoad() ?? [])
      } else {
        lsSave(DEFAULT_BANNERS)
        setBanners(DEFAULT_BANNERS)
      }
      setReady(true)
    }

    init()
  }, [])

  useEffect(() => {
    if (!ready || syncMode !== 'local') return
    lsSave(banners)
  }, [banners, ready, syncMode])

  const addBanner = useCallback(async (banner) => {
    const id = String(Date.now())
    const newBanner = { ...banner, id, position: banners.length }
    setBanners(prev => [...prev, newBanner])
    if (syncMode === 'supabase') await dbInsertBanner(newBanner)
  }, [banners.length, syncMode])

  const updateBanner = useCallback(async (id, changes) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, ...changes } : b))
    if (syncMode === 'supabase') await dbUpdateBanner(id, changes)
  }, [syncMode])

  const deleteBanner = useCallback(async (id) => {
    setBanners(prev => prev.filter(b => b.id !== id).map((b, i) => ({ ...b, position: i })))
    if (syncMode === 'supabase') await dbDeleteBanner(id)
  }, [syncMode])

  const moveBanner = useCallback(async (id, dir) => {
    setBanners(prev => {
      const arr = [...prev]
      const idx = arr.findIndex(b => b.id === id)
      const newIdx = idx + dir
      if (newIdx < 0 || newIdx >= arr.length) return prev
        ;[arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]]
      return arr.map((b, i) => ({ ...b, position: i }))
    })
    if (syncMode === 'supabase') {
      setTimeout(() => {
        setBanners(current => {
          current.forEach(b => dbUpdateBanner(b.id, { position: b.position }))
          return current
        })
      }, 100)
    }
  }, [syncMode])

  return (
    <BannerContext.Provider value={{ banners, ready, syncMode, addBanner, updateBanner, deleteBanner, moveBanner }}>
      {children}
    </BannerContext.Provider>
  )
}

export function useBanners() {
  const ctx = useContext(BannerContext)
  if (!ctx) throw new Error('useBanners must be used within BannerProvider')
  return ctx
}
