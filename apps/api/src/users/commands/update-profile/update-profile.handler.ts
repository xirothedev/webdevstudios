import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserRepository } from '../../../auth/infrastructure/user.repository';
import { PrivateUserDto } from '../../dtos/responses.dto';
import { UpdateProfileCommand } from './update-profile.command';

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler implements ICommandHandler<UpdateProfileCommand> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: UpdateProfileCommand): Promise<PrivateUserDto> {
    const { userId, fullName, phone } = command;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData: { fullName?: string; phone?: string } = {};
    if (fullName !== undefined) {
      updateData.fullName = fullName;
    }
    if (phone !== undefined) {
      updateData.phone = phone;
    }

    const updatedUser = await this.userRepository.update(userId, updateData);

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
