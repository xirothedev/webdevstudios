import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AuthModule } from '@/auth/auth.module';
import { StorageModule } from '@/storage/storage.module';

// Guards
import { RolesGuard } from '../common/guards/roles.guard';
// Commands
import { DeleteUserHandler } from './commands/delete-user/delete-user.handler';
import { UpdateAvatarHandler } from './commands/update-avatar/update-avatar.handler';
import { UpdateProfileHandler } from './commands/update-profile/update-profile.handler';
import { UpdateUserHandler } from './commands/update-user/update-user.handler';
// Queries
import { GetUserByIdHandler } from './queries/get-user-by-id/get-user-by-id.handler';
import { ListUsersHandler } from './queries/list-users/list-users.handler';
import { SearchUsersHandler } from './queries/search-users/search-users.handler';
// Controller
import { UsersController } from './users.controller';

const CommandHandlers = [
  UpdateProfileHandler,
  UpdateAvatarHandler,
  UpdateUserHandler,
  DeleteUserHandler,
];

const QueryHandlers = [
  GetUserByIdHandler,
  ListUsersHandler,
  SearchUsersHandler,
];

@Module({
  imports: [CqrsModule, AuthModule, StorageModule],
  controllers: [UsersController],
  providers: [...CommandHandlers, ...QueryHandlers, RolesGuard],
})
export class UsersModule {}
