import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import {
  isSupabaseEnabled,
  dbLoadAll, dbInsert, dbUpdate, dbDelete, dbDeleteAll, uploadImage,
} from '@/services/supabase'

const InventoryContext = createContext(null)
const STORAGE_KEY = 'botanica_inventory'
const IMAGES_KEY = 'botanica_images'

function imgCacheLoad() {
  try { return JSON.parse(localStorage.getItem(IMAGES_KEY) || '{}') } catch { return {} }
}
function imgCacheSave(map) {
  try { localStorage.setItem(IMAGES_KEY, JSON.stringify(map)) } catch { }
}
function imgCacheSet(id, b64Array) {
  const m = imgCacheLoad()
  if (b64Array.length > 0) m[id] = b64Array
  else delete m[id]
  imgCacheSave(m)
}
function imgCacheDel(id) {
  const m = imgCacheLoad()
  delete m[id]
  imgCacheSave(m)
}

function rehydrate(products) {
  const map = imgCacheLoad()
  if (Object.keys(map).length === 0) return products
  return products.map(p =>
    map[p.id]
      ? { ...p, images: [...map[p.id], ...(p.images || []).filter(i => !i.startsWith('data:'))] }
      : p
  )
}

function lsLoad() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch { return null }
}

function lsSave(products) {
  try {
    const stripped = products.map(p => ({
      ...p,
      images: (p.images || []).filter(img => !img.startsWith('data:')),
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped))
    const map = {}
    products.forEach(p => {
      const b64 = (p.images || []).filter(img => img.startsWith('data:'))
      if (b64.length > 0) map[p.id] = b64
    })
    imgCacheSave(map)
  } catch (e) { console.warn('lsSave error:', e) }
}

function lsClear() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(IMAGES_KEY)
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function uploadBase64Images(images) {
  if (!isSupabaseEnabled) return images
  return Promise.all(images.map(async (img) => {
    if (!img.startsWith('data:')) return img
    try {
      const res = await fetch(img)
      const blob = await res.blob()
      const ext = blob.type.split('/')[1] || 'jpg'
      const file = new File([blob], `upload.${ext}`, { type: blob.type })
      const url = await uploadImage(file)
      return url || img
    } catch { return img }
  }))
}

export function InventoryProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncMode, setSyncMode] = useState(isSupabaseEnabled ? 'supabase' : 'local')

  useEffect(() => {
    async function init() {
      if (isSupabaseEnabled) {
        const remote = await dbLoadAll()
        if (remote !== null) {
          setProducts(rehydrate(remote))
          setSyncMode('supabase')
          setLoading(false)
          return
        }
        console.warn('Supabase unavailable, falling back to localStorage')
      }
      setSyncMode('local')
      const local = lsLoad()
      setProducts(local ? rehydrate(local) : [])
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (!loading && syncMode === 'local') lsSave(products)
  }, [products, loading, syncMode])

  const addProduct = useCallback(async (product) => {
    const id = String(Date.now())
    let newProduct = {
      id, slug: id,
      name: product.name || '',
      category: product.category || 'interior',
      description: product.description || '',
      tags: product.tags || [],
      priceRetail: Number(product.priceRetail) || 0,
      priceWholesale: Number(product.priceWholesale) || 0,
      minWholesaleQty: Number(product.minWholesaleQty) || 1,
      stock: Number(product.stock) || 0,
      unit: product.unit || 'planta',
      images: product.images || [],
      riego: product.riego || '',
      sustrato: product.sustrato || '',
      cuidado: product.cuidado || '',
      featured: product.featured || false,
    }

    let finalImages = newProduct.images || []
    if (syncMode === 'supabase' && finalImages.some(img => img.startsWith('data:'))) {
      finalImages = await uploadBase64Images(finalImages)
      newProduct = { ...newProduct, images: finalImages }
    }

    setProducts(prev => [...prev, newProduct])

    const b64 = finalImages.filter(img => img.startsWith('data:'))
    if (b64.length > 0) imgCacheSet(id, b64)

    if (syncMode === 'supabase') {
      await dbInsert(newProduct)
    }

    return id
  }, [syncMode])

  const updateProduct = useCallback(async (id, changes_) => {
    let changes = { ...changes_ }
    if (changes.images && syncMode === 'supabase' && changes.images.some(img => img.startsWith('data:'))) {
      changes = { ...changes, images: await uploadBase64Images(changes.images) }
    }

    setProducts(prev => prev.map(p =>
      p.id === id ? {
        ...p, ...changes,
        priceRetail: changes.priceRetail !== undefined ? Number(changes.priceRetail) : p.priceRetail,
        priceWholesale: changes.priceWholesale !== undefined ? Number(changes.priceWholesale) : p.priceWholesale,
        minWholesaleQty: changes.minWholesaleQty !== undefined ? Number(changes.minWholesaleQty) : p.minWholesaleQty,
        stock: changes.stock !== undefined ? Number(changes.stock) : p.stock,
      } : p
    ))

    if (changes.images !== undefined) {
      const b64 = changes.images.filter(img => img.startsWith('data:'))
      imgCacheSet(id, b64)
    }

    if (syncMode === 'supabase') {
      await dbUpdate(id, changes)
    }
  }, [syncMode])

  const adjustStock = useCallback(async (id, delta) => {
    let newStock
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p
      newStock = Math.max(0, p.stock + delta)
      return { ...p, stock: newStock }
    }))
    if (syncMode === 'supabase') await dbUpdate(id, { stock: newStock })
  }, [syncMode])

  const deleteProduct = useCallback(async (id) => {
    setProducts(prev => prev.filter(p => p.id !== id))
    imgCacheDel(id)
    if (syncMode === 'supabase') await dbDelete(id)
  }, [syncMode])

  const resetToDefaults = useCallback(async () => {
    setProducts([])
    lsClear()
    if (syncMode === 'supabase') await dbDeleteAll()
  }, [syncMode])

  const stats = {
    total: products.length,
    interior: products.filter(p => p.category?.startsWith('interior')).length,
    exterior: products.filter(p => p.category?.startsWith('exterior')).length,
    kits: products.filter(p => p.category === 'kits').length,
    insumos: products.filter(p => p.category === 'insumos').length,
    quimicos: products.filter(p => p.category === 'quimicos').length,
    fertilizantes: products.filter(p => p.category === 'fertilizantes').length,
    macetas: products.filter(p => p.category?.startsWith('macetas')).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 5).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalStockValue: products.reduce((s, p) => s + p.priceRetail * p.stock, 0),
    totalStockValueWholesale: products.reduce((s, p) => s + p.priceWholesale * p.stock, 0),
  }

  return (
    <InventoryContext.Provider value={{
      products, stats, loading, syncMode,
      addProduct, updateProduct, adjustStock, deleteProduct, resetToDefaults,
    }}>
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventoryStore() {
  const ctx = useContext(InventoryContext)
  if (!ctx) throw new Error('useInventoryStore must be used within InventoryProvider')
  return ctx
}
