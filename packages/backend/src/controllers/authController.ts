import type { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { generateToken } from '../utils/jwt';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = UserModel.findByUsername(username);

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
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkAdminExists = (_req: Request, res: Response) => {
  try {
    const hasAdmin = UserModel.hasAdminUser();
    res.json({ hasAdmin });
  } catch (error) {
    console.error('Check admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createInitialAdmin = async (req: Request, res: Response) => {
  try {
    // Check if admin already exists
    if (UserModel.hasAdminUser()) {
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
    if (UserModel.findByUsername(username)) {
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
      },
    });
  } catch (error) {
    console.error('Create initial admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
