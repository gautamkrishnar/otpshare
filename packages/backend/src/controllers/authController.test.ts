import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthRequest } from '../middleware/auth';
import { UserModel } from '../models/User';
import * as jwtUtils from '../utils/jwt';
import {
  changePassword,
  checkAdminExists,
  createInitialAdmin,
  login,
  updatePreferences,
  verifyToken,
} from './authController';

vi.mock('../models/User');
vi.mock('../utils/jwt');

describe('AuthController', () => {
  let mockRequest: Partial<Request | AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockJson = vi.fn();
    mockStatus = vi.fn().mockReturnThis();
    mockRequest = {
      body: {},
    };
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should return 400 if username is missing', async () => {
      mockRequest.body = { password: 'password123' };

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Username and password are required' });
    });

    it('should return 400 if password is missing', async () => {
      mockRequest.body = { username: 'testuser' };

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Username and password are required' });
    });

    it('should return 401 if user not found', async () => {
      mockRequest.body = { username: 'nonexistent', password: 'password123' };
      vi.spyOn(UserModel, 'findByUsername').mockResolvedValue(undefined);

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 401 if password is invalid', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password_hash: 'hashed',
        role: 'user' as const,
        dark_mode: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      mockRequest.body = { username: 'testuser', password: 'wrongpassword' };
      vi.spyOn(UserModel, 'findByUsername').mockResolvedValue(mockUser);
      vi.spyOn(UserModel, 'verifyPassword').mockResolvedValue(false);

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return token and user if credentials are valid', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password_hash: 'hashed',
        role: 'user' as const,
        dark_mode: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      mockRequest.body = { username: 'testuser', password: 'correctpassword' };
      vi.spyOn(UserModel, 'findByUsername').mockResolvedValue(mockUser);
      vi.spyOn(UserModel, 'verifyPassword').mockResolvedValue(true);
      vi.spyOn(jwtUtils, 'generateToken').mockResolvedValue('mock-token');

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({
        token: 'mock-token',
        user: {
          id: 1,
          username: 'testuser',
          role: 'user',
          dark_mode: true,
        },
      });
    });

    it('should return 500 on internal error', async () => {
      mockRequest.body = { username: 'testuser', password: 'password123' };
      vi.spyOn(UserModel, 'findByUsername').mockRejectedValue(new Error('Database error'));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Internal server error' });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('checkAdminExists', () => {
    it('should return true if admin exists', async () => {
      vi.spyOn(UserModel, 'hasAdminUser').mockResolvedValue(true);

      await checkAdminExists(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({ hasAdmin: true });
    });

    it('should return false if admin does not exist', async () => {
      vi.spyOn(UserModel, 'hasAdminUser').mockResolvedValue(false);

      await checkAdminExists(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({ hasAdmin: false });
    });

    it('should return 500 on internal error', async () => {
      vi.spyOn(UserModel, 'hasAdminUser').mockRejectedValue(new Error('Database error'));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await checkAdminExists(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Internal server error' });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('createInitialAdmin', () => {
    it('should return 400 if admin already exists', async () => {
      vi.spyOn(UserModel, 'hasAdminUser').mockResolvedValue(true);

      await createInitialAdmin(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Admin user already exists' });
    });

    it('should return 400 if username is missing', async () => {
      mockRequest.body = { password: 'password123' };
      vi.spyOn(UserModel, 'hasAdminUser').mockResolvedValue(false);

      await createInitialAdmin(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Username and password are required' });
    });

    it('should return 400 if username is too short', async () => {
      mockRequest.body = { username: 'ab', password: 'password123' };
      vi.spyOn(UserModel, 'hasAdminUser').mockResolvedValue(false);

      await createInitialAdmin(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Username must be at least 3 characters long',
      });
    });

    it('should return 400 if password is too short', async () => {
      mockRequest.body = { username: 'admin', password: '12345' };
      vi.spyOn(UserModel, 'hasAdminUser').mockResolvedValue(false);

      await createInitialAdmin(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Password must be at least 6 characters long',
      });
    });

    it('should return 400 if username already exists', async () => {
      const mockUser = {
        id: 1,
        username: 'existinguser',
        password_hash: 'hashed',
        role: 'user' as const,
        dark_mode: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      mockRequest.body = { username: 'existinguser', password: 'password123' };
      vi.spyOn(UserModel, 'hasAdminUser').mockResolvedValue(false);
      vi.spyOn(UserModel, 'findByUsername').mockResolvedValue(mockUser);

      await createInitialAdmin(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Username already exists' });
    });

    it('should create admin user and return token', async () => {
      const mockAdmin = {
        id: 1,
        username: 'admin',
        password_hash: 'hashed',
        role: 'admin' as const,
        dark_mode: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      mockRequest.body = { username: 'admin', password: 'password123' };
      vi.spyOn(UserModel, 'hasAdminUser').mockResolvedValue(false);
      vi.spyOn(UserModel, 'findByUsername').mockResolvedValue(undefined);
      vi.spyOn(UserModel, 'create').mockResolvedValue(mockAdmin);
      vi.spyOn(jwtUtils, 'generateToken').mockResolvedValue('admin-token');

      await createInitialAdmin(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Admin user created successfully',
        token: 'admin-token',
        user: {
          id: 1,
          username: 'admin',
          role: 'admin',
          dark_mode: true,
        },
      });
    });
  });

  describe('updatePreferences', () => {
    it('should return 401 if user is not authenticated', async () => {
      const authRequest = mockRequest as AuthRequest;
      authRequest.user = undefined;

      await updatePreferences(authRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should return 400 if dark_mode is not a boolean', async () => {
      const authRequest = mockRequest as AuthRequest;
      authRequest.user = { userId: 1, username: 'testuser', role: 'user' };
      authRequest.body = { dark_mode: 'invalid' };

      await updatePreferences(authRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'dark_mode must be a boolean' });
    });

    it('should return 404 if user not found', async () => {
      const authRequest = mockRequest as AuthRequest;
      authRequest.user = { userId: 1, username: 'testuser', role: 'user' };
      authRequest.body = { dark_mode: true };

      vi.spyOn(UserModel, 'update').mockResolvedValue(undefined);

      await updatePreferences(authRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should update preferences and return user', async () => {
      const updatedUser = {
        id: 1,
        username: 'testuser',
        password_hash: 'hashed',
        role: 'user' as const,
        dark_mode: false,
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
      };

      const authRequest = mockRequest as AuthRequest;
      authRequest.user = { userId: 1, username: 'testuser', role: 'user' };
      authRequest.body = { dark_mode: false };

      vi.spyOn(UserModel, 'update').mockResolvedValue(updatedUser);

      await updatePreferences(authRequest, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({
        user: {
          id: 1,
          username: 'testuser',
          role: 'user',
          dark_mode: false,
        },
      });
    });
  });

  describe('changePassword', () => {
    it('should return 401 if user is not authenticated', async () => {
      const authRequest = mockRequest as AuthRequest;
      authRequest.user = undefined;

      await changePassword(authRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should return 400 if currentPassword or newPassword is missing', async () => {
      const authRequest = mockRequest as AuthRequest;
      authRequest.user = { userId: 1, username: 'testuser', role: 'user' };
      authRequest.body = { currentPassword: 'old' };

      await changePassword(authRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Current password and new password are required',
      });
    });

    it('should return 400 if new password is too short', async () => {
      const authRequest = mockRequest as AuthRequest;
      authRequest.user = { userId: 1, username: 'testuser', role: 'user' };
      authRequest.body = { currentPassword: 'old', newPassword: '12345' };

      await changePassword(authRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'New password must be at least 6 characters long',
      });
    });

    it('should return 404 if user not found', async () => {
      const authRequest = mockRequest as AuthRequest;
      authRequest.user = { userId: 1, username: 'testuser', role: 'user' };
      authRequest.body = { currentPassword: 'old', newPassword: 'newpassword' };

      vi.spyOn(UserModel, 'findById').mockResolvedValue(undefined);

      await changePassword(authRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 401 if current password is incorrect', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password_hash: 'hashed',
        role: 'user' as const,
        dark_mode: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      const authRequest = mockRequest as AuthRequest;
      authRequest.user = { userId: 1, username: 'testuser', role: 'user' };
      authRequest.body = { currentPassword: 'wrongpassword', newPassword: 'newpassword' };

      vi.spyOn(UserModel, 'findById').mockResolvedValue(mockUser);
      vi.spyOn(UserModel, 'verifyPassword').mockResolvedValue(false);

      await changePassword(authRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Current password is incorrect' });
    });

    it('should change password successfully', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password_hash: 'hashed',
        role: 'user' as const,
        dark_mode: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      const authRequest = mockRequest as AuthRequest;
      authRequest.user = { userId: 1, username: 'testuser', role: 'user' };
      authRequest.body = { currentPassword: 'correctpassword', newPassword: 'newpassword123' };

      vi.spyOn(UserModel, 'findById').mockResolvedValue(mockUser);
      vi.spyOn(UserModel, 'verifyPassword').mockResolvedValue(true);
      vi.spyOn(UserModel, 'update').mockResolvedValue(mockUser);

      await changePassword(authRequest, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({ message: 'Password changed successfully' });
    });
  });

  describe('verifyToken', () => {
    it('should return 401 if user is not authenticated', async () => {
      const authRequest = mockRequest as AuthRequest;
      authRequest.user = undefined;

      await verifyToken(authRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should return 401 if user not found in database', async () => {
      const authRequest = mockRequest as AuthRequest;
      authRequest.user = { userId: 1, username: 'testuser', role: 'user' };

      vi.spyOn(UserModel, 'findById').mockResolvedValue(undefined);

      await verifyToken(authRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return new token and user data', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password_hash: 'hashed',
        role: 'user' as const,
        dark_mode: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      const authRequest = mockRequest as AuthRequest;
      authRequest.user = { userId: 1, username: 'testuser', role: 'user' };

      vi.spyOn(UserModel, 'findById').mockResolvedValue(mockUser);
      vi.spyOn(jwtUtils, 'generateToken').mockResolvedValue('new-token');

      await verifyToken(authRequest, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({
        token: 'new-token',
        user: {
          id: 1,
          username: 'testuser',
          role: 'user',
          dark_mode: true,
        },
      });
    });
  });
});
