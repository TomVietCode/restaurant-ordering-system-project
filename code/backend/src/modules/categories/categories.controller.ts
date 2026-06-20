import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoriesService } from './categories.service.js';
import { Category } from './entities/category.entity.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { Public } from '@common/decorators/index.js';

@ApiTags('Categories')
@Controller('categories')
@Public()
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
  async create(@Body() dto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(dto);
  }


  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of categories', type: [Category] 
  })
  async findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
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
  async findById(@Param('id') id: number): Promise<Category | null> {
    return this.categoriesService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update category by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Category updated', type: Category 
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async update(@Param('id') id: number, @Body() dto: UpdateCategoryDto): Promise<Category | null> {
    return this.categoriesService.update(id, dto);
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
  async delete(@Param('id') id: number): Promise<void> {
    return this.categoriesService.delete(id);
  }
}
