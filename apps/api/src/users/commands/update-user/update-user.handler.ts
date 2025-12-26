import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRole } from 'generated/prisma/client';

import { UserRepository } from '../../../auth/infrastructure/user.repository';
import { PrivateUserDto } from '../../dtos/responses.dto';
import { UpdateUserCommand } from './update-user.command';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: UpdateUserCommand): Promise<PrivateUserDto> {
    const { targetUserId, fullName, phone, avatar, role } = command;

    const user = await this.userRepository.findById(targetUserId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData: {
      fullName?: string;
      phone?: string;
      avatar?: string;
      role?: UserRole;
    } = {};

    if (fullName !== undefined) {
      updateData.fullName = fullName;
    }
    if (phone !== undefined) {
      updateData.phone = phone;
    }
    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }
    if (role !== undefined) {
      updateData.role = role;
    }

    const updatedUser = await this.userRepository.update(
      targetUserId,
      updateData
    );

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
