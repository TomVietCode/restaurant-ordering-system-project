import { Controller, Get, Post, Delete, Param, Body, Patch, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service.js';
import { Category } from './entities/category.entity.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { ApiResponseDto } from '@common/dtos/api-response.dto.js';
import { Roles } from '@common/decorators/roles.decorator.js';
import { Role } from '@common/enums.js';
import { Public } from '@common/decorators/public.decorator.js';

const ParseCategoryId = new ParseIntPipe({
  exceptionFactory: () => new NotFoundException('Category not found'),
});

@ApiTags('Categories')
@Controller('categories')
@ApiBearerAuth('JWT-auth')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully', type: Category })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Category name already exists' })
  async create(@Body() dto: CreateCategoryDto): Promise<ApiResponseDto<Category>> {
    return ApiResponseDto.success(await this.categoriesService.create(dto));
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'List of categories', type: [Category] })
  async findAll(): Promise<ApiResponseDto<Category[]>> {
    return ApiResponseDto.success(await this.categoriesService.findAll());
  }

  @Get(':id')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category found', type: Category })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findById(@Param('id', ParseCategoryId) id: number): Promise<ApiResponseDto<Category | null>> {
    return ApiResponseDto.success(await this.categoriesService.findById(id));
  }

  @Patch(':id')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Update category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Category updated',
    type: Category,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async update(@Param('id', ParseCategoryId) id: number, @Body() dto: UpdateCategoryDto): Promise<ApiResponseDto<Category | null>> {
    return ApiResponseDto.success(await this.categoriesService.update(id, dto));
  }

  @Delete(':id')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Delete category by ID' })
  @ApiResponse({ status: 204, description: 'Category deleted' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async delete(@Param('id', ParseCategoryId) id: number): Promise<ApiResponseDto<void>> {
    await this.categoriesService.delete(id);
    return ApiResponseDto.success(undefined);
  }
}
