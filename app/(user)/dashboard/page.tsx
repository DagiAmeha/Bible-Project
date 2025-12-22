"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, Flame, FileText, CheckCircle } from "lucide-react";

type TodayReading = {
  day: number;
  books: {
    name: string;
    chapters: number[];
    completed: boolean;
  }[];
};

type DashboardStats = {
  chaptersReadToday: number;
  currentStreak: number;
  completionPercent: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const t = useTranslations("common");

  // -----------------------------
  // Mocked API state
  // -----------------------------
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayReading, setTodayReading] = useState<TodayReading | null>(null);
  const [currentPlan, setCurrentPlan] = useState({
    title: "New Testament Reading Plan",
    day: 12,
    totalDays: 106,
  });

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
    // Fake API response
    setStats({
      chaptersReadToday: 2,
      currentStreak: 5,
      completionPercent: 18,
    });

    setTodayReading({
      day: 12,
      books: [
        {
          name: "Romans",
          chapters: [5, 6],
          completed: false,
        },
      ],
    });
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
          value={`${stats.currentStreak} days`}
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

        {todayReading.books.map((book) => (
          <div
            key={book.name}
            className="flex items-center justify-between p-3 border rounded-md mb-2"
          >
            <div>
              <p className="font-medium">{book.name}</p>
              <p className="text-sm text-gray-600">
                Chapters: {book.chapters.join(", ")}
              </p>
            </div>
            <span
              className={`text-sm font-medium ${
                book.completed ? "text-green-600" : "text-orange-500"
              }`}
            >
              {book.completed ? "Completed" : "Pending"}
            </span>
          </div>
        ))}
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-lg border p-5">
        <h2 className="text-lg font-semibold mb-2">📅 Current Plan</h2>
        <p className="text-gray-700">{currentPlan.title}</p>
        <p className="text-sm text-gray-600">
          Day {currentPlan.day} of {currentPlan.totalDays}
        </p>

        <div className="mt-4 flex gap-3">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
            onClick={() => router.push("/tracker/today")}
          >
            Continue Reading
          </button>
          <button
            className="px-4 py-2 border rounded-md text-sm"
            onClick={() => router.push("/plan")}
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
