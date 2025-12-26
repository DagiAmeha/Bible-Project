"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, Flame, FileText, CheckCircle } from "lucide-react";

type TodayReading = {
  day: number;
  portion: string;
  books: string[];
  status: string;
};

type DashboardStats = {
  chaptersReadToday: number;
  currentStreak: number;
  completionPercent: number;
};

type currentPlan = {
  id: string;
  title: string;
  day: number;
  totalDays: number;
};

export function getChapterCount(portion: string): number {
  // Extract the numeric part: "1–2", "3", "13–15"
  const match = portion.match(/(\d+)(?:\s*[–-]\s*(\d+))?$/);

  if (!match) return 0;

  const start = parseInt(match[1], 10);
  const end = match[2] ? parseInt(match[2], 10) : start;

  return end - start + 1;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const t = useTranslations("common");

  // -----------------------------
  // Mocked API state
  // -----------------------------
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayReading, setTodayReading] = useState<TodayReading | null>(null);
  const [currentPlan, setCurrentPlan] = useState<currentPlan | null>(null);
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // Auth redirect
  // -----------------------------
  useEffect(() => {
    if (status === "unauthenticated" && !session) {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role === "admin") {
      router.push("/stats");
    }
  }, [status, session, router]);

  // -----------------------------
  // Mimic API calls
  // -----------------------------
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/user/dashboard");
        const data = await res.json();
        console.log("Dashboard data:", data);
        if (data.status === "success") {
          // For simplicity, we take the first plan's data
          const firstPlan = data.data[0];
          setStats({
            chaptersReadToday: getChapterCount(firstPlan.todayReading.portion),
            currentStreak: firstPlan.streak,
            completionPercent: firstPlan.completionPercent, // Mocked value
          });
          setTodayReading(firstPlan.todayReading);
          setCurrentPlan({
            id: firstPlan.id,
            title: firstPlan.planName,
            day: firstPlan.todayReading.day,
            totalDays: firstPlan.totalDays,
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (status === "loading" || !stats || !todayReading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{t("dashboard")}</h1>
        <p className="text-gray-600 mt-1">
          {t("welcome")}, {session?.user?.name}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<BookOpen />}
          title="Chapters Today"
          value={stats.chaptersReadToday}
          color="blue"
        />
        <StatCard
          icon={<Flame />}
          title="Current Streak"
          value={`${
            stats.currentStreak > 0
              ? `${stats.currentStreak} days`
              : "No streak"
          } `}
          color="green"
        />
        <StatCard
          icon={<CheckCircle />}
          title="Completion"
          value={`${stats.completionPercent}%`}
          color="purple"
        />
      </div>

      {/* Today's Reading */}
      <div className="bg-white rounded-lg border p-5">
        <h2 className="text-lg font-semibold mb-3">
          📖 Today’s Reading (Day {todayReading.day})
        </h2>

        <div
          key={todayReading.books[0]}
          className="flex items-center justify-between p-3 border rounded-md mb-2"
        >
          <div>
            <p className="font-medium">{todayReading.books[0]}</p>
            <p className="text-sm text-gray-600">
              Chapters: {todayReading.portion}
            </p>
          </div>
          <span
            className={`text-sm font-medium ${
              todayReading.status === "completed"
                ? "text-green-600"
                : "text-orange-500"
            }`}
          >
            {todayReading.status}
          </span>
        </div>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-lg border p-5">
        <h2 className="text-lg font-semibold mb-2">📅 Current Plan</h2>
        <p className="text-gray-700">{currentPlan?.title}</p>
        <p className="text-sm text-gray-600">
          Day {currentPlan?.day} of {currentPlan?.totalDays}
        </p>

        <div className="mt-4 flex gap-3">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
            onClick={() => router.push(`/plans/${currentPlan?.id}/progress`)}
          >
            Continue Reading
          </button>
          <button
            className="px-4 py-2 border rounded-md text-sm"
            onClick={() => router.push("/plans")}
          >
            View Plan
          </button>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------
   Reusable Stat Card
----------------------------- */
function StatCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: "blue" | "green" | "purple";
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="bg-white rounded-lg border p-4 flex items-center">
      <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
      <div className="ml-4">
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}
