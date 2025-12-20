import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { LoginCommand } from './commands/login.command';
import { RegisterUserCommand } from './commands/register-user.command';
import { AuthUserDto } from './dto/auth-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GetProfileQuery } from './queries/get-profile.query';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register new account',
    description: 'Create a new user account with email and password',
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      example1: {
        summary: 'Register with full information',
        value: {
          email: 'user@example.com',
          password: 'password123',
          fullName: 'John Doe',
          phone: '0123456789',
        },
      },
      example2: {
        summary: 'Register with email and password only',
        value: {
          email: 'user2@example.com',
          password: 'password123',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Registration successful',
    type: AuthUserDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email already in use',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  register(@Body() dto: RegisterDto): Promise<AuthUserDto> {
    return this.commandBus.execute(new RegisterUserCommand(dto));
  }

  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with email and password',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      example1: {
        summary: 'Login',
        value: {
          email: 'user@example.com',
          password: 'password123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthUserDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  login(@Body() dto: LoginDto): Promise<AuthUserDto> {
    return this.commandBus.execute(new LoginCommand(dto));
  }

  @Get('profile/:id')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Retrieve detailed user information by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: AuthUserDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  getProfile(@Param('id') id: string): Promise<AuthUserDto> {
    return this.queryBus.execute(new GetProfileQuery(id));
  }
}
