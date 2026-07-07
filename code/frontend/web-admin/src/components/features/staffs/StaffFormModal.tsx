'use client';

// ─────────────────────────────────────────────────────────────────────────────
// StaffFormModal.tsx — Modal Thêm mới & Chỉnh sửa thông tin nhân viên
// Bao gồm: validate, role select, password reset (tùy chọn cho edit)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import {
  Field,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';

import {
  UserRole,
  type IUser,
  type IFormErrors,
  type IAddStaffForm,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// ADD STAFF MODAL (AC-01, AC-02)
// ─────────────────────────────────────────────────────────────────────────────

interface AddStaffModalProps {
  open: boolean;
  existingEmails: string[];
  onClose: () => void;
  onSubmit: (data: Omit<IUser, 'id'> & { password: string }) => void;
}

const INITIAL_FORM: IAddStaffForm = {
  fullName: '',
  email: '',
  password: '',
  role: UserRole.STAFF,
};

function AddStaffModal({ open, existingEmails, onClose, onSubmit }: AddStaffModalProps) {
  const [form, setForm] = useState<IAddStaffForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<IFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form mỗi khi modal mở
  useEffect(() => {
    if (open) {
      setForm(INITIAL_FORM);
      setErrors({});
      setShowPassword(false);
    }
  }, [open]);

  const handleChange = (field: keyof IAddStaffForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Xóa lỗi của trường vừa thay đổi khi người dùng bắt đầu nhập lại
    if (errors[field as keyof IFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form trước khi submit
  const validate = (): boolean => {
    const newErrors: IFormErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống.';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email không được để trống.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email không đúng định dạng.';
    } else if (existingEmails.includes(form.email.toLowerCase())) {
      // AC-02: Kiểm tra trùng email ngay ở tầng UI (API sẽ kiểm tra lại ở backend)
      newErrors.email = 'Email đã được sử dụng.';
    }

    if (!form.password) {
      newErrors.password = 'Mật khẩu không được để trống.';
    } else if (form.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    setIsSubmitting(true);
    // Giả lập delay API call (sẽ thay bằng fetch thực tế)
    await new Promise((resolve) => setTimeout(resolve, 600));
    onSubmit({
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      role: form.role,
      phone: null,
      isActive: true,
    });
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Thêm nhân viên mới</DialogTitle>
        </DialogHeader>

        {/*
          autoComplete="off" ở thẻ form để bổ sung tín hiệu chặn trình quản lý
          mật khẩu của Chrome (kết hợp với autoComplete="new-password" trên input).
        */}
        <form id="add-staff-form" onSubmit={handleSubmit} noValidate autoComplete="off">
          <div className="flex flex-col gap-4 py-2">
            {/* Họ tên */}
            <Field>
              <FieldLabel htmlFor="input-fullname">
                Họ tên <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="input-fullname"
                type="text"
                placeholder="Nhập họ và tên đầy đủ"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? 'error-fullname' : undefined}
                autoComplete="name"
              />
              <FieldError id="error-fullname" errors={[{ message: errors.fullName }]} />
            </Field>

            {/* Email */}
            <Field>
              <FieldLabel htmlFor="input-email">
                Email <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="input-email"
                type="email"
                placeholder="nhanvien@cafe.vn"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'error-email' : undefined}
                autoComplete="email"
              />
              <FieldError id="error-email" errors={[{ message: errors.email }]} />
            </Field>

            {/* Mật khẩu tạm thời */}
            <Field>
              <FieldLabel htmlFor="input-password">
                Mật khẩu tạm thời <span className="text-destructive">*</span>
              </FieldLabel>
              <div className="relative">
                <Input
                  id="input-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ít nhất 8 ký tự"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'error-password' : undefined}
                  className="pr-9"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </button>
              </div>
              <FieldError id="error-password" errors={[{ message: errors.password }]} />
            </Field>

            {/* Vai trò */}
            <Field>
              <FieldLabel htmlFor="select-role">Vai trò</FieldLabel>
              {/* NOTE: Theo AC-01, vai trò khi tạo mới luôn là Staff.
                  Vẫn để Select để dễ mở rộng sau này nếu cần. */}
              {/*
                FIX: @base-ui/react hiển thị value thô ("STAFF"/"OWNER") thay vì
                nhãn tiếng Việt — dùng span + map giống dropdown lọc trạng thái.
              */}
              <Select
                value={form.role}
                onValueChange={(value) => handleChange('role', value as UserRole)}
              >
                <SelectTrigger id="select-role" className="w-full">
                  <span className="flex flex-1 text-left text-sm">
                    {{
                      [UserRole.STAFF]: 'Nhân viên',
                      [UserRole.OWNER]: 'Chủ quán',
                    }[form.role] ?? 'Chọn vai trò'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.STAFF}>Nhân viên</SelectItem>
                  <SelectItem value={UserRole.OWNER}>Chủ quán</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="add-staff-form"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary-dark"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EDIT STAFF MODAL
// Bổ sung: ô Đặt lại mật khẩu và ô thay đổi Vai trò
// ─────────────────────────────────────────────────────────────────────────────

interface EditStaffModalProps {
  staff: IUser | null;
  existingEmails: string[];
  onClose: () => void;
  onSubmit: (updated: IUser) => void;
}

function EditStaffModal({ staff, existingEmails, onClose, onSubmit }: EditStaffModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STAFF);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; newPassword?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Điền dữ liệu hiện tại vào form mỗi khi nhân viên được chọn
  useEffect(() => {
    if (staff) {
      setFullName(staff.fullName);
      setPhone(staff.phone ?? '');
      setRole(staff.role);
      setNewPassword('');
      setShowNewPassword(false);
      setErrors({});
    }
  }, [staff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { fullName?: string; newPassword?: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống.';
    }
    // Mật khẩu mới là tùy chọn — chỉ validate nếu người dùng đã điền
    if (newPassword && newPassword.length < 8) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 8 ký tự.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (staff) {
      onSubmit({
        ...staff,
        fullName: fullName.trim(),
        phone: phone.trim() || null,
        role,
        // NOTE: newPassword chỉ gửi lên API thực tế; ở đây chỉ mô phỏng local
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={!!staff} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin nhân viên</DialogTitle>
        </DialogHeader>

        {/*
          autoComplete="off" ở thẻ form để bổ sung tín hiệu chặn trình quản lý
          mật khẩu của Chrome (kết hợp với autoComplete="new-password" trên input).
        */}
        <form id="edit-staff-form" onSubmit={handleSubmit} noValidate autoComplete="off">
          <div className="flex flex-col gap-4 py-2">
            {/* Email chỉ hiển thị, không cho chỉnh sửa */}
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                type="email"
                value={staff?.email ?? ''}
                disabled
                aria-readonly="true"
                className="cursor-not-allowed"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="edit-fullname">
                Họ tên <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="edit-fullname"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) {
                    setErrors((prev) => ({ ...prev, fullName: undefined }));
                  }
                }}
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? 'edit-error-fullname' : undefined}
              />
              <FieldError
                id="edit-error-fullname"
                errors={[{ message: errors.fullName }]}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="edit-phone">Số điện thoại</FieldLabel>
              <Input
                id="edit-phone"
                type="tel"
                placeholder="Tùy chọn"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>

            {/* Vai trò */}
            <Field>
              <FieldLabel htmlFor="edit-role">Vai trò</FieldLabel>
              {/*
                FIX: @base-ui/react hiển thị value thô ("STAFF"/"OWNER") thay vì
                nhãn tiếng Việt — dùng span + map giống dropdown lọc trạng thái.
              */}
              <Select
                value={role}
                onValueChange={(value) => setRole((value ?? UserRole.STAFF) as UserRole)}
              >
                <SelectTrigger id="edit-role" className="w-full">
                  <span className="flex flex-1 text-left text-sm">
                    {{
                      [UserRole.STAFF]: 'Nhân viên',
                      [UserRole.OWNER]: 'Chủ quán',
                    }[role] ?? 'Chọn vai trò'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.STAFF}>Nhân viên</SelectItem>
                  <SelectItem value={UserRole.OWNER}>Chủ quán</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {/* Đặt lại mật khẩu (tùy chọn) */}
            <Field>
              <FieldLabel htmlFor="edit-new-password">
                Đặt lại mật khẩu
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  (tùy chọn)
                </span>
              </FieldLabel>
              <div className="relative">
                <Input
                  id="edit-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Để trống nếu không muốn thay đổi"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) {
                      setErrors((prev) => ({ ...prev, newPassword: undefined }));
                    }
                  }}
                  aria-invalid={!!errors.newPassword}
                  aria-describedby={errors.newPassword ? 'edit-error-password' : undefined}
                  className="pr-9"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </button>
              </div>
              <FieldError
                id="edit-error-password"
                errors={[{ message: errors.newPassword }]}
              />
            </Field>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="edit-staff-form"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary-dark"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS — cả 2 modal từ 1 file vì chúng chia sẻ types và pattern giống nhau
// ─────────────────────────────────────────────────────────────────────────────
export { AddStaffModal, EditStaffModal };
