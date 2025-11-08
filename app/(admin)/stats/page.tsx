"use client";
import { ProgressChart } from '@/components/ProgressChart';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminStatsPage() {
  const t = useTranslations('common');
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated' && !session) {
      router.push("/login");
    } else if (status === 'authenticated' && session?.user?.role === 'user') {
      // Redirect admin users to stats page
      router.push("/dashboard");
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="container mx-auto px-4 py-6 grid gap-6">
        <h1 className="text-2xl font-semibold">{t('adminStats')}</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-medium mb-2">{t('weeklyProgress')}</h2>
            <ProgressChart />
          </div>
          <div className="border rounded-md p-4">
            <h2 className="font-medium mb-2">{t('totals')}</h2>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>Users: 120</li>
              <li>Messages: 1,542</li>
              <li>Audio Uploads: 98</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}


