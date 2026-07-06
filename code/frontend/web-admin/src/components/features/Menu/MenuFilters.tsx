'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import type { Category } from '@/types/menu';

type Status = 'ALL' | 'REMAIN' | 'OUT';
type PriceSort = '' | 'ASC' | 'DESC';
type Option = { value: string; label: string };

// Width chung cho cả 3 dropdown — đủ rộng để không cắt nhãn dài nhất ("Xắp xếp theo giá").
const SELECT_W = 'w-48';

interface Props {
  search: string;
  catId: number | undefined;
  status: Status;
  price: PriceSort;
  cats: Category[];
  onSearch: (v: string) => void;
  onCatChange: (v: number | undefined) => void;
  onPriceChange: (v: PriceSort) => void;
  onStatusChange: (v: Status) => void;
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

export function MenuFilters({ search, catId, status, price, cats, onSearch, onCatChange, onPriceChange, onStatusChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <div className="relative min-w-48 flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-8" placeholder="Tìm tên món..." value={search} onChange={e => onSearch(e.target.value)} />
      </div>

      <FilterSelect width={SELECT_W} value={catId ? String(catId) : 'ALL'}
        options={[{ value: 'ALL', label: 'Tất cả danh mục' }, ...cats.map(c => ({ value: String(c.id), label: c.name }))]}
        onChange={v => onCatChange(v === 'ALL' ? undefined : Number(v))} />

      <FilterSelect width={SELECT_W} value={price || 'ALL'}
        options={[{ value: 'ALL', label: 'Xắp xếp theo giá' }, { value: 'ASC', label: 'Giá tăng dần' }, { value: 'DESC', label: 'Giá giảm dần' }]}
        onChange={v => onPriceChange(v === 'ALL' ? '' : (v as 'ASC' | 'DESC'))} />

      <FilterSelect width={SELECT_W} value={status}
        options={[{ value: 'ALL', label: 'Trạng thái' }, { value: 'REMAIN', label: 'Còn hàng' }, { value: 'OUT', label: 'Hết hàng' }]}
        onChange={v => onStatusChange(v as Status)} />
    </div>
  );
}
