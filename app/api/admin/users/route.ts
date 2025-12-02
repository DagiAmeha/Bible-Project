import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import UserPlan from "@/models/UserPlan";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

    const users = await User.find({ role: { $ne: "admin" } }).lean();

    const enriched = await Promise.all(
      users.map(async (u: any) => {
        const started = await UserPlan.countDocuments({ userId: u._id });
        const completed = await UserPlan.countDocuments({
          userId: u._id,
          isCompleted: true,
        });
        return { ...u, started, completed };
      })
    );

    return NextResponse.json({ status: "success", data: enriched });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: "fail", message: "Error fetching users" },
      { status: 500 }
    );
  }
}
