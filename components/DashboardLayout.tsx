"use client";
import { Sidebar } from "@/components/Sidebar";
import { BarChart3, Calendar, MessageCircle, User } from "lucide-react";
import { useTranslations } from "next-intl";

interface DashboardLayoutProps {
  children: React.ReactNode;
  isSidebarOpen?: boolean;
  onCloseSidebar?: () => void;
}

export function DashboardLayout({
  children,
  isSidebarOpen,
  onCloseSidebar,
}: DashboardLayoutProps) {
  const t = useTranslations("common");

  const items = [
    { href: "/dashboard", label: t("dashboard"), icon: BarChart3 },
    { href: "/plans", label: t("plans"), icon: Calendar },
    { href: "/chat", label: t("chat"), icon: MessageCircle },
    { href: "/profile", label: t("profile"), icon: User },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar items={items} isOpen={isSidebarOpen} onClose={onCloseSidebar} />
      <div className="flex-1 flex flex-col md:ml-0">
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
