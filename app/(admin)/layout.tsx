"use client";

import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import { AdminNavbar } from "@/components/AdminNavbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated" && !session) {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <section>Loading...</section>;
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  return (
    <section>
      <AdminNavbar />
      <AdminDashboardLayout>{children}</AdminDashboardLayout>
    </section>
  );
}
