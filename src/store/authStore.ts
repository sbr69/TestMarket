import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  token: string | null;
  user: { id: string; name: string; email: string; phone?: string } | null;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (isOpen: boolean) => void;
  setAuth: (token: string, user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthModalOpen: false,
      setAuthModalOpen: (isOpen) => set({ isAuthModalOpen: isOpen }),
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'marketsim-auth',
    }
  )
);
