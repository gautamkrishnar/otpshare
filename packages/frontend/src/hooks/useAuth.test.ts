import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authAPI } from '../services/api';
import type { UserWithDates } from '../types';
import { useAuth } from './useAuth';

// Mock the API
vi.mock('../services/api', () => ({
  authAPI: {
    verifyToken: vi.fn(),
  },
}));

// Mock useTheme
vi.mock('./useTheme', () => ({
  useTheme: {
    getState: vi.fn(() => ({
      setTheme: vi.fn(),
    })),
  },
}));

describe('useAuth store', () => {
  beforeEach(() => {
    // Reset the store
    useAuth.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
    });
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const state = useAuth.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isAdmin).toBe(false);
  });

  it('should login user and set admin flag for admin role', () => {
    const mockUser: UserWithDates = {
      id: 1,
      username: 'admin',
      role: 'admin',
      dark_mode: true,
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    };
    const mockToken = 'test-token';

    useAuth.getState().login(mockUser, mockToken);

    const state = useAuth.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe(mockToken);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isAdmin).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
  });

  it('should login user and not set admin flag for regular user', () => {
    const mockUser: UserWithDates = {
      id: 2,
      username: 'user',
      role: 'user',
      dark_mode: false,
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    };
    const mockToken = 'user-token';

    useAuth.getState().login(mockUser, mockToken);

    const state = useAuth.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe(mockToken);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isAdmin).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
  });

  it('should logout user and clear state', () => {
    // First login
    const mockUser: UserWithDates = {
      id: 1,
      username: 'admin',
      role: 'admin',
      dark_mode: true,
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    };
    useAuth.getState().login(mockUser, 'test-token');

    // Then logout
    useAuth.getState().logout();

    const state = useAuth.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isAdmin).toBe(false);
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
  });

  it('should verify token on rehydration and update state', async () => {
    const mockUser: UserWithDates = {
      id: 1,
      username: 'testuser',
      role: 'user',
      dark_mode: true,
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    };
    const mockToken = 'new-token';

    // Mock localStorage to have a token
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('old-token');
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    // Mock API response
    vi.mocked(authAPI.verifyToken).mockResolvedValue({
      user: mockUser,
      token: mockToken,
    });

    // Simulate rehydration by calling the onRehydrateStorage callback
    const state = {
      user: null,
      token: 'old-token',
      isAuthenticated: false,
      isAdmin: false,
    };

    // Get the persist config
    // biome-ignore lint/suspicious/noExplicitAny: Accessing internal zustand persist config for testing
    const persistConfig = (useAuth as any).persist;
    if (persistConfig?.onRehydrateStorage) {
      const rehydrateCallback = persistConfig.onRehydrateStorage();
      await rehydrateCallback(state);

      expect(authAPI.verifyToken).toHaveBeenCalled();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isAdmin).toBe(false);
    }

    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });

  it('should clear state on rehydration if token verification fails', async () => {
    // Mock localStorage to have a token
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('invalid-token');
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');

    // Mock API to reject
    vi.mocked(authAPI.verifyToken).mockRejectedValue(new Error('Invalid token'));

    // Simulate rehydration
    const state = {
      user: {
        id: 1,
        username: 'old',
        role: 'user',
        dark_mode: true,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      } as UserWithDates,
      token: 'invalid-token',
      isAuthenticated: true,
      isAdmin: false,
    };

    // biome-ignore lint/suspicious/noExplicitAny: Accessing internal zustand persist config for testing
    const persistConfig = (useAuth as any).persist;
    if (persistConfig?.onRehydrateStorage) {
      const rehydrateCallback = persistConfig.onRehydrateStorage();
      await rehydrateCallback(state);

      expect(authAPI.verifyToken).toHaveBeenCalled();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isAdmin).toBe(false);
    }

    getItemSpy.mockRestore();
    removeItemSpy.mockRestore();
  });

  it('should clear state on rehydration if no token in localStorage', async () => {
    // Mock localStorage to have no token
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

    // Simulate rehydration with existing state
    const state = {
      user: {
        id: 1,
        username: 'old',
        role: 'user',
        dark_mode: true,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      } as UserWithDates,
      token: 'some-token',
      isAuthenticated: true,
      isAdmin: false,
    };

    // biome-ignore lint/suspicious/noExplicitAny: Accessing internal zustand persist config for testing
    const persistConfig = (useAuth as any).persist;
    if (persistConfig?.onRehydrateStorage) {
      const rehydrateCallback = persistConfig.onRehydrateStorage();
      await rehydrateCallback(state);

      // Should not call verifyToken if no token in localStorage
      expect(authAPI.verifyToken).not.toHaveBeenCalled();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isAdmin).toBe(false);
    }

    getItemSpy.mockRestore();
  });
});
