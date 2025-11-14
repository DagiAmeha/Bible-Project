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
  };
  lastMessage: string;
  lastMessageType: string;
  status: string;
  updatedAt: string;
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
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map());

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
      setChats(data.chats);
      setSelectedId((prev) => prev ?? data.chats[0]?._id ?? null);
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

    const socket = io({ path: "/api/socket" });
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
        return prev
          .map((chat) =>
            chat._id === message.chatId
              ? {
                  ...chat,
                  lastMessage: message.type === "text" ? message.content || "" : "[Voice message]",
                  lastMessageType: message.type,
                  updatedAt: message.createdAt,
                }
              : chat
          )
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });

      if (selectedChatRef.current === message.chatId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleUserTyping = (data: { chatId: string; userId: string; isTyping: boolean }) => {
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

    const handleUserStatus = (data: { userId: string; status: "online" | "offline" }) => {
      setOnlineUsers((prev) => {
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

  return (
    <div className="min-h-screen flex flex-col">
      <main className="container mx-auto px-4 py-6 flex gap-4">
        <aside className="w-full md:w-80 lg:w-96 shrink-0 border rounded-md overflow-hidden">
          <div className="p-3 border-b flex items-center gap-2">
            <Input
              placeholder={t("Search")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button variant="outline" disabled>
              {t("New")}
            </Button>
          </div>
          {loadingChats ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Loading conversations...
            </div>
          ) : (
            <ul className="divide-y max-h-[calc(100vh-200px)] overflow-auto">
              {filteredChats.map((item) => (
                <li key={item._id}>
                  <button
                    className={`w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-muted ${
                      item._id === selectedId ? "bg-muted" : ""
                    }`}
                    onClick={() => setSelectedId(item._id)}
                  >
                    <div className="relative">
                      <InitialAvatar name={item.user.name} />
                      {onlineUsers.has(item.user._id) && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="font-medium truncate">{item.user.name}</div>
                          {onlineUsers.has(item.user._id) && (
                            <span className="text-[10px] text-green-600 dark:text-green-400">Online</span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {item.lastMessage || "No messages yet"}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
              {!filteredChats.length && (
                <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No conversations found.
                </li>
              )}
            </ul>
          )}
        </aside>

        <section className="flex-1 border rounded-md min-h-[600px] grid grid-rows-[auto_1fr_auto]">
          <div className="px-4 py-3 border-b flex items-center gap-3">
            {selectedChat ? (
              <>
                <div className="relative">
                  <InitialAvatar name={selectedChat.user.name} />
                  {onlineUsers.has(selectedChat.user._id) && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{selectedChat.user.name}</div>
                    {onlineUsers.has(selectedChat.user._id) ? (
                      <span className="text-xs text-green-600 dark:text-green-400">Online</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Offline</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {typingUsers.has(selectedChat.user._id) && typingUsers.get(selectedChat.user._id) ? (
                      <span className="inline-flex items-center gap-1">
                        <span>typing</span>
                        <span className="inline-flex gap-1">
                          <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                          <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                          <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                        </span>
                      </span>
                    ) : (
                      `Last active ${new Date(selectedChat.updatedAt).toLocaleString()}`
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                Select a conversation
              </div>
            )}
          </div>
          <div className="p-3 overflow-auto space-y-3">
            {error && (
              <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded px-3 py-2">
                {error}
              </div>
            )}
            {loadingMessages ? (
              <div className="text-sm text-muted-foreground">Loading messages...</div>
            ) : selectedChat ? (
              <>
                {messages.length ? (
                  messages.map((msg) => (
                    <MessageBubble
                      key={msg._id || `${msg.chatId}-${msg.createdAt}`}
                      message={msg}
                      currentUserId={session?.user?.id ?? ""}
                    />
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No messages yet. Start the conversation below.
                  </div>
                )}
                {/* {selectedChat && typingUsers.has(selectedChat.user._id) && typingUsers.get(selectedChat.user._id) && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        {selectedChat.user.name} is typing
                        <span className="inline-flex gap-1">
                          <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                          <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                          <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                        </span>
                      </span>
                    </div>
                  </div>
                )} */}
                <div ref={endRef} />
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                No conversation selected.
              </div>
            )}
          </div>
          <div className="border-t p-2 flex gap-2">
            <Input
              placeholder={
                selectedChat
                  ? `Message ${selectedChat.user.name}`
                  : "Select a conversation to start chatting"
              }
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                
                // Handle typing indicators
                if (!socketRef.current || !selectedChat || !session?.user?.id) return;
                
                // Clear existing timeout
                if (typingTimeoutRef.current) {
                  clearTimeout(typingTimeoutRef.current);
                }
                
                // Send typing start if there's text
                if (e.target.value.trim()) {
                  socketRef.current.emit("typing_start", {
                    chatId: selectedChat._id,
                    userId: session.user.id,
                  });
                  
                  // Auto-stop typing after 3 seconds of inactivity
                  typingTimeoutRef.current = setTimeout(() => {
                    if (socketRef.current) {
                      socketRef.current.emit("typing_stop", {
                        chatId: selectedChat._id,
                        userId: session.user.id,
                      });
                    }
                  }, 3000);
                } else {
                  // Stop typing if input is empty
                  socketRef.current.emit("typing_stop", {
                    chatId: selectedChat._id,
                    userId: session.user.id,
                  });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // Stop typing when sending
                  if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                  }
                  if (socketRef.current && selectedChat && session?.user?.id) {
                    socketRef.current.emit("typing_stop", {
                      chatId: selectedChat._id,
                      userId: session.user.id,
                    });
                  }
                  sendMessage();
                }
              }}
              disabled={!selectedChat}
            />
            <Button onClick={sendMessage} disabled={!selectedChat || !messageText.trim()}>
              Send
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

