"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Mic, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import { Input } from "./Input";
import { Button } from "./Button";
import { ChatMessage, MessageBubble } from "./MessageBubble";

type ChatApiResponse = {
  chat: {
    _id: string;
    adminId: string;
  };
  messages: ChatMessage[];
};

type SocketAck = {
  ok: boolean;
  error?: string;
};

export function ChatBox() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [chatId, setChatId] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [isAdminOnline, setIsAdminOnline] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    let isMounted = true;

    const loadChat = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/chat", { cache: "no-store" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || "Unable to load chat");
        }
        const data: ChatApiResponse = await res.json();
        if (!isMounted) return;
        setChatId(data.chat?._id ?? null);
        setAdminId(data.chat?.adminId ?? null);
        setMessages(Array.isArray(data.messages) ? data.messages : []);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load chat");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadChat();

    return () => {
      isMounted = false;
    };
  }, [status]);

  useEffect(() => {
    if (!chatId || !session?.user?.id) return;

    const socket = io({
      path: "/api/socket",
    });

    socketRef.current = socket;
    
    // Notify server that user is online
    socket.on("connect", () => {
      socket.emit("user_online", session.user.id);
      socket.emit("join_chat", chatId);
    });

    const handleNewMessage = (message: ChatMessage) => {
      if (message.chatId === chatId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleUserTyping = (data: { chatId: string; userId: string; isTyping: boolean }) => {
      if (data.chatId === chatId && data.userId === adminId) {
        setIsAdminTyping(data.isTyping);
      }
    };

    const handleUserStatus = (data: { userId: string; status: "online" | "offline" }) => {
      if (data.userId === adminId) {
        setIsAdminOnline(data.status === "online");
      }
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
  }, [chatId, session?.user?.id, adminId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAdminTyping]);

  const sendMessage = () => {
    if (!socketRef.current || !chatId || !adminId || !session?.user?.id) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socketRef.current.emit("typing_stop", {
      chatId,
      userId: session.user.id,
    });

    socketRef.current.emit(
      "send_message",
      {
        chatId,
        senderId: session.user.id,
        receiverId: adminId,
        type: "text",
        content: trimmed,
      },
      (ack?: SocketAck) => {
        if (ack && !ack.ok) {
          setError(ack.error || "Failed to send message");
        }
      }
    );

    setText("");
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const recordAudio = () => {
    setError("Voice messages are not supported yet.");
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex h-full items-center justify-center border rounded-md">
        <p className="text-sm text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center border rounded-md">
        <div className="text-center space-y-2">
          <p className="text-sm text-red-500">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!chatId || !session?.user?.id) {
    return (
      <div className="flex h-full items-center justify-center border rounded-md">
        <p className="text-sm text-muted-foreground">
          Chat is not available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border rounded-md">
      {/* Header with online status */}
      <div className="px-4 py-2 border-b flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isAdminOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-sm text-muted-foreground">
            {isAdminOnline ? "Admin is online" : "Admin is offline"}
          </span>
        </div>
      </div>
      
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {messages.map((m) => (
          <MessageBubble
            key={m._id || `${m.chatId}-${m.createdAt}`}
            message={m}
            currentUserId={session.user.id}
          />
        ))}
        {isAdminTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                Admin is typing
                <span className="inline-flex gap-1">
                  <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                </span>
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="border-t p-2 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Record audio"
          onClick={recordAudio}
        >
          <Mic className="h-5 w-5" />
        </Button>
        <Input
          placeholder="Type your message..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            
            // Handle typing indicators
            if (!socketRef.current || !chatId || !session?.user?.id) return;
            
            // Clear existing timeout
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
            
            // Send typing start if there's text
            if (e.target.value.trim()) {
              socketRef.current.emit("typing_start", {
                chatId,
                userId: session.user.id,
              });
              
              // Auto-stop typing after 3 seconds of inactivity
              typingTimeoutRef.current = setTimeout(() => {
                if (socketRef.current) {
                  socketRef.current.emit("typing_stop", {
                    chatId,
                    userId: session.user.id,
                  });
                }
              }, 3000);
            } else {
              // Stop typing if input is empty
              socketRef.current.emit("typing_stop", {
                chatId,
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
              if (socketRef.current && chatId && session?.user?.id) {
                socketRef.current.emit("typing_stop", {
                  chatId,
                  userId: session.user.id,
                });
              }
              sendMessage();
            }
          }}
        />
        <Button aria-label="Send" onClick={sendMessage}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

