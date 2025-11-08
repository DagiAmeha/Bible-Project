"use client";
import { useEffect, useRef, useState } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { Message, MessageBubble } from './MessageBubble';
import { Mic, Send } from 'lucide-react';

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'assistant', content: 'Welcome! Ask anything about today\'s reading.', timestamp: new Date().toISOString() },
  ]);
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = () => {
    if (!text.trim()) return;
    const msg: Message = { id: crypto.randomUUID(), sender: 'user', content: text.trim(), timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, msg]);
    console.log('sendMessage', msg);
    setText('');
  };

  const recordAudio = () => {
    console.log('recordAudio clicked - to be implemented with backend');
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full border rounded-md">
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <div ref={endRef} />
      </div>
      <div className="border-t p-2 flex gap-2">
        <Button variant="ghost" size="icon" aria-label="Record audio" onClick={recordAudio}>
          <Mic className="h-5 w-5" />
        </Button>
        <Input
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage();
          }}
        />
        <Button aria-label="Send" onClick={sendMessage}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}


