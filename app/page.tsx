"use client";
import { HomeNavbar } from '@/components/HomeNavBar';
import { Button } from '@/components/Button';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function HomePage() {
  const t = useTranslations('common');
  return (
    <div className="min-h-screen flex flex-col">
      <HomeNavbar />
      <main className="flex-1 container mx-auto px-4 py-10 grid gap-6">
        <h1 className="text-3xl font-bold">{t('appTitle')}</h1>
        <p className="text-muted-foreground max-w-2xl">{t('landingSubtitle')}</p>
        <div className="flex gap-3">
          <Link href="/login">
            <Button>{t('Login')}</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline">{t('Signup')}</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}


