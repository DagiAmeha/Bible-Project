"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Navbar } from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserLayout({
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
      <Navbar onHamburgerClick={() => setIsSidebarOpen(true)} />
      <DashboardLayout
        isSidebarOpen={isSidebarOpen}
        onCloseSidebar={() => setIsSidebarOpen(false)}
      >
        {children}
      </DashboardLayout>
    </section>
  );
}
