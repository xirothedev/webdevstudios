import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';

import { Public } from '@/common/decorators/public.decorator';

import { AuthService } from './auth.service';
import { LoginCommand } from './commands/impl/login.command';
import { RegisterUserCommand } from './commands/impl/register-user.command';
import { verifyUserCommand } from './commands/impl/verifyUser.command';
import { AuthUserResponseDto } from './dto/auth-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenRequestDto } from './dto/tokenRequest.dto';
import { userInfoDto } from './dto/userInfo.dto';
import { GetProfileQuery } from './queries/impl/get-profile.query';
import { GetProfileQueryByToken } from './queries/impl/getProfileByToken.query';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly authService: AuthService,
    private readonly config: ConfigService
  ) {}

  @Public()
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
    type: AuthUserResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email already in use',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<AuthUserResponseDto> {
    const data = await this.commandBus.execute(new RegisterUserCommand(dto));

    const token = await this.authService.generateTokenFromUser(data.data);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: this.config.get<number>('JWT_EXPIRES_IN', 1000 * 60 * 60 * 24), // 24 hours
    });

    return {
      ...data,
      token: {
        access_token: token,
        // refresh_token: refreshToken,
      },
    };
  }

  @Public()
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
    type: AuthUserResponseDto,
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
  ): Promise<AuthUserResponseDto> {
    const data: AuthUserResponseDto = await this.commandBus.execute(
      new LoginCommand(dto)
    );

    const token = await this.authService.generateTokenFromUser(data.data);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: this.config.get<number>('JWT_EXPIRES_IN', 1000 * 60 * 60 * 24), // 24 hours
    });

    return {
      ...data,
      token: {
        access_token: token,
        // refresh_token: refreshToken,
      },
    };
  }

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
    });
    return { message: 'Logout successful' };
  }

  @Get('/verify')
  @ApiOperation({
    summary: 'Verify user email',
    description: 'Verify user email using the verification token',
  })
  @ApiParam({
    name: 'token',
    description: 'Verification token sent to user email',
    example: '123456',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid verification token',
  })
  async verifyEmail(
    @Query('token') token: string
  ): Promise<AuthUserResponseDto> {
    console.log(token);
    return this.commandBus.execute(
      new verifyUserCommand({ verficationCode: token })
    );
  }
}
