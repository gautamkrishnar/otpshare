import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';
import { useAuth } from './useAuth';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => Promise<void>;
  setTheme: (isDark: boolean) => void;
}

const applyTheme = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.add('pf-v6-theme-dark');
  } else {
    document.documentElement.classList.remove('pf-v6-theme-dark');
  }
};

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDarkMode: true,
      setTheme: (isDark: boolean) => {
        applyTheme(isDark);
        set({ isDarkMode: isDark });
      },
      toggleTheme: async () => {
        const newDarkMode = !get().isDarkMode;
        applyTheme(newDarkMode);
        set({ isDarkMode: newDarkMode });

        // Sync with backend only if user is authenticated
        const isAuthenticated = useAuth.getState().isAuthenticated;
        if (isAuthenticated) {
          try {
            await authAPI.updatePreferences(newDarkMode);
          } catch (error) {
            console.error('Failed to save theme preference:', error);
            // Don't revert the theme on error - localStorage still persists it
          }
        }
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // Apply theme on initial load
        if (state) {
          applyTheme(state.isDarkMode);
        }
      },
    },
  ),
);
