import { Roles, CurrentUser } from '@common/decorators';
import { Role } from '@common/enums';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, NotFoundException, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { CreateUserDto, UpdateUserDto, UserResponseDto, UserQueryDto, toggleActivateDto } from './dto/dtos.js';
import { ApiResponseDto } from '@common/dtos/api-response.dto';
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
    const pagination = await this.userService.findAll(query);
    return ApiResponseDto.success(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single user by id' })
  @ApiParam({ name: 'id', description: 'User id' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: number): Promise<ApiResponseDto<UserResponseDto>> {
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
  async update(@Param('id') id: number, @Body() dto: UpdateUserDto): Promise<ApiResponseDto<UserResponseDto>> {
    const userResponse = await this.userService.update(id, dto);
    return ApiResponseDto.success(userResponse, 'User updated successfully');
  }

  @Patch('toggle-activate/:id')
  @ApiOperation({ summary: 'Update user active status' })
  @ApiParam({ name: 'id', description: 'User id' })
  @ApiResponse({ status: 200, description: 'User updated active status successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'User email already exists' })
  async toggleActivate(@Param('id') id: number, @Body() dto: toggleActivateDto, @CurrentUser('id') currentId: number): Promise<ApiResponseDto<null>> {
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
  async remove(@Param('id') id: number): Promise<ApiResponseDto<null>> {
    await this.userService.remove(id);
    return ApiResponseDto.success(null, 'Deleted user successfully');
  }
}
