import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { useTheme } from './useTheme';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      login: (user: User, token: string) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true, isAdmin: user.role === 'admin' });

        // Sync theme with user's preference
        useTheme.getState().setTheme(user.dark_mode);
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false, isAdmin: false });
      },
    }),
    {
      name: 'auth-storage',
    },
  ),
);
