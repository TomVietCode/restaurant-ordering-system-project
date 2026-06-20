import { Test, TestingModule } from '@nestjs/testing';
import { TableService } from './table.service';
import { TABLE_REPO_TOKEN, ORDER_CHECK_SERVICE_TOKEN } from '@common/constants';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Table } from './table.entity';
import type { ITableRepository } from './repositories/table.repository.interface';
import type { IOrderCheckService } from '@common/interfaces/order-check.interface';

describe('TableService', () => {
  let service: TableService;
  let repositoryMock: jest.Mocked<ITableRepository>;
  let orderCheckServiceMock: jest.Mocked<IOrderCheckService>;

  beforeEach(async () => {
    repositoryMock = {
      findByName: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      findWithOptions: jest.fn(),
      saveMany: jest.fn(),
      exists: jest.fn(),
    } as unknown as jest.Mocked<ITableRepository>;

    orderCheckServiceMock = {
      hasActiveOrders: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TableService,
        {
          provide: TABLE_REPO_TOKEN,
          useValue: repositoryMock,
        },
        {
          provide: ORDER_CHECK_SERVICE_TOKEN,
          useValue: orderCheckServiceMock,
        },
      ],
    }).compile();

    service = module.get<TableService>(TableService);
  });

  describe('create', () => {
    it('should create a table and return it', async () => {
      // Arrange
      const dto = { name: 'Bàn 01', capacity: 4 };
      const expectedTable: Table = {
        id: 'uuid-1234',
        name: 'Bàn 01',
        capacity: 4,
        isAvailable: true,
      };
      repositoryMock.findByName.mockResolvedValue(null);
      repositoryMock.save.mockResolvedValue(expectedTable);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(repositoryMock.findByName).toHaveBeenCalledWith(dto.name);
      expect(repositoryMock.save).toHaveBeenCalledWith(expect.objectContaining({
        name: dto.name,
        capacity: dto.capacity,
      }));
      expect(result).toEqual(expectedTable);
    });

    it('should throw ConflictException when name already exists', async () => {
      // Arrange
      const dto = { name: 'Bàn 01', capacity: 4 };
      const existingTable: Table = {
        id: 'uuid-1234',
        name: 'Bàn 01',
        capacity: 4,
        isAvailable: true,
      };
      repositoryMock.findByName.mockResolvedValue(existingTable);

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow(
        new ConflictException('Table name already exists'),
      );
      expect(repositoryMock.findByName).toHaveBeenCalledWith(dto.name);
      expect(repositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all tables', async () => {
      // Arrange
      const expectedTables: Table[] = [
        { id: 'uuid-1', name: 'Bàn 01', capacity: 2, isAvailable: true },
        { id: 'uuid-2', name: 'Bàn 02', capacity: 4, isAvailable: true },
      ];
      repositoryMock.findAll.mockResolvedValue(expectedTables);

      // Act
      const result = await service.findAll();

      // Assert
      expect(repositoryMock.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedTables);
    });
  });

  describe('findById', () => {
    it('should return a single table by id', async () => {
      // Arrange
      const tableId = 'uuid-123';
      const expectedTable: Table = {
        id: tableId,
        name: 'Bàn 01',
        capacity: 4,
        isAvailable: true,
      };
      repositoryMock.findById.mockResolvedValue(expectedTable);

      // Act
      const result = await service.findById(tableId);

      // Assert
      expect(repositoryMock.findById).toHaveBeenCalledWith(tableId);
      expect(result).toEqual(expectedTable);
    });

    it('should throw NotFoundException when table not found', async () => {
      // Arrange
      const tableId = 'non-existent-uuid';
      repositoryMock.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(tableId)).rejects.toThrow(
        new NotFoundException('Table not found'),
      );
      expect(repositoryMock.findById).toHaveBeenCalledWith(tableId);
    });
  });

  describe('update', () => {
    it('should update name and capacity without changing id', async () => {
      // Arrange
      const tableId = 'uuid-123';
      const existingTable: Table = {
        id: tableId,
        name: 'Bàn 01',
        capacity: 2,
        isAvailable: true,
      };
      const updateDto = { name: 'Bàn VIP 01', capacity: 4 };
      const updatedTable: Table = {
        id: tableId,
        name: 'Bàn VIP 01',
        capacity: 4,
        isAvailable: true,
      };

      repositoryMock.findById.mockResolvedValue(existingTable);
      repositoryMock.findByName.mockResolvedValue(null);
      repositoryMock.save.mockResolvedValue(updatedTable);

      // Act
      const result = await service.update(tableId, updateDto);

      // Assert
      expect(repositoryMock.findById).toHaveBeenCalledWith(tableId);
      expect(repositoryMock.findByName).toHaveBeenCalledWith(updateDto.name);
      expect(repositoryMock.save).toHaveBeenCalledWith(expect.objectContaining({
        id: tableId,
        name: updateDto.name,
        capacity: updateDto.capacity,
      }));
      expect(result).toEqual(updatedTable);
    });

    it('should throw ConflictException when updating to duplicate name', async () => {
      // Arrange
      const tableId = 'uuid-123';
      const existingTable: Table = {
        id: tableId,
        name: 'Bàn 01',
        capacity: 2,
        isAvailable: true,
      };
      const updateDto = { name: 'Bàn 02' };
      const conflictingTable: Table = {
        id: 'uuid-456',
        name: 'Bàn 02',
        capacity: 4,
        isAvailable: true,
      };

      repositoryMock.findById.mockResolvedValue(existingTable);
      repositoryMock.findByName.mockResolvedValue(conflictingTable);

      // Act & Assert
      await expect(service.update(tableId, updateDto)).rejects.toThrow(
        new ConflictException('Table name already exists'),
      );
      expect(repositoryMock.findById).toHaveBeenCalledWith(tableId);
      expect(repositoryMock.findByName).toHaveBeenCalledWith(updateDto.name);
      expect(repositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a table with no active orders', async () => {
      // Arrange
      const tableId = 'uuid-123';
      const existingTable: Table = {
        id: tableId,
        name: 'Bàn 01',
        capacity: 4,
        isAvailable: true,
      };
      repositoryMock.findById.mockResolvedValue(existingTable);
      orderCheckServiceMock.hasActiveOrders.mockResolvedValue(false);
      repositoryMock.delete.mockResolvedValue(undefined);

      // Act
      await service.remove(tableId);

      // Assert
      expect(repositoryMock.findById).toHaveBeenCalledWith(tableId);
      expect(orderCheckServiceMock.hasActiveOrders).toHaveBeenCalledWith(tableId);
      expect(repositoryMock.delete).toHaveBeenCalledWith(tableId);
    });

    it('should throw BadRequestException when table has active orders', async () => {
      // Arrange
      const tableId = 'uuid-123';
      const existingTable: Table = {
        id: tableId,
        name: 'Bàn 01',
        capacity: 4,
        isAvailable: true,
      };
      repositoryMock.findById.mockResolvedValue(existingTable);
      orderCheckServiceMock.hasActiveOrders.mockResolvedValue(true);

      // Act & Assert
      await expect(service.remove(tableId)).rejects.toThrow(
        new BadRequestException('Cannot delete table that has active orders'),
      );
      expect(repositoryMock.findById).toHaveBeenCalledWith(tableId);
      expect(orderCheckServiceMock.hasActiveOrders).toHaveBeenCalledWith(tableId);
      expect(repositoryMock.delete).not.toHaveBeenCalled();
    });
  });
});
