import type { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { generateToken } from '../utils/jwt';
import type { AuthRequest } from '../middleware/auth';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await UserModel.findByUsername(username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await UserModel.verifyPassword(user, password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        dark_mode: user.dark_mode ?? true,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkAdminExists = async (_req: Request, res: Response) => {
  try {
    const hasAdmin = await UserModel.hasAdminUser();
    res.json({ hasAdmin });
  } catch (error) {
    console.error('Check admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createInitialAdmin = async (req: Request, res: Response) => {
  try {
    // Check if admin already exists
    if (await UserModel.hasAdminUser()) {
      return res.status(400).json({ error: 'Admin user already exists' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Validate username
    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if username already exists
    if (await UserModel.findByUsername(username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Create admin user
    const admin = await UserModel.create({
      username,
      password,
      role: 'admin',
    });

    // Generate token for auto-login
    const token = generateToken({
      userId: admin.id,
      username: admin.username,
      role: admin.role,
    });

    res.status(201).json({
      message: 'Admin user created successfully',
      token,
      user: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        dark_mode: admin.dark_mode ?? true,
      },
    });
  } catch (error) {
    console.error('Create initial admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePreferences = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { dark_mode } = req.body;

    if (typeof dark_mode !== 'boolean') {
      return res.status(400).json({ error: 'dark_mode must be a boolean' });
    }

    const updatedUser = await UserModel.update(req.user.userId, { dark_mode });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role,
        dark_mode: updatedUser.dark_mode,
      },
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const user = await UserModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValidPassword = await UserModel.verifyPassword(user, currentPassword);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    await UserModel.update(req.user.userId, { password: newPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
