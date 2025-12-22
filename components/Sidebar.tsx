"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "./utils";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useState } from "react";

export function Sidebar({
  items,
  isOpen,
  onClose,
}: {
  items: { href: string; label: string; icon: any }[];
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          " flex flex-col py-4 bg-white dark:bg-gray-900 border-r shadow-sm  transition-all duration-300",
          // Desktop: always visible, expandable
          "hidden md:flex",
          isExpanded ? "md:w-64" : "md:w-24",
          // Mobile: fixed, overlay when open
          isOpen
            ? "fixed left-0 top-0 h-full w-64 z-50 md:relative md:top-auto"
            : ""
        )}
      >
        {/* Mobile close button */}
        <div className="md:hidden flex justify-end p-4">
          <button onClick={onClose} className="p-1">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="px-4 space-y-2 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 text-sm font-medium hover:border-l-4 hover:border-blue-700 dark:hover: dark:border-blue-300 transition-all duration-200",
                  pathname.includes(item.href)
                    ? `text-blue-700 dark:text-blue-400 ${
                        isExpanded &&
                        "border-l-4 border-blue-700 dark:border-blue-400"
                      }`
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                )}
                onClick={onClose}
              >
                <Icon className="h-6 w-6" />
                {isExpanded && item.label}
              </Link>
            );
          })}
        </nav>

        <div
          className="mt-auto p-4 hidden md:block"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ArrowLeft className="h-6 w-6" />
          ) : (
            <ArrowRight className="h-6 w-6" />
          )}
        </div>
      </aside>
    </>
  );
}
