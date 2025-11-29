import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: true,
      toggleTheme: () =>
        set((state) => {
          const newDarkMode = !state.isDarkMode;
          // Update document class for PatternFly dark theme
          if (newDarkMode) {
            document.documentElement.classList.add('pf-v6-theme-dark');
          } else {
            document.documentElement.classList.remove('pf-v6-theme-dark');
          }
          return { isDarkMode: newDarkMode };
        }),
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // Apply theme on initial load
        if (state?.isDarkMode) {
          document.documentElement.classList.add('pf-v6-theme-dark');
        } else {
          document.documentElement.classList.remove('pf-v6-theme-dark');
        }
      },
    },
  ),
);
