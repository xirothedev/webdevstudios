import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'clx1234567890',
  })
  userId: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User information',
  })
  user: {
    id: string;
    email: string;
    fullName: string | null;
    emailVerified: boolean;
    mfaEnabled: boolean;
  };

  @ApiProperty({
    description: 'Whether 2FA verification is required',
    example: false,
    required: false,
  })
  requires2FA?: boolean;
}

export class RefreshTokenResponseDto {
  @ApiProperty({
    description: 'New JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'New JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}

export class SuccessResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success: boolean;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'clx1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    nullable: true,
  })
  fullName: string | null;

  @ApiProperty({
    description: 'User phone number',
    example: '+84123456789',
    nullable: true,
  })
  phone: string | null;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  avatar: string | null;

  @ApiProperty({
    description: 'User role',
    example: 'CUSTOMER',
    enum: ['ADMIN', 'CUSTOMER'],
  })
  role: string;

  @ApiProperty({
    description: 'Email verification status',
    example: true,
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'Phone verification status',
    example: false,
  })
  phoneVerified: boolean;

  @ApiProperty({
    description: '2FA enabled status',
    example: false,
  })
  mfaEnabled: boolean;

  @ApiProperty({
    description: 'Account creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class SessionResponseDto {
  @ApiProperty({
    description: 'Session ID',
    example: 'clx1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Device information',
    nullable: true,
  })
  device: {
    id: string;
    name: string | null;
    type: string;
    lastSeenAt: Date;
  } | null;

  @ApiProperty({
    description: 'IP address',
    example: '192.168.1.1',
    nullable: true,
  })
  ipAddress: string | null;

  @ApiProperty({
    description: 'User agent',
    example: 'Mozilla/5.0...',
    nullable: true,
  })
  userAgent: string | null;

  @ApiProperty({
    description: 'Session status',
    example: 'ACTIVE',
    enum: ['ACTIVE', 'EXPIRED', 'REVOKED'],
  })
  status: string;

  @ApiProperty({
    description: 'Session creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Session expiration date',
    example: '2024-01-08T00:00:00.000Z',
  })
  expiresAt: Date;
}

export class Enable2FAResponseDto {
  @ApiProperty({
    description: 'QR code data URL for authenticator app',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
  })
  qrCode: string;

  @ApiProperty({
    description: 'TOTP secret (user should save this)',
    example: 'JBSWY3DPEHPK3PXP',
  })
  secret: string;

  @ApiProperty({
    description: 'Backup codes (user should save these)',
    example: ['12345678', '87654321', '11223344'],
    type: [String],
  })
  backupCodes: string[];
}

export class Verify2FAResponseDto {
  @ApiProperty({
    description: 'JWT access token (if login flow)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  accessToken?: string;

  @ApiProperty({
    description: 'JWT refresh token (if login flow)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  refreshToken?: string;

  @ApiProperty({
    description: 'User information (if login flow)',
    required: false,
  })
  user?: {
    id: string;
    email: string;
    fullName: string | null;
    emailVerified: boolean;
    mfaEnabled: boolean;
  };

  @ApiProperty({
    description: 'Verification status (if setup flow)',
    example: true,
    required: false,
  })
  verified?: boolean;
}

export class OAuthCallbackResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User information',
  })
  user: {
    id: string;
    email: string;
    fullName: string | null;
    emailVerified: boolean;
  };
}
