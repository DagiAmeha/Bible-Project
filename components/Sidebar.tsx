"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from './utils';
import { useTranslations } from 'next-intl';

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations('common');
  const items = [
    { href: '/dashboard', label: t('dashboard') },
    { href: '/tracker', label: t('tracker') },
    { href: '/chat', label: t('chat') },
    { href: '/profile', label: t('profile') },
  ];
  return (
    <aside className="w-60 shrink-0 border-r h-[calc(100vh-56px)] sticky top-14">
      <div className="p-3 text-xs font-semibold text-muted-foreground">{t('navigation')}</div>
      <ul className="px-2 space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                'block rounded-md px-3 py-2 text-sm hover:bg-muted',
                pathname === item.href && 'bg-muted font-medium'
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}


