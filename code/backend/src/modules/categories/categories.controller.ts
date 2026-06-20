import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiResponseCommonMetadata } from '@nestjs/swagger';
import { CategoriesService } from './categories.service.js';
import { Category } from './entities/category.entity.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { ApiResponseDto } from '@common/dtos/api-response.dto.js';
import { Roles } from '@common/decorators/roles.decorator.js';
import { Role } from '@common/enums.js';

@ApiTags('Categories')
@Controller('categories')
@Roles(Role.OWNER)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ 
    status: 201, 
    description: 'Category created successfully', type: Category })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 409,
    description: 'Category name already exists',
  })
  async create(@Body() dto: CreateCategoryDto): Promise<ApiResponseDto<Category>> {
    return ApiResponseDto.success(await this.categoriesService.create(dto));
  }


  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of categories', type: [Category] 
  })
  async findAll(): Promise<ApiResponseDto<Category[]>> {
    return ApiResponseDto.success(await this.categoriesService.findAll());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Category found', type: Category 
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async findById(@Param('id') id: number): Promise<ApiResponseDto<Category | null>> {
    return ApiResponseDto.success(await this.categoriesService.findById(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Category updated', type: Category 
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async update(@Param('id') id: number, @Body() dto: UpdateCategoryDto): Promise<ApiResponseDto<Category | null>> {
    return ApiResponseDto.success(await this.categoriesService.update(id, dto));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category by ID' })
  @ApiResponse({ 
    status: 204, 
    description: 'Category deleted' 
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async delete(@Param('id') id: number): Promise<ApiResponseDto<void>> {
    await this.categoriesService.delete(id);
    return ApiResponseDto.success(undefined);
  }
}
