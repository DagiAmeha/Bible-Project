import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import Progress from "@/models/Progress";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export interface DailyProgress {
  day: number;               // The day number in the plan
  completed: boolean;              // Optional MongoDB subdocument ID (as string)
  markedAt: string;         // ISO date string when the day was marked
}

export async function POST( req: Request) {
  try {
   
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { day, planId} = await req.json();
    await connectDB();

    // Find the progress record for this user and plan
    let progress = await Progress.findOne({
      userId: session.user.id,
      planId,
    });

    if (!progress) {
      // Create new progress document if none exists
      progress = await Progress.create({
        userId: session.user.id,
        planId,
        dailyProgress: [{ day, completed: true }],
      });
    } else {
      // Check if the day already exists
      const dayProgress = progress.dailyProgress.find((p:DailyProgress) => p.day === day);
      if (dayProgress) {
        dayProgress.completed = true;
        dayProgress.markedAt = new Date();
      } else {
        progress.dailyProgress.push({ day, completed: true });
      }
      await progress.save();
    }

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
