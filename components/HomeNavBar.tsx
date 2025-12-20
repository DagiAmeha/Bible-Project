"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Button } from "./Button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function HomeNavbar() {
  const { data: session, status } = useSession();
  const t = useTranslations("common");
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900">
          {t("appTitle")}
        </Link>
        <nav className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link href="/login">
            <Button variant="outline">{t("Login")}</Button>
          </Link>
          <Link href="/signup">
            <Button>{t("Signup")}</Button>
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
