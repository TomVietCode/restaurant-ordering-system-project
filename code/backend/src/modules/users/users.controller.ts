import { Roles, CurrentUser } from '@common/decorators';
import { Role } from '@common/enums';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, NotFoundException, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { ChangePasswordDto, CreateUserDto, UpdateUserDto, UserResponseDto, UserQueryDto } from './dto/dtos.js';
import { ApiResponseDto } from '@common/dtos/api-response.dto';
import { User } from './entities/user.entity.js';
import { PaginationDto } from '@common/dtos/pagination.dto.js';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@Roles(Role.OWNER)
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
    const { search, role, isActive, sortBy = 'createdAt', order = 'DESC', page = 1, limit = 10 } = query;
    const { data, total } = await this.userService.findAll({
      search,
      role,
      isActive,
      sortBy,
      order,
      page,
      limit,
    });
    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationDto<UserResponseDto> = {
      items: data,
      page,
      limit,
      total,
      totalPages,
    };

    return ApiResponseDto.success(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single user by id' })
  @ApiParam({ name: 'id', description: 'User id' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: number): Promise<ApiResponseDto<UserResponseDto>> {
    const user = await this.userService.findById(id);
    // HACK: findById là hàm có sẵn (có liên quan module khác) không thể thay đổi để bọc dto hoặc check null ở service được nên phải check null ở controller
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash, ...userResponse } = user;
    return ApiResponseDto.success(userResponse as UserResponseDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user information' })
  @ApiParam({ name: 'id', description: 'User id' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'User email already exists' })
  async update(@Param('id') id: number, @Body() dto: UpdateUserDto): Promise<ApiResponseDto<UserResponseDto>> {
    const userResponse = await this.userService.update(id, dto);
    return ApiResponseDto.success(userResponse, 'User updated successfully');
  }

  // @Patch(':id/change-password')
  // @ApiOperation({ summary: 'Change user password' })
  // @ApiParam({ name: 'id', description: 'User id' })
  // @ApiResponse({ status: 200, description: 'User updated successfully'})
  // @ApiResponse({ status: 404, description: 'User not found' })
  // @ApiResponse({ status: 409, description: 'Password is incorrect' })
  // @ApiResponse({ status: 400, description: 'User not active or new password does not match confirm new password' })
  // async changePassword(
  //   @Param('id') id: number,
  //   @Body() dto: ChangePasswordDto,
  // ): Promise<ApiResponseDto<null>> {
  //   await this.userService.changePassword(id, dto);
  //   return ApiResponseDto.success(null, 'Password changed successfully');
  // }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inactivate a user (block if role is OWNER)' })
  @ApiParam({ name: 'id', description: 'user id' })
  @ApiResponse({ status: 200, description: 'User inactivated successfully' })
  @ApiResponse({ status: 400, description: 'Owner cannot be inactivated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async inactive(@Param('id') id: number, @CurrentUser('id') userId: number): Promise<ApiResponseDto<null>> {
    await this.userService.inactive(id, userId);
    return ApiResponseDto.success(null, 'Inactivate user successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user (block if user still active)' })
  @ApiParam({ name: 'id', description: 'user id' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 400, description: 'Can not delete user still active' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: number): Promise<ApiResponseDto<null>> {
    await this.userService.remove(id);
    return ApiResponseDto.success(null, 'Inactivate user successfully');
  }
}
