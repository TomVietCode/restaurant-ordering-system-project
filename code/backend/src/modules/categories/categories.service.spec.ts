import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService, CATEGORY_REPOSITORY_TOKEN } from './categories.service.js';
import { ITEM_REPOSITORY_TOKEN } from '@common/constants.js';
import { Category } from './entities/category.entity.js';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import type { ICategoryRepository } from './repositories/category.repository.interface.js';
import type { IItemRepository } from '@modules/items/repositories/item.repo.interface.js';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryRepoMock: jest.Mocked<ICategoryRepository>;
  let itemRepoMock: jest.Mocked<IItemRepository>;

  beforeEach(async () => {
    categoryRepoMock = {
      findByName: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      findWithOptions: jest.fn(),
      saveMany: jest.fn(),
      exists: jest.fn(),
      softDelete: jest.fn(),
    } as unknown as jest.Mocked<ICategoryRepository>;

    itemRepoMock = {
      findByName: jest.fn(),
      findPaginated: jest.fn(),
      countGroupedByCategory: jest.fn(),
      findWithOptions: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      saveMany: jest.fn(),
      delete: jest.fn(),
      softDelete: jest.fn(),
      exists: jest.fn(),
    } as unknown as jest.Mocked<IItemRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: CATEGORY_REPOSITORY_TOKEN,
          useValue: categoryRepoMock,
        },
        {
          provide: ITEM_REPOSITORY_TOKEN,
          useValue: itemRepoMock,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  describe('findAll', () => {
    it('should return all categories with populated totalItem', async () => {
      // Arrange
      const mockCategories: Category[] = [
        Object.assign(new Category(), { id: 1, name: 'Coffee', description: 'Fresh Brew' }),
        Object.assign(new Category(), { id: 2, name: 'Tea', description: 'Hot Tea' }),
      ];
      categoryRepoMock.findAll.mockResolvedValue(mockCategories);

      const mockCounts = new Map<number, number>();
      mockCounts.set(1, 5); // 5 items in Coffee
      // Tea has no items, should default to 0
      itemRepoMock.countGroupedByCategory.mockResolvedValue(mockCounts);

      // Act
      const result = await service.findAll();

      // Assert
      expect(categoryRepoMock.findAll).toHaveBeenCalled();
      expect(itemRepoMock.countGroupedByCategory).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].totalItem).toBe(5);
      expect(result[1].totalItem).toBe(0);
    });
  });

  describe('create', () => {
    it('should create a category successfully', async () => {
      // Arrange
      const dto = { name: 'Desserts', description: 'Sweet treats' };
      const expectedCategory = Object.assign(new Category(), dto);
      categoryRepoMock.findByName.mockResolvedValue(null);
      categoryRepoMock.save.mockResolvedValue(expectedCategory);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(categoryRepoMock.findByName).toHaveBeenCalledWith(dto.name);
      expect(categoryRepoMock.save).toHaveBeenCalledWith(expect.objectContaining({ name: dto.name }));
      expect(result).toEqual(expectedCategory);
    });

    it('should throw ConflictException if category name already exists', async () => {
      // Arrange
      const dto = { name: 'Desserts' };
      categoryRepoMock.findByName.mockResolvedValue(new Category());

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('should return category when found', async () => {
      // Arrange
      const expectedCategory = Object.assign(new Category(), { id: 1, name: 'Coffee' });
      categoryRepoMock.findById.mockResolvedValue(expectedCategory);

      // Act
      const result = await service.findById(1);

      // Assert
      expect(categoryRepoMock.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      // Arrange
      categoryRepoMock.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update category details successfully', async () => {
      // Arrange
      const existing = Object.assign(new Category(), { id: 1, name: 'Coffee' });
      const updateDto = { name: 'Special Coffee' };
      const updated = Object.assign(new Category(), { id: 1, name: 'Special Coffee' });

      categoryRepoMock.findById.mockResolvedValue(existing);
      categoryRepoMock.findByName.mockResolvedValue(null);
      categoryRepoMock.save.mockResolvedValue(updated);

      // Act
      const result = await service.update(1, updateDto);

      // Assert
      expect(categoryRepoMock.findById).toHaveBeenCalledWith(1);
      expect(categoryRepoMock.findByName).toHaveBeenCalledWith(updateDto.name);
      expect(result).toEqual(updated);
    });

    it('should throw ConflictException when updating to an existing name', async () => {
      // Arrange
      const existing = Object.assign(new Category(), { id: 1, name: 'Coffee' });
      const updateDto = { name: 'Tea' };

      categoryRepoMock.findById.mockResolvedValue(existing);
      categoryRepoMock.findByName.mockResolvedValue(Object.assign(new Category(), { id: 2, name: 'Tea' }));

      // Act & Assert
      await expect(service.update(1, updateDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    it('should delete category when no items are linked to it', async () => {
      // Arrange
      const existing = Object.assign(new Category(), { id: 1, name: 'Coffee' });
      categoryRepoMock.findById.mockResolvedValue(existing);
      itemRepoMock.findWithOptions.mockResolvedValue([]);
      categoryRepoMock.delete.mockResolvedValue(undefined);

      // Act
      await service.delete(1);

      // Assert
      expect(categoryRepoMock.findById).toHaveBeenCalledWith(1);
      expect(itemRepoMock.findWithOptions).toHaveBeenCalledWith({
        where: { category: { id: 1 } },
        withDeleted: true,
      });
      expect(categoryRepoMock.delete).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException when active items are linked to category', async () => {
      // Arrange
      const existing = Object.assign(new Category(), { id: 1, name: 'Coffee' });
      categoryRepoMock.findById.mockResolvedValue(existing);
      itemRepoMock.findWithOptions.mockResolvedValue([{ id: 10, name: 'Latte', deletedAt: null } as any]);

      // Act & Assert
      await expect(service.delete(1)).rejects.toThrow(BadRequestException);
      expect(itemRepoMock.findWithOptions).toHaveBeenCalledWith({
        where: { category: { id: 1 } },
        withDeleted: true,
      });
      expect(categoryRepoMock.delete).not.toHaveBeenCalled();
    });

    it('should set categoryId to null for soft-deleted items and delete category', async () => {
      // Arrange
      const existing = Object.assign(new Category(), { id: 1, name: 'Coffee' });
      categoryRepoMock.findById.mockResolvedValue(existing);
      
      const softDeletedItem = { id: 10, name: 'Old Latte', categoryId: 1, deletedAt: new Date() } as any;
      itemRepoMock.findWithOptions.mockResolvedValue([softDeletedItem]);
      itemRepoMock.saveMany.mockResolvedValue([softDeletedItem]);
      categoryRepoMock.delete.mockResolvedValue(undefined);

      // Act
      await service.delete(1);

      // Assert
      expect(categoryRepoMock.findById).toHaveBeenCalledWith(1);
      expect(itemRepoMock.findWithOptions).toHaveBeenCalledWith({
        where: { category: { id: 1 } },
        withDeleted: true,
      });
      expect(softDeletedItem.categoryId).toBeNull();
      expect(itemRepoMock.saveMany).toHaveBeenCalledWith([softDeletedItem]);
      expect(categoryRepoMock.delete).toHaveBeenCalledWith(1);
    });
  });
});
