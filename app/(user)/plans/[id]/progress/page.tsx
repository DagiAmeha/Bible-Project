"use client";
import { useEffect, useState } from "react";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";
import { getCurrentDay } from "@/utils/date";

export interface Schedule {
  _id: string;
  planId: {
    _id: string;
    title: string;
    startDate: Date;
  };
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

export default function BookPlan({ params }: { params: { id: string } }) {
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [readDays, setReadDays] = useState<Set<number>>(new Set());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  // Pagination
  const ITEMS_PER_PAGE = 14; // configurable: number of days per page
  const [currentPage, setCurrentPage] = useState<number>(0); // zero-based

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Step 1: Fetch schedule
        setLoading(true);
        const resSchedule = await fetch(`/api/plans/${params.id}/progress`);
        const dataSchedule = await resSchedule.json();

        setSchedule(
          Array.isArray(dataSchedule.schedules) ? dataSchedule.schedules : []
        );

        setReadDays(
          new Set(
            Array.isArray(dataSchedule.progress)
              ? dataSchedule.progress.map((item: DailyProgress) => item.day)
              : []
          )
        );

        console.log("Schedule Data:", dataSchedule.schedules);
      } catch (error) {
        console.error("Error fetching schedule or progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  useEffect(() => {
    const planStartDate = schedule[0]?.planId.startDate.toString();
    console.log("Plan Start Date:", planStartDate);

    if (planStartDate) {
      const todayNumber = getCurrentDay(planStartDate);
      setCurrentDay(todayNumber);
    }
    // set page to the page that contains currentDay
    if (schedule.length > 0) {
      const initialPage = Math.max(
        0,
        Math.ceil((currentDay || 1) / ITEMS_PER_PAGE) - 1
      );
      setCurrentPage((prev) => (prev === initialPage ? prev : initialPage));
    }
  }, [schedule]);

  // Derived pagination values
  const totalItems = schedule?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const currentPageSchedule = schedule.slice(startIndex, endIndex);

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

  return loading ? (
    <div className="flex align-top justify-center p-8">Loading...</div>
  ) : (
    <div className="px-4 py-8 transition-colors duration-300 flex flex-col scrollbar-hide">
      <h1 className="text-2xl font-bold mb-8 text-gray-900 dark:text-gray-100">
        {schedule[0]?.planId.title} - Reading Progress
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
        mb-16
      "
      >
        {currentPageSchedule.map((item: Schedule) => {
          const isRead = readDays.has(item.day);
          const isHovered = hoveredDay === item.day;
          const isToday = item.day === currentDay; // ✅ Highlight today

          return (
            <li
              key={item._id}
              className={`
                border rounded-xl relative text-center cursor-pointer
                transition-all duration-300 overflow-hidden
                ${
                  isToday
                    ? "border-green-500 shadow-green-200 dark:shadow-green-800"
                    : "border-gray-200 dark:border-gray-700"
                }
                bg-white hover:shadow-md
                dark:bg-gray-800 dark:hover:shadow-gray-700/40
              `}
              onMouseEnter={() => setHoveredDay(item.day)}
              onMouseLeave={() => setHoveredDay(null)}
              onClick={() => makeAsRead(item.day, item.planId._id)}
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
                    ${
                      isHovered
                        ? "opacity-100 scale-100 bg-white/40 dark:bg-gray-900/40"
                        : "opacity-0 scale-95 pointer-events-none"
                    }
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
                    isToday
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-900 dark:text-gray-100"
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

      {/* Pagination controls */}
      {totalItems > ITEMS_PER_PAGE && (
        <div
          className="
      fixed
      bottom-1/4
      left-1/2
      z-50
    "
        >
          <div className="flex items-center gap-8 bg-white dark:bg-gray-800 px-6 py-3 rounded-xl shadow-lg">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
            >
              <ArrowLeft className="h-6 w-6 dark:text-white" />
            </button>

            <div className="text-sm text-gray-700 dark:text-gray-200">
              Page {currentPage + 1} of {totalPages}
            </div>

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
              }
              disabled={currentPage >= totalPages - 1}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
            >
              <ArrowRight className="h-6 w-6 dark:text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
