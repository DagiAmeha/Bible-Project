import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import User from "@/models/User";

const serializeChat = (chat: any) => ({
  _id: chat._id.toString(),
  userId: chat.userId.toString(),
  adminId: chat.adminId.toString(),
  lastMessage: chat.lastMessage || "",
  lastMessageType: chat.lastMessageType || "text",
  status: chat.status,
  updatedAt: chat.updatedAt instanceof Date ? chat.updatedAt.toISOString() : chat.updatedAt,
  createdAt: chat.createdAt instanceof Date ? chat.createdAt.toISOString() : chat.createdAt,
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
      message.createdAt instanceof Date ? message.createdAt.toISOString() : message.createdAt,
    updatedAt:
      message.updatedAt instanceof Date ? message.updatedAt.toISOString() : message.updatedAt,
  }));

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  if (session.user.role === "admin") {
    const chats = await Chat.find()
      .populate("userId", "name email")
      .sort({ updatedAt: -1 })
      .lean();

    const serialized = chats.map((chat: any) => ({
      _id: chat._id.toString(),
      adminId: chat.adminId.toString(),
      user: {
        _id: chat.userId?._id?.toString() ?? "",
        name: chat.userId?.name ?? "Unknown user",
        email: chat.userId?.email ?? "",
      },
      lastMessage: chat.lastMessage || "",
      lastMessageType: chat.lastMessageType || "text",
      status: chat.status,
      updatedAt:
        chat.updatedAt instanceof Date ? chat.updatedAt.toISOString() : chat.updatedAt,
    }));

    return NextResponse.json({ chats: serialized });
  }

  const userId = session.user.id;

  let chat = await Chat.findOne({ userId }).sort({ updatedAt: -1 });
  let adminUser: any = null;

  if (!chat) {
    adminUser = await User.findOne({ role: "admin" }).sort({ createdAt: 1 });

    if (!adminUser) {
      return NextResponse.json({ message: "No administrator available." }, { status: 500 });
    }

    chat = await Chat.create({
      userId,
      adminId: adminUser._id,
      lastMessage: "",
    });
  } else {
    adminUser = await User.findById(chat.adminId).lean();
  }

  const messages = await Message.find({ chatId: chat._id }).sort({ createdAt: 1 }).lean();

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



