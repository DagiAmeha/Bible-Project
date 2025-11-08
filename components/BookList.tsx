"use client";
import { useRouter } from 'next/navigation';
import { Button } from './Button';

type Book = {
  name: string;
  chapters: number;
  status: "unread" | "reading" | "completed";
  testament: "Old Testament" | "New Testament";
};

type BookListProps = {
  books: Book[];
};


export function BookList({books}: BookListProps) {
  const router = useRouter();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {books.map((book) => (
        <Button
          key={book.name}
          variant="outline"
          onClick={() => router.push(`/tracker/${book.name}`)}
          className="justify-start"
        >
          {book.name}
        </Button>
      ))}
    </div>
  );
}


