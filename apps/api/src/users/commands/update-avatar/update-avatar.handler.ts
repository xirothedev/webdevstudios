import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';

import { UserRepository } from '@/auth/infrastructure/user.repository';
import { StorageService } from '@/storage/storage.service';

import { PrivateUserDto } from '../../dtos/responses.dto';
import { UpdateAvatarCommand } from './update-avatar.command';

@CommandHandler(UpdateAvatarCommand)
export class UpdateAvatarHandler implements ICommandHandler<UpdateAvatarCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly storageService: StorageService
  ) {}

  async execute(command: UpdateAvatarCommand): Promise<PrivateUserDto> {
    const { userId, file } = command;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const oldKey = this.storageService.extractKeyFromUrl(user.avatar);
      if (oldKey) {
        try {
          await this.storageService.deleteFile(oldKey);
        } catch (error) {
          // Log error but don't fail the upload
          console.error('Failed to delete old avatar:', error);
        }
      }
    }

    // Generate file key
    const timestamp = Date.now();
    const fileId = randomUUID();
    const key = `avatars/${userId}/${timestamp}-${fileId}.webp`;

    // Upload image to R2 with optimization (400x400px, WebP)
    const uploadResult = await this.storageService.uploadImage({
      key,
      file: file.buffer,
      contentType: file.mimetype,
      width: 400,
      height: 400,
    });

    // Update user avatar URL
    const updatedUser = await this.userRepository.update(userId, {
      avatar: uploadResult.url,
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
      emailVerified: updatedUser.emailVerified,
      phoneVerified: updatedUser.phoneVerified,
      mfaEnabled: updatedUser.mfaEnabled,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }
}
