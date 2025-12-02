import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Plan from "@/models/Plan";
import UserPlan from "@/models/UserPlan";
import Message from "@/models/Message";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ status: "fail", message: "Unauthorized" }, { status: 401 });
    }

    const totalUsers = await User.countDocuments();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const activeToday = await User.countDocuments({ lastSeen: { $gte: startOfToday } });
    const totalPlans = await Plan.countDocuments();
    const plansStarted = await UserPlan.countDocuments({});
    const plansCompleted = await UserPlan.countDocuments({ isCompleted: true });

    const adminUsers = await User.find({ role: "admin" }).select("_id").lean();
    const adminIds = adminUsers.map((a) => a._id);
    const unreadSupportMessages = await Message.countDocuments({ receiverId: { $in: adminIds }, status: { $ne: "seen" } });

    return NextResponse.json({ status: "success", data: { totalUsers, activeToday, totalPlans, plansStarted, plansCompleted, unreadSupportMessages } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: "fail", message: "Error fetching dashboard metrics" }, { status: 500 });
  }
}
