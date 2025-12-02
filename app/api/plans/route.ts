import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Plan from "@/models/Plan";
import UserPlan from "@/models/UserPlan";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

interface PlanType {
  _id: string;
  title: string;
  description: string;
  language: string;
  durationDays: number;
  startDate: Date;
  createdAt: Date;
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json(
        { status: "fail", message: "Unauthorized" },
        { status: 401 }
      );

    // Make both queries lean + typed
    const allPlans = await Plan.find().lean<PlanType[]>();
    console.log("All plans", allPlans);

    const startedPlans = await UserPlan.find({
      userId: session.user.id,
      isCompleted: false,
    }).lean();

    console.log("started plans", startedPlans);

    const startedPlanIds = new Set(
      startedPlans.map((p) => p.planId.toString())
    );

    const result = allPlans.map((plan) => ({
      ...plan,
      started: startedPlanIds.has(plan._id.toString()),
    }));

    console.log("result", result);
    return NextResponse.json({ status: "success", plans: result });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching plans" },
      { status: 500 }
    );
  }
}
