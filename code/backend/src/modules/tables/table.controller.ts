import { Roles } from '@common/decorators';
import { Role } from '@common/enums';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, ParseUUIDPipe, NotFoundException, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TableService } from './table.service';
import { CreateTableDto, TableQueryDto, TableResponseDto, UpdateTableDto } from './repositories/dtos';
import { ApiResponseDto } from '@common/dtos/api-response.dto';

const ParseTableUUID = new ParseUUIDPipe({
  exceptionFactory: () => new NotFoundException('Table not found'),
});

@ApiTags('Tables')
@ApiBearerAuth('JWT-auth')
@Roles(Role.OWNER)
@Controller('tables')
export class TableController {
  constructor(private readonly tablesService: TableService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new table with auto-generated QR-ready UUID' })
  @ApiResponse({ status: 201, description: 'Table created successfully', type: TableResponseDto })
  @ApiResponse({ status: 409, description: 'Table name already exists' })
  async create(@Body() dto: CreateTableDto): Promise<ApiResponseDto<TableResponseDto>> {
    const table = await this.tablesService.create(dto);
    return ApiResponseDto.success(table, 'Table created successfully');
  }
  // ApiRes<Table> 
  // ApiResponseDto<TableResponseDto>

  @Get()
  @ApiOperation({ summary: 'List all tables with optional status filter' })
  @ApiResponse({ status: 200, description: 'Returns all tables', type: [TableResponseDto] })
  async findAll(@Query() query: TableQueryDto): Promise<ApiResponseDto<TableResponseDto[]>> {
    const tables = await this.tablesService.findAll(query.status);
    return ApiResponseDto.success(tables);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single table by UUID' })
  @ApiParam({ name: 'id', description: 'Table UUID' })
  @ApiResponse({ status: 200, description: 'Table found', type: TableResponseDto })
  @ApiResponse({ status: 404, description: 'Table not found' })
  async findOne(@Param('id', ParseTableUUID) id: string): Promise<ApiResponseDto<TableResponseDto>> {
    const table = await this.tablesService.findById(id);
    return ApiResponseDto.success(table);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update table name and/or capacity (QR unchanged)' })
  @ApiParam({ name: 'id', description: 'Table UUID' })
  @ApiResponse({ status: 200, description: 'Table updated successfully', type: TableResponseDto })
  @ApiResponse({ status: 404, description: 'Table not found' })
  @ApiResponse({ status: 409, description: 'Table name already exists' })
  async update(
    @Param('id', ParseTableUUID) id: string,
    @Body() dto: UpdateTableDto,
  ): Promise<ApiResponseDto<TableResponseDto>> {
    const table = await this.tablesService.update(id, dto);
    return ApiResponseDto.success(table, 'Table updated successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a table (blocked if it has unpaid orders)' })
  @ApiParam({ name: 'id', description: 'Table UUID' })
  @ApiResponse({ status: 200, description: 'Table deleted successfully' })
  @ApiResponse({ status: 400, description: 'Table has unpaid orders — cannot delete' })
  @ApiResponse({ status: 404, description: 'Table not found' })
  async remove(@Param('id', ParseTableUUID) id: string): Promise<ApiResponseDto<null>> {
    await this.tablesService.remove(id);
    return ApiResponseDto.success(null, 'Delete table successfully');
  }

  @Patch(':id/toggle-status')
  @Roles(Role.STAFF, Role.OWNER)
  @ApiOperation({ summary: 'Toggle table status between AVAILABLE and CLOSED (realtime)' })
  @ApiParam({ name: 'id', description: 'Table UUID' })
  @ApiResponse({ status: 200, description: 'Table status toggled successfully', type: TableResponseDto })
  @ApiResponse({ status: 400, description: 'Cannot toggle status of occupied table' })
  @ApiResponse({ status: 404, description: 'Table not found' })
  async toggleStatus(@Param('id', ParseTableUUID) id: string): Promise<ApiResponseDto<TableResponseDto>> {
    const table = await this.tablesService.toggleStatus(id);
    return ApiResponseDto.success(table, 'Table status toggled successfully');
  }
}

