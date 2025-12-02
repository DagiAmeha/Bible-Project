"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { useTranslations } from "next-intl";
import { Logout } from "./Logout";
import { useSession } from "next-auth/react";

export function AdminNavbar() {
  const { data: session, status } = useSession();
  const t = useTranslations("common");
  const router = useRouter();
  const [unread, setUnread] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/chat", { cache: "no-store" });
        if (!res.ok) return;
        const body = await res.json();
        const total = (body.chats || []).reduce(
          (s: number, c: any) => s + (c.unreadCount || 0),
          0
        );
        if (mounted) setUnread(total);
      } catch (e) {
        // ignore
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleMessagesClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/admin/messages/mark-read", { method: "POST" });
    } catch (err) {
      // ignore
    }
    setUnread(0);
    router.push("/admin/messages");
  };
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/admin/dashboard" className="font-semibold">
          {t("appTitle")}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin/dashboard" className="hover:underline">
            {t("dashboard") ?? "Dashboard"}
          </Link>
          <Link href="/admin/plans" className="hover:underline">
            {t("plans") ?? "Plans"}
          </Link>
          <Link href="/admin/users" className="hover:underline">
            {t("users") ?? "Users"}
          </Link>
          <button
            onClick={handleMessagesClick}
            className="hover:underline inline-flex items-center gap-2"
            aria-label="Messages"
          >
            <span>{t("messages") ?? "Messages"}</span>
            {unread > 0 && (
              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-xs px-2 py-0.5">
                {unread}
              </span>
            )}
          </button>
          {/* <Link href="/profile" className="hover:underline">{t('profile')}</Link> */}
          <LanguageSwitcher />
          <ThemeToggle />
          {session && <Logout />}
        </nav>
      </div>
    </header>
  );
}
