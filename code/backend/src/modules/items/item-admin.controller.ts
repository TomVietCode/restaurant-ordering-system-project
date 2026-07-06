import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Roles } from '@common/decorators/roles.decorator.js';
import { Role } from '@common/enums.js';
import { ApiResponseDto } from '@common/dtos/api-response.dto.js';
import { PaginationDto } from '@common/dtos/pagination.dto.js';
import { ItemsService } from './item.service';
import { CreateItemDto, QueryItemsDto, ToggleAvailabilityDto, UpdateItemDto } from './dtos';
import { Item } from './entities/item.entity';

const ParseItemId = new ParseIntPipe({
  exceptionFactory: () => new NotFoundException('Item not found'),
});

@ApiTags('Items (Admin)')
@ApiBearerAuth('JWT-auth')
@Roles(Role.OWNER)
@Controller('items')
export class ItemsAdminController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new menu item' })
  @ApiResponse({ status: 201, description: 'Item created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async create(@Body() dto: CreateItemDto): Promise<ApiResponseDto<Item>> {
    const item = await this.itemsService.create(dto);
    return ApiResponseDto.success(item, 'Item added successfully');
  }

  @Get()
  @ApiOperation({ summary: 'List all items with pagination, search, and filter' })
  @ApiResponse({ status: 200, description: 'Paginated list of items' })
  async findAll(@Query() query: QueryItemsDto): Promise<ApiResponseDto<PaginationDto<Item>>> {
    const result = await this.itemsService.findAll(query);
    return ApiResponseDto.success(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single item by ID' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiResponse({ status: 200, description: 'Item found' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async findById(@Param('id', ParseItemId) id: number): Promise<ApiResponseDto<Item>> {
    const item = await this.itemsService.findById(id);
    return ApiResponseDto.success(item);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update item information' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiResponse({ status: 200, description: 'Item updated successfully' })
  @ApiResponse({ status: 404, description: 'Item or category not found' })
  async update(@Param('id', ParseItemId) id: number, @Body() dto: UpdateItemDto): Promise<ApiResponseDto<Item>> {
    const item = await this.itemsService.update(id, dto);
    return ApiResponseDto.success(item, 'Item updated successfully');
  }

  @Patch(':id/availability')
  @ApiOperation({ summary: 'Toggle item In Stock / Out of Stock' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiResponse({ status: 200, description: 'Availability toggled' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async toggleAvailability(@Param('id', ParseItemId) id: number, @Body() dto: ToggleAvailabilityDto): Promise<ApiResponseDto<Item>> {
    const item = await this.itemsService.toggleAvailability(id, dto);
    return ApiResponseDto.success(item, 'Item availability updated');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a menu item' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiResponse({ status: 200, description: 'Item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async remove(@Param('id', ParseItemId) id: number): Promise<ApiResponseDto<null>> {
    await this.itemsService.remove(id);
    return ApiResponseDto.success(null, 'Item deleted successfully');
  }
}
