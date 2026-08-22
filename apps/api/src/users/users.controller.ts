/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { UserRole } from '@prisma/client';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public, Roles } from '@/common/decorators';
import { RolesGuard } from '@/common/guards';
import { FileValidationPipe } from '../storage/pipes/file-validation.pipe';
import {
  PrivateUserDto,
  PublicUserDto,
  SearchUsersResponseDto,
  UserListResponseDto,
  UpdateProfileDto,
  UpdateUserDto,
} from './dto';
import { UsersService } from './services/users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update own profile',
    description: 'Update the authenticated user profile information (fullName, phone)',
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: PrivateUserDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateProfileDto,
  ): Promise<PrivateUserDto> {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Patch('avatar')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update own avatar',
    description:
      'Update the authenticated user avatar. Upload image file (jpg, png, webp, max 5MB). Image will be resized to 400x400px and converted to WebP format.',
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar updated successfully',
    type: PrivateUserDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid file type or size',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateAvatar(
    @CurrentUser() user: { id: string },
    @UploadedFile(new FileValidationPipe())
    file: Express.Multer.File,
  ): Promise<PrivateUserDto> {
    return this.usersService.updateAvatar(user.id, file);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get own profile',
    description: 'Get the authenticated user profile information (full data)',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: PrivateUserDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(
    @CurrentUser() user: { id: string; email: string; role: UserRole },
  ): Promise<PrivateUserDto> {
    return this.usersService.getOwnProfile(user.id);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get user by ID',
    description:
      'Get user information by ID. Returns limited public data (id, fullName, avatar) for regular users, or full data for own profile or admin.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description:
      'User retrieved successfully. Returns PublicUserDto (id, fullName, avatar) for regular users, or PrivateUserDto (full data) for own profile or admin.',
    type: PrivateUserDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(
    @Param('id') id: string,
    @CurrentUser() user?: { id: string; role: UserRole },
  ): Promise<PublicUserDto | PrivateUserDto> {
    return this.usersService.getUserById(id, user?.id, user?.role);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List users (Admin only)',
    description: 'Get a paginated list of all users. Admin only endpoint.',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    example: 1,
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    example: 10,
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'role',
    description: 'Filter by user role',
    enum: UserRole,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: UserListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async listUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: UserRole,
  ): Promise<UserListResponseDto> {
    return this.usersService.listUsers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      role,
    );
  }

  @Get('search')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Search users',
    description:
      'Search users by query. Regular users can only search by fullName and receive limited public data. Admin can search by email and fullName and receive full data.',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search query',
    example: 'John',
    required: true,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    example: 1,
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    example: 10,
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: SearchUsersResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async searchUsers(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: { id: string; role: UserRole },
  ): Promise<SearchUsersResponseDto> {
    return this.usersService.searchUsers(
      query,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      user?.role,
    );
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user (Admin only)',
    description: 'Update any user information. Admin only endpoint.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID to update',
    example: 'clx1234567890',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: PrivateUserDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<PrivateUserDto> {
    return this.usersService.updateUser(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete user (Admin only)',
    description: 'Delete a user and all related data. Admin only endpoint.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID to delete',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.usersService.deleteUser(id);
  }
}
