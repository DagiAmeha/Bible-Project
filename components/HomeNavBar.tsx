"use client";
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Button } from './Button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';


export function HomeNavbar() {
  const {data: session, status} =useSession();
  const t = useTranslations('common');
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">{t('appTitle')}</Link>
        <nav className="flex items-center gap-4 text-sm">
          <LanguageSwitcher />
          <Link href="/login">
            <Button>{t('Login')}</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline">{t('Signup')}</Button>
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}


