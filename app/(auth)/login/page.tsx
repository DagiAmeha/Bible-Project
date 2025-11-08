"use client";
import { useSession } from 'next-auth/react';
import { AuthCard } from '@/components/AuthCard';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const {data: session, status} = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      // Role-based routing
      if (session.user.role === "admin") {
        router.push("/stats");
      } else {
        router.push("/dashboard");
      }
    }
  }, [session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 grid place-items-center py-12">
          <div>Loading...</div>
        </main>
      </div>
    );
  }

  if (session) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 grid place-items-center py-12">
        <AuthCard mode="login" />
      </main>
    </div>
  );
}


