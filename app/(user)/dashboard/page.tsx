"use client";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BookOpen, Flame, FileText } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const t = useTranslations("common");

  useEffect(() => {
    if (status === "unauthenticated" && !session) {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role === "admin") {
      // Redirect admin users to stats page
      router.push("/stats");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t("dashboard")}</h1>
        <p className="text-gray-600 mt-1">{`${t("welcome")}, ${
          session?.user.name
        }`}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Chapters Read Today
              </p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Flame className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Current Streak
              </p>
              <p className="text-2xl font-bold text-gray-900">5 days</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Notes Created</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t("todaySummary")}
        </h2>
        <ul className="space-y-3">
          <li className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">2 chapters read</span>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">1 note created</span>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-gray-700">Streak: 5 days</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
