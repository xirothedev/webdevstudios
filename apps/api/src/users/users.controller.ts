import { UserRole } from '@generated/prisma';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';

import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { DeleteUserCommand } from './commands/delete-user/delete-user.command';
import { UpdateAvatarCommand } from './commands/update-avatar/update-avatar.command';
import { UpdateProfileCommand } from './commands/update-profile/update-profile.command';
import { UpdateUserCommand } from './commands/update-user/update-user.command';
import {
  PrivateUserDto,
  PublicUserDto,
  SearchUsersResponseDto,
  UserListResponseDto,
} from './dtos/responses.dto';
import { UpdateAvatarDto } from './dtos/update-avatar.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { GetUserByIdQuery } from './queries/get-user-by-id/get-user-by-id.query';
import { ListUsersQuery } from './queries/list-users/list-users.query';
import { SearchUsersQuery } from './queries/search-users/search-users.query';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update own profile',
    description:
      'Update the authenticated user profile information (fullName, phone)',
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
    @Body() dto: UpdateProfileDto
  ): Promise<PrivateUserDto> {
    return this.commandBus.execute(
      new UpdateProfileCommand(user.id, dto.fullName, dto.phone)
    );
  }

  @Patch('avatar')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update own avatar',
    description:
      'Update the authenticated user avatar. Currently accepts avatar URL string. TODO: Implement S3/R2 Cloudflare upload.',
  })
  @ApiBody({ type: UpdateAvatarDto })
  @ApiResponse({
    status: 200,
    description: 'Avatar updated successfully',
    type: PrivateUserDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateAvatar(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateAvatarDto
  ): Promise<PrivateUserDto> {
    return this.commandBus.execute(
      new UpdateAvatarCommand(user.id, dto.avatar)
    );
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
    @CurrentUser() user: { id: string; email: string; role: UserRole }
  ): Promise<PrivateUserDto> {
    return this.queryBus.execute(
      new GetUserByIdQuery(user.id, user.id, user.role)
    );
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
    @CurrentUser() user?: { id: string; role: UserRole }
  ): Promise<PublicUserDto | PrivateUserDto> {
    return this.queryBus.execute(
      new GetUserByIdQuery(id, user?.id, user?.role)
    );
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
    @Query('role') role?: UserRole
  ): Promise<UserListResponseDto> {
    return this.queryBus.execute(
      new ListUsersQuery(
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 10,
        role
      )
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
    @CurrentUser() user?: { id: string; role: UserRole }
  ): Promise<SearchUsersResponseDto> {
    return this.queryBus.execute(
      new SearchUsersQuery(
        query,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 10,
        user?.id,
        user?.role
      )
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
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto
  ): Promise<PrivateUserDto> {
    return this.commandBus.execute(
      new UpdateUserCommand(id, dto.fullName, dto.phone, dto.avatar, dto.role)
    );
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
    return this.commandBus.execute(new DeleteUserCommand(id));
  }
}
