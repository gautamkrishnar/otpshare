import jwt from 'jsonwebtoken';
import { SettingModel } from '../models/Setting';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-this';

export interface JWTPayload {
  userId: number;
  username: string;
  role: 'admin' | 'user';
}

export const generateToken = async (payload: JWTPayload): Promise<string> => {
  const expirationHours = await SettingModel.getJWTExpirationHours();
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${expirationHours}h` });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (_error) {
    return null;
  }
};
