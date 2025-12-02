import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserPlan from "@/models/UserPlan";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json(
        { status: "fail", message: "Unauthorized" },
        { status: 401 }
      );

    const userId = session.user.id;
    console.log("Fetching plans for user:", userId);

    const myPlans = await UserPlan.find({ userId, isCompleted: false })
      .populate("planId")
      .sort({ createdAt: -1 });

    console.log(myPlans);
    return NextResponse.json({ status: "success", plans: myPlans });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Failed to fetch user plans" },
      { status: 500 }
    );
  }
}
