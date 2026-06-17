import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { TokenResponseDto } from './dto/token-response.dto.js';
import { Public, CurrentUser, Cookies } from '@common/decorators/index.js';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful — returns access token and sets refresh token in httpOnly cookie',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials (generic error message)',
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    success: boolean;
    data: TokenResponseDto;
  }> {
    const tokens = await this.authService.login(dto);

    // Set refresh token in httpOnly cookie for security
    res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    return {
      success: true,
      data: { accessToken: tokens.accessToken },
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using a valid refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Token refresh successful — returns new access token and updates refresh token cookie',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid, expired, or revoked refresh token',
  })
  async refresh(
    @Cookies('refreshToken') refreshToken: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    success: boolean;
    data: TokenResponseDto;
  }> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const tokens = await this.authService.refreshTokens(refreshToken);

    // Update the refresh token in cookie
    res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    return {
      success: true,
      data: { accessToken: tokens.accessToken },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout — revoke refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful — refresh token revoked',
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token',
  })
  async logout(
    @CurrentUser('id') userId: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    await this.authService.logout(userId);

    // Clear refresh token cookie on logout
    res.clearCookie('refreshToken', {
      httpOnly: REFRESH_COOKIE_OPTIONS.httpOnly,
      secure: REFRESH_COOKIE_OPTIONS.secure,
      sameSite: REFRESH_COOKIE_OPTIONS.sameSite,
      path: REFRESH_COOKIE_OPTIONS.path,
    });

    return { success: true, message: 'Logged out successfully' };
  }

  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns user profile (without password hash)',
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token',
  })
  async getProfile(@CurrentUser() user: Record<string, unknown>): Promise<{
    success: boolean;
    data: Record<string, unknown>;
  }> {
    return { success: true, data: user };
  }
}
