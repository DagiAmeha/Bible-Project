import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import Message from "@/models/Message";
import Chat from "@/models/Chat";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { ObjectId } from "mongodb";

let io: SocketIOServer | undefined;

type SendMessagePayload = {
  chatId: string;
  senderId: string;
  receiverId: string; // always admin or user
  type: "text" | "voice";
  content?: string;
  audioUrl?: string;
};

export function initSocket(server: HTTPServer) {
  if (io) return io;

  io = new SocketIOServer(server, {
    path: "/api/socket",
    cors: { origin: "*" },
  });

  const onlineUsers = new Map<string, string>(); // userId → socket.id

  io.on("connection", (socket: Socket) => {
    console.log("Socket connected:", socket.id);
    const userId = socket.handshake.query.userId;

    //
    // -------------------------
    // USER ONLINE / OFFLINE
    // -------------------------
    //
    socket.on("user_online", (userId: string) => {
      onlineUsers.set(userId, socket.id);
      io?.emit("user_status", { userId, status: "online" });
    });

    socket.on("disconnect", async () => {
      const lastSeen = new Date();

      await User.findByIdAndUpdate(userId, {
        lastSeen,
      });

      for (const [userId, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
          onlineUsers.delete(userId);
          io?.emit("user_status", { userId, status: "offline" });
          break;
        }
      }
    });

    //
    // -------------------------
    // JOIN CHAT (1-to-1 ROOM)
    // -------------------------
    //
    socket.on("join_chat", (chatId: string) => {
      socket.join(chatId);
    });

    //
    // -------------------------
    // TYPING INDICATOR
    // -------------------------
    //
    socket.on("typing_start", ({ chatId, userId }) => {
      socket.to(chatId).emit("user_typing", {
        chatId,
        userId,
        isTyping: true,
      });
    });

    socket.on("typing_stop", ({ chatId, userId }) => {
      socket.to(chatId).emit("user_typing", {
        chatId,
        userId,
        isTyping: false,
      });
    });

    //
    // -------------------------
    // SEND MESSAGE
    // -------------------------
    //
    socket.on("send_message", async (payload: SendMessagePayload, callback) => {
      try {
        await connectDB();

        const msg = await Message.create({
          chatId: payload.chatId,
          senderId: payload.senderId,
          receiverId: payload.receiverId,
          type: payload.type,
          content: payload.content || null,
          audioUrl: payload.audioUrl || null,
          status: "sent",
        });

        await Chat.findByIdAndUpdate(payload.chatId, {
          lastMessage: msg.type === "text" ? msg.content : "[Voice message]",
          lastMessageType: msg.type,
          updatedAt: new Date(),
        });

        io?.to(payload.chatId).emit("new_message", msg);

        callback?.({ ok: true });
      } catch (err) {
        callback?.({ ok: false, error: "Message failed to send" });
      }
    });

    // When a user/admin opens the chat: mark all messages (to that user) as read
    socket.on(
      "mark_read",
      async (chatId: string, userId: string, source: string) => {
        try {
          await connectDB();
          const admin = await User.findOne({ role: "admin" });

          // Convert a string to ObjectId
          const res = await Message.updateMany(
            {
              chatId,
              senderId: source === "user" ? admin._id : userId,
              status: "sent",
            },
            { status: "read" }
          );

          console.log("chatId", chatId);
          console.log("userId", admin._id);
          console.log(res);

          // Notify everyone in the chat that messages are read (so sender UI clears badges)
          if (source === "admin") {
            io?.to(chatId).emit("messages_read", { chatId, userId, res });
          }
        } catch (err) {
          console.error("mark_read error:", err);
        }
      }
    );
    socket.on("unread_reset", async (chatId: string) => {
      try {
        await connectDB();
        const admin = await User.findOne({ role: "admin" });

        const res = await Message.updateMany(
          {
            chatId,
            receiverId: admin._id,
            status: "sent",
          },
          { status: "read" }
        );
        console.log(res);
      } catch (err) {
        console.error("mark_read error:", err);
      }
    });
  });

  return io;
}
