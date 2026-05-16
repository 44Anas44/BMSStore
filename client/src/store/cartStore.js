import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, qty = 1) => {
        const items = get().items
        const existing = items.find(i => i._id === product._id)
        const maxQty = product.stock ?? Infinity
        if (existing) {
          const newQty = Math.min(existing.qty + qty, maxQty)
          const clamped = newQty < existing.qty + qty
          set({ items: items.map(i => i._id === product._id ? { ...i, qty: newQty } : i) })
          return { added: true, clamped, available: maxQty }
        } else {
          const safeQty = Math.min(qty, maxQty)
          const clamped = safeQty < qty
          set({ items: [...items, { ...product, qty: safeQty }] })
          return { added: true, clamped, available: maxQty }
        }
      },

      removeItem: (id) => set({ items: get().items.filter(i => i._id !== id) }),

      updateQty: (id, qty) => {
        if (qty <= 0) { get().removeItem(id); return }
        set({ items: get().items.map(i => i._id === id ? { ...i, qty } : i) })
      },

      clear: () => set({ items: [] }),
    }),
    { name: '--cart' }
  )
)
