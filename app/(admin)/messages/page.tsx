"use client";
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

type InboxItem = {
  id: string;
  name: string;
  lastMessage: string;
  updatedAt: string;
};

const MOCK_INBOX: InboxItem[] = [
  { id: 'u1', name: 'John Doe', lastMessage: 'Can you review today\'s chapter?', updatedAt: '2025-11-01T10:21:00Z' },
  { id: 'u2', name: 'Jane Admin', lastMessage: 'Psalms 23 inspired me a lot.', updatedAt: '2025-11-02T08:05:00Z' },
  { id: 'u3', name: 'Samuel K.', lastMessage: 'Audio upload not working yet?', updatedAt: '2025-11-02T12:45:00Z' },
  { id: 'u4', name: 'Lidiya B.', lastMessage: 'Finished Genesis!', updatedAt: '2025-11-03T07:15:00Z' },
];

function InitialAvatar({ name }: { name: string }) {
  const letter = name?.trim()?.charAt(0)?.toUpperCase() || '?';
  return (
    <div className="h-9 w-9 rounded-full grid place-items-center bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100 text-sm font-semibold">
      {letter}
    </div>
  );
}

export default function AdminMessagesPage() {
  const t = useTranslations('common');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_INBOX[0]?.id ?? null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return MOCK_INBOX.filter((i) => i.name.toLowerCase().includes(q) || i.lastMessage.toLowerCase().includes(q));
  }, [query]);

  const selected = useMemo(() => MOCK_INBOX.find((i) => i.id === selectedId) || null, [selectedId]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="container mx-auto px-4 py-6 flex gap-4">
        {/* Left: Inbox list */}
        <aside className="w-full md:w-80 lg:w-96 shrink-0 border rounded-md overflow-hidden">
          <div className="p-3 border-b flex items-center gap-2">
            <Input placeholder={t("Search")} value={query} onChange={(e) => setQuery(e.target.value)} />
            <Button variant="outline" onClick={() => console.log('newChat')}>{t('New')}</Button>
          </div>
          <ul className="divide-y max-h-[calc(100vh-200px)] overflow-auto">
            {filtered.map((item) => (
              <li key={item.id}>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-muted ${
                    item.id === selectedId ? 'bg-muted' : ''
                  }`}
                  onClick={() => {
                    setSelectedId(item.id);
                    console.log('selectThread', item);
                  }}
                >
                  <InitialAvatar name={item.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium truncate">{item.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">{item.lastMessage}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Right: Chat area */}
        <section className="flex-1 border rounded-md min-h-[600px] grid grid-rows-[auto_1fr_auto]">
          <div className="px-4 py-3 border-b flex items-center gap-3">
            {selected ? (
              <>
                <InitialAvatar name={selected.name} />
                <div>
                  <div className="font-medium">{selected.name}</div>
                  <div className="text-xs text-muted-foreground">Last active {new Date(selected.updatedAt).toLocaleString()}</div>
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Select a conversation</div>
            )}
          </div>
          <div className="p-3 overflow-auto">
            {/* Placeholder: In a later step this could mount a per-thread ChatBox with fetched messages */}
            <div className="text-sm text-muted-foreground">
              {selected
                ? `You are viewing the conversation with ${selected.name}. Use the input below to send messages.`
                : 'No conversation selected.'}
            </div>
          </div>
          <div className="border-t p-2 flex gap-2">
            <Input placeholder={selected ? `Message ${selected.name}` : 'Select a conversation to start chatting'} disabled={!selected} />
            <Button onClick={() => console.log('adminSendMessage', { to: selected?.id })} disabled={!selected}>Send</Button>
          </div>
        </section>
      </main>
    </div>
  );
}




