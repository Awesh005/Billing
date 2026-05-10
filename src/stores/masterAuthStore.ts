import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type MasterUser = {
  id: string;
  email: string;
  name: string;
  role: 'MASTER';
};

interface MasterAuthState {
  user: MasterUser | null;
  token: string | null;
  setAuth: (user: MasterUser, token: string) => void;
  logout: () => void;
}

export const useMasterAuthStore = create<MasterAuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'master-auth-storage',
    }
  )
);
