'use client';

import { useState } from 'react';
import { CategorySidebar } from './categories/CategorySidebar';
import { ItemGrid } from './items/ItemGrid';
import type { Category } from '@/types/menu';

export function MenuBoard() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId) ?? null;

  return (
    <div className="flex gap-5">
      {/* Left: category sidebar */}
      <CategorySidebar
        selectedId={selectedCategoryId}
        onSelect={setSelectedCategoryId}
        onCategoriesChange={setCategories}
      />

      {/* Divider */}
      <div className="w-px shrink-0 bg-border" />

      {/* Right: item grid */}
      <div className="min-w-0 flex-1">
        <ItemGrid
          key={selectedCategoryId ?? 'all'}
          selectedCategoryId={selectedCategoryId}
          selectedCategoryName={selectedCategory?.name ?? null}
          categories={categories}
        />
      </div>
    </div>
  );
}
