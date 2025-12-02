"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Socket, io } from "socket.io-client";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { ChatMessage, MessageBubble } from "@/components/MessageBubble";
import { useTranslations } from "next-intl";

type ChatSummary = {
  _id: string;
  adminId: string;
  user: {
    _id: string;
    name: string;
    email: string;
    lastSeen: Date;
  };
  lastMessage: string;
  lastMessageType: string;
  status: string;
  updatedAt: string;
  unreadCount?: number;
};

type ChatsResponse = {
  chats: ChatSummary[];
};

type MessagesResponse = {
  messages: ChatMessage[];
};

type SocketAck = {
  ok: boolean;
  error?: string;
};

function InitialAvatar({ name }: { name: string }) {
  const letter = name?.trim()?.charAt(0)?.toUpperCase() || "?";
  return (
    <div className="h-9 w-9 rounded-full grid place-items-center bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100 text-sm font-semibold">
      {letter}
    </div>
  );
}

export default function AdminMessagesPage() {
  const t = useTranslations("common");
  const router = useRouter();
  const { data: session, status } = useSession();

  const [query, setQuery] = useState("");
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(
    new Map()
  );

  const socketRef = useRef<Socket | null>(null);
  const selectedChatRef = useRef<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadChats = useCallback(async () => {
    try {
      setLoadingChats(true);
      const res = await fetch("/api/chat", { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Unable to load chats");
      }
      const data: ChatsResponse = await res.json();
      console.log(data);
      setChats(data.chats);
      setSelectedId((prev) => prev ?? null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chats");
    } finally {
      setLoadingChats(false);
    }
  }, []);

  const loadMessages = useCallback(async (chatId: string) => {
    try {
      setLoadingMessages(true);
      setMessages([]);
      const res = await fetch(`/api/chat/${chatId}/messages`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Unable to load messages");
      }
      const data: MessagesResponse = await res.json();
      setMessages(data.messages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "admin") return;
    loadChats();
  }, [status, session, loadChats]);

  useEffect(() => {
    if (!selectedId) return;
    selectedChatRef.current = selectedId;
    loadMessages(selectedId);
  }, [selectedId, loadMessages]);

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "admin") return;

    const socket = io("http://localhost:3000", {
      path: "/api/socket",
      query: {
        userId: session.user.id,
      },
    });
    socketRef.current = socket;

    // Notify server that admin is online
    socket.on("connect", () => {
      if (session?.user?.id) {
        socket.emit("user_online", session.user.id);
      }
    });

    const handleNewMessage = (message: ChatMessage) => {
      setChats((prev) => {
        const exists = prev.find((chat) => chat._id === message.chatId);
        if (!exists) {
          void loadChats();
          return prev;
        }
        const isCurrentChatOpen = selectedChatRef.current === message.chatId;

        return prev
          .map((chat) =>
            chat._id === message.chatId
              ? {
                  ...chat,
                  lastMessage:
                    message.type === "text"
                      ? message.content || ""
                      : "[Voice message]",
                  lastMessageType: message.type,
                  updatedAt: message.createdAt,
                  unreadCount: isCurrentChatOpen
                    ? 0
                    : (chat.unreadCount ?? 0) + 1,
                }
              : chat
          )
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      });

      if (selectedChatRef.current === message.chatId) {
        setMessages((prev) => [...prev, message]);
      }

      // socket.emit("mark_read", selectedId, message._id, "admin");
    };

    const handleUserTyping = (data: {
      chatId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      if (data.chatId === selectedChatRef.current) {
        setTypingUsers((prev) => {
          const next = new Map(prev);
          if (data.isTyping) {
            next.set(data.userId, true);
          } else {
            next.delete(data.userId);
          }
          return next;
        });
      }
    };

    const handleUserStatus = (data: {
      userId: string;
      status: "online" | "offline";
    }) => {
      setOnlineUsers((prev) => {
        console.log(data);
        const next = new Set(prev);
        if (data.status === "online") {
          next.add(data.userId);
        } else {
          next.delete(data.userId);
        }
        return next;
      });
    };

    socket.on("new_message", handleNewMessage);
    socket.on("messages_read", ({ chatId, userId, res }) => {
      // If admin is the one who just marked read, you already set local unreadCount to 0.
      // But if the other side (user) marked read and you need to clear (rare), handle it:
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === res.senderId ? { ...msg, status: "read" } : msg
        )
      );
    });

    socket.on("user_typing", handleUserTyping);
    socket.on("user_status", handleUserStatus);
    socket.on("connect_error", (err: Error) => {
      setError(err.message || "Real-time connection failed");
    });

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_status", handleUserStatus);
      socket.disconnect();
    };
  }, [status, session, loadChats]);

  useEffect(() => {
    if (!selectedId || !socketRef.current) return;
    socketRef.current.emit("join_chat", selectedId);
  }, [selectedId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const filteredChats = useMemo(() => {
    const q = query.toLowerCase();
    return chats.filter(
      (chat) =>
        chat.user.name.toLowerCase().includes(q) ||
        chat.lastMessage.toLowerCase().includes(q)
    );
  }, [chats, query]);

  const selectedChat = useMemo(
    () => chats.find((chat) => chat._id === selectedId) || null,
    [chats, selectedId]
  );

  const sendMessage = () => {
    if (
      !messageText.trim() ||
      !socketRef.current ||
      !selectedChat ||
      !session?.user?.id
    ) {
      return;
    }
    console.log("______FUNCTIONI CALLED CORRECTLY______");
    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socketRef.current.emit("typing_stop", {
      chatId: selectedChat._id,
      userId: session.user.id,
    });

    socketRef.current.emit(
      "send_message",
      {
        chatId: selectedChat._id,
        senderId: session.user.id,
        receiverId: selectedChat.user._id,
        type: "text",
        content: messageText.trim(),
      },
      (ack?: SocketAck) => {
        if (ack && !ack.ok) {
          setError(ack.error || "Failed to send message");
        }
      }
    );

    setMessageText("");
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // const chatSelect = () => {
  //   setSelectedId(item._id);
  //   setChats((prev) =>
  //     prev.map((c) => (c._id === item._id ? { ...c, unreadCount: 0 } : c))
  //   );
  //   socketRef.current.emit("uncount_reset", item._id);
  // };
  return (
    <div className="h-screen flex flex-col">
      <main className="flex flex-1 overflow-hidden">
        {/* ---------- SIDEBAR ---------- */}
        <aside className="w-80 md:w-96 border-r flex flex-col">
          <div className="p-3 border-b flex items-center gap-2">
            <Input
              placeholder={t("search")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button variant="outline" disabled>
              {t("new")}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingChats ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : (
              <ul className="divide-y">
                {filteredChats.map((item) => (
                  <li key={item._id}>
                    <button
                      className={`w-full p-3 flex items-center gap-3 text-left hover:bg-muted ${
                        item._id === selectedId ? "bg-muted" : ""
                      }`}
                      onClick={() => {
                        setSelectedId(item._id);
                        setChats((prev) =>
                          prev.map((c) =>
                            c._id === item._id ? { ...c, unreadCount: 0 } : c
                          )
                        );
                        socketRef.current?.emit("unread_reset", item._id);
                        socketRef.current?.emit(
                          "mark_read",
                          item._id,
                          item.user._id,
                          "admin"
                        );
                        console.log("called");
                      }}
                    >
                      <div className="relative">
                        <InitialAvatar name={item.user.name} />

                        {onlineUsers.has(item.user._id) && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">
                            {item.user.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm truncate text-muted-foreground flex-1">
                            {item.lastMessage || "No messages"}
                          </div>
                          {item.unreadCount! > 0 && (
                            <div className="min-w-[24px] h-6 px-2 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-medium">
                              {item.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* ---------- CHAT SECTION ---------- */}
        <section className="flex flex-col flex-1">
          {/* Header */}
          <div className="p-3 border-b">
            {selectedChat ? (
              <div className="flex items-center gap-3">
                <InitialAvatar name={selectedChat.user.name} />
                <div>
                  <div className="font-medium">{selectedChat.user.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {typingUsers.get(selectedChat.user._id) ? (
                      <span className="text-blue-500">
                        typing
                        <span className="inline-flex gap-1">
                          <span
                            className="animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          >
                            .
                          </span>
                          <span
                            className="animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          >
                            .
                          </span>
                          <span
                            className="animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          >
                            .
                          </span>
                        </span>
                      </span>
                    ) : onlineUsers.has(selectedChat.user._id) ? (
                      <span className="text-green-600 font-medium">Online</span>
                    ) : (
                      <span className="text-muted-foreground">
                        last seen{" "}
                        {new Date(selectedChat.user.lastSeen).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Select a conversation
              </div>
            )}
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {selectedChat ? (
              loadingMessages ? (
                <div className="text-sm text-muted-foreground">
                  Loading messages...
                </div>
              ) : messages.length ? (
                messages.map((msg) => (
                  <MessageBubble
                    key={msg._id}
                    message={msg}
                    currentUserId={session?.user?.id ?? ""}
                  />
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  No messages yet
                </div>
              )
            ) : (
              <div className="text-sm text-muted-foreground">
                {t("not selected")}
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Input Box */}
          <div className="border-t p-2 flex gap-2">
            <Input
              placeholder={
                selectedChat
                  ? `Message ${selectedChat.user.name}`
                  : "Select a chat"
              }
              disabled={!selectedChat}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button
              disabled={!selectedChat || !messageText.trim()}
              onClick={sendMessage}
            >
              Send
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
