import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import Progress from "@/models/Progress";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Plan from "@/models/Plan";

export interface DailyProgress {
  day: number;               // The day number in the plan
  completed: boolean;              // Optional MongoDB subdocument ID (as string)
  markedAt: string;         // ISO date string when the day was marked
}

export async function GET( req: Request, {params}: {params: Promise<{planId: string}>}) {
  try {
    const {planId} = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find the progress record for this user and plan
    const progress = await Progress.find({
      userId: session.user.id,
      planId,
    })    ;
    console.log(progress)
    if(!progress) return NextResponse.json({status: 'fail', message: "Progress with this user is not found" }, { status: 404 });
    
    const plan = await Plan.findOne({
      _id: planId
    })
    console.log(plan)
    if(!plan) return NextResponse.json({status: 'fail', message: "Plan ss with this user is not found" }, { status: 404 });
    console.log({planStartDate: plan.startDate, progress});
    return NextResponse.json({ status: 'success', data: {planStartDate: plan.startDate, progress} });
  } catch (error) {
    console.error(error);
    return NextResponse.json({status: 'error', message: "Internal Server Error" }, { status: 500 });
  }
}
