import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ForgotPasswordTrigger } from '@/components/features/auth/forgot-password-trigger';

// Server Action — chạy trên server, gọi signIn từ @/auth.
async function login(formData: FormData) {
  'use server';
  try {
    await signIn('credentials', {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirectTo: '/', // proxy tự điều hướng tiếp: OWNER→/dashboard, STAFF→/select-role
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // Sai email/mật khẩu → báo lỗi qua search param (AC-03).
      redirect('/login?error=1');
    }
    // PHẢI re-throw — NEXT_REDIRECT không phải lỗi thật, Next.js cần nó để redirect.
    throw error;
  }
}

// searchParams là Promise trong Next.js 16.
export default async function LoginPage(props: {
  searchParams: Promise<{ error?: string }>;
}) {
  const searchParams = await props.searchParams;
  const hasError = Boolean(searchParams.error);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-lg [--card-spacing:32px]">
        <CardHeader>
          <CardTitle className="text-center text-2xl md:text-3xl font-bold tracking-tight">
            Đăng nhập quản trị
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={login} className="flex flex-col gap-3">
            <div className="grid gap-1">
              <Label htmlFor="email" className="text-sm md:text-base font-semibold">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="owner@restaurant.com"
                required
                className="h-12 px-4 text-base md:text-base"
              />
            </div>
            <div className="grid gap-1 mt-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm md:text-base font-semibold">
                  Mật khẩu
                </Label>
                <ForgotPasswordTrigger />
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="********"
                required
                className="h-12 px-4 text-base md:text-base"
              />
            </div>
            <div className="min-h-3">
              {hasError && (
                <p className="text-sm md:text-base text-destructive font-medium" role="alert">
                  Email hoặc mật khẩu không đúng
                </p>
              )}
            </div>
            <Button type="submit" size="lg" className="w-full h-12 text-base font-semibold">
              Đăng nhập
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
