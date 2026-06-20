import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-xl">Đăng nhập Web Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={login} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="owner@restaurant.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
            </div>
            {hasError && (
              <p className="text-sm text-destructive" role="alert">
                Email hoặc mật khẩu không đúng
              </p>
            )}
            <Button type="submit" size="lg" className="w-full">
              Đăng nhập
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
