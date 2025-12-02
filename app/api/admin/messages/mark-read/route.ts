import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Message from "@/models/Message";
import mongoose from "mongoose";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const adminId = session.user.id;

  try {
    const res = await Message.updateMany(
      {
        receiverId: new mongoose.Types.ObjectId(adminId),
        status: "sent",
      },
      { $set: { status: "seen" } }
    );

    return NextResponse.json({ status: "success", updated: res.modifiedCount });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err?.message || "Failed to mark messages" },
      { status: 500 }
    );
  }
}
