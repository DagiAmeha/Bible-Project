import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserPlan from "@/models/UserPlan";
import Schedule from "@/models/Schedule";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Progress from "@/models/Progress";
import { Types } from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // console.log("Fetching progress for user:", userId, "and plan:", planId);
    const planObjectId = new Types.ObjectId(params.id);

    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json(
        { status: "fail", message: "Unauthorized" },
        { status: 401 }
      );

    const userId = session.user.id;
    const planId = params.id;

    console.log("User ID:", userId);
    console.log("Plan ID:", planId);

    const schedules = await Schedule.find({
      planId: planObjectId,
    }).populate("planId");

    console.log("Fetched schedules:", schedules);

    if (!schedules || schedules.length === 0) {
      return NextResponse.json(
        { status: "fail", message: "No schedules found for this plan" },
        { status: 404 }
      );
    }

    const progress = await Progress.findOne({ userId, planId });

    console.log("Schedules:", schedules);
    console.log("Progress:", progress);

    return NextResponse.json({
      status: "success",
      schedules,
      ...(progress !== null && { progress: progress.dailyProgress }),
    });
  } catch (error) {
    console.log("ERROR:   ", error);
    return NextResponse.json(
      { status: "error", message: "Failed to update progress", error: error },
      { status: 500 }
    );
  }
}
