import axios from 'axios';
import type {
  AdminOTPResponse,
  CreateUserInput,
  LoginResponse,
  OTPListResponse,
  ParserMetadata,
  UpdateUserInput,
  UserData,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if:
    // 1. We have a token (user was logged in)
    // 2. We're not on the login/setup page already
    // 3. The request was using authentication
    const hasToken = !!localStorage.getItem('token');
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath === '/' || currentPath === '/login';

    if (error.response?.status === 401 && hasToken && !isAuthEndpoint && !isLoginPage) {
      // Token is invalid or user no longer exists - logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Use replace to avoid adding to history and force full reload
      window.location.replace('/');
      // Don't reject the error after redirect
      return new Promise(() => {}); // Pending promise to prevent further execution
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post('/auth/login', { username, password });
    return data;
  },

  checkAdminExists: async (): Promise<{ hasAdmin: boolean }> => {
    const { data } = await api.get('/auth/check-admin');
    return data;
  },

  createInitialAdmin: async (username: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post('/auth/initial-admin', { username, password });
    return data;
  },

  updatePreferences: async (dark_mode: boolean): Promise<{ user: UserData }> => {
    const { data } = await api.put('/auth/preferences', { dark_mode });
    return data;
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> => {
    const { data } = await api.put('/auth/change-password', { currentPassword, newPassword });
    return data;
  },
};

export const otpAPI = {
  getOTPs: async (): Promise<OTPListResponse> => {
    const { data } = await api.get('/otp');
    return data;
  },

  markAsUsed: async (id: number): Promise<void> => {
    await api.put(`/otp/${id}/use`);
  },
};

export const adminAPI = {
  importOTPs: async (codes: string[]): Promise<{ count: number }> => {
    const { data } = await api.post('/admin/otp', { codes });
    return data;
  },

  importOTPsFromFile: async (file: File, vendorType: string): Promise<{ count: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('vendorType', vendorType);

    const { data } = await api.post('/admin/otp/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  getAllOTPs: async (filters?: {
    status?: 'used' | 'unused';
    search?: string;
  }): Promise<AdminOTPResponse> => {
    const { data } = await api.get('/admin/otp', { params: filters });
    return data;
  },

  getUsers: async (): Promise<{ users: UserData[] }> => {
    const { data } = await api.get('/admin/users');
    return data;
  },

  createUser: async (input: CreateUserInput): Promise<{ user: UserData }> => {
    const { data } = await api.post('/admin/users', input);
    return data;
  },

  updateUser: async (id: number, input: UpdateUserInput): Promise<{ user: UserData }> => {
    const { data } = await api.put(`/admin/users/${id}`, input);
    return data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },

  deleteOTP: async (id: number): Promise<void> => {
    await api.delete(`/admin/otp/${id}`);
  },

  deleteBulkOTPs: async (ids: number[]): Promise<{ count: number }> => {
    const { data } = await api.post('/admin/otp/bulk/delete', { ids });
    return data;
  },

  markBulkOTPsAsUsed: async (ids: number[]): Promise<{ count: number }> => {
    const { data } = await api.post('/admin/otp/bulk/mark-used', { ids });
    return data;
  },

  markBulkOTPsAsUnused: async (ids: number[]): Promise<{ count: number }> => {
    const { data } = await api.post('/admin/otp/bulk/mark-unused', { ids });
    return data;
  },

  downloadBackup: async (): Promise<void> => {
    const response = await api.get('/admin/backup', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    link.setAttribute('download', `otpmanager-backup-${timestamp}.db`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  getSettings: async (): Promise<{ settings: Record<string, string> }> => {
    const { data } = await api.get('/admin/settings');
    return data;
  },

  updateSettings: async (settings: Record<string, string>): Promise<{ message: string; settings: Record<string, string> }> => {
    const { data} = await api.put('/admin/settings', { settings });
    return data;
  },
};

export const parserAPI = {
  getMetadata: async (): Promise<ParserMetadata[]> => {
    const { data } = await api.get('/parsers/metadata');
    return data;
  },
};

export default api;
