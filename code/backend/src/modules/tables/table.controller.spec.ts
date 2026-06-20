import { Test, TestingModule } from '@nestjs/testing';
import { TableController } from './table.controller';
import { TableService } from './table.service';
import { Table } from './table.entity';
import { CreateTableDto, UpdateTableDto } from './repositories/dtos';
import { ApiResponseDto } from '@common/dtos/api-response.dto';

describe('TableController', () => {
  let controller: TableController;
  let serviceMock: jest.Mocked<TableService>;

  beforeEach(async () => {
    serviceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<TableService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TableController],
      providers: [
        {
          provide: TableService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<TableController>(TableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a table and return a success response', async () => {
      // Arrange
      const dto: CreateTableDto = { name: 'Bàn 01', capacity: 4 };
      const createdTable: Table = {
        id: 'uuid-1234',
        name: 'Bàn 01',
        capacity: 4,
        isAvailable: true,
      };
      serviceMock.create.mockResolvedValue(createdTable);

      // Act
      const result = await controller.create(dto);

      // Assert
      expect(serviceMock.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(ApiResponseDto.success(createdTable, 'Table created successfully'));
    });
  });

  describe('findAll', () => {
    it('should return all tables in a success response', async () => {
      // Arrange
      const tables: Table[] = [
        { id: 'uuid-1', name: 'Bàn 01', capacity: 2, isAvailable: true },
        { id: 'uuid-2', name: 'Bàn 02', capacity: 4, isAvailable: true },
      ];
      serviceMock.findAll.mockResolvedValue(tables);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(serviceMock.findAll).toHaveBeenCalled();
      expect(result).toEqual(ApiResponseDto.success(tables));
    });
  });

  describe('findOne', () => {
    it('should return a table by id in a success response', async () => {
      // Arrange
      const tableId = 'uuid-123';
      const table: Table = {
        id: tableId,
        name: 'Bàn 01',
        capacity: 4,
        isAvailable: true,
      };
      serviceMock.findById.mockResolvedValue(table);

      // Act
      const result = await controller.findOne(tableId);

      // Assert
      expect(serviceMock.findById).toHaveBeenCalledWith(tableId);
      expect(result).toEqual(ApiResponseDto.success(table));
    });
  });

  describe('update', () => {
    it('should update a table and return a success response', async () => {
      // Arrange
      const tableId = 'uuid-123';
      const dto: UpdateTableDto = { name: 'Bàn VIP 01', capacity: 6 };
      const updatedTable: Table = {
        id: tableId,
        name: 'Bàn VIP 01',
        capacity: 6,
        isAvailable: true,
      };
      serviceMock.update.mockResolvedValue(updatedTable);

      // Act
      const result = await controller.update(tableId, dto);

      // Assert
      expect(serviceMock.update).toHaveBeenCalledWith(tableId, dto);
      expect(result).toEqual(ApiResponseDto.success(updatedTable, 'Table updated successfully'));
    });
  });

  describe('remove', () => {
    it('should delete a table and return a success response', async () => {
      // Arrange
      const tableId = 'uuid-123';
      serviceMock.remove.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove(tableId);

      // Assert
      expect(serviceMock.remove).toHaveBeenCalledWith(tableId);
      expect(result).toEqual(ApiResponseDto.success(null, 'Delete table successfully'));
    });
  });
});
