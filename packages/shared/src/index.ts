// User types
export interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
}

export interface UserWithDates extends User {
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  username: string;
  password: string;
  role: 'admin' | 'user';
}

export interface UpdateUserInput {
  username?: string;
  password?: string;
  role?: 'admin' | 'user';
}

// OTP types
export interface OTP {
  id: number;
  code: string;
  status: 'used' | 'unused';
  created_at: string;
  used_at: string | null;
  used_by: number | null;
}

export interface OTPWithUser extends OTP {
  username?: string;
}

export interface OTPListResponse {
  available: OTPWithUser[];
  recentlyUsed: OTPWithUser[];
  totalAvailable: number;
}

export interface OTPStats {
  total: number;
  used: number;
  unused: number;
}

export interface AdminOTPResponse {
  otps: OTPWithUser[];
  stats: OTPStats;
}

// Auth types
export interface LoginResponse {
  token: string;
  user: User;
}

// Vendor types
export enum VendorType {
  PLAIN_TEXT = 'plain_text',
  TPLINK_OMADA = 'tplink_omada',
}

// Parser types
export interface OTPParser {
  parse(data: Buffer): Promise<string[]>;
}
