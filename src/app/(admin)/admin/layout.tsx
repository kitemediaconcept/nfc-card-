import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AdminLayout from '@/components/layout/AdminLayout';

export const dynamic = 'force-dynamic';

export default async function ServerAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    redirect('/dashboard');
  }

  return <AdminLayout user={user}>{children}</AdminLayout>;
}
