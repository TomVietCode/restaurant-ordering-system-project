import { Test, TestingModule } from '@nestjs/testing';
import { TableService } from './table.service';
import { TABLE_REPO_TOKEN, ORDER_CHECK_SERVICE_TOKEN, REALTIME_SERVICE_TOKEN } from '@common/constants';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Table } from './table.entity';
import type { ITableRepository } from './repositories/table.repository.interface';
import type { IOrderCheckService } from '@common/interfaces/order-check.interface';
import type { IRealtimeService } from '@modules/realtime/realtime.service.interface.js';
import { TableStatus } from '@common/enums.js';

describe('TableService', () => {
  let service: TableService;
  let repositoryMock: jest.Mocked<ITableRepository>;
  let orderCheckServiceMock: jest.Mocked<IOrderCheckService>;
  let realtimeServiceMock: jest.Mocked<IRealtimeService>;

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

    realtimeServiceMock = {
      emit: jest.fn(),
      emitToRoom: jest.fn(),
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
        {
          provide: REALTIME_SERVICE_TOKEN,
          useValue: realtimeServiceMock,
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
        status: TableStatus.AVAILABLE,
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
        status: TableStatus.AVAILABLE,
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
        { id: 'uuid-1', name: 'Bàn 01', capacity: 2, status: TableStatus.AVAILABLE },
        { id: 'uuid-2', name: 'Bàn 02', capacity: 4, status: TableStatus.AVAILABLE },
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
        status: TableStatus.AVAILABLE,
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
        status: TableStatus.AVAILABLE,
      };
      const updateDto = { name: 'Bàn VIP 01', capacity: 4 };
      const updatedTable: Table = {
        id: tableId,
        name: 'Bàn VIP 01',
        capacity: 4,
        status: TableStatus.AVAILABLE,
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
        status: TableStatus.AVAILABLE,
      };
      const updateDto = { name: 'Bàn 02' };
      const conflictingTable: Table = {
        id: 'uuid-456',
        name: 'Bàn 02',
        capacity: 4,
        status: TableStatus.AVAILABLE,
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

    it('should throw BadRequestException when changing status of table with active orders', async () => {
      // Arrange
      const tableId = 'uuid-123';
      const existingTable: Table = {
        id: tableId,
        name: 'Bàn 01',
        capacity: 2,
        status: TableStatus.AVAILABLE,
      };
      const updateDto = { status: TableStatus.CLOSED };

      repositoryMock.findById.mockResolvedValue(existingTable);
      orderCheckServiceMock.hasActiveOrders.mockResolvedValue(true);

      // Act & Assert
      await expect(service.update(tableId, updateDto)).rejects.toThrow(
        new BadRequestException('Cannot change table status while it has active orders'),
      );
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
        status: TableStatus.AVAILABLE,
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
        status: TableStatus.AVAILABLE,
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

  describe('toggleStatus', () => {
    it('should toggle status from AVAILABLE to CLOSED and emit event', async () => {
      // Arrange
      const tableId = 'uuid-123';
      const table: Table = {
        id: tableId,
        name: 'Bàn 01',
        capacity: 4,
        status: TableStatus.AVAILABLE,
      };
      const savedTable: Table = {
        ...table,
        status: TableStatus.CLOSED,
      };

      repositoryMock.findById.mockResolvedValue(table);
      repositoryMock.save.mockResolvedValue(savedTable);

      // Act
      const result = await service.toggleStatus(tableId);

      // Assert
      expect(table.status).toBe(TableStatus.CLOSED);
      expect(repositoryMock.save).toHaveBeenCalledWith(table);
      expect(realtimeServiceMock.emit).toHaveBeenCalledWith('table:status-changed', {
        tableId,
        status: TableStatus.CLOSED,
      });
      expect(result).toEqual(savedTable);
    });

    it('should toggle status from CLOSED to AVAILABLE and emit event', async () => {
      // Arrange
      const tableId = 'uuid-123';
      const table: Table = {
        id: tableId,
        name: 'Bàn 01',
        capacity: 4,
        status: TableStatus.CLOSED,
      };
      const savedTable: Table = {
        ...table,
        status: TableStatus.AVAILABLE,
      };

      repositoryMock.findById.mockResolvedValue(table);
      repositoryMock.save.mockResolvedValue(savedTable);

      // Act
      const result = await service.toggleStatus(tableId);

      // Assert
      expect(table.status).toBe(TableStatus.AVAILABLE);
      expect(repositoryMock.save).toHaveBeenCalledWith(table);
      expect(realtimeServiceMock.emit).toHaveBeenCalledWith('table:status-changed', {
        tableId,
        status: TableStatus.AVAILABLE,
      });
      expect(result).toEqual(savedTable);
    });

    it('should throw BadRequestException when trying to toggle OCCUPIED table', async () => {
      // Arrange
      const tableId = 'uuid-123';
      const table: Table = {
        id: tableId,
        name: 'Bàn 01',
        capacity: 4,
        status: TableStatus.OCCUPIED,
      };

      repositoryMock.findById.mockResolvedValue(table);

      // Act & Assert
      await expect(service.toggleStatus(tableId)).rejects.toThrow(
        new BadRequestException('Cannot toggle status when table is occupied'),
      );
      expect(repositoryMock.save).not.toHaveBeenCalled();
      expect(realtimeServiceMock.emit).not.toHaveBeenCalled();
    });
  });
});
