"use client";
import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { useTranslations } from "next-intl";
import { Logout } from "./Logout";
import { useSession } from "next-auth/react";

export function UserNavbar() {
  const { data: session, status } = useSession();
  const t = useTranslations("common");
  return (
    <header className="border-b">
      <div className="container mx-auto px-8 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="text-lg  font-bold">
          {t("appTitle")}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <LanguageSwitcher />
          <ThemeToggle />
          {session && <Logout />}
        </nav>
      </div>
    </header>
  );
}
