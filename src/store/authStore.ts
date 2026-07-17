import { create } from 'zustand';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface AuthStore {
  user: AuthUser | null;
  isAuthModalOpen: boolean;
  sessionResolved: boolean;
  setAuthModalOpen: (isOpen: boolean) => void;
  setAuth: (user: AuthUser) => void;
  restoreSession: () => Promise<void>;
  logout: () => Promise<void>;
}

let sessionRequest: Promise<void> | null = null;

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthModalOpen: false,
  sessionResolved: false,
  setAuthModalOpen: (isOpen) => set({ isAuthModalOpen: isOpen }),
  setAuth: (user) => set({ user, sessionResolved: true }),
  restoreSession: async () => {
    if (sessionRequest) return sessionRequest;

    sessionRequest = (async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          set({ user: null, sessionResolved: true });
          return;
        }
        set({ user: await response.json(), sessionResolved: true });
      } catch {
        set({ user: null, sessionResolved: true });
      } finally {
        sessionRequest = null;
      }
    })();

    return sessionRequest;
  },
  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      set({ user: null, sessionResolved: true, isAuthModalOpen: false });
    }
  },
}));
