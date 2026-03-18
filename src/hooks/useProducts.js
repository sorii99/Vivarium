import { useInventoryStore } from '@/context/InventoryContext'
import { useMemo } from 'react'

export function useProducts({ category = 'all', search = '' } = {}) {
  const { products } = useInventoryStore()

  const filtered = useMemo(() => {
    let data = products
    if (category && category !== 'all') data = data.filter(p => p.category === category)
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.toLowerCase().includes(q))
      )
    }
    return data
  }, [products, category, search])

  return {
    data: { products: filtered, total: filtered.length },
    isLoading: false,
    isError: false,
  }
}

export function useProduct(id) {
  const { products } = useInventoryStore()
  const product = useMemo(
    () => products.find(p => p.id === id || p.slug === id) || null,
    [products, id]
  )
  return { data: product, isLoading: false, isError: !product && !!id }
}

export function useFeaturedProducts() {
  const { products } = useInventoryStore()
  const featured = useMemo(() => products.filter(p => p.featured), [products])
  return { data: featured, isLoading: false }
}

export function useInventory({ category = 'all', search = '' } = {}) {
  const { products } = useInventoryStore()

  const filtered = useMemo(() => {
    let data = products
    if (category !== 'all') data = data.filter(p => p.category === category)
    if (search) data = data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    return data
  }, [products, category, search])

  return { data: filtered, isLoading: false, refetch: () => {} }
}
