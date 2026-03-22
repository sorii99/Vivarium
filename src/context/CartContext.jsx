import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const CartContext = createContext(null)
const LS_KEY = 'botanica_cart'

function lsLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => lsLoad())
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(items)) } catch { }
  }, [items])

  const addItem = useCallback((product) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        image: product.images?.[0] || '',
        price: product.priceRetail,
        unit: product.unit,
        stock: product.stock,
        qty: 1,
      }]
    })
    setOpen(true)
  }, [])

  const removeItem = useCallback((id) => setItems(prev => prev.filter(i => i.id !== id)), [])

  const updateQty = useCallback((id, qty) => {
    if (qty <= 0) return removeItem(id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.min(qty, i.stock) } : i))
  }, [removeItem])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((s, i) => s + i.qty, 0)
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <CartContext.Provider value={{
      items, open, setOpen,
      addItem, removeItem, updateQty, clearCart,
      totalItems, subtotal,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
