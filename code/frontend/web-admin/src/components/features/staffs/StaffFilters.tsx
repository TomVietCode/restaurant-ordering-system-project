'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Role } from '@/types/auth';
import { ROLE_LABEL } from '@/types/staff';
import { PAGE_SIZES, type RoleFilter, type ActiveFilter } from './useStaffs';

type Option = { value: string; label: string };

const SELECT_W = 'w-44';

interface Props {
  search: string;
  role: RoleFilter;
  active: ActiveFilter;
  pageSize: number;
  onSearch: (v: string) => void;
  onRoleChange: (v: RoleFilter) => void;
  onActiveChange: (v: ActiveFilter) => void;
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

const ROLE_OPTIONS: Option[] = [
  { value: 'ALL', label: 'Tất cả vai trò' },
  ...(Object.values(Role) as Role[]).map(r => ({ value: r, label: ROLE_LABEL[r] })),
];

const ACTIVE_OPTIONS: Option[] = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'true', label: 'Đang hoạt động' },
  { value: 'false', label: 'Đã khóa' },
];

export function StaffFilters({ search, role, active, pageSize, onSearch, onRoleChange, onActiveChange, onPageSizeChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <div className="relative min-w-56 flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-8" placeholder="Tìm theo tên hoặc email..." value={search} maxLength={100} onChange={e => onSearch(e.target.value)} />
      </div>

      <FilterSelect width={SELECT_W} value={role} options={ROLE_OPTIONS}
        onChange={v => onRoleChange(v as RoleFilter)} />

      <FilterSelect width={SELECT_W} value={active} options={ACTIVE_OPTIONS}
        onChange={v => onActiveChange(v as ActiveFilter)} />

      <FilterSelect width="w-32" value={String(pageSize)}
        options={PAGE_SIZES.map(n => ({ value: String(n), label: `${n} / trang` }))}
        onChange={v => onPageSizeChange(Number(v))} />
    </div>
  );
}
