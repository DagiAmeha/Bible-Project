import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserPlan from "@/models/UserPlan";
import "@/models/Plan";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCurrentDay } from "@/utils/date";
import { DailyProgress } from "@/types/progress";
import Progress from "@/models/Progress";
import { calculateStreak } from "@/lib/calculateStreak";
import Schedule, { ScheduleDay } from "@/models/Schedule";

interface response {
  id: string;
  planName: string;
  totalDays: number;
  todayReading: {
    day: number;
    portion: string;
    books: string[];
    status: string;
  };
  streak: number;
  completionPercent: number;
}

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "user") {
      return NextResponse.json(
        { status: "fail", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userPlans = await UserPlan.find({ userId: session.user.id }).populate(
      "planId"
    );
    let response: response[] = [];

    for (let i = 0; i < userPlans.length; i++) {
      const id = userPlans[i]._id.toString();
      const planName = userPlans[i].planId.name;
      const totalDays = userPlans[i].planId.durationDays;
      const { startDate } = userPlans[i].planId;
      const currentDay = getCurrentDay(startDate);

      const todaySchedule = await Schedule.findOne({
        planId: userPlans[i].planId._id,
        day: currentDay,
      }).lean<ScheduleDay | null>();

      if (!todaySchedule) continue;

      const progressDoc = (await Progress.findOne({
        userId: session.user.id,
        planId: userPlans[i].planId._id,
      }).lean()) as { dailyProgress?: DailyProgress[] } | null;

      const dailyProgresses: DailyProgress[] = progressDoc?.dailyProgress ?? [];
      const streak = calculateStreak(dailyProgresses);

      const completedCount = dailyProgresses.filter((d) => d.completed).length;

      const completionPercent = Math.round((completedCount / totalDays) * 100);

      let status = "not read";
      const readToday = dailyProgresses.filter(
        (progress) => progress.day === currentDay
      );
      if (readToday.length > 0 && readToday[0].completed) {
        status = "completed";
      }

      response.push({
        id,
        planName,
        totalDays,
        todayReading: {
          day: todaySchedule.day,
          portion: todaySchedule.portion,
          books: todaySchedule.books,
          status,
        },
        streak,
        completionPercent,
      });
    }

    return NextResponse.json({
      status: "success",
      data: response,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: "fail", message: "Error fetching dashboard metrics" },
      { status: 500 }
    );
  }
}
