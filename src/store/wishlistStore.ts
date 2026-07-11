import { create } from 'zustand';

interface WishlistItem {
  productId: string;
  product?: any;
}

interface WishlistState {
  items: WishlistItem[];
  fetchWishlist: (token: string) => Promise<void>;
  toggleWishlist: (productId: string, token: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  
  fetchWishlist: async (token: string) => {
    try {
      const res = await fetch('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        set({ items: data.map((item: any) => ({ productId: item.productId, product: item.product })) });
      }
    } catch (err) {
      console.error('Failed to fetch wishlist', err);
    }
  },
  
  toggleWishlist: async (productId: string, token: string) => {
    const isWished = get().isInWishlist(productId);
    
    // Optimistic update
    if (isWished) {
      set({ items: get().items.filter(i => i.productId !== productId) });
      try {
        await fetch(`/api/wishlist/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        // Revert on failure
        set({ items: [...get().items, { productId }] });
      }
    } else {
      set({ items: [...get().items, { productId }] });
      try {
        await fetch(`/api/wishlist/${productId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        // Revert on failure
        set({ items: get().items.filter(i => i.productId !== productId) });
      }
    }
  },
  
  isInWishlist: (productId: string) => {
    return get().items.some(item => item.productId === productId);
  }
}));
