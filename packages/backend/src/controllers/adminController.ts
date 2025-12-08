import fs from 'node:fs';
import path from 'node:path';
import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { OTPModel } from '../models/OTP';
import { UserModel } from '../models/User';
import { ParserFactory, VendorType } from '../parsers';

export const importOTPs = async (req: AuthRequest, res: Response) => {
  try {
    const { codes } = req.body;

    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return res.status(400).json({ error: 'Codes array is required and must not be empty' });
    }

    const trimmedCodes = codes.map((code) => String(code).trim()).filter((code) => code.length > 0);

    if (trimmedCodes.length === 0) {
      return res.status(400).json({ error: 'No valid codes provided' });
    }

    const count = await OTPModel.createBulk(trimmedCodes, req.user!.userId);

    res.json({
      message: `${count} OTPs imported successfully`,
      count,
    });
  } catch (error) {
    console.error('Import OTPs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const importOTPsFromFile = async (req: AuthRequest, res: Response) => {
  try {
    const { vendorType } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'File is required' });
    }

    if (!vendorType || !Object.values(VendorType).includes(vendorType as VendorType)) {
      return res.status(400).json({ error: 'Valid vendor type is required' });
    }

    const parser = ParserFactory.getParser(vendorType as VendorType);
    const codes = await parser.parse(file.buffer);

    if (codes.length === 0) {
      return res.status(400).json({ error: 'No valid codes found in the file' });
    }

    const count = await OTPModel.createBulk(codes, req.user!.userId);

    res.json({
      message: `${count} OTPs imported successfully`,
      count,
    });
  } catch (error) {
    console.error('Import OTPs from file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllOTPs = async (req: AuthRequest, res: Response) => {
  try {
    const { status, search, page, perPage } = req.query;

    const filters: {
      status?: 'used' | 'unused';
      search?: string;
      page?: number;
      perPage?: number;
    } = {};

    if (status === 'used' || status === 'unused') {
      filters.status = status;
    }

    if (typeof search === 'string' && search.trim()) {
      filters.search = search.trim();
    }

    if (typeof page === 'string') {
      const pageNum = Number.parseInt(page, 10);
      if (!Number.isNaN(pageNum) && pageNum > 0) {
        filters.page = pageNum;
      }
    }

    if (typeof perPage === 'string') {
      const perPageNum = Number.parseInt(perPage, 10);
      if (!Number.isNaN(perPageNum) && perPageNum > 0 && perPageNum <= 100) {
        filters.perPage = perPageNum;
      }
    }

    const { data: otps, total } = await OTPModel.findAll(filters);
    const stats = await OTPModel.getStats();

    res.json({
      otps,
      total,
      stats,
    });
  } catch (error) {
    console.error('Get all OTPs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { username, password, role, email, name } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Username, password, and role are required' });
    }

    if (role !== 'admin' && role !== 'user') {
      return res.status(400).json({ error: 'Role must be either "admin" or "user"' });
    }

    const existingUser = await UserModel.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const user = await UserModel.create({ username, password, role, email, name });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { page, perPage } = req.query;

    const filters: { page?: number; perPage?: number } = {};

    if (typeof page === 'string') {
      const pageNum = Number.parseInt(page, 10);
      if (!Number.isNaN(pageNum) && pageNum > 0) {
        filters.page = pageNum;
      }
    }

    if (typeof perPage === 'string') {
      const perPageNum = Number.parseInt(perPage, 10);
      if (!Number.isNaN(perPageNum) && perPageNum > 0 && perPageNum <= 100) {
        filters.perPage = perPageNum;
      }
    }

    const { data: users, total } = await UserModel.findAll(filters);

    const sanitizedUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }));

    res.json({ users: sanitizedUsers, total });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number.parseInt(req.params.id);
    const { username, password, role, email, name } = req.body;

    if (Number.isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (role && role !== 'admin' && role !== 'user') {
      return res.status(400).json({ error: 'Role must be either "admin" or "user"' });
    }

    const updateData: {
      username?: string;
      password?: string;
      role?: 'admin' | 'user';
      email?: string;
      name?: string;
    } = {};

    if (username) updateData.username = username;
    if (password) updateData.password = password;
    if (role) updateData.role = role;
    if (email !== undefined) updateData.email = email;
    if (name !== undefined) updateData.name = name;

    const updatedUser = await UserModel.update(userId, updateData);

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role,
        email: updatedUser.email,
        name: updatedUser.name,
        updated_at: updatedUser.updated_at,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number.parseInt(req.params.id);

    if (Number.isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      const { data: allUsers } = await UserModel.findAll();
      const adminCount = allUsers.filter((u) => u.role === 'admin').length;

      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin user' });
      }
    }

    const deleted = await UserModel.delete(userId);

    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteOTP = async (req: AuthRequest, res: Response) => {
  try {
    const otpId = Number.parseInt(req.params.id);

    if (Number.isNaN(otpId)) {
      return res.status(400).json({ error: 'Invalid OTP ID' });
    }

    const otp = await OTPModel.findById(otpId);
    if (!otp) {
      return res.status(404).json({ error: 'OTP not found' });
    }

    const deleted = await OTPModel.delete(otpId);

    if (!deleted) {
      return res.status(404).json({ error: 'OTP not found' });
    }

    res.json({ message: 'OTP deleted successfully' });
  } catch (error) {
    console.error('Delete OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const downloadBackup = async (_req: AuthRequest, res: Response) => {
  try {
    const dbPath = process.env.DATABASE_PATH || './data/otpmanager.db';
    const absolutePath = path.resolve(dbPath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: 'Database file not found' });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const filename = `otpmanager-backup-${timestamp}.db`;

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const fileStream = fs.createReadStream(absolutePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download backup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteBulkOTPs = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'IDs array is required and must not be empty' });
    }

    const validIds = ids.filter((id) => typeof id === 'number' && !Number.isNaN(id));

    if (validIds.length === 0) {
      return res.status(400).json({ error: 'No valid IDs provided' });
    }

    const deletedCount = await OTPModel.deleteBulk(validIds);

    res.json({
      message: `${deletedCount} OTP(s) deleted successfully`,
      count: deletedCount,
    });
  } catch (error) {
    console.error('Bulk delete OTPs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markBulkOTPsAsUsed = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'IDs array is required and must not be empty' });
    }

    const validIds = ids.filter((id) => typeof id === 'number' && !Number.isNaN(id));

    if (validIds.length === 0) {
      return res.status(400).json({ error: 'No valid IDs provided' });
    }

    const markedCount = await OTPModel.markBulkAsUsed(validIds, req.user!.userId);

    res.json({
      message: `${markedCount} OTP(s) marked as used successfully`,
      count: markedCount,
    });
  } catch (error) {
    console.error('Bulk mark OTPs as used error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markBulkOTPsAsUnused = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'IDs array is required and must not be empty' });
    }

    const validIds = ids.filter((id) => typeof id === 'number' && !Number.isNaN(id));

    if (validIds.length === 0) {
      return res.status(400).json({ error: 'No valid IDs provided' });
    }

    const markedCount = await OTPModel.markBulkAsUnused(validIds);

    res.json({
      message: `${markedCount} OTP(s) marked as unused successfully`,
      count: markedCount,
    });
  } catch (error) {
    console.error('Bulk mark OTPs as unused error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAllOTPs = async (_req: AuthRequest, res: Response) => {
  try {
    const deletedCount = await OTPModel.deleteAll();

    res.json({
      message: `${deletedCount} OTP(s) deleted successfully`,
      count: deletedCount,
    });
  } catch (error) {
    console.error('Delete all OTPs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
