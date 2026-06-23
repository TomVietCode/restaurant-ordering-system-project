import { Roles, CurrentUser } from '@common/decorators';
import { Role } from '@common/enums';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { ChangePasswordDto, CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/dtos.js';
import { ApiResponseDto } from '@common/dtos/api-response.dto';


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
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({ status: 200, description: 'Returns all users', type: [UserResponseDto] })
  async findAll(): Promise<ApiResponseDto<UserResponseDto[]>> {
    const userResponses = await this.userService.findAll();
    return ApiResponseDto.success(userResponses);
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
    // const userResponse: UserResponseDto = Object.assign(new UserResponseDto(), user);
    const {passwordHash, ... userResponse} = user 
    return ApiResponseDto.success(userResponse as UserResponseDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user information' })
  @ApiParam({ name: 'id', description: 'User id' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'User email already exists' })
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<ApiResponseDto<UserResponseDto>> {
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

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inactivate a user (block if role is OWNER)' })
  @ApiParam({ name: 'id', description: 'user id' })
  @ApiResponse({ status: 200, description: 'user inactivated successfully' })
  @ApiResponse({ status: 400, description: 'Owner cannot be inactivated' })
  @ApiResponse({ status: 404, description: 'user not found' })
  async remove(
    @Param('id') id: number,
    @CurrentUser('id') userId: number
  ): Promise<ApiResponseDto<null>> {
    await this.userService.remove(id,userId);
    return ApiResponseDto.success(null, 'Inactivate user successfully');
  }
}
