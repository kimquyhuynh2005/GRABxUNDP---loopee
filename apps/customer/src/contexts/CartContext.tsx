import { createContext, useContext, useState } from 'react'

export interface CartItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  restaurantId: string
  restaurantName: string
}

interface CartCtx {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  updateQty: (menuItemId: string, qty: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  restaurantId: string | null
  restaurantName: string | null
}

const CartContext = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      if (prev.length > 0 && prev[0].restaurantId !== item.restaurantId) {
        return [{ ...item, quantity: 1 }]
      }
      const found = prev.find(i => i.menuItemId === item.menuItemId)
      if (found) {
        return prev.map(i => i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const updateQty = (menuItemId: string, qty: number) => {
    setItems(prev =>
      qty <= 0
        ? prev.filter(i => i.menuItemId !== menuItemId)
        : prev.map(i => i.menuItemId === menuItemId ? { ...i, quantity: qty } : i)
    )
  }

  const clearCart = () => setItems([])

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      updateQty,
      clearCart,
      totalItems: items.reduce((s, i) => s + i.quantity, 0),
      totalPrice: items.reduce((s, i) => s + i.price * i.quantity, 0),
      restaurantId: items[0]?.restaurantId ?? null,
      restaurantName: items[0]?.restaurantName ?? null,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be within CartProvider')
  return ctx
}
