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

import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'

import { AuthModule } from '../auth/auth.module'
// Guards
import { RolesGuard } from '@/common/guards'
import { StorageModule } from '../storage/storage.module'
// Commands
import { DeleteUserHandler } from './commands/delete-user'
import { UpdateAvatarHandler } from './commands/update-avatar'
import { UpdateProfileHandler } from './commands/update-profile'
import { UpdateUserHandler } from './commands/update-user'
// Queries
import { GetUserByIdHandler } from './queries/get-user-by-id'
import { ListUsersHandler } from './queries/list-users'
import { SearchUsersHandler } from './queries/search-users'
// Controller
import { UsersController } from './users.controller'

const CommandHandlers = [
  UpdateProfileHandler,
  UpdateAvatarHandler,
  UpdateUserHandler,
  DeleteUserHandler,
]

const QueryHandlers = [GetUserByIdHandler, ListUsersHandler, SearchUsersHandler]

@Module({
  imports: [CqrsModule, AuthModule, StorageModule],
  controllers: [UsersController],
  providers: [...CommandHandlers, ...QueryHandlers, RolesGuard],
})
export class UsersModule {}
