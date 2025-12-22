import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Plan from "@/models/Plan";
import UserPlan from "@/models/UserPlan";
import Message from "@/models/Message";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCurrentDay } from "@/utils/date";
import { DailyProgress } from "@/types/progress";
import Progress from "@/models/Progress";
import { calculateStreak } from "@/lib/calculateStreak";

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { status: "fail", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userPlans = await UserPlan.find({ userId: session.user.id }).populate(
      "plandId"
    );
    const progressRecords = await Progress.find({
      userId: session.user.id,
      planId: { $in: userPlans.map((p) => p.planId) },
    }).lean();

    const progress: DailyProgress[] = progressRecords.flatMap(
      (record) => record.dailyProgress
    );
    const streak = calculateStreak(progress);

    const currentDate = getCurrentDay();

    return NextResponse.json({
      status: "success",
      data: {
        totalUsers,
        activeToday,
        totalPlans,
        plansStarted,
        plansCompleted,
        unreadSupportMessages,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: "fail", message: "Error fetching dashboard metrics" },
      { status: 500 }
    );
  }
}
