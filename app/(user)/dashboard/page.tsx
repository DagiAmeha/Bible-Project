"use client";
import { useSession } from 'next-auth/react';
import { Sidebar } from '@/components/Sidebar';
import { ProgressChart } from '@/components/ProgressChart';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const t = useTranslations('common');

  useEffect(() => {
    if (status === 'unauthenticated' && !session) {
      router.push("/login");
    } else if (status === 'authenticated' && session?.user?.role === 'admin') {
      // Redirect admin users to stats page
      router.push("/stats");
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }


  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex container mx-auto px-4 gap-6 py-6">
        <Sidebar />
        <main className="flex-1 grid gap-6">
          <h1 className="text-2xl font-semibold">{t('dashboard')}</h1>
          <h2 className="text-2xl font-semibold">  {`${t('welcome')}, ${session?.user.name}`}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="font-medium mb-2">{t('weeklyProgress')}</h2>
              <ProgressChart />
            </div>
            <div className="border rounded-md p-4">
              <h2 className="font-medium mb-2">{t('todaySummary')}</h2>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li>2 chapters read</li>
                <li>1 note created</li>
                <li>Streak: 5 days</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


