"use client";
import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { useTranslations } from "next-intl";
import { Logout } from "./Logout";
import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";

export function Navbar({
  onHamburgerClick,
}: {
  onHamburgerClick?: () => void;
}) {
  const { data: session, status } = useSession();
  const t = useTranslations("common");
  return (
    <header className="border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onHamburgerClick && (
            <button
              onClick={onHamburgerClick}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          <Link
            href="/dashboard"
            className="text-lg font-bold text-gray-900 dark:text-gray-100"
          >
            {t("appTitle")}
          </Link>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <LanguageSwitcher />
          <ThemeToggle />
          {session && <Logout />}
        </nav>
      </div>
    </header>
  );
}
