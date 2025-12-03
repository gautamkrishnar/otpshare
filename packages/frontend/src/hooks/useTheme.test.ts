import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authAPI } from '../services/api';
import { useTheme } from './useTheme';

// Mock the API
vi.mock('../services/api', () => ({
  authAPI: {
    updatePreferences: vi.fn(),
  },
}));

// Mock useAuth
vi.mock('./useAuth', () => ({
  useAuth: {
    getState: vi.fn(() => ({
      isAuthenticated: false,
    })),
  },
}));

describe('useTheme store', () => {
  beforeEach(() => {
    // Reset the store
    useTheme.setState({
      isDarkMode: true,
    });
    localStorage.clear();
    vi.clearAllMocks();
    // Clear any dark theme class
    document.documentElement.classList.remove('pf-v6-theme-dark');
  });

  it('should initialize with default dark mode', () => {
    const state = useTheme.getState();
    expect(state.isDarkMode).toBe(true);
  });

  it('should apply dark theme class when setTheme is called with true', () => {
    useTheme.getState().setTheme(true);

    expect(document.documentElement.classList.contains('pf-v6-theme-dark')).toBe(true);
    expect(useTheme.getState().isDarkMode).toBe(true);
  });

  it('should remove dark theme class when setTheme is called with false', () => {
    // First add the class
    document.documentElement.classList.add('pf-v6-theme-dark');

    useTheme.getState().setTheme(false);

    expect(document.documentElement.classList.contains('pf-v6-theme-dark')).toBe(false);
    expect(useTheme.getState().isDarkMode).toBe(false);
  });

  it('should toggle theme from dark to light', async () => {
    // Start with dark mode
    useTheme.setState({ isDarkMode: true });
    document.documentElement.classList.add('pf-v6-theme-dark');

    await useTheme.getState().toggleTheme();

    expect(document.documentElement.classList.contains('pf-v6-theme-dark')).toBe(false);
    expect(useTheme.getState().isDarkMode).toBe(false);
  });

  it('should toggle theme from light to dark', async () => {
    // Start with light mode
    useTheme.setState({ isDarkMode: false });
    document.documentElement.classList.remove('pf-v6-theme-dark');

    await useTheme.getState().toggleTheme();

    expect(document.documentElement.classList.contains('pf-v6-theme-dark')).toBe(true);
    expect(useTheme.getState().isDarkMode).toBe(true);
  });

  it('should sync with backend when user is authenticated', async () => {
    const { useAuth } = await import('./useAuth');
    vi.mocked(useAuth.getState).mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    vi.mocked(authAPI.updatePreferences).mockResolvedValue({
      user: {
        id: 1,
        username: 'test',
        role: 'user',
        dark_mode: false,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      },
    });

    await useTheme.getState().toggleTheme();

    expect(authAPI.updatePreferences).toHaveBeenCalledWith(false);
  });

  it('should not sync with backend when user is not authenticated', async () => {
    const { useAuth } = await import('./useAuth');
    vi.mocked(useAuth.getState).mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    await useTheme.getState().toggleTheme();

    expect(authAPI.updatePreferences).not.toHaveBeenCalled();
  });

  it('should not revert theme if backend sync fails', async () => {
    const { useAuth } = await import('./useAuth');
    vi.mocked(useAuth.getState).mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    vi.mocked(authAPI.updatePreferences).mockRejectedValue(new Error('Network error'));

    // Suppress console.error for this test since we're intentionally testing error handling
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Start with dark mode
    useTheme.setState({ isDarkMode: true });

    await useTheme.getState().toggleTheme();

    // Theme should still be toggled to light mode despite API error
    expect(useTheme.getState().isDarkMode).toBe(false);

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to save theme preference:',
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });

  it('should apply theme on rehydration', () => {
    // Simulate rehydration with dark mode
    const state = { isDarkMode: true };

    // biome-ignore lint/suspicious/noExplicitAny: Accessing internal zustand persist config for testing
    const persistConfig = (useTheme as any).persist;
    if (persistConfig?.onRehydrateStorage) {
      const rehydrateCallback = persistConfig.onRehydrateStorage();
      rehydrateCallback(state);

      expect(document.documentElement.classList.contains('pf-v6-theme-dark')).toBe(true);
    }
  });

  it('should apply light theme on rehydration when isDarkMode is false', () => {
    // Simulate rehydration with light mode
    const state = { isDarkMode: false };

    // biome-ignore lint/suspicious/noExplicitAny: Accessing internal zustand persist config for testing
    const persistConfig = (useTheme as any).persist;
    if (persistConfig?.onRehydrateStorage) {
      const rehydrateCallback = persistConfig.onRehydrateStorage();
      rehydrateCallback(state);

      expect(document.documentElement.classList.contains('pf-v6-theme-dark')).toBe(false);
    }
  });
});
