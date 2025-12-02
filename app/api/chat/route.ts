import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import User from "@/models/User";
import mongoose from "mongoose";

const serializeChat = (chat: any) => ({
  _id: chat._id.toString(),
  userId: chat.userId.toString(),
  adminId: chat.adminId.toString(),
  lastMessage: chat.lastMessage || "",
  lastMessageType: chat.lastMessageType || "text",
  status: chat.status,
  updatedAt:
    chat.updatedAt instanceof Date
      ? chat.updatedAt.toISOString()
      : chat.updatedAt,
  createdAt:
    chat.createdAt instanceof Date
      ? chat.createdAt.toISOString()
      : chat.createdAt,
});

const serializeMessages = (messages: any[]) =>
  messages.map((message) => ({
    _id: message._id.toString(),
    chatId: message.chatId.toString(),
    senderId: message.senderId.toString(),
    receiverId: message.receiverId.toString(),
    type: message.type,
    content: message.content || "",
    audioUrl: message.audioUrl || "",
    status: message.status,
    createdAt:
      message.createdAt instanceof Date
        ? message.createdAt.toISOString()
        : message.createdAt,
    updatedAt:
      message.updatedAt instanceof Date
        ? message.updatedAt.toISOString()
        : message.updatedAt,
  }));

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  if (session.user.role === "admin") {
    const chats = await Chat.find()
      .populate("userId", "name email lastSeen")
      .sort({ updatedAt: -1 })
      .lean();

    const adminId = session.user.id; // ensure session is admin
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: { $exists: true },
          status: { $in: ["sent"] },
        },
      },
      { $match: { receiverId: new mongoose.Types.ObjectId(adminId) } }, // if admin only, else adapt
      { $group: { _id: "$chatId", count: { $sum: 1 } } },
    ]);

    // convert aggregation to map for quick lookup
    const unreadMap = new Map<string, number>();
    unreadCounts.forEach((r: any) => unreadMap.set(r._id.toString(), r.count));

    const serialized = chats.map((chat: any) => ({
      _id: chat._id.toString(),
      adminId: chat.adminId.toString(),
      user: {
        _id: chat.userId?._id?.toString() ?? "",
        name: chat.userId?.name ?? "Unknown user",
        email: chat.userId?.email ?? "",
        lastSeen: chat.userId?.lastSeen ?? "",
      },
      lastMessage: chat.lastMessage || "",
      lastMessageType: chat.lastMessageType || "text",
      status: chat.status,
      updatedAt:
        chat.updatedAt instanceof Date
          ? chat.updatedAt.toISOString()
          : chat.updatedAt,
      unreadCount: unreadMap.get(chat._id.toString()) || 0,
    }));

    return NextResponse.json({ chats: serialized });
  }
  const userId = session.user.id;

  // find the admin
  const adminUser = await User.findOne({ role: "admin" }).sort({
    createdAt: 1,
  });

  if (!adminUser) {
    return NextResponse.json(
      { message: "No administrator available." },
      { status: 500 }
    );
  }

  // create OR return existing chat safely
  let chat = await Chat.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId,
        adminId: adminUser._id,
        lastMessage: "",
      },
    },
    {
      new: true,
      upsert: true,
    }
  );

  const messages = await Message.find({ chatId: chat._id })
    .sort({ createdAt: 1 })
    .lean();

  return NextResponse.json({
    chat: serializeChat(chat),
    admin: adminUser
      ? {
          _id: adminUser._id.toString(),
          name: adminUser.name,
          email: adminUser.email,
        }
      : null,
    messages: serializeMessages(messages),
  });
}
