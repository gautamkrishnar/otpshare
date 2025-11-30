import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { OTPModel } from '../models/OTP';

export const getOTPs = async (_req: AuthRequest, res: Response) => {
  try {
    const available = await OTPModel.findAvailable(1);
    const recentlyUsed = await OTPModel.findRecentlyUsed(7);
    const stats = await OTPModel.getStats();

    res.json({
      available,
      recentlyUsed,
      totalAvailable: stats.unused,
    });
  } catch (error) {
    console.error('Get OTPs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markOTPAsUsed = async (req: AuthRequest, res: Response) => {
  try {
    const otpId = Number.parseInt(req.params.id);
    const userId = req.user?.userId;

    if (Number.isNaN(otpId)) {
      return res.status(400).json({ error: 'Invalid OTP ID' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const updatedOTP = await OTPModel.markAsUsed(otpId, userId);

    if (!updatedOTP) {
      return res.status(400).json({ error: 'OTP not found or already used' });
    }

    res.json({
      message: 'OTP marked as used successfully',
      otp: updatedOTP,
    });
  } catch (error) {
    console.error('Mark OTP as used error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
