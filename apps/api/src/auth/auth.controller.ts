import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';

import { LoginCommand } from './commands/login.command';
import { RegisterUserCommand } from './commands/register-user.command';
import { AuthUserDto } from './dto/auth-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenRequestDto } from './dto/tokenRequest.dto';
import { userInfoDto } from './dto/userInfo.dto';
import { GetProfileQuery } from './queries/get-profile.query';
import { GetProfileQueryByToken } from './queries/getProfileByToken.query';

@ApiTags('auth')
@ApiBearerAuth()
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
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<AuthUserDto> {
    const data: AuthUserDto = await this.commandBus.execute(
      new LoginCommand(dto)
    );
    const token = data.token;

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    console.log(token);
    return data;
  }

  @UseGuards(AuthGuard('jwt-strategy'))
  @Get('profile/me')
  @ApiOperation({
    summary: 'Get my profile',
    description: 'Retrieve detailed information about the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: userInfoDto,
  })
  getMyProfile(@Req() req: TokenRequestDto): Promise<userInfoDto> {
    return this.queryBus.execute(new GetProfileQueryByToken(req.userToken));
  }

  @UseGuards(AuthGuard('jwt-strategy'))
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
    type: userInfoDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  getProfile(@Param('id') id: string): Promise<userInfoDto> {
    return this.queryBus.execute(new GetProfileQuery(id));
  }

  @Post('logout')
  @ApiOperation({
    summary: 'User logout',
    description:
      'Logout the authenticated user by clearing the access token cookie',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
  })
  logout(@Res({ passthrough: true }) res: Response): { message: string } {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    return { message: 'Logout successful' };
  }
}
