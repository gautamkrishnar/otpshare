// Re-export all types from shared package
export type {
  User,
  UserWithDates,
  CreateUserInput,
  UpdateUserInput,
  OTP,
  OTPWithUser,
  OTPListResponse,
  OTPStats,
  AdminOTPResponse,
  LoginResponse,
} from '@otpshare/shared';

export { VendorType } from '@otpshare/shared';

// Frontend-specific type aliases for compatibility
export type { UserWithDates as UserData } from '@otpshare/shared';
