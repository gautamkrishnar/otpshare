import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';
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
      onRehydrateStorage: () => async (state) => {
        // Verify token exists in localStorage on rehydration
        const token = localStorage.getItem('token');
        if (!token && state) {
          // Token doesn't exist, clear auth state
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          state.isAdmin = false;
          return;
        }

        // If token exists, verify it and get a fresh one
        if (token && state) {
          try {
            const response = await authAPI.verifyToken();
            // Update with fresh token and user data
            localStorage.setItem('token', response.token);
            state.token = response.token;
            state.user = response.user;
            state.isAuthenticated = true;
            state.isAdmin = response.user.role === 'admin';
            // Sync theme with user's preference
            useTheme.getState().setTheme(response.user.dark_mode);
          } catch (error) {
            // Token is invalid, clear auth state
            console.error('Token verification failed:', error);
            localStorage.removeItem('token');
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.isAdmin = false;
          }
        }
      },
    },
  ),
);
