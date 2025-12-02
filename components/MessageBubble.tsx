import { Check, CheckCheck } from "lucide-react";
import { cn } from "./utils";

export type ChatMessage = {
  _id?: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  type: "text" | "audio";
  content?: string;
  audioUrl?: string;
  status?: string;
  createdAt: string;
  updatedAt?: string;
};

type MessageBubbleProps = {
  message: ChatMessage;
  currentUserId: string;
};

export function MessageBubble({ message, currentUserId }: MessageBubbleProps) {
  const isCurrentUser = message.senderId === currentUserId;

  const renderStatusIcon = () => {
    if (!isCurrentUser) return null; // Only show status for sender

    switch (message.status) {
      case "sent":
        return <Check className="w-4 h-4 text-gray-400" />;
      case "read":
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };
  return (
    <div
      className={cn("flex", isCurrentUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-3 py-2 text-sm shadow",
          isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {message.type === "audio" ? (
          message.audioUrl ? (
            <audio controls className="w-48" src={message.audioUrl} />
          ) : (
            <div className="italic opacity-70">Audio unavailable</div>
          )
        ) : (
          <div className="whitespace-pre-wrap break-words">
            {message.content || ""}
          </div>
        )}
        <div
          className={cn(
            "mt-1 text-[10px] opacity-70",
            isCurrentUser ? "text-primary-foreground" : "text-foreground"
          )}
        >
          {new Date(message.createdAt).toLocaleTimeString()}
          {renderStatusIcon()}
        </div>
      </div>
    </div>
  );
}
