import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserModel } from '../models/User';
import * as jwtUtils from '../utils/jwt';
import { type AuthRequest, authenticate, requireAdmin } from './auth';

vi.mock('../models/User');
vi.mock('../utils/jwt');

describe('Auth Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should return 401 if no authorization header', async () => {
      await authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'No token provided' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header does not start with Bearer', async () => {
      mockRequest.headers = { authorization: 'Basic token123' };

      await authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'No token provided' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      mockRequest.headers = { authorization: 'Bearer invalid-token' };
      vi.spyOn(jwtUtils, 'verifyToken').mockReturnValue(null);

      await authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if user no longer exists', async () => {
      const mockPayload = { userId: 1, username: 'testuser', role: 'user' as const };
      mockRequest.headers = { authorization: 'Bearer valid-token' };

      vi.spyOn(jwtUtils, 'verifyToken').mockReturnValue(mockPayload);
      vi.spyOn(UserModel, 'findById').mockResolvedValue(undefined);

      await authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User no longer exists' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next() and set req.user if token is valid and user exists', async () => {
      const mockPayload = { userId: 1, username: 'testuser', role: 'user' as const };
      const mockUser = {
        id: 1,
        username: 'testuser',
        password_hash: 'hashed',
        role: 'user' as const,
        dark_mode: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      mockRequest.headers = { authorization: 'Bearer valid-token' };

      vi.spyOn(jwtUtils, 'verifyToken').mockReturnValue(mockPayload);
      vi.spyOn(UserModel, 'findById').mockResolvedValue(mockUser);

      await authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual(mockPayload);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 500 if database error occurs', async () => {
      const mockPayload = { userId: 1, username: 'testuser', role: 'user' as const };
      mockRequest.headers = { authorization: 'Bearer valid-token' };

      vi.spyOn(jwtUtils, 'verifyToken').mockReturnValue(mockPayload);
      vi.spyOn(UserModel, 'findById').mockRejectedValue(new Error('Database error'));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' });
      expect(mockNext).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should extract token correctly from Bearer header', async () => {
      const mockPayload = { userId: 1, username: 'testuser', role: 'user' as const };
      const mockUser = {
        id: 1,
        username: 'testuser',
        password_hash: 'hashed',
        role: 'user' as const,
        dark_mode: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      mockRequest.headers = { authorization: 'Bearer my-token-here' };

      const verifyTokenSpy = vi.spyOn(jwtUtils, 'verifyToken').mockReturnValue(mockPayload);
      vi.spyOn(UserModel, 'findById').mockResolvedValue(mockUser);

      await authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(verifyTokenSpy).toHaveBeenCalledWith('my-token-here');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('should return 403 if no user in request', () => {
      requireAdmin(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Admin access required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 if user is not admin', () => {
      mockRequest.user = { userId: 1, username: 'testuser', role: 'user' };

      requireAdmin(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Admin access required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next() if user is admin', () => {
      mockRequest.user = { userId: 1, username: 'admin', role: 'admin' };

      requireAdmin(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});
