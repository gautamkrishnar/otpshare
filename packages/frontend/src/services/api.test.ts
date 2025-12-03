import { beforeEach, describe, expect, it } from 'vitest';
import { adminAPI, authAPI, otpAPI, parserAPI } from './api';

describe('API Services', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('authAPI', () => {
    it('should login with valid credentials', async () => {
      const result = await authAPI.login('testuser', 'password');

      expect(result).toEqual({
        user: {
          id: 1,
          username: 'testuser',
          role: 'user',
          dark_mode: true,
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
        },
        token: 'mock-token',
      });
    });

    it('should fail login with invalid credentials', async () => {
      await expect(authAPI.login('invalid', 'wrong')).rejects.toThrow();
    });

    it('should check if admin exists', async () => {
      const result = await authAPI.checkAdminExists();
      expect(result).toEqual({ hasAdmin: true });
    });

    it('should create initial admin', async () => {
      const result = await authAPI.createInitialAdmin('admin', 'password');

      expect(result.user).toEqual({
        id: 1,
        username: 'admin',
        role: 'admin',
        dark_mode: true,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      });
      expect(result.token).toBe('admin-token');
    });

    it('should verify token', async () => {
      // Mock localStorage.getItem to return the token
      vi.mocked(localStorage.getItem).mockReturnValue('mock-token');

      const result = await authAPI.verifyToken();

      expect(result.user.username).toBe('testuser');
      expect(result.token).toBe('new-token');
    });

    it('should update user preferences', async () => {
      const result = await authAPI.updatePreferences(false);

      expect(result.user.dark_mode).toBe(false);
    });

    it('should change password', async () => {
      const result = await authAPI.changePassword('oldpass', 'newpass');

      expect(result.message).toBe('Password changed successfully');
    });

    it('should fail to change password with wrong current password', async () => {
      await expect(authAPI.changePassword('wrongpass', 'newpass')).rejects.toThrow();
    });
  });

  describe('otpAPI', () => {
    it('should get OTPs', async () => {
      const result = await otpAPI.getOTPs();

      expect(result.available).toBeDefined();
      expect(result.recentlyUsed).toBeDefined();
      expect(result.totalAvailable).toBeDefined();
    });

    it('should mark OTP as used', async () => {
      await expect(otpAPI.markAsUsed(1)).resolves.not.toThrow();
    });
  });

  describe('adminAPI', () => {
    it('should import OTPs', async () => {
      const result = await adminAPI.importOTPs(['123456', '789012', '345678']);

      expect(result.count).toBe(3);
    });

    it('should import OTPs from file', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = await adminAPI.importOTPsFromFile(mockFile, 'vendor1');

      expect(result.count).toBe(10);
    });

    it('should get all OTPs with filters', async () => {
      const result = await adminAPI.getAllOTPs({ status: 'unused', search: '123' });

      expect(result.otps).toBeDefined();
      expect(result.stats).toBeDefined();
    });

    it('should get users', async () => {
      const result = await adminAPI.getUsers();

      expect(result.users).toHaveLength(2);
      expect(result.users[0].username).toBe('user1');
      expect(result.users[1].username).toBe('admin1');
    });

    it('should create user', async () => {
      const result = await adminAPI.createUser({
        username: 'newuser',
        password: 'password123',
        role: 'user',
      });

      expect(result.user.username).toBe('newuser');
      expect(result.user.role).toBe('user');
    });

    it('should update user', async () => {
      const result = await adminAPI.updateUser(1, { role: 'admin' });

      expect(result.user.role).toBe('admin');
    });

    it('should delete user', async () => {
      await expect(adminAPI.deleteUser(1)).resolves.not.toThrow();
    });

    it('should delete OTP', async () => {
      await expect(adminAPI.deleteOTP(1)).resolves.not.toThrow();
    });

    it('should delete bulk OTPs', async () => {
      const result = await adminAPI.deleteBulkOTPs([1, 2, 3]);

      expect(result.count).toBe(3);
    });

    it('should mark bulk OTPs as used', async () => {
      const result = await adminAPI.markBulkOTPsAsUsed([1, 2]);

      expect(result.count).toBe(2);
    });

    it('should mark bulk OTPs as unused', async () => {
      const result = await adminAPI.markBulkOTPsAsUnused([1, 2]);

      expect(result.count).toBe(2);
    });

    it('should get settings', async () => {
      const result = await adminAPI.getSettings();

      expect(result.settings).toEqual({
        app_name: 'OTP Manager',
        version: '1.0.0',
      });
    });

    it('should update settings', async () => {
      const newSettings = { app_name: 'New OTP Manager' };
      const result = await adminAPI.updateSettings(newSettings);

      expect(result.message).toBe('Settings updated');
      expect(result.settings).toEqual(newSettings);
    });

    it('should download backup', async () => {
      // Just verify the function doesn't throw
      await expect(adminAPI.downloadBackup()).resolves.not.toThrow();
    });
  });

  describe('parserAPI', () => {
    it('should get parser metadata', async () => {
      const result = await parserAPI.getMetadata();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'vendor1',
        name: 'Vendor 1',
        description: 'Parser for Vendor 1',
      });
    });
  });
});
