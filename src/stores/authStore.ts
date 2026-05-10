import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF';
}

export interface Shop {
  id: string;
  name: string;
  gst_number?: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  invoice_prefix?: string;
}

interface AuthState {
  user: User | null;
  shop: Shop | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, shop: Shop, token: string) => void;
  updateShop: (shop: Partial<Shop>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      shop: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, shop, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
        set({ user, shop, token, isAuthenticated: true });
      },

      updateShop: (shopData) =>
        set((state) => ({ shop: state.shop ? { ...state.shop, ...shopData } : null })),

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        set({ user: null, shop: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, shop: state.shop, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
