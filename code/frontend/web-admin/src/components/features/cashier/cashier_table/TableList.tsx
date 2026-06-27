import { cn } from '@/lib/utils';
import type { Row, TblStatus } from './TablePanel';

const LABEL: Record<TblStatus, string> = { WAITPAY: 'Chờ TT', SERVING: 'Phục vụ', EMPTY: 'Trống' };
const BADGE: Record<TblStatus, string> = {
  WAITPAY: 'bg-status-paid text-status-paid-foreground',
  SERVING: 'bg-status-preparing text-status-preparing-foreground',
  EMPTY:   'bg-muted text-muted-foreground',
};

const GROUPS: { label: string; status: TblStatus }[] = [
  { label: 'Chờ thanh toán', status: 'WAITPAY' },
  { label: 'Đang phục vụ',   status: 'SERVING'  },
  { label: 'Trống',          status: 'EMPTY'    },
];

interface Props {
  rows: Row[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function TableList({ rows, selectedId, onSelect }: Props) {
  return (
    <div className="flex flex-[3] flex-col gap-5 overflow-y-auto border-r border-border p-4">
      {GROUPS.map(({ label, status }) => {
        const items = rows.filter(r => r.tblStatus === status);
        if (!items.length) return null;
        return (
          <div key={status}>
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
            <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
              {items.map(t => (
                <button key={t.id} onClick={() => onSelect(t.id)}
                  className={cn(
                    'rounded-lg border p-3 text-left transition-colors',
                    selectedId === t.id
                      ? 'border-primary bg-primary-light'
                      : 'border-border bg-card hover:border-primary/40 hover:bg-accent',
                  )}>
                  <div className="mb-1 flex items-center justify-between gap-1">
                    <span className="truncate text-sm font-medium">{t.name}</span>
                    <span className={cn('shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium', BADGE[t.tblStatus])}>
                      {LABEL[t.tblStatus]}
                    </span>
                  </div>
                  {t.tblStatus !== 'EMPTY' && (
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t.active.length} đơn</span>
                      <span className="font-medium text-foreground">{t.total.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
