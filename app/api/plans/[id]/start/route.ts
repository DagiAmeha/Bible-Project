import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserPlan from "@/models/UserPlan";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json(
        { status: "fail", message: "Unauthorized" },
        { status: 401 }
      );

    const userId = session.user.id;
    const planId = params.id;

    const { duration } = await req.json();

    // Prevent duplicates
    const exists = await UserPlan.findOne({ userId, planId });
    if (exists)
      return NextResponse.json(
        { status: "fail", message: "Plan already started" },
        { status: 400 }
      );

    const userPlan = await UserPlan.create({
      userId,
      planId,
      totalDays: duration,
      currentDay: 1,
      progress: 0,
      isCompleted: false,
    });

    return NextResponse.json({
      status: "success",
      message: "Plan started",
      plan: userPlan,
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Failed to start plan" },
      { status: 500 }
    );
  }
}
