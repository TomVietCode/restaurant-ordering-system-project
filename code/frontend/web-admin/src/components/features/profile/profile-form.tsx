'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Phone, Mail, Shield, Calendar, Loader2 } from 'lucide-react';
import { authService, UserProfile } from '@/services/auth.service';
import { ChangePasswordDialog } from './change-password-dialog';

interface ProfileFormProps {
  initialProfile: UserProfile;
  token: string;
}

const roleMap: Record<string, { label: string; color: string }> = {
  OWNER: { label: 'Chủ quán', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  STAFF: { label: 'Nhân viên', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
};

export function ProfileForm({ initialProfile, token }: ProfileFormProps) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [phone, setPhone] = useState(initialProfile.phone ?? '');
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>({});
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'change-password') {
      Promise.resolve().then(() => setChangePasswordOpen(true));
      
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('action');
      const queryStr = newParams.toString();
      router.replace(queryStr ? `/profile?${queryStr}` : '/profile');
    }
  }, [searchParams, router]);

  const formattedDate = new Date(profile.createdAt).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const initials = fullName
    ? fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const validate = () => {
    const newErrors: { fullName?: string; phone?: string } = {};
    if (!fullName.trim()) {
      newErrors.fullName = 'Họ và tên không được để trống';
    } else if (fullName.length > 100) {
      newErrors.fullName = 'Họ và tên không được vượt quá 100 ký tự';
    }

    if (phone && phone.length > 20) {
      newErrors.phone = 'Số điện thoại không được vượt quá 20 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const updated = await authService.updateProfile(token, {
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
      });

      setProfile(updated);
      toast.success('Cập nhật thông tin tài khoản thành công');

      // Update NextAuth session state
      if (session) {
        await update({
          ...session,
          user: {
            ...session.user,
            name: updated.fullName,
          },
        });
      }

      // Refresh Next.js server components
      router.refresh();
    } catch (err) {
      console.error(err);
      let errorMsg = 'Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại sau.';
      const errorStr = err instanceof Error ? err.message : String(err);

      if (errorStr.includes('Phone number already exists') || errorStr.includes('409')) {
        errorMsg = 'Số điện thoại đã được sử dụng bởi tài khoản khác';
        setErrors((prev) => ({ ...prev, phone: errorMsg }));
      }
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const roleInfo = roleMap[profile.role] ?? { label: profile.role, color: 'bg-muted text-muted-foreground' };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row gap-6">

        {/* Profile Form Details */}
        <Card className="flex-1 border border-muted/40 shadow-sm">
          <CardHeader>
            <CardTitle>Thông tin tài khoản</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Account details (Readonly Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/40 border border-muted/30">
                {/* Email (Readonly) */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <Mail className="size-3.5" />
                    <span>EMAIL ĐĂNG NHẬP</span>
                  </div>
                  <p className="text-sm font-medium text-foreground py-1 truncate">{profile.email}</p>
                </div>

                {/* Role (Readonly) */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <Shield className="size-3.5" />
                    <span>VAI TRÒ HỆ THỐNG</span>
                  </div>
                  <p className="text-sm font-medium text-foreground py-1 truncate">{roleInfo.label}</p>
                </div>

                {/* CreatedAt (Readonly) */}
                <div className="space-y-1 sm:col-span-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <Calendar className="size-3.5" />
                    <span>NGÀY TẠO TÀI KHOẢN</span>
                  </div>
                  <p className="text-sm font-medium text-foreground py-1">{formattedDate}</p>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-4">
                {/* Họ và tên */}
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <User className="size-4 text-muted-foreground" />
                    Họ và tên <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    placeholder="Nguyễn Văn A"
                    maxLength={100}
                    disabled={loading}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                    }}
                    className={errors.fullName ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-destructive mt-1 font-medium">{errors.fullName}</p>
                  )}
                </div>

                {/* Số điện thoại */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Phone className="size-4 text-muted-foreground" />
                    Số điện thoại
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    placeholder="Ví dụ: 0912345678"
                    maxLength={20}
                    disabled={loading}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    className={errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive mt-1 font-medium">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-muted/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setChangePasswordOpen(true)}
                  className="cursor-pointer"
                >
                  Đổi mật khẩu
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !fullName.trim()}
                  className="cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground min-w-28"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

      </div>
      <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} token={token} email={profile.email} />
    </div>
  );
}
