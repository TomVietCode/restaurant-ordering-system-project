'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toViError } from '@/lib/errors';
import { Role } from '@/types/auth';
import { ROLE_LABEL } from '@/types/staff';
import type { Staff, CreateStaffDto, UpdateStaffDto } from '@/types/staff';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  staff: Staff | null;
  onSave: (dto: CreateStaffDto | UpdateStaffDto, id?: number) => Promise<void>;
}

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
}

function Inner({ staff, onOpenChange, onSave }: Omit<Props, 'open'>) {
  const [fullName, setFullName] = useState(staff?.fullName ?? '');
  const [email, setEmail]       = useState(staff?.email ?? '');
  const [phone, setPhone]       = useState(staff?.phone ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState<Role>(staff?.role ?? Role.STAFF);
  const [errors, setErrors]     = useState<FieldErrors>({});
  const [loading, setLoading]   = useState(false);

  const isEdit = !!staff;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: FieldErrors = {};
    if (!fullName.trim()) next.fullName = 'Vui lòng nhập họ tên';
    if (!email.trim()) next.email = 'Vui lòng nhập email';
    if (password && password.length < 6) next.password = 'Mật khẩu tối thiểu 6 ký tự';
    if (!isEdit && !password) next.password = 'Vui lòng nhập mật khẩu';
    if (Object.keys(next).length) { setErrors(next); return; }

    setLoading(true);
    try {
      const base = { fullName: fullName.trim(), email: email.trim(), phone: phone.trim() || undefined, role };
      if (isEdit) {
        await onSave({ ...base, ...(password ? { password } : {}) }, staff.id);
      } else {
        await onSave({ ...base, password } as CreateStaffDto);
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(toViError(err, 'Không thể lưu thông tin nhân viên. Vui lòng thử lại.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}</DialogTitle>
      </DialogHeader>

      <form id="staff-form" onSubmit={handleSubmit} className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label htmlFor="staff-name" className="gap-0.5">Họ tên <span className="text-destructive">*</span></Label>
          <Input
            id="staff-name" value={fullName} maxLength={255} autoFocus
            placeholder="VD: Nguyễn Văn A" aria-invalid={!!errors.fullName}
            onChange={e => { setFullName(e.target.value); setErrors(p => ({ ...p, fullName: undefined })); }}
          />
          {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="staff-email" className="gap-0.5">Email <span className="text-destructive">*</span></Label>
          <Input
            id="staff-email" type="email" value={email} maxLength={100}
            placeholder="vd: staff@restaurant.com" aria-invalid={!!errors.email}
            onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="staff-phone">Số điện thoại</Label>
          <Input
            id="staff-phone" value={phone} maxLength={20}
            placeholder="Không bắt buộc"
            onChange={e => setPhone(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="staff-password" className="gap-0.5">
            Mật khẩu {!isEdit && <span className="text-destructive">*</span>}
          </Label>
          <Input
            id="staff-password" type="password" value={password} maxLength={100}
            placeholder={isEdit ? 'Để trống nếu không đổi mật khẩu' : 'Tối thiểu 6 ký tự'}
            aria-invalid={!!errors.password}
            onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Vai trò</Label>
          <RadioGroup value={role} onValueChange={v => setRole(v as Role)} className="flex gap-6">
            {(Object.values(Role) as Role[]).map(r => (
              <label key={r} className="flex items-center gap-2 text-sm text-foreground">
                <RadioGroupItem value={r} />
                {ROLE_LABEL[r]}
              </label>
            ))}
          </RadioGroup>
        </div>
      </form>

      <DialogFooter>
        <Button variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>Hủy</Button>
        <Button type="submit" form="staff-form" disabled={loading}>
          {loading ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Thêm nhân viên'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function StaffFormDialog({ open, onOpenChange, staff, onSave }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && <Inner key={staff?.id ?? 'new'} staff={staff} onOpenChange={onOpenChange} onSave={onSave} />}
    </Dialog>
  );
}
