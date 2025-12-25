import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserRepository } from '@/auth/infrastructure/user.repository';

import { PrivateUserDto } from '../../dtos/responses.dto';
import { UpdateAvatarCommand } from './update-avatar.command';

@CommandHandler(UpdateAvatarCommand)
export class UpdateAvatarHandler implements ICommandHandler<UpdateAvatarCommand> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: UpdateAvatarCommand): Promise<PrivateUserDto> {
    const { userId, avatar } = command;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // TODO: Implement S3/R2 Cloudflare storage for avatar upload
    // - Hiện tại: Accept avatar URL string
    // - Future: Upload file → R2 Cloudflare → Return CDN URL
    // - Image validation (size, format: jpg, png, webp)
    // - Image optimization/resizing (thumbnails)
    // - Delete old avatar khi upload mới

    const updatedUser = await this.userRepository.update(userId, { avatar });

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
