import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';

export const dynamic = 'force-dynamic';

export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <DashboardLayout user={user}>{children}</DashboardLayout>;
}
