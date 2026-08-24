import { UserRole } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { StorageService } from '../../storage/storage.service';
import { UpdateProfileDto, UpdateUserDto } from '../dto';
import { UserRepo, UserRow } from '../repo';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly storageService: StorageService,
  ) {}

  // Rows persist R2 keys; clients get derived URLs (absolute OAuth pictures pass through).
  private resolveUser<T extends { avatar: string | null }>(user: T): T {
    return { ...user, avatar: this.storageService.resolveMediaUrl(user.avatar) };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserRow> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData: { fullName?: string; phone?: string } = {};
    if (dto.fullName !== undefined) {
      updateData.fullName = dto.fullName;
    }
    if (dto.phone !== undefined) {
      updateData.phone = dto.phone;
    }

    return this.resolveUser(await this.userRepo.update(userId, updateData));
  }

  async updateAvatar(userId: string, file: Express.Multer.File): Promise<UserRow> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.avatar && !user.avatar.includes('://')) {
      // Stored avatars are R2 keys; absolute URLs are external (OAuth) and not ours to delete.
      try {
        await this.storageService.deleteFile(user.avatar);
      } catch (error) {
        console.error('Failed to delete old avatar:', error);
      }
    }

    const timestamp = Date.now();
    const fileId = randomUUID();
    const key = `avatars/${userId}/${timestamp}-${fileId}.webp`;

    const uploadResult = await this.storageService.uploadImage({
      key,
      file: file.buffer,
      contentType: file.mimetype,
      width: 400,
      height: 400,
    });

    return this.resolveUser(await this.userRepo.update(userId, { avatar: uploadResult.key }));
  }

  async updateUser(targetUserId: string, dto: UpdateUserDto): Promise<UserRow> {
    const user = await this.userRepo.findById(targetUserId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData: {
      fullName?: string;
      phone?: string;
      avatar?: string;
      role?: UserRole;
    } = {};

    if (dto.fullName !== undefined) {
      updateData.fullName = dto.fullName;
    }
    if (dto.phone !== undefined) {
      updateData.phone = dto.phone;
    }
    if (dto.avatar !== undefined) {
      updateData.avatar = dto.avatar;
    }
    if (dto.role !== undefined) {
      updateData.role = dto.role;
    }

    return this.resolveUser(await this.userRepo.update(targetUserId, updateData));
  }

  async deleteUser(userId: string): Promise<{ success: boolean }> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepo.remove(userId);

    return { success: true };
  }

  async getOwnProfile(userId: string): Promise<UserRow> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.resolveUser(user);
  }

  async getUserById(
    userId: string,
    requesterId?: string,
    requesterRole?: UserRole,
  ): Promise<UserRow | Pick<UserRow, 'id' | 'fullName' | 'avatar'>> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (requesterId === userId || requesterRole === UserRole.ADMIN) {
      return this.resolveUser(user);
    }

    return {
      id: user.id,
      fullName: user.fullName,
      avatar: this.storageService.resolveMediaUrl(user.avatar),
    };
  }

  async listUsers(
    page: number,
    limit: number,
    role?: UserRole,
  ): Promise<{
    users: UserRow[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const { users, total } = await this.userRepo.list(page, limit, role);
    return {
      users: users.map((u) => this.resolveUser(u)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async searchUsers(
    query: string,
    page: number,
    limit: number,
    requesterRole?: UserRole,
  ): Promise<{
    users: UserRow[] | Pick<UserRow, 'id' | 'fullName' | 'avatar'>[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    // ponytail: privacy branch mirrors old handler — admin sees private rows, others public shape
    const isAdmin = requesterRole === UserRole.ADMIN;
    const { users, total } = await this.userRepo.searchByKeyword(query, page, limit, isAdmin);
    const totalPages = Math.ceil(total / limit);

    if (!isAdmin) {
      return {
        users: users.map((user) => ({
          id: user.id,
          fullName: user.fullName,
          avatar: this.storageService.resolveMediaUrl(user.avatar),
        })),
        pagination: { page, limit, total, totalPages },
      };
    }

    return {
      users: users.map((u) => this.resolveUser(u)),
      pagination: { page, limit, total, totalPages },
    };
  }
}
