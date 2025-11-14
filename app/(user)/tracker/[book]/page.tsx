"use client";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";

export interface Schedule {
  _id: string;
  planId: string;
  day: number;
  portion: string;
  books: string[];
  startDate?: string; // assuming your API includes this
}

interface DailyProgress {
  day: number;
  completed: boolean;
  markedAt: Date;
}

export interface Progress {
  _id: string;
  userId: string;
  PlanId: string;
  dailyProgress: DailyProgress[];
}

// ✅ Utility: get current reading day based on plan start date
function getCurrentDay(startDateString: string): number {
  if (!startDateString) return 0;
  const startDate = new Date(startDateString);
  const today = new Date();

  // Normalize to midnight to avoid timezone issues
  const localStart = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );
  const localToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const diffMs = localToday.getTime() - localStart.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return diffDays < 1 ? 0 : diffDays;
}

export default function BookPlan({ params }: { params: { book: string } }) {
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [readDays, setReadDays] = useState<Set<number>>(new Set());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Step 1: Fetch schedule
        const resSchedule = await fetch(`/api/schedules/${params.book}`);
        const dataSchedule = await resSchedule.json();
        setSchedule(dataSchedule.schedules);
        console.log("Schedule loaded:", dataSchedule.schedules);

        // ✅ Extract startDate and calculate current day
        

        // Step 2: Fetch progress
        if (dataSchedule.schedules.length > 0) {
          const planId = dataSchedule.schedules[0].planId;
          const resProgress = await fetch(`/api/progress/${planId}`);

          if (resProgress.ok) {
            const dataProgress = await resProgress.json();
            const progressObj: Progress[] = dataProgress.data.progress;

            setReadDays(
              new Set(
                progressObj[0].dailyProgress.map(
                  (item: DailyProgress) => item.day
                )
              )
            );

            if (dataProgress.data.progress.length > 0 && dataProgress.data.planStartDate) {
              const todayNumber = getCurrentDay(dataProgress.data.planStartDate);
              setCurrentDay(todayNumber);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching schedule or progress:", error);
      }
    };

    fetchData();
  }, [params.book]);

  const makeAsRead = async (day: number, planId: string) => {
    try {
      const response = await fetch("/api/progress/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ day, planId }),
      });

      if (response.ok) {
        setReadDays((prev) => new Set(prev).add(day));
      } else {
        console.error("Failed to mark as read");
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  return (
    <div className="p-4 transition-colors duration-300">
      <h1 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">
        {decodeURIComponent(params.book)} Reading Plan
      </h1>

      <ul
        className="
          grid
          gap-4
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          xl:grid-cols-5
          2xl:grid-cols-6
        "
      >
        {schedule.map((item: Schedule) => {
          const isRead = readDays.has(item.day);
          const isHovered = hoveredDay === item.day;
          const isToday = item.day === currentDay; // ✅ Highlight today

          return (
            <li
              key={item._id}
              className={`
                border rounded-xl relative text-center cursor-pointer
                transition-all duration-300 overflow-hidden
                ${isToday
                  ? "border-green-500 shadow-green-200 dark:shadow-green-800"
                  : "border-gray-200 dark:border-gray-700"}
                bg-white hover:shadow-md
                dark:bg-gray-800 dark:hover:shadow-gray-700/40
              `}
              onMouseEnter={() => setHoveredDay(item.day)}
              onMouseLeave={() => setHoveredDay(null)}
              onClick={() => makeAsRead(item.day, item.planId)}
            >
              {/* ✅ Checkmark */}
              {isRead && (
                <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow-md">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}

              {/* ✅ Hover Overlay */}
              {!isRead && (
                <div
                  className={`
                    absolute inset-0 flex items-center justify-center
                    backdrop-blur-sm transition-all duration-300 ease-in-out
                    ${isHovered
                      ? "opacity-100 scale-100 bg-white/40 dark:bg-gray-900/40"
                      : "opacity-0 scale-95 pointer-events-none"}
                  `}
                >
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    Mark as Read
                  </span>
                </div>
              )}

              <div className="p-4">
                <p
                  className={`font-bold ${
                    isToday ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  Day {item.day}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {item.portion}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
