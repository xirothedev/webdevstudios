// dto/device/create-device.dto.ts
import { DeviceType, SessionStatus } from '@generated/prisma';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class SessionDto {
  @ApiProperty({ example: 'session_token_jwt_or_random' })
  @IsString()
  @MaxLength(512) // JWT length
  token!: string;

  @ApiProperty({ example: 'refresh_jwt_token_here' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  refreshToken!: string;

  @ApiProperty({ example: 'user_123' })
  @IsString()
  userId!: string;

  @ApiProperty({ example: 'device_123' })
  @IsOptional()
  @IsString()
  deviceId!: string;

  @ApiProperty({ example: '113.172.45.123' })
  @IsOptional()
  @IsString()
  @MaxLength(45)
  ipAddress!: string;

  @ApiProperty({ example: 'Mozilla/5.0 (iPhone...)' })
  @IsOptional()
  @IsString()
  userAgent!: string;

  @ApiProperty({
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
    example: SessionStatus.ACTIVE,
  })
  @IsEnum(SessionStatus)
  @IsOptional()
  status!: SessionStatus;

  @ApiProperty({ example: '2025-12-30T10:00:00.000Z' })
  @IsDate()
  expiresAt!: Date;

  @ApiProperty({ example: '2025-12-23T15:30:00.000Z' })
  @IsOptional()
  @IsDate()
  revokedAt?: Date;

  @ApiProperty({ example: '2025-12-23T14:30:00.000Z' })
  @IsDate()
  createdAt!: Date;

  @ApiProperty({ example: '2025-12-23T14:45:00.000Z' })
  @IsDate()
  updatedAt!: Date;
}

export class DeviceDto {
  @ApiProperty({ example: 'iPhone 14 Pro', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty({
    description: 'Device Type',
    enum: DeviceType,
    example: DeviceType.DESKTOP,
  })
  @IsOptional()
  @IsEnum(DeviceType)
  type!: DeviceType;

  @ApiProperty({ example: 'Mozilla/5.0 (iPhone...)' })
  @IsOptional()
  @IsString()
  userAgent!: string;

  @ApiProperty({ example: '113.172.45.123' })
  @IsOptional()
  @IsString()
  @MaxLength(45)
  ipAddress!: string;

  @ApiProperty({ example: 'sha256-fingerprint-hash' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fingerprint!: string;

  @ApiProperty({ example: 'user_123' })
  userId!: string;

  @ApiProperty({ example: true })
  isTrusted!: boolean;

  @ApiProperty({ example: '2025-12-23T15:30:00.000Z' })
  lastSeenAt!: Date;

  @ApiProperty({ example: '2025-12-23T14:30:00.000Z' })
  createdAt!: Date;

  // Relations
  @ApiProperty({ type: SessionDto })
  session?: SessionDto; // Session hiện tại của thiết bị này (one-to-one)
}

export class RequestDeviceDto {
  @ApiProperty({ example: 'iPhone 14 Pro', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty({
    description: 'Device Type',
    enum: DeviceType,
    example: DeviceType.DESKTOP,
  })
  @IsOptional()
  @IsEnum(DeviceType)
  type!: DeviceType;

  @ApiProperty({ example: 'Mozilla/5.0 (iPhone...)' })
  @IsOptional()
  @IsString()
  userAgent!: string;

  @ApiProperty({ example: '113.172.45.123' })
  @IsOptional()
  @IsString()
  @MaxLength(45)
  ipAddress!: string;

  @ApiProperty({ example: 'sha256-fingerprint-hash' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fingerprint!: string;
}
