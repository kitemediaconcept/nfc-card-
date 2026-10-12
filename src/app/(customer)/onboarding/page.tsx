import { requireAuth } from '@/lib/auth';
import OnboardingClient from '@/components/onboarding/OnboardingClient';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const user = await requireAuth();

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <OnboardingClient user={user} />
      </div>
    </main>
  );
}
