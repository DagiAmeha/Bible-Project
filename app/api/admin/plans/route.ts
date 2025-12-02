import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Plan from "@/models/Plan";
import UserPlan from "@/models/UserPlan";
import User from "@/models/User";

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

    const plans = await Plan.find().lean();

    // Attach started count
    const enriched = await Promise.all(
      plans.map(async (p: any) => {
        const startedCount = await UserPlan.countDocuments({ planId: p._id });
        return { ...p, startedCount };
      })
    );

    return NextResponse.json({ status: "success", data: enriched });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: "fail", message: "Error fetching plans" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { status: "fail", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, description, language, durationDays, startDate } = body;
    if (!title || !description || !durationDays) {
      return NextResponse.json(
        { status: "fail", message: "Missing required fields" },
        { status: 400 }
      );
    }

    const plan = await Plan.create({
      title,
      description,
      language: language || "en",
      durationDays,
      startDate: startDate ? new Date(startDate) : new Date(),
    });

    return NextResponse.json({ status: "success", data: plan });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: "fail", message: "Error creating plan" },
      { status: 500 }
    );
  }
}
