'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Key, Mail, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { authService } from '@/services/auth.service';

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; otp?: string; newPassword?: string; confirmPassword?: string }>({});

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
  }, [open]);

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrors({ email: 'Email không được để trống' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Email không hợp lệ' });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await authService.forgotPassword(email.trim());
      toast.success('Mã OTP khôi phục mật khẩu đã được gửi đến email');
      setStep(2);
    } catch (err: any) {
      console.error(err);
      let errorMsg = 'Có lỗi xảy ra khi gửi mã OTP. Vui lòng thử lại sau.';
      const errorStr = err?.message || '';

      if (errorStr.includes('Email had not link to any user') || errorStr.includes('404')) {
        errorMsg = 'Email không liên kết với tài khoản nào trong hệ thống';
      }
      setErrors({ email: errorMsg });
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm OTP and Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
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
      toast.success('Khôi phục mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.');
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      let errorMsg = 'Có lỗi xảy ra khi khôi phục mật khẩu. Vui lòng thử lại sau.';
      const errorStr = err?.message || '';

      if (errorStr.includes('OTP not correct') || errorStr.includes('OTP not corret')) {
        errorMsg = 'Mã OTP không chính xác';
        setErrors({ otp: errorMsg });
      } else if (errorStr.includes('OTP has expired')) {
        errorMsg = 'Mã OTP đã hết hạn';
        setErrors({ otp: errorMsg });
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
            Khôi phục mật khẩu
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Nhập địa chỉ email đã đăng ký để nhận mã xác thực OTP khôi phục mật khẩu.'
              : 'Nhập mã OTP đã nhận qua email và đặt mật khẩu mới.'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <form id="forgot-otp-form" onSubmit={handleSendOtp} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="forgot-email" className="text-sm font-medium">
                Email đăng ký <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="forgot-email"
                  type="email"
                  value={email}
                  placeholder="owner@restaurant.com"
                  autoFocus
                  disabled={loading}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-11"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive font-medium">{errors.email}</p>
              )}
            </div>
          </form>
        ) : (
          <form id="forgot-reset-form" onSubmit={handleResetPassword} className="space-y-4 py-2">
            {/* OTP */}
            <div className="space-y-1.5">
              <Label htmlFor="forgot-otp" className="text-sm font-medium">
                Mã xác thực OTP <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="forgot-otp"
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
              <Label htmlFor="forgot-new-password" className="text-sm font-medium">
                Mật khẩu mới <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="forgot-new-password"
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
              <Label htmlFor="forgot-confirm-password" className="text-sm font-medium">
                Xác nhận mật khẩu mới <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="forgot-confirm-password"
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
              form="forgot-otp-form"
              disabled={loading || !email.trim()}
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
              form="forgot-reset-form"
              disabled={loading || otp.length !== 6 || newPassword.length < 6 || !confirmPassword}
              className="cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Khôi phục mật khẩu'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
