import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import {
  isSupabaseEnabled,
  dbLoadAll, dbInsert, dbUpdate, dbDelete, dbDeleteAll,
} from '@/services/supabase'

const InventoryContext = createContext(null)
const STORAGE_KEY = 'botanica_inventory'

function lsLoad() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch { return null }
}

function lsSave(products) {
  try {
    const json = JSON.stringify(products)
    if (json.length > 4 * 1024 * 1024) {
      const stripped = products.map(p => ({
        ...p, images: (p.images || []).filter(img => !img.startsWith('data:')),
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped))
    } else {
      localStorage.setItem(STORAGE_KEY, json)
    }
  } catch (e) { console.warn('localStorage save error:', e) }
}

function lsClear() { localStorage.removeItem(STORAGE_KEY) }

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function InventoryProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncMode, setSyncMode] = useState(isSupabaseEnabled ? 'supabase' : 'local')
  const pendingOps = useRef([])
  useEffect(() => {
    async function init() {
      if (isSupabaseEnabled) {
        const remote = await dbLoadAll()
        if (remote !== null) {
          setProducts(remote)
          setSyncMode('supabase')
          setLoading(false)
          return
        }
        console.warn('Supabase unavailable, using localStorage')
      }
      setSyncMode('local')
      setProducts(lsLoad() ?? [])
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (!loading && syncMode === 'local') lsSave(products)
  }, [products, loading, syncMode])

  const addProduct = useCallback(async (product) => {
    const id = String(Date.now())
    const newProduct = {
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
      featured: product.featured || false,
    }
    setProducts(prev => [...prev, newProduct])
    if (syncMode === 'supabase') await dbInsert(newProduct)
    return id
  }, [syncMode])

  const updateProduct = useCallback(async (id, changes) => {
    setProducts(prev => prev.map(p =>
      p.id === id ? {
        ...p, ...changes,
        priceRetail: changes.priceRetail !== undefined ? Number(changes.priceRetail) : p.priceRetail,
        priceWholesale: changes.priceWholesale !== undefined ? Number(changes.priceWholesale) : p.priceWholesale,
        minWholesaleQty: changes.minWholesaleQty !== undefined ? Number(changes.minWholesaleQty) : p.minWholesaleQty,
        stock: changes.stock !== undefined ? Number(changes.stock) : p.stock,
      } : p
    ))
    if (syncMode === 'supabase') await dbUpdate(id, changes)
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
    if (syncMode === 'supabase') await dbDelete(id)
  }, [syncMode])

  const resetToDefaults = useCallback(async () => {
    setProducts([])
    if (syncMode === 'supabase') await dbDeleteAll()
    else lsClear()
  }, [syncMode])

  const stats = {
    total: products.length,
    interior: products.filter(p => p.category === 'interior').length,
    exterior: products.filter(p => p.category === 'exterior').length,
    insumos: products.filter(p => p.category === 'insumos').length,
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
