import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useToastStore } from './toastStore';

export interface CartItem {
  id: string; // productId
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (productId, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(item => item.id === productId);
          if (existingItem) {
            return {
              items: state.items.map(item => 
                item.id === productId 
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            };
          }
          return { items: [...state.items, { id: productId, quantity }] };
        });
        useToastStore.getState().addToast('Item added to cart!', 'success');
      },
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(item => item.id !== productId)
      })),
      updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map(item => 
          item.id === productId ? { ...item, quantity } : item
        )
      })),
      clearCart: () => set({ items: [] })
    }),
    {
      name: 'marketsim-cart-storage',
    }
  )
);
