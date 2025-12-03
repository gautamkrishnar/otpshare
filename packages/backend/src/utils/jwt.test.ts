import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingModel } from '../models/Setting';
import { type JWTPayload, generateToken, verifyToken } from './jwt';

vi.mock('../models/Setting');

describe('JWT Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', async () => {
      vi.spyOn(SettingModel, 'getJWTExpirationHours').mockResolvedValue(24);

      const payload: JWTPayload = {
        userId: 1,
        username: 'testuser',
        role: 'user',
      };

      const token = await generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    it('should generate token with custom expiration', async () => {
      vi.spyOn(SettingModel, 'getJWTExpirationHours').mockResolvedValue(48);

      const payload: JWTPayload = {
        userId: 2,
        username: 'admin',
        role: 'admin',
      };

      const token = await generateToken(payload);

      expect(token).toBeDefined();
      expect(SettingModel.getJWTExpirationHours).toHaveBeenCalled();
    });

    it('should generate different tokens for different payloads', async () => {
      vi.spyOn(SettingModel, 'getJWTExpirationHours').mockResolvedValue(24);

      const payload1: JWTPayload = {
        userId: 1,
        username: 'user1',
        role: 'user',
      };

      const payload2: JWTPayload = {
        userId: 2,
        username: 'user2',
        role: 'admin',
      };

      const token1 = await generateToken(payload1);
      const token2 = await generateToken(payload2);

      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', async () => {
      vi.spyOn(SettingModel, 'getJWTExpirationHours').mockResolvedValue(24);

      const payload: JWTPayload = {
        userId: 1,
        username: 'testuser',
        role: 'user',
      };

      const token = await generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.username).toBe(payload.username);
      expect(decoded?.role).toBe(payload.role);
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = verifyToken(invalidToken);

      expect(decoded).toBeNull();
    });

    it('should return null for malformed token', () => {
      const malformedToken = 'not-a-jwt-token';
      const decoded = verifyToken(malformedToken);

      expect(decoded).toBeNull();
    });

    it('should return null for empty token', () => {
      const decoded = verifyToken('');

      expect(decoded).toBeNull();
    });

    it('should verify admin role correctly', async () => {
      vi.spyOn(SettingModel, 'getJWTExpirationHours').mockResolvedValue(24);

      const adminPayload: JWTPayload = {
        userId: 1,
        username: 'admin',
        role: 'admin',
      };

      const token = await generateToken(adminPayload);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.role).toBe('admin');
    });

    it('should verify user role correctly', async () => {
      vi.spyOn(SettingModel, 'getJWTExpirationHours').mockResolvedValue(24);

      const userPayload: JWTPayload = {
        userId: 2,
        username: 'regularuser',
        role: 'user',
      };

      const token = await generateToken(userPayload);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.role).toBe('user');
    });
  });

  describe('Token expiration', () => {
    it('should generate token with correct expiration time', async () => {
      vi.spyOn(SettingModel, 'getJWTExpirationHours').mockResolvedValue(1);

      const payload: JWTPayload = {
        userId: 1,
        username: 'testuser',
        role: 'user',
      };

      const token = await generateToken(payload);
      const decoded = verifyToken(token) as JWTPayload & { exp?: number };

      expect(decoded).toBeDefined();
      expect(decoded?.exp).toBeDefined();

      // Check that expiration is approximately 1 hour from now (with some tolerance)
      const now = Math.floor(Date.now() / 1000);
      const expectedExpiration = now + 3600; // 1 hour in seconds
      expect(decoded?.exp).toBeGreaterThan(now);
      expect(decoded?.exp).toBeLessThan(expectedExpiration + 10); // Allow 10 second tolerance
    });
  });

  describe('Round trip', () => {
    it('should successfully encode and decode a payload', async () => {
      vi.spyOn(SettingModel, 'getJWTExpirationHours').mockResolvedValue(24);

      const originalPayload: JWTPayload = {
        userId: 123,
        username: 'roundtripuser',
        role: 'admin',
      };

      const token = await generateToken(originalPayload);
      const decodedPayload = verifyToken(token);

      expect(decodedPayload).toBeDefined();
      expect(decodedPayload?.userId).toBe(originalPayload.userId);
      expect(decodedPayload?.username).toBe(originalPayload.username);
      expect(decodedPayload?.role).toBe(originalPayload.role);
    });
  });
});
