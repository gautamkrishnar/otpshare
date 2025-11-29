# @otpshare/shared

Shared TypeScript types for the OTPShare application.

## Overview

This package contains all shared type definitions used by both the frontend and backend workspaces. This ensures type consistency across the entire application and prevents type mismatches.

## Types Included

### User Types
- `User` - Basic user information
- `UserWithDates` - User with created_at and updated_at timestamps
- `CreateUserInput` - Input for creating a new user
- `UpdateUserInput` - Input for updating a user

### OTP Types
- `OTP` - Basic OTP information
- `OTPWithUser` - OTP with associated username
- `OTPListResponse` - Response for OTP lists
- `OTPStats` - OTP statistics
- `AdminOTPResponse` - Response for admin OTP queries

### Auth Types
- `LoginResponse` - Login API response

### Parser Types
- `VendorType` - Enum for supported OTP vendors
- `OTPParser` - Interface for OTP parsers

## Usage

### In Backend

```typescript
import type { User, OTP, CreateUserInput } from '@otpshare/shared';
import { VendorType } from '@otpshare/shared';
```

### In Frontend

```typescript
import type { User, OTP, OTPListResponse } from '@otpshare/shared';
import { VendorType } from '@otpshare/shared';
```

Or use the re-exported types from the frontend types file:

```typescript
import type { User, OTP } from '../types';
```

## Development

### Building

```bash
yarn build
```

This compiles the TypeScript source to JavaScript with type declarations.

### Adding New Types

1. Add the type definition to `src/index.ts`
2. Export it from the main export
3. Run `yarn build` to compile
4. The type will be automatically available in both frontend and backend workspaces
