import { Controller, Get, Param, Query, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator.js';
import { ApiResponseDto } from '@common/dtos/api-response.dto.js';
import { PaginationDto } from '@common/dtos/pagination.dto.js';
import { ItemsService } from '@modules/items/item.service';
import { QueryItemsDto } from '@modules/items/dtos';
import { Item } from '@modules/items/entities/item.entity.js';

const ParseItemId = new ParseIntPipe({
  exceptionFactory: () => new NotFoundException('Item not found'),
});

@ApiTags('Customer Menu')
@Public()
@Controller('customer/items')
export class ItemsCustomerController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  @ApiOperation({ summary: 'Browse menu items (public — no login required)' })
  @ApiResponse({ status: 200, description: 'Paginated list of available items' })
  async findAll(@Query() query: QueryItemsDto): Promise<ApiResponseDto<PaginationDto<Item>>> {
    const result = await this.itemsService.findAll(query);
    return ApiResponseDto.success(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get item detail (public — no login required)' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiResponse({ status: 200, description: 'Item found' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async findById(@Param('id', ParseItemId) id: number): Promise<ApiResponseDto<Item>> {
    const item = await this.itemsService.findById(id);
    return ApiResponseDto.success(item);
  }
}
