"use client";
import { Sidebar } from '@/components/Sidebar';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ProfilePage() {
  const t = useTranslations('common');
  const [displayName, setDisplayName] = useState('');
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex container mx-auto px-4 gap-6 py-6">
        <Sidebar />
        <main className="flex-1 grid gap-6">
          <h1 className="text-2xl font-semibold">{t('profile')}</h1>
          <div className="border rounded-md p-4 grid gap-4 max-w-lg">
            <div>
              <label className="block text-sm mb-1">{t('displayName')}</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <Button onClick={() => console.log('updateProfile', { displayName })}>{t('save')}</Button>
          </div>
        </main>
      </div>
    </div>
  );
}


