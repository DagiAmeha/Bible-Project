import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Plan from "@/models/Plan";
import UserPlan from "@/models/UserPlan";
import Schedule from "@/models/Schedule";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { status: "fail", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    const plan = await Plan.findById(id).lean();
    if (!plan)
      return NextResponse.json(
        { status: "fail", message: "Plan not found" },
        { status: 404 }
      );

    const startedCount = await UserPlan.countDocuments({ planId: id });

    return NextResponse.json({
      status: "success",
      data: { ...plan, startedCount },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: "fail", message: "Error fetching plan" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin")
      return NextResponse.json(
        { status: "fail", message: "Unauthorized" },
        { status: 401 }
      );

    const { id } = params;
    const body = await req.json();
    const { title, description, language, durationDays, startDate } = body;

    const updated = await Plan.findByIdAndUpdate(
      id,
      {
        title,
        description,
        language,
        durationDays,
        startDate: startDate ? new Date(startDate) : undefined,
      },
      { new: true }
    ).lean();
    if (!updated)
      return NextResponse.json(
        { status: "fail", message: "Plan not found" },
        { status: 404 }
      );

    return NextResponse.json({ status: "success", data: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: "fail", message: "Error updating plan" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin")
      return NextResponse.json(
        { status: "fail", message: "Unauthorized" },
        { status: 401 }
      );

    const { id } = params;
    const deleted = await Plan.findByIdAndDelete(id).lean();
    if (!deleted)
      return NextResponse.json(
        { status: "fail", message: "Plan not found" },
        { status: 404 }
      );

    // Optionally remove related schedules and userplans? Keep it simple for now.
    await UserPlan.deleteMany({ planId: id });
    await Schedule.deleteMany({ planId: id });

    return NextResponse.json({ status: "success", data: deleted });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: "fail", message: "Error deleting plan" },
      { status: 500 }
    );
  }
}
