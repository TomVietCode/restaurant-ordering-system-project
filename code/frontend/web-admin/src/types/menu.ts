export interface Category {
  id: number;
  name: string;
  description?: string;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: number;
  name: string;
  price: number;
  imagesUrl: string[] | null;
  description: string | null;
  isRemain: boolean;
  categoryId: number;
  category: Category;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ItemsPage {
  items: Item[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface CreateItemDto {
  name: string;
  price: number;
  categoryId: number;
  description?: string;
  imagesUrl?: string[];
  isRemain?: boolean;
}

export type UpdateItemDto = Partial<CreateItemDto>;
