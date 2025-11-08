import { cn } from './utils';

export type Message = {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.sender === 'user';
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-3 py-2 text-sm shadow',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        <div className={cn('mt-1 text-[10px] opacity-70', isUser ? 'text-primary-foreground' : 'text-foreground')}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}


