"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PlansTabs() {
  const pathname = usePathname();

  const tabs = [
    { name: "My Plans", href: "/plans/my" },
    { name: "All Plans", href: "/plans/all" },
    { name: "Completed", href: "/plans/completed" },
  ];

  return (
    <div className="flex border-b mb-4">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              active
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-muted-foreground"
            }`}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
