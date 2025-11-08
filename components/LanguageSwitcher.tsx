"use client";
import { useLanguage } from '@/_lib/language-provider';
import { Button } from './Button';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={() => setLocale(locale === 'en' ? 'am' : 'en')}
        aria-label="Switch language"
      >
        {locale === 'en' ? 'Amharic' : 'English'}
      </Button>
    </div>
  );
}


