import { Roles, CurrentUser, Public } from '@common/decorators';
import { Role } from '@common/enums';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, ParseIntPipe, NotFoundException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { CreateUserDto, UpdateUserDto, UserResponseDto, UserQueryDto, ToggleActivateDto } from './dtos/user-dtos.js';
import { ApiResponseDto } from '@common/dtos/api-response.dto';
import { PaginationDto } from '@common/dtos/pagination.dto.js';
import { OldPasswordDto, NewPasswordAndOtpDto, EmailDto } from './dtos/reset-password.dtos.js';
import { User } from './entities/user.entity.js';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard.js';

const ParseUserId = new ParseIntPipe({
  exceptionFactory: () => new NotFoundException('User not found'),
});

@UseGuards(JwtAuthGuard)
@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
// @Roles(Role.OWNER)
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'User email or phone already exists' })
  async create(@Body() dto: CreateUserDto): Promise<ApiResponseDto<UserResponseDto>> {
    const userResponse = await this.userService.create(dto);
    return ApiResponseDto.success(userResponse, 'User created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'List all users with filters' })
  @ApiResponse({ status: 200, description: 'Returns filtered users', type: [UserResponseDto] })
  async findAll(@Query() query: UserQueryDto): Promise<ApiResponseDto<PaginationDto<UserResponseDto>>> {
    const pagination = await this.userService.findAll(query);
    return ApiResponseDto.success(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single user by id' })
  @ApiParam({ name: 'id', description: 'User id' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id', ParseUserId) id: number): Promise<ApiResponseDto<UserResponseDto>> {
    const user = await this.userService.findById(id);
    const { passwordHash, ...rest } = user;
    return ApiResponseDto.success(rest as UserResponseDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user information' })
  @ApiParam({ name: 'id', description: 'User id' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'User email already exists' })
  async update(@Param('id', ParseUserId) id: number, @Body() dto: UpdateUserDto): Promise<ApiResponseDto<UserResponseDto>> {
    const userResponse = await this.userService.update(id, dto);
    return ApiResponseDto.success(userResponse, 'User updated successfully');
  }

  @Patch('toggle-activate/:id')
  @ApiOperation({ summary: 'Update user active status' })
  @ApiParam({ name: 'id', description: 'User id' })
  @ApiResponse({ status: 200, description: 'User updated active status successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'User email already exists' })
  async toggleActivate(@Param('id', ParseUserId) id: number, @Body() dto: ToggleActivateDto, @CurrentUser('id') currentId: number): Promise<ApiResponseDto<null>> {
    await this.userService.toggleActivate(id, dto.isActive, currentId);
    return ApiResponseDto.success(null, 'User updated successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user (block if user still active)' })
  @ApiParam({ name: 'id', description: 'user id' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 400, description: 'Can not delete user still active' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id', ParseUserId) id: number): Promise<ApiResponseDto<null>> {
    await this.userService.remove(id);
    return ApiResponseDto.success(null, 'Deleted user successfully');
  }

  @Post('password/verify-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify old password of user before update password' })
  @ApiResponse({ status: 200, description: 'Old password is correct' })
  @ApiResponse({ status: 400, description: 'Old password is incorrect' })
  async changePasswordRequest(@CurrentUser('id') currentId: number, @Body() dto: OldPasswordDto): Promise<ApiResponseDto<null>> {
    await this.userService.changePasswordRequest(currentId, dto);
    return ApiResponseDto.success(null,"Old password is correct. Otp was sent to your email");
  }
  
  @Post('password/verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify otp before update password' })
  @ApiResponse({ status: 200, description: 'otp is correct' })
  @ApiResponse({ status: 400, description: 'otp does not exist' })
  async changePasswordVerify(@Body() dto: NewPasswordAndOtpDto): Promise<ApiResponseDto<null>> {
    await this.userService.changePasswordVerify(dto);
    return ApiResponseDto.success(null,"OTP verified successfully. Your password has been updated");
  }

  @Post('password/forgot')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status: 200, description: 'otp was sent to email' })
  @ApiResponse({ status: 400, description: 'email does not exist' })
  async forgetPassword(@Body() dto: EmailDto): Promise<ApiResponseDto<null>> {
    await this.userService.forgetPassword(dto);
    return ApiResponseDto.success(null,"OTP verified successfully. Your password has been updated");
  }

  
}
