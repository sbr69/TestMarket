import { create } from 'zustand';
import { useToastStore } from './toastStore';

interface WishlistItem {
  productId: string;
  product?: any;
}

interface WishlistState {
  items: WishlistItem[];
  loadedForUserId: string | null;
  pending: Record<string, true>;
  fetchWishlist: (userId: string, token?: string) => Promise<void>;
  toggleWishlist: (productId: string, token?: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

let wishlistRequest: Promise<void> | null = null;
let wishlistRequestUserId: string | null = null;

const authHeaders = (token?: string) => token ? { Authorization: `Bearer ${token}` } : {};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  loadedForUserId: null,
  pending: {},
  
  fetchWishlist: async (userId: string, token?: string) => {
    if (get().loadedForUserId === userId) return;
    if (wishlistRequest && wishlistRequestUserId === userId) return wishlistRequest;

    set({ items: [], loadedForUserId: null });
    wishlistRequestUserId = userId;
    wishlistRequest = (async () => {
      try {
        const res = await fetch('/api/wishlist', { headers: authHeaders(token) });
        if (!res.ok) throw new Error('Wishlist request failed');
        const data = await res.json();
        if (wishlistRequestUserId === userId) {
          set({ items: data.map((item: any) => ({ productId: item.productId, product: item.product })), loadedForUserId: userId });
        }
      } catch (err) {
        console.error('Failed to fetch wishlist', err);
      } finally {
        wishlistRequest = null;
        wishlistRequestUserId = null;
      }
    })();

    return wishlistRequest;
  },
  
  toggleWishlist: async (productId: string, token?: string) => {
    if (get().pending[productId]) return;
    const isWished = get().isInWishlist(productId);
    const previousItems = get().items;
    set({ pending: { ...get().pending, [productId]: true } });
    
    // Optimistic update
    try {
      if (isWished) {
        set({ items: get().items.filter(i => i.productId !== productId) });
        const response = await fetch(`/api/wishlist/${productId}`, {
          method: 'DELETE',
          headers: authHeaders(token)
        });
        if (!response.ok) throw new Error('Wishlist delete failed');
      } else {
        set({ items: [...get().items, { productId }] });
        const response = await fetch(`/api/wishlist/${productId}`, {
          method: 'POST',
          headers: authHeaders(token)
        });
        if (!response.ok) throw new Error('Wishlist create failed');
      }
    } catch {
      // Revert a failed optimistic update to the exact prior state.
      set({ items: previousItems });
      useToastStore.getState().addToast('Wishlist update failed. Your previous selection was restored.', 'error');
    } finally {
      const { [productId]: _, ...pending } = get().pending;
      set({ pending });
    }
  },
  
  isInWishlist: (productId: string) => {
    return get().items.some(item => item.productId === productId);
  }
}));
