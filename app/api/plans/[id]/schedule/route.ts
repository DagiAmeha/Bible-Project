import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Schedule from "@/models/Schedule";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { status: "fail", message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const planId = params.id;
    const schedules = await Schedule.find({
      planId: new mongoose.Types.ObjectId(planId),
    })
      .sort({ day: 1 })
      .lean();

    return NextResponse.json({ status: "success", data: schedules });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { status: "fail", message: err?.message || "Error fetching schedule" },
      { status: 500 }
    );
  }
}
