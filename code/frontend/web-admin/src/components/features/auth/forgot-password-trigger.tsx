'use client';

import React, { useState } from 'react';
import { ForgotPasswordDialog } from './forgot-password-dialog';

export function ForgotPasswordTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-primary hover:text-primary/90 hover:underline cursor-pointer outline-none bg-transparent border-0 p-0 text-right"
      >
        Quên mật khẩu?
      </button>
      <ForgotPasswordDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
