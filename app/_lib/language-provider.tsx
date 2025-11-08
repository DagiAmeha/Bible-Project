"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import en from '@/locales/en/common.json';
import am from '@/locales/am/common.json';

type Locale = 'en' | 'am';

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('locale')) as Locale | null;
    if (saved === 'en' || saved === 'am') setLocaleState(saved);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== 'undefined') localStorage.setItem('locale', l);
    console.log('Locale changed to', l);
  }, []);

  const messages = useMemo(() => (locale === 'am' ? am : en), [locale]);

  const ctx = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return (
    <LanguageContext.Provider value={ctx}>
      <NextIntlClientProvider locale={locale} messages={{ common: messages }}>
        {children}
      </NextIntlClientProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}


