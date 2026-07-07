import { Pencil, Trash2, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ColumnDef } from '@/components/ui/data-table';
import { ROLE_LABEL, ROLE_CLASS, type Staff } from '@/types/staff';

interface Args {
  onEdit: (s: Staff) => void;
  onToggle: (s: Staff) => void;
  onDelete: (s: Staff) => void;
  /** Email của người đang đăng nhập — không cho tự khóa tài khoản của chính mình. */
  currentEmail?: string | null;
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('vi-VN');
}

export function getStaffColumns({ onEdit, onToggle, onDelete, currentEmail }: Args): ColumnDef<Staff>[] {
  return [
    {
      accessorKey: 'fullName',
      header: 'Họ tên',
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.fullName}</span>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
    },
    {
      accessorKey: 'phone',
      header: 'Số điện thoại',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.phone ?? '—'}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày tạo',
      cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
    },
    {
      accessorKey: 'role',
      header: () => <div className="text-center">Vai trò</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ROLE_CLASS[row.original.role]}`}>
            {ROLE_LABEL[row.original.role]}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: () => <div className="text-center">Trạng thái</div>,
      cell: ({ row }) => {
        const active = row.original.isActive;
        return (
          <div className="flex justify-center">
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${active ? 'bg-status-paid text-status-paid-foreground' : 'bg-status-cancel text-status-cancel-foreground'}`}>
              {active ? 'Đang hoạt động' : 'Đã khóa'}
            </span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Thao tác</div>,
      cell: ({ row }) => {
        const s = row.original;
        const isSelf = !!currentEmail && s.email === currentEmail;
        return (
          <div className="flex justify-end gap-1">
            <Button size="icon" variant="ghost" className="size-8 text-muted-foreground hover:text-foreground"
              onClick={() => onToggle(s)} disabled={isSelf}
              title={isSelf ? 'Không thể khóa tài khoản của chính mình' : s.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}>
              {s.isActive ? <Unlock className="size-4" /> : <Lock className="size-4" />}
            </Button>
            <Button size="icon" variant="ghost" className="size-8 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(s)} title="Sửa">
              <Pencil className="size-4" />
            </Button>
            <Button size="icon" variant="ghost" className="size-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(s)} disabled={s.isActive}
              title={s.isActive ? 'Khóa tài khoản trước khi xóa' : 'Xóa'}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
