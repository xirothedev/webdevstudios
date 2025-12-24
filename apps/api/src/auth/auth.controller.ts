import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
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
import { verify } from 'argon2';
import type { Request, Response } from 'express';

import { Cookies } from '@/common/decorators/cookies.decorators';
import { Public } from '@/common/decorators/public.decorator';
import { PrismaService } from '@/prisma/prisma.service';

import { Payload } from './auth.interface';
import { AuthService, cookieOptions, TokenType } from './auth.service';
import { GoogleLoginCommand } from './commands/impl/google-login.command';
import { LoginCommand } from './commands/impl/login.command';
import { RegisterUserCommand } from './commands/impl/register-user.command';
import { verifyUserCommand } from './commands/impl/verify-user.command';
import { AuthUserResponseDto } from './dto/auth-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { userInfoDto } from './dto/userInfo.dto';
import { GoogleAuthGuard } from './guards/google.guard';
import { GetProfileQuery } from './queries/impl/get-profile.query';
import { GetProfileQueryByToken } from './queries/impl/getProfileByToken.query';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly authService: AuthService,
    private readonly prisma: PrismaService
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

    const payload: Payload = {
      sub: data.data.id,
      email: data.data.email,
      role: data.data.role,
    };

    const new_access_token = await this.authService.generateTokenFromUser(
      payload,
      TokenType.ACCESS
    );

    res.cookie('access_token', new_access_token, cookieOptions);

    return {
      ...data,
      token: {
        access_token: new_access_token,
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

    const payload: Payload = {
      sub: data.data.id,
      email: data.data.email,
      role: data.data.role,
    };

    const token = await this.authService.generateTokenFromUser(
      payload,
      TokenType.ACCESS
    );
    res.cookie('access_token', token, cookieOptions);

    const refresh_token = await this.authService.generateTokenFromUser(
      payload,
      TokenType.REFRESH
    );

    res.cookie('refresh_token', refresh_token, cookieOptions);

    const old_session = await this.prisma.session.findFirst({
      where: { userId: payload.sub },
    });

    if (!old_session)
      this.authService.createUserSession(payload, refresh_token);
    else this.authService.updateUserSession(payload, refresh_token);

    return {
      ...data,
      token: {
        access_token: token,
        // refresh_token: refresh_token,
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
  async getMyProfile(
    @Cookies('access_token') token: string
  ): Promise<userInfoDto> {
    return this.queryBus.execute(new GetProfileQueryByToken(token));
  }

  @Public()
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
  async logout(
    @Cookies('access_token') token: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ message: string }> {
    const user = await this.authService.extractUserFromToken(
      token,
      TokenType.ACCESS
    );

    if (user) {
      this.authService.deleteUserSession(user.sub);
    }

    res.clearCookie('access_token', { httpOnly: true });
    res.clearCookie('refresh_token', { httpOnly: true });

    return { message: 'Logout successful' };
  }

  @Public()
  @Post('/verify')
  @ApiOperation({
    summary: 'Verify user email',
    description: 'Verify user email using the verification token',
  })
  @ApiQuery({
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
  async verifyEmail(@Query('token') token: string) {
    return this.commandBus.execute(
      new verifyUserCommand({ verificationCode: token })
    );
  }

  @Post('/refresh')
  @Public()
  async refreshToken(
    @Cookies('refresh_token') token: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload = await this.authService.extractUserFromToken(
      token,
      TokenType.REFRESH
    );
    const user = {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    const old_session = await this.prisma.session.findFirst({
      where: { userId: user.sub },
    });

    if (!old_session) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    // Checks with the one in DB
    if (
      !old_session.refreshToken ||
      !verify(old_session.refreshToken as string, token)
    ) {
      throw new BadRequestException('Invalid Refresh Token');
    }

    const new_access_token = await this.authService.generateTokenFromUser(
      user,
      TokenType.ACCESS
    );
    const new_refresh_token = await this.authService.generateTokenFromUser(
      user,
      TokenType.REFRESH
    );

    res.cookie('access_token', new_access_token, cookieOptions);
    res.cookie('refresh_token', new_refresh_token, cookieOptions);

    this.authService.updateUserSession(user, new_refresh_token);

    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token,
    };
  }

  @Public()
  @Get('/google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    this.logger.log('Google Auth');
  }

  @Public()
  @Get('/google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const data: AuthUserResponseDto = await this.commandBus.execute(
      new GoogleLoginCommand(req.user!)
    );

    const { id, email, role } = data.data;

    const new_access_token = await this.authService.generateTokenFromUser(
      { sub: id, email, role },
      TokenType.ACCESS
    );

    const new_refresh_token = await this.authService.generateTokenFromUser(
      { sub: id, email, role },
      TokenType.REFRESH
    );

    res.cookie('access_token', new_access_token, cookieOptions);
    res.cookie('refresh_token', new_refresh_token, cookieOptions);

    return res.redirect('https://google.com');
  }
}
