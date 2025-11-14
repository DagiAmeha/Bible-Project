import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import Message from "@/models/Message";
import Chat from "@/models/Chat";
import { connectDB } from "@/lib/mongodb";

let io: SocketIOServer | undefined;

type SendMessagePayload = {
  chatId: string;
  senderId: string;
  receiverId: string;
  type: "text" | "audio";
  content?: string;
  audioUrl?: string;
};

const serializeMessage = (message: any) => ({
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
      : new Date().toISOString(),
  updatedAt:
    message.updatedAt instanceof Date
      ? message.updatedAt.toISOString()
      : new Date().toISOString(),
});

// Track online users: userId -> Set of socketIds
const onlineUsers = new Map<string, Set<string>>();
// Track typing users: chatId -> Set of userIds
const typingUsers = new Map<string, Set<string>>();
// Track socket -> userId mapping for cleanup
const socketToUser = new Map<string, string>();

export function initializeSocketIO(httpServer: HTTPServer) {
  if (io) {
    return io;
  }

  io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
  });

  console.log("Socket.IO initialized");

  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);
    let currentUserId: string | null = null;

    // Handle user online status
    socket.on("user_online", (userId: string) => {
      if (!userId) return;
      currentUserId = userId;
      socketToUser.set(socket.id, userId);
      
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId)!.add(socket.id);
      
      // Notify all chats this user is part of
      socket.broadcast.emit("user_status", { userId, status: "online" });
      console.log(`User ${userId} is now online`);
    });

    socket.on("join_chat", (chatId: string) => {
      if (!chatId) return;
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined chat ${chatId}`);
    });

    // Handle typing indicators
    socket.on("typing_start", (data: { chatId: string; userId: string }) => {
      if (!data?.chatId || !data?.userId) return;
      
      if (!typingUsers.has(data.chatId)) {
        typingUsers.set(data.chatId, new Set());
      }
      typingUsers.get(data.chatId)!.add(data.userId);
      
      // Notify others in the chat
      socket.to(data.chatId).emit("user_typing", {
        chatId: data.chatId,
        userId: data.userId,
        isTyping: true,
      });
    });

    socket.on("typing_stop", (data: { chatId: string; userId: string }) => {
      if (!data?.chatId || !data?.userId) return;
      
      const typingSet = typingUsers.get(data.chatId);
      if (typingSet) {
        typingSet.delete(data.userId);
        if (typingSet.size === 0) {
          typingUsers.delete(data.chatId);
        }
      }
      
      // Notify others in the chat
      socket.to(data.chatId).emit("user_typing", {
        chatId: data.chatId,
        userId: data.userId,
        isTyping: false,
      });
    });

    socket.on("send_message", async (msg: SendMessagePayload, callback) => {
      try {
        await connectDB();

        if (!msg?.chatId || !msg?.senderId || !msg?.receiverId) {
          throw new Error("Invalid message payload");
        }

        const payload = {
          chatId: msg.chatId,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          type: msg.type || "text",
          content: msg.type === "text" ? msg.content : undefined,
          audioUrl: msg.type === "audio" ? msg.audioUrl : undefined,
        };

        if (payload.type === "text" && !payload.content?.trim()) {
          throw new Error("Message content is required");
        }

        if (payload.type === "audio" && !payload.audioUrl) {
          throw new Error("Audio URL is required");
        }

        // Stop typing when message is sent
        const typingSet = typingUsers.get(msg.chatId);
        if (typingSet) {
          typingSet.delete(msg.senderId);
          if (typingSet.size === 0) {
            typingUsers.delete(msg.chatId);
          }
        }
        socket.to(msg.chatId).emit("user_typing", {
          chatId: msg.chatId,
          userId: msg.senderId,
          isTyping: false,
        });

        const messageDoc = await Message.create(payload);

        await Chat.findByIdAndUpdate(msg.chatId, {
          lastMessage:
            payload.type === "text"
              ? payload.content
              : payload.type === "audio"
              ? "[Voice message]"
              : "",
          lastMessageType: payload.type || "text",
          updatedAt: new Date(),
        });

        const message = serializeMessage(messageDoc);
        io!.to(msg.chatId).emit("new_message", message);
        callback?.({ ok: true, messageId: message._id });
      } catch (error: any) {
        console.error("Error sending message:", error);
        callback?.({ ok: false, error: error.message || "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      
      // Get userId from socket mapping
      const userId = socketToUser.get(socket.id) || currentUserId;
      socketToUser.delete(socket.id);
      
      // Remove user from online status
      if (userId) {
        const userSockets = onlineUsers.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            onlineUsers.delete(userId);
            // Notify all chats this user is part of
            socket.broadcast.emit("user_status", {
              userId: userId,
              status: "offline",
            });
            console.log(`User ${userId} is now offline`);
          }
        }
        
        // Clean up typing status for this user in all chats
        typingUsers.forEach((userSet, chatId) => {
          if (userSet.has(userId)) {
            userSet.delete(userId);
            if (userSet.size === 0) {
              typingUsers.delete(chatId);
            }
            // Notify others that user stopped typing
            socket.to(chatId).emit("user_typing", {
              chatId,
              userId,
              isTyping: false,
            });
          }
        });
      }
    });
  });

  return io;
}

// Helper function to check if user is online
export function isUserOnline(userId: string): boolean {
  const userSockets = onlineUsers.get(userId);
  return userSockets ? userSockets.size > 0 : false;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.IO not initialized. Call initializeSocketIO first.");
  }
  return io;
}

