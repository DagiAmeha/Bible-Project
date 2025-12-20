"use client";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/Input";
import { useState } from "react";

export function TopHeader() {
  const { data: session } = useSession();
  const t = useTranslations("common");
  const [search, setSearch] = useState("");

  return (
    <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <div className="flex-1 max-w-md mx-auto">
        <Input
          placeholder={t("search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {session?.user?.role}
        </span>
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
          {session?.user?.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
      </div>
    </header>
  );
}
