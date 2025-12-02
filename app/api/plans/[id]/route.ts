import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Plan from "@/models/Plan";
import Schedule from "@/models/Schedule";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    const plan = await Plan.findById(id);
    if (!plan)
      return NextResponse.json(
        { status: "fail", message: "Plan not found" },
        { status: 404 }
      );

    const schedule = await Schedule.find({ planId: id });

    return NextResponse.json({
      status: "success",
      plan,
      schedule,
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Failed to fetch plan" },
      { status: 500 }
    );
  }
}
