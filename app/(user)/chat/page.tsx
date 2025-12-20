"use client";
import { Sidebar } from "@/components/Sidebar";
import { ChatBox } from "@/components/ChatBox";
import { useTranslations } from "next-intl";

export default function ChatPage() {
  const t = useTranslations("common");
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex container mx-auto px-4 gap-6 py-6">
        <main className="flex-1 grid gap-6">
          <h1 className="text-2xl font-semibold">{t("chat")}</h1>
          <div className="h-[600px]">
            <ChatBox />
          </div>
        </main>
      </div>
    </div>
  );
}
