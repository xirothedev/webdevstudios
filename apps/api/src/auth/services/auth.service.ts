import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';

import { isBefore } from 'date-fns';

import { UserRepo } from '@/users/repo';

import { MailService } from '../../mail/mail.service';
import {
  LoginDto,
  RegisterDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  Verify2FADto,
  VerifyEmailDto,
} from '../dto';
import { MfaRepo, SessionRepo } from '../repo';
import { TokenService, TokenStorageService, TotpService } from '../infrastructure';
import { SessionIssuer } from './session-issuer.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly sessionRepo: SessionRepo,
    private readonly mfaRepo: MfaRepo,
    private readonly tokenService: TokenService,
    private readonly tokenStorage: TokenStorageService,
    private readonly totpService: TotpService,
    private readonly mailService: MailService,
    private readonly sessionIssuer: SessionIssuer,
  ) {}

  async register(dto: RegisterDto): Promise<{ userId: string }> {
    const existingUser = await this.userRepo.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await argon2.hash(dto.password);

    const user = await this.userRepo.create({
      email: dto.email,
      password: hashedPassword,
      fullName: dto.fullName,
      phone: dto.phone,
      emailVerified: false,
    });

    const verificationToken = this.tokenService.generateEmailVerificationToken();

    await this.tokenStorage.storeEmailVerificationToken(verificationToken, user.id);

    await this.mailService.sendVerificationEmail(dto.email, verificationToken);

    return { userId: user.id };
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<{ success: boolean }> {
    const userId = await this.tokenStorage.getEmailVerificationToken(dto.token);

    if (!userId) {
      throw new NotFoundException('Invalid or expired verification token');
    }

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    await this.userRepo.update(user.id, { emailVerified: true });

    await this.tokenStorage.deleteEmailVerificationToken(dto.token);

    return { success: true };
  }

  async login(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    ttlSeconds?: number;
    user: {
      id: string;
      email: string;
      fullName: string | null;
      emailVerified: boolean;
      mfaEnabled: boolean;
    };
    requires2FA?: boolean;
  }> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(user.password, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new BadRequestException('Please verify your email before logging in');
    }

    if (user.mfaEnabled) {
      return {
        accessToken: '',
        refreshToken: '',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          emailVerified: user.emailVerified,
          mfaEnabled: user.mfaEnabled,
        },
        requires2FA: true,
      };
    }

    const ttlSeconds = dto.rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;
    const { accessToken, refreshToken } = await this.sessionIssuer.issue(user.id, {
      ip: ipAddress,
      userAgent,
      mfaTrusted: !user.mfaEnabled,
      ttlSeconds,
    });

    return {
      accessToken,
      refreshToken,
      ttlSeconds,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        emailVerified: user.emailVerified,
        mfaEnabled: user.mfaEnabled,
      },
    };
  }

  async refresh(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    ttlSeconds: number;
  }> {
    let payload;
    try {
      payload = this.tokenService.verifyToken(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.sessionRepo.findByRefreshToken(refreshToken);
    if (!session || session.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid or expired session');
    }

    if (isBefore(session.expiresAt, new Date())) {
      throw new UnauthorizedException('Session expired');
    }

    const newAccessToken = this.tokenService.generateAccessToken(
      {
        sub: payload.sub,
        email: session.user.email,
        role: session.user.role,
      },
      session.id,
    );

    const newRefreshToken = this.tokenService.generateRefreshToken({
      sub: payload.sub,
    });

    await this.sessionRepo.updateRefreshToken(session.id, newRefreshToken);

    const mfaVerified = await this.tokenStorage.getSessionMfaVerified(session.id);
    if (mfaVerified) {
      const ttl = Math.floor((session.expiresAt.getTime() - Date.now()) / 1000);
      if (ttl > 0) {
        await this.tokenStorage.storeSessionMfaVerified(session.id, ttl);
      }
    }

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      // cookie must die with the session, not a hardcoded lifetime
      ttlSeconds: Math.max(0, Math.floor((session.expiresAt.getTime() - Date.now()) / 1000)),
    };
  }

  async logout(userId: string, sessionId?: string): Promise<{ success: boolean }> {
    if (sessionId) {
      await this.sessionRepo.revoke(sessionId);
    } else {
      await this.sessionRepo.revokeAllByUserId(userId);
    }

    return { success: true };
  }

  async getCurrentUser(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getSessions(userId: string) {
    const sessions = await this.sessionRepo.findByUserId(userId);

    return sessions.map((session) => ({
      id: session.id,
      device: session.device
        ? {
            id: session.deviceId,
            name: session.device?.name,
            type: session.device?.type,
            lastSeenAt: session.device?.lastSeenAt,
          }
        : null,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      status: session.status,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    }));
  }

  async enable2FA(userId: string): Promise<{
    qrCode: string;
    secret: string;
    backupCodes: string[];
  }> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.mfaEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    const email = user.email;

    const secret = this.totpService.generateSecret(email);
    const qrCode = await this.totpService.generateQRCode(secret, email);
    const backupCodes = this.totpService.generateBackupCodes(10);

    const hashedBackupCodes = await Promise.all(backupCodes.map((code) => argon2.hash(code)));

    await this.mfaRepo.provisionTotp(userId, secret, hashedBackupCodes);

    // Legacy mirror: MfaRepo.resolveSecret falls back to User.mfaSecret
    await this.userRepo.update(userId, {
      mfaSecret: secret,
    });

    return {
      qrCode,
      secret,
      backupCodes,
    };
  }

  async verify2FA(
    userId: string,
    dto: Verify2FADto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{
    accessToken?: string;
    refreshToken?: string;
    ttlSeconds?: number;
    user?: {
      id: string;
      email: string;
      fullName: string | null;
      emailVerified: boolean;
      mfaEnabled: boolean;
    };
    verified?: boolean;
  }> {
    const { code, sessionId } = dto;

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const secret = await this.mfaRepo.resolveSecret(userId);
    if (!secret) {
      throw new BadRequestException('2FA is not enabled for this user');
    }

    const isValidTotp = this.totpService.verifyCode(secret, code);

    if (!isValidTotp) {
      const consumed = await this.mfaRepo.verifyBackupCodeAndConsume(userId, code);

      if (!consumed) {
        throw new UnauthorizedException('Invalid 2FA code');
      }
    }

    if (sessionId) {
      const ttlSeconds = 7 * 24 * 60 * 60;
      const { accessToken, refreshToken } = await this.sessionIssuer.issue(user.id, {
        ip: ipAddress,
        userAgent,
        mfaTrusted: true,
        ttlSeconds,
      });

      return {
        accessToken,
        refreshToken,
        ttlSeconds,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          emailVerified: user.emailVerified,
          mfaEnabled: user.mfaEnabled,
        },
      };
    }

    const activeTotp = await this.mfaRepo.findActiveTotp(userId);
    if (activeTotp && !activeTotp.isVerified) {
      await this.mfaRepo.activateTotp(activeTotp.id);

      await this.userRepo.update(userId, {
        mfaEnabled: true,
      });
    }

    return { verified: true };
  }

  async requestPasswordReset(dto: RequestPasswordResetDto): Promise<{ success: boolean }> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      // Don't reveal if user exists or not
      return { success: true };
    }

    const resetToken = this.tokenService.generatePasswordResetToken();

    await this.tokenStorage.storePasswordResetToken(resetToken, user.id);

    await this.mailService.sendPasswordResetEmail(dto.email, resetToken);

    return { success: true };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ success: boolean }> {
    const userId = await this.tokenStorage.getPasswordResetToken(dto.token);

    if (!userId) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await argon2.hash(dto.newPassword);

    await this.userRepo.update(user.id, {
      password: hashedPassword,
    });

    await this.sessionRepo.revokeAllByUserId(user.id);

    await this.tokenStorage.deletePasswordResetToken(dto.token);

    return { success: true };
  }
}
