"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "./utils";
import { useTranslations } from "next-intl";
import { BarChart3, Users, ClipboardList, MessageCircle } from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  const t = useTranslations("common");
  const items = [
    { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/plans", label: "Plans", icon: ClipboardList },
    { href: "/admin/messages", label: "Messages", icon: MessageCircle },
  ];
  return (
    <aside className="w-64 bg-white border-r shadow-sm">
      <nav className="px-4 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
