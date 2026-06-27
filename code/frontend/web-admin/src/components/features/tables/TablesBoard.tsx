'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { tableService } from '@/services/table.service';
import { TableCard } from './TableCard';
import type { Table } from '@/types/table';
import { TableAdd } from './TableAdd';

type Filter = 'ALL' | 'AVAILABLE' | 'OCCUPIED';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'ALL',       label: 'Tất cả'   },
  { value: 'AVAILABLE', label: 'Trống'    },
  { value: 'OCCUPIED',  label: 'Có khách' },
];


export function TablesBoard() {
  const [tables, setTables] = useState<Table[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [openAdd, setOpenAdd] = useState(false);

  useEffect(() => {
    tableService.getAll().then(setTables);
  }, []);

  const visible = tables.filter(t =>
    filter === 'ALL'       ? true :
    filter === 'AVAILABLE' ? t.isAvailable : !t.isAvailable,
  );

  return (
    <>
      {/* Header */}
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">

        <div className="flex items-center gap-2">
          {/* Bộ lọc */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary p-1">
            {FILTERS.map(f => (
              <Button
                key={f.value}
                size="sm"
                variant={filter === f.value ? 'default' : 'ghost'}
                className={cn(
                  'rounded-md text-xs',
                  filter === f.value
                    ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary-dark'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
{/* 
          <Separator orientation="vertical" className="h-7" /> */}

          <Button className="bg-primary text-primary-foreground hover:bg-primary-dark" onClick={() => setOpenAdd(true)}>
            <Plus className="size-4" /> Thêm bàn
          </Button>
        </div>
      </div>
      {/* Grid */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p>Không có bàn nào</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map(table => (
            <TableCard
              key={table.id}
              table={table}
              onEdit={() => {}}
              onDelete={() => {}}
              onDetail={() => {}}
            />
          ))}
        </div>
      )}
      <TableAdd
        open={openAdd}
        onOpenChange={setOpenAdd}
        // onCreated={(table) => setTables((prev) => [...prev, table])}
      />
    </>
  );
}
