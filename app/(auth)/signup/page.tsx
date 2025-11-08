"use client";
import { AuthCard } from '@/components/AuthCard';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 grid place-items-center py-12">
        <AuthCard mode="signup" />
      </main>
    </div>
  );
}


