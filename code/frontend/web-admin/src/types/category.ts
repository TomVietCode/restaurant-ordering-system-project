export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  totalItem?: number;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}
