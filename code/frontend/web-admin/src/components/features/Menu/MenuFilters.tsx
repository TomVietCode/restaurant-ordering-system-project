'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { PAGE_SIZES, type SortBy, type SortOrder } from './useMenuItems';
import type { Category } from '@/types/menu';

type Status = 'ALL' | 'REMAIN' | 'OUT';
type Option = { value: string; label: string };

// Width chung cho các dropdown — đủ rộng để không cắt nhãn dài nhất.
const SELECT_W = 'w-48';

// Các lựa chọn sắp xếp: mỗi giá trị là "field:order" khớp với backend.
const SORT_OPTIONS: Option[] = [
  { value: 'createdAt:DESC', label: 'Mới nhất' },
  { value: 'createdAt:ASC', label: 'Cũ nhất' },
  { value: 'price:ASC', label: 'Giá tăng dần' },
  { value: 'price:DESC', label: 'Giá giảm dần' },
  { value: 'name:ASC', label: 'Tên A → Z' },
  { value: 'name:DESC', label: 'Tên Z → A' },
];

interface Props {
  search: string;
  catId: number | undefined;
  status: Status;
  sortBy: SortBy;
  sortOrder: SortOrder;
  pageSize: number;
  cats: Category[];
  onSearch: (v: string) => void;
  onCatChange: (v: number | undefined) => void;
  onSortChange: (by: SortBy, order: SortOrder) => void;
  onStatusChange: (v: Status) => void;
  onPageSizeChange: (v: number) => void;
}

function FilterSelect({ value, options, width, onChange }: { value: string; options: Option[]; width: string; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={v => onChange(v ?? options[0].value)}>
      <SelectTrigger className={width}>
        <span className="flex-1 truncate text-left text-sm">{options.find(o => o.value === value)?.label ?? options[0].label}</span>
      </SelectTrigger>
      <SelectContent>
        {options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

export function MenuFilters({ search, catId, status, sortBy, sortOrder, pageSize, cats, onSearch, onCatChange, onSortChange, onStatusChange, onPageSizeChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <div className="relative min-w-48 flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-8" placeholder="Tìm tên món..." value={search} onChange={e => onSearch(e.target.value)} />
      </div>

      <FilterSelect width={SELECT_W} value={catId ? String(catId) : 'ALL'}
        options={[{ value: 'ALL', label: 'Tất cả danh mục' }, ...cats.map(c => ({ value: String(c.id), label: c.name }))]}
        onChange={v => onCatChange(v === 'ALL' ? undefined : Number(v))} />

      <FilterSelect width={SELECT_W} value={`${sortBy}:${sortOrder}`}
        options={SORT_OPTIONS}
        onChange={v => { const [by, order] = v.split(':'); onSortChange(by as SortBy, order as SortOrder); }} />

      <FilterSelect width={SELECT_W} value={status}
        options={[{ value: 'ALL', label: 'Trạng thái' }, { value: 'REMAIN', label: 'Còn hàng' }, { value: 'OUT', label: 'Hết hàng' }]}
        onChange={v => onStatusChange(v as Status)} />

      <FilterSelect width="w-32" value={String(pageSize)}
        options={PAGE_SIZES.map(n => ({ value: String(n), label: `${n} / trang` }))}
        onChange={v => onPageSizeChange(Number(v))} />
    </div>
  );
}
