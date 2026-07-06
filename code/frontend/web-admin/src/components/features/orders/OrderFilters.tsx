'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { ORDER_STATUS_LABEL, type OrderStatus } from '@/types/order';
import type { Table } from '@/types/table';
import { PAGE_SIZES } from './useOrders';

type StatusFilter = 'ALL' | OrderStatus;
type DateFilter = 'all' | 'today' | 'week' | 'month';
type Option = { value: string; label: string };

const SELECT_W = 'w-44';

interface Props {
  search: string;
  status: StatusFilter;
  dateFilter: DateFilter;
  tableId: string | undefined;
  tables: Table[];
  pageSize: number;
  onSearch: (v: string) => void;
  onStatusChange: (v: StatusFilter) => void;
  onDateChange: (v: DateFilter) => void;
  onTableChange: (v: string | undefined) => void;
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

const STATUS_OPTIONS: Option[] = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  ...(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map(s => ({ value: s, label: ORDER_STATUS_LABEL[s] })),
];

const DATE_OPTIONS: Option[] = [
  { value: 'all', label: 'Tất cả thời gian' },
  { value: 'today', label: 'Hôm nay' },
  { value: 'week', label: 'Tuần qua' },
  { value: 'month', label: 'Tháng qua' },
];

export function OrderFilters({ search, status, dateFilter, tableId, tables, pageSize, onSearch, onStatusChange, onDateChange, onTableChange, onPageSizeChange }: Props) {
  const tableOptions: Option[] = [
    { value: 'ALL', label: 'Tất cả bàn' },
    ...tables.map(t => ({ value: t.id, label: t.name })),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      <div className="relative min-w-56 flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-8" placeholder="Tìm theo mã đơn..." value={search} maxLength={50} onChange={e => onSearch(e.target.value)} />
      </div>

      <FilterSelect width={SELECT_W} value={tableId ?? 'ALL'} options={tableOptions}
        onChange={v => onTableChange(v === 'ALL' ? undefined : v)} />

      <FilterSelect width={SELECT_W} value={status} options={STATUS_OPTIONS}
        onChange={v => onStatusChange(v as StatusFilter)} />

      <FilterSelect width={SELECT_W} value={dateFilter} options={DATE_OPTIONS}
        onChange={v => onDateChange(v as DateFilter)} />

      <FilterSelect width="w-32" value={String(pageSize)}
        options={PAGE_SIZES.map(n => ({ value: String(n), label: `${n} / trang` }))}
        onChange={v => onPageSizeChange(Number(v))} />
    </div>
  );
}
