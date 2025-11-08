"use client";
import Link from 'next/link';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { useTranslations } from 'next-intl';
import { Logout } from './Logout';
import { useSession } from 'next-auth/react';


export function UserNavbar() {
  const {data: session, status} =useSession();
  const t = useTranslations('common');
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">{t('appTitle')}</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="hover:underline">{t('dashboard')}</Link>
          <Link href="/tracker" className="hover:underline">{t('tracker')}</Link>
          <Link href="/chat" className="hover:underline">{t('chat')}</Link>
          <Link href="/profile" className="hover:underline">{t('profile')}</Link>
          <LanguageSwitcher />
          <ThemeToggle />
          {session && <Logout/> }
          
        </nav>
      </div>
    </header>
  );
}


