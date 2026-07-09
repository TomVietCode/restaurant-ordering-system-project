'use client';

import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Key, Mail, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { authService } from '@/services/auth.service';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string;
}

export function ChangePasswordDialog({ open, onOpenChange, token }: ChangePasswordDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [oldPassword, setOldPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ oldPassword?: string; otp?: string; newPassword?: string; confirmPassword?: string }>({});

  const [prevOpen, setPrevOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setStep(1);
      setOldPassword('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    }
  }

  // Step 1: Verify Current Password
  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) {
      setErrors({ oldPassword: 'Mật khẩu hiện tại không được để trống' });
      return;
    }
    if (oldPassword.length < 6) {
      setErrors({ oldPassword: 'Mật khẩu phải chứa ít nhất 6 ký tự' });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await authService.verifyPassword(token, oldPassword);
      toast.success('Mã OTP đã được gửi đến email của bạn');
      setStep(2);
    } catch (err) {
      console.error(err);
      let errorMsg = 'Có lỗi xảy ra khi xác thực mật khẩu. Vui lòng thử lại sau.';
      const errorStr = err instanceof Error ? err.message : String(err);

      if (errorStr.includes('Old password invalid')) {
        errorMsg = 'Mật khẩu hiện tại không chính xác';
      }
      setErrors({ oldPassword: errorMsg });
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm OTP & Change Password
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!otp) {
      newErrors.otp = 'Mã OTP không được để trống';
    } else if (!/^[0-9]{6}$/.test(otp)) {
      newErrors.otp = 'Mã OTP phải gồm 6 chữ số';
    }

    if (!newPassword) {
      newErrors.newPassword = 'Mật khẩu mới không được để trống';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu mới không khớp';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await authService.verifyOtp(otp, newPassword);
      toast.success('Đổi mật khẩu thành công. Hệ thống sẽ đăng xuất tài khoản.');
      
      // Auto logout and redirect to login page
      setTimeout(async () => {
        await signOut({ redirect: false });
        window.location.href = '/login';
      }, 1500);
    } catch (err) {
      console.error(err);
      let errorMsg = 'Có lỗi xảy ra khi cập nhật mật khẩu. Vui lòng thử lại sau.';
      const errorStr = err instanceof Error ? err.message : String(err);

      if (errorStr.includes('OTP not correct') || errorStr.includes('OTP not corret')) {
        errorMsg = 'Mã OTP không chính xác';
        setErrors({ otp: errorMsg });
      } else if (errorStr.includes('OTP has expired')) {
        errorMsg = 'Mã OTP đã hết hạn';
        setErrors({ otp: errorMsg });
      } else if (errorStr.includes('New password and old password can not be the same')) {
        errorMsg = 'Mật khẩu mới không được trùng với mật khẩu cũ';
        setErrors({ newPassword: errorMsg });
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border border-muted/40 shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="size-5 text-primary" />
            Đổi mật khẩu tài khoản
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Nhập mật khẩu hiện tại để nhận mã xác thực OTP gửi qua email.'
              : 'Nhập mã OTP nhận được từ email và đặt mật khẩu mới.'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <form id="verify-pw-form" onSubmit={handleVerifyPassword} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="oldPassword" className="text-sm font-medium">
                Mật khẩu hiện tại <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="oldPassword"
                  type="password"
                  value={oldPassword}
                  placeholder="••••••••"
                  autoFocus
                  disabled={loading}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="pl-9 h-11"
                />
              </div>
              {errors.oldPassword && (
                <p className="text-xs text-destructive font-medium">{errors.oldPassword}</p>
              )}
            </div>
          </form>
        ) : (
          <form id="reset-pw-form" onSubmit={handleConfirmReset} className="space-y-4 py-2">
            {/* OTP */}
            <div className="space-y-1.5">
              <Label htmlFor="otp" className="text-sm font-medium">
                Mã xác thực OTP <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="otp"
                  value={otp}
                  placeholder="Nhập 6 chữ số"
                  maxLength={6}
                  disabled={loading}
                  onChange={(e) => setOtp(e.target.value)}
                  className="pl-9 h-11"
                />
              </div>
              {errors.otp && (
                <p className="text-xs text-destructive font-medium">{errors.otp}</p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-sm font-medium">
                Mật khẩu mới <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  placeholder="Tối thiểu 6 ký tự"
                  disabled={loading}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-9 h-11"
                />
              </div>
              {errors.newPassword && (
                <p className="text-xs text-destructive font-medium">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Xác nhận mật khẩu mới <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  placeholder="••••••••"
                  disabled={loading}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9 h-11"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive font-medium">{errors.confirmPassword}</p>
              )}
            </div>
          </form>
        )}

        <DialogFooter className="gap-2 sm:gap-0 border-t border-muted/40 pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Hủy
          </Button>

          {step === 1 ? (
            <Button
              type="submit"
              form="verify-pw-form"
              disabled={loading || oldPassword.length < 6}
              className="cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Đang gửi mã...
                </>
              ) : (
                'Gửi mã OTP'
              )}
            </Button>
          ) : (
            <Button
              type="submit"
              form="reset-pw-form"
              disabled={loading || otp.length !== 6 || newPassword.length < 6 || !confirmPassword}
              className="cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Đổi mật khẩu'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
