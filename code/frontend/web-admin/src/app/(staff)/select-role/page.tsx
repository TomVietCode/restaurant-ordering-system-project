import { signOut } from '@/auth';
import Link from 'next/link';

export default function SelectRolePage() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-cover bg-center"
    >
      <div className="flex flex-col items-center gap-4 rounded-lg bg-white/80 p-8 shadow-lg backdrop-blur-md">
        <h1 className="text-center text-2xl font-bold">Select Role</h1>
        <p className="text-center text-gray-700">Chọn vai trò nhân viên của bạn</p>
        <div className="flex gap-4">
          <Link
            href="/kitchen"
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Kitchen
          </Link>
          <Link
            href="/cashier"
            className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          >
            Cashier
          </Link>
        </div>
        <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: '/login' })
            }}
          >
            <button type="submit">Sign Out</button>
          </form>
      </div>
      
    </main>
  );
}
