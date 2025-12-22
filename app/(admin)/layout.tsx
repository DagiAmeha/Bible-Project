"use client";

import { AdminDashboardLayout } from "@/components/AdminDashboardLayout";
import { AdminNavbar } from "@/components/AdminNavbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      <AdminNavbar onHamburgerClick={() => setIsSidebarOpen(true)} />
      <AdminDashboardLayout
        isSidebarOpen={isSidebarOpen}
        onCloseSidebar={() => setIsSidebarOpen(false)}
      >
        {children}
      </AdminDashboardLayout>
    </section>
  );
}
