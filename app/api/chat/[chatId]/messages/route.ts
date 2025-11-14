import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Chat from "@/models/Chat";
import Message from "@/models/Message";

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

type Params = { params: { chatId: string } };

export async function GET(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const chat = await Chat.findById(params.chatId);

  if (!chat) {
    return NextResponse.json({ message: "Chat not found" }, { status: 404 });
  }

  const isParticipant =
    chat.userId?.toString() === session.user.id ||
    chat.adminId?.toString() === session.user.id ||
    session.user.role === "admin";

  if (!isParticipant) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const messages = await Message.find({ chatId: params.chatId }).sort({ createdAt: 1 }).lean();

  return NextResponse.json({ messages: serializeMessages(messages) });
}



