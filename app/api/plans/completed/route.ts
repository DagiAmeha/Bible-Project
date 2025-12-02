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

    const completed = await UserPlan.find({
      userId,
      isCompleted: true,
    }).populate("planId");

    return NextResponse.json({ status: "success", plans: completed });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Failed to fetch completed plans" },
      { status: 500 }
    );
  }
}
