import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { TokenResponseDto } from './dto/token-response.dto.js';
import { OldPasswordDto, NewPasswordAndOtpDto, EmailDto } from './dto/reset-password.dtos.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UserResponseDto } from '@modules/users/dtos/user-dtos.js';
import { Public, CurrentUser, Cookies } from '@common/decorators/index.js';
import { ApiResponseDto } from '@common/dtos/api-response.dto.js';
import { ErrorCode } from '@common/error-codes.js';
import { AuthGuard } from '@nestjs/passport';

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
      throw new UnauthorizedException({
        message: 'Refresh token is missing',
        errorCode: ErrorCode.REFRESH_TOKEN_INVALID,
      });
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

  @Patch('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update current authenticated user profile (fullName and phone only)' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token',
  })
  @ApiResponse({
    status: 409,
    description: 'Phone number already exists',
  })
  async updateProfile(
    @CurrentUser('id') currentId: number,
    @Body() dto: UpdateProfileDto,
  ): Promise<ApiResponseDto<UserResponseDto>> {
    const updatedUser = await this.authService.updateProfile(currentId, dto);
    return ApiResponseDto.success(updatedUser, 'Profile updated successfully');
  }

  @Post('password/verify-password')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify old password of user before update password' })
  @ApiResponse({ status: 200, description: 'Old password is correct' })
  @ApiResponse({ status: 400, description: 'Old password is incorrect' })
  async changePasswordRequest(@CurrentUser('id') currentId: number, @Body() dto: OldPasswordDto): Promise<ApiResponseDto<null>> {
    await this.authService.changePasswordRequest(currentId, dto);
    return ApiResponseDto.success(null, 'Otp was sent to your email');
  }

  @Post('password/verify-otp')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify otp before update password' })
  @ApiResponse({ status: 200, description: 'otp is correct' })
  @ApiResponse({ status: 400, description: 'otp does not exist' })
  async changePasswordVerify(@Body() dto: NewPasswordAndOtpDto): Promise<ApiResponseDto<null>> {
    await this.authService.changePasswordVerify(dto);
    return ApiResponseDto.success(null, 'OTP verified successfully. Your password has been updated');
  }
  
  @Post('password/forgot')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status: 200, description: 'otp was sent to email' })
  @ApiResponse({ status: 400, description: 'email does not exist' })
  async forgetPassword(@Body() dto: EmailDto): Promise<ApiResponseDto<null>> {
    await this.authService.forgetPassword(dto);
    return ApiResponseDto.success(null, 'Otp was sent to your email');
  }
}
