"use client";
import { Sidebar } from '@/components/Sidebar';
import { BookList } from '@/components/BookList';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export default function TrackerPage() {
  const [books, setBooks] = useState([]);
  const t = useTranslations('common');

  useEffect(() => {
    const fetchBooks = async () => {
      const res = await fetch("/api/books", { method: "GET" });
      const data = await res.json();
      setBooks(data.books);
      console.log(data.books);
    };
    fetchBooks();
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex container mx-auto px-4 gap-6 py-6">
        <Sidebar />
        <main className="flex-1 grid gap-6">
          <h1 className="text-2xl font-semibold">{t('tracker')}</h1>
          <div className="border rounded-md p-4 grid gap-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">{t('selectBook')}</div>
            </div>
            <BookList books={books} />
          </div>
        </main>
      </div>
    </div>
  );
}


