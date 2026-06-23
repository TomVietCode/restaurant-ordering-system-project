import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ROLE_HOME } from '@/lib/constants';
import type { Role } from '@/types/auth';

export default async function HomePage() {
  const session = await auth();
  
  if (session?.user?.role) {
    redirect(ROLE_HOME[session.user.role as Role]); // OWNER→/dashboard, STAFF→/select-role
  }
  redirect('/login'); // chưa login
}